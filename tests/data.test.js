import test from 'node:test';
import assert from 'node:assert/strict';
import {LOCATIONS,RESORTS,PEAKS,STATIONS,getLocation,getResort} from '../assets/data.js';
import {parseGHCN} from '../functions/api/observations.js';
import {parseAssociation} from '../functions/api/resorts.js';
import {parseSnowListings} from '../functions/api/listings.js';
import {onRequestGet as forecast} from '../functions/api/forecast.js';

const makeGHCNRow=(year,month,kind,vals)=>{
 const head=`USC00310645${year}${String(month).padStart(2,'0')}${kind}`;
 return head+Array.from({length:31},(_,i)=>String(vals[i]??-9999).padStart(5,' ')+ '   ').join('');
};
test('tracking points are unique, actual resorts exclude Sapphire',()=>{
 assert.equal(RESORTS.length,5);assert.equal(PEAKS.length,8);
 assert.equal(LOCATIONS.length,13);assert.equal(new Set(LOCATIONS.map(x=>x.id)).size,13);
 assert.ok(!LOCATIONS.some(x=>/sapphire/i.test(x.name)));
 assert.equal(getResort('sugar-mountain')?.id,'sugar');assert.equal(getLocation('mitchell')?.name,'Mount Mitchell');
 assert.equal(STATIONS.length,2);
});
test('NOAA parser correctly converts SNOW mm and never treats missing values as zero',()=>{
 const vals=Array(31).fill(0);vals[0]=254;vals[1]=-9999;vals[2]=51;
 const rows=parseGHCN(makeGHCNRow(2025,1,'SNOW',vals));assert.equal(rows.length,1);
 assert.equal(rows[0].snowfallIn,12.0);
 assert.equal(rows[0].observedDays,30);assert.equal(rows[0].complete,false);
 assert.equal(rows[0].month,'2025-01');
});
test('NOAA complete winter month valid with all zero readings',()=>{
 const rows=parseGHCN(makeGHCNRow(2025,1,'SNOW',Array(31).fill(0)));
 assert.equal(rows[0].snowfallIn,0);assert.equal(rows[0].complete,true);
});
test('NCSAA parser treats dated status as a source, never invented',()=>{
 const h='<h3>Sugar Mountain Resort</h3><p>This Resort is Currently: Closed</p><p>Snowmaking in Progress: Yes</p><p>Updated: November 13, 2026 at 3:50 pm</p>';
 const x=parseAssociation(h);
 assert.equal(x.sugar.reportedStatus,'Closed');assert.equal(x.sugar.snowmaking,'Yes');assert.ok(x.sugar.updatedLabel.includes('November'));
 assert.ok(!x.beech);
});
test('model endpoint rejects unavailable upstream rather than inventing snow data',async()=>{
 const old=global.fetch;global.fetch=async()=>({ok:false,status:503});
 try{const resp=await forecast({request:new Request('https://skincnow.com/api/forecast')});assert.equal(resp.status,502);const data=await resp.json();assert.ok(data.error);assert.equal(data.items,undefined)}finally{global.fetch=old}
});

test('SkiSoutheast listings remain explicitly third-party and parse Trace, without invented zeroes',()=>{
 const h='<h2>Appalachian Ski Mountain</h2><p>Season Snowfall</p><p>0.7"</p><h2>Beech Mountain Resort</h2><p>Season Snowfall</p><p>Trace"</p>';
 const d=parseSnowListings(h);assert.equal(d.app.seasonSnow,'0.7');assert.equal(d.beech.trace,true);assert.equal(d.sugar,undefined);
});
