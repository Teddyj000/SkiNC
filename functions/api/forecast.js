import { LOCATIONS } from '../../assets/data.js';
const json=(data,status=200,extra={})=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json;charset=utf-8','cache-control':status===200?'public,max-age=300,s-maxage=900':'no-store','access-control-allow-origin':'*',...extra}});
export async function onRequestGet({request}) {
 try {
  const qs = new URLSearchParams({
   latitude: LOCATIONS.map(x=>x.lat).join(','), longitude:LOCATIONS.map(x=>x.lon).join(','),
   elevation:LOCATIONS.map(x=>x.elevation).join(','),
   timezone:'America/New_York',temperature_unit:'fahrenheit',wind_speed_unit:'mph',
   forecast_days:'7',current:'temperature_2m,weather_code,wind_speed_10m',
   daily:'snowfall_sum,temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max,rain_sum,wind_speed_10m_max',
   hourly:'snowfall,temperature_2m,snow_depth'
  });
  const upstream=await fetch('https://api.open-meteo.com/v1/forecast?'+qs,{headers:{accept:'application/json'},signal:AbortSignal.timeout(18000)});
  if(!upstream.ok) return json({error:'Weather provider unavailable',status:upstream.status},502);
  const data=await upstream.json();
  const rows=Array.isArray(data)?data:[data];
  const items=rows.map((r,i)=>({id:LOCATIONS[i]?.id,forecast:r})).filter(x=>x.id&&x.forecast?.daily?.time?.length&&Array.isArray(x.forecast?.daily?.snowfall_sum));
  if(!items.length) return json({error:'No valid forecast data returned'},502);
  return json({source:'Open-Meteo',kind:'forecast-model',fetchedAt:new Date().toISOString(),items});
 }catch(error){return json({error:'Unable to retrieve forecasts',detail:String(error?.name==='TimeoutError'?'Upstream timed out':'Provider or network failure')},503)}
}
