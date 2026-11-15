import {getResort} from '../../assets/data.js';
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json;charset=utf-8','cache-control':status===200?'public,max-age=7200,s-maxage=86400':'no-store'}});
export async function onRequestGet({request}){
 const url=new URL(request.url),resort=getResort(url.searchParams.get('resort'));
 if(!resort)return json({error:'Unknown resort'},400);
 const q=`[out:json][timeout:20];(way["piste:type"="downhill"](around:${resort.radius},${resort.lat},${resort.lon});way["aerialway"](around:${resort.radius},${resort.lat},${resort.lon}););out geom;`;
 try{
  const r=await fetch('https://overpass.kumi.systems/api/interpreter',{method:'POST',body:new URLSearchParams({data:q}),headers:{'content-type':'application/x-www-form-urlencoded'},signal:AbortSignal.timeout(23000)});
  if(!r.ok)return json({error:'Map data provider unavailable'},502);
  const d=await r.json();
  const features=(d?.elements||[]).filter(e=>e.type==='way'&&e.geometry?.length>1).map(e=>({id:e.id,name:e.tags?.name||null,kind:e.tags?.aerialway?'lift':'run',difficulty:e.tags?.['piste:difficulty']||'unknown',type:e.tags?.aerialway||'downhill',coords:e.geometry.map(p=>[p.lat,p.lon])}));
  return json({resort:resort.id,source:'OpenStreetMap contributors via Overpass',kind:'community-mapped-unverified-trails',fetchedAt:new Date().toISOString(),features});
 }catch(e){return json({error:'Community trail geometry unavailable'},503)}
}
