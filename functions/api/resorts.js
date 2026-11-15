const names={beech:'Beech Mountain Resort',sugar:'Sugar Mountain Resort',app:'Appalachian Ski Mtn',cataloochee:'Cataloochee Ski Area',hatley:'Hatley Pointe'};
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json;charset=utf-8','cache-control':status===200?'public,max-age=120,s-maxage=900':'no-store'}});
// Parses the plain-text context of official NC ski-area association reports.
// We never treat an old report as currently verified operating status.
export function parseAssociation(html){
 const cleaned=html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<\/(?:h[1-6]|section|div|p|article)>/gi,'\n').replace(/<br\s*\/?\s*>/gi,'\n').replace(/<[^>]+>/g,' ').replace(/&nbsp;|&#160;/gi,' ').replace(/&amp;/gi,'&').replace(/\r/g,'').replace(/[ \t]+/g,' ');
 const out={};
 for(const [id,name] of Object.entries(names)){
  const marker=name.toLowerCase();const pos=cleaned.toLowerCase().indexOf(marker);if(pos<0)continue;
  const end=Object.values(names).filter(n=>n!==name).map(n=>cleaned.toLowerCase().indexOf(n.toLowerCase(),pos+name.length)).filter(n=>n>pos).sort((a,b)=>a-b)[0] ?? cleaned.length;
  const section=cleaned.slice(pos,Math.min(end,pos+3000));
  const status=section.match(/This Resort is Currently:\s*(Open|Closed)/i);
  const snowmaking=section.match(/Snowmaking in Progress:\s*(Yes|No)/i);
  const updated=section.match(/Updated:\s*([A-Z][a-z]+ \d{1,2}, \d{4} at \d{1,2}:\d{2} (?:am|pm))/i);
  if(!status || !updated) continue;
  const updatedAt=new Date(updated[1].replace(' at ',' '));
  // This date is on the official report page in US Eastern time; Date.parse may use UTC
  // on the server, so add a generous 2 day buffer for eligibility.
  const fresh=Number.isFinite(updatedAt.getTime())&&Date.now()-updatedAt.getTime()<48*3600*1000&&updatedAt.getTime()-Date.now()<86400000;
  out[id]={status:fresh?status[1].toLowerCase():null,stale:!fresh,reportedStatus:status[1],snowmaking:snowmaking?.[1]||null,updatedLabel:updated[1],source:'NCSAA'};
 }
 return out;
}
export async function onRequestGet(){
 try {const r=await fetch('https://www.goskinc.com/snow-reports/',{signal:AbortSignal.timeout(12000)});if(!r.ok)return json({error:'Association reports unavailable'},502);
  const records=parseAssociation(await r.text());
  return json({source:'North Carolina Ski Areas Association',sourceUrl:'https://www.goskinc.com/snow-reports/',fetchedAt:new Date().toISOString(),reports:records});
 }catch(e){return json({error:'Resort report feed is unavailable'},503)}
}
