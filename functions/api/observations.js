import {getStation} from '../../assets/data.js';
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json;charset=utf-8','cache-control':status===200?'public,max-age=7200,s-maxage=43200':'no-store'}});
// NOAA GHCN-Daily .dly format: 21-character prefix, 31 fixed-width 8-char daily values;
// SNOW/SNWD are millimeters (unlike PRCP, which uses tenths of millimeters).
export function parseGHCN(text){
 const months={};
 for(const line of text.split(/\r?\n/)){
  if(line.length<27)continue;
  const year=Number(line.slice(11,15)),m=Number(line.slice(15,17));
  const field=line.slice(17,21);if(!['SNOW','SNWD'].includes(field)||!Number.isInteger(year)||m<1||m>12)continue;
  const month=String(year)+'-'+String(m).padStart(2,'0');
  const calendarDays=new Date(Date.UTC(year,m,0)).getUTCDate();
  const vals=[];let trace=0;
  for(let day=0;day<calendarDays;day++){
   const block=line.slice(21+day*8,29+day*8);
   const n=Number(block.slice(0,5));const qflag=block[6];const mflag=block[5];
   // Reject missing and quality-flagged observations.
   if(!Number.isFinite(n)||n===-9999||qflag?.trim()){vals.push(null);continue}
   vals.push(Math.max(0,n));if(mflag==='T')trace++;
  }
  if(!months[month])months[month]={month,days:calendarDays};
  if(field==='SNOW'){
   const available=vals.filter(x=>x!==null).length;
   // Daily values remain valid even if an annual/season total has missing days.
   months[month].observedDays=available;
   months[month].snowfallIn=Math.round(vals.reduce((s,x)=>s+(x??0),0)/25.4*10)/10;
   months[month].complete=available===calendarDays;
   months[month].traceDays=trace;
  }
  if(field==='SNWD'){
   const valid=vals.filter(x=>x!==null);
   months[month].snowDepthMaxIn=valid.length?Math.round(Math.max(...valid)/25.4*10)/10:null;
  }
 }
 return Object.values(months).filter(m=>m.observedDays!==undefined).sort((a,b)=>a.month.localeCompare(b.month));
}
export async function onRequestGet({request}){
 const url=new URL(request.url);const s=getStation(url.searchParams.get('station'));
 if(!s)return json({error:'Unknown observation station'},400);
 try {
  const r=await fetch('https://www.ncei.noaa.gov/pub/data/ghcn/daily/all/'+s.ghcn+'.dly',{signal:AbortSignal.timeout(18000)});
  if(!r.ok)return json({error:'NOAA record is temporarily unavailable'},502);
  const txt=await r.text();const months=parseGHCN(txt);
  if(!months.length)return json({error:'No station snowfall observations available'},502);
  return json({station:s,source:'NOAA GHCN-Daily',kind:'station-measurements-not-resort',fetchedAt:new Date().toISOString(),months});
 }catch(e){return json({error:'Unable to load NOAA station record'},503)}
}
