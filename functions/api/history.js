import { getLocation } from '../../assets/data.js';
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json;charset=utf-8','cache-control':status===200?'public,max-age=7200,s-maxage=43200':'no-store'}});
export async function onRequestGet({request}){
 const url=new URL(request.url);const location=getLocation(url.searchParams.get('place'));
 if(!location)return json({error:'Unknown location'},400);
 const now=new Date();const cutoff=new Date(now.getTime()-9*86400000).toISOString().slice(0,10);
 const start='2016-01-01';if(cutoff<start)return json({error:'Archive not yet available'},503);
 try{
  const qs=new URLSearchParams({latitude:String(location.lat),longitude:String(location.lon),elevation:String(location.elevation),start_date:start,end_date:cutoff,daily:'snowfall_sum',timezone:'America/New_York'});
  const r=await fetch('https://archive-api.open-meteo.com/v1/archive?'+qs,{signal:AbortSignal.timeout(22000),headers:{accept:'application/json'}});
  if(!r.ok)return json({error:'Historical model archive unavailable',status:r.status},502);
  const d=await r.json();if(!Array.isArray(d?.daily?.time)||!Array.isArray(d?.daily?.snowfall_sum))return json({error:'Invalid archive response'},502);
  const months={};let count=0;
  for(let i=0;i<d.daily.time.length;i++){
   const date=d.daily.time[i],v=d.daily.snowfall_sum[i],key=date.slice(0,7);
   if(!months[key])months[key]={month:key,totalCm:0,days:0,available:0};
   months[key].days++;
   if(typeof v==='number'&&Number.isFinite(v)){months[key].totalCm+=Math.max(0,v);months[key].available++;count++}
  }
  return json({source:'Open-Meteo Historical Weather API',kind:'model-reanalysis-not-measured',place:location.id,availableThrough:cutoff,months:Object.values(months).map(m=>({...m,totalIn:Math.round(m.totalCm/2.54*10)/10}))});
 }catch(e){return json({error:'Could not load model history'},503)}
}
