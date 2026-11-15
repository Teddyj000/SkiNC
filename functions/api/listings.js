const resortNames={app:'Appalachian Ski Mountain',beech:'Beech Mountain Resort',cataloochee:'Cataloochee Ski Area',hatley:'Hatley Pointe',sugar:'Sugar Mountain Resort'};
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json;charset=utf-8','cache-control':status===200?'public,max-age=300,s-maxage=1800':'no-store'}});
const clean = s=>s.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<[^>]*>/g,' ').replace(/&nbsp;|&#160;/gi,' ').replace(/&quot;/gi,'"').replace(/&amp;/gi,'&').replace(/\s+/g,' ').trim();
// A third-party listing, never identified as NOAA observation or first-party resort report.
export function parseSnowListings(html){
 const content=clean(html),res={};
 const matches=Object.entries(resortNames).map(([id,name])=>({id,name,start:content.toLowerCase().indexOf(name.toLowerCase())})).filter(x=>x.start>=0).sort((a,b)=>a.start-b.start);
 for(let i=0;i<matches.length;i++){
  const x=matches[i];const next=matches[i+1]?.start??Math.min(content.length,x.start+1600);
  const portion=content.slice(x.start,Math.min(next,x.start+2000));
  const m=portion.match(/Season Snowfall\s*(Trace|\d+(?:\.\d+)?)\s*(?:["″]|\b)/i);
  if(!m)continue;
  res[x.id]={seasonSnow:m[1],trace:/trace/i.test(m[1]),source:'SkiSoutheast',sourceUrl:'https://www.skisoutheast.com/snow-reports/'};
 }
 return res;
}
export async function onRequestGet(){try{const r=await fetch('https://www.skisoutheast.com/snow-reports/',{signal:AbortSignal.timeout(14000)});if(!r.ok)return json({error:'Third-party listings unavailable'},502);return json({kind:'third-party-aggregator-not-observations',fetchedAt:new Date().toISOString(),listings:parseSnowListings(await r.text())})}catch{return json({error:'Third-party listings unavailable'},503)}}
