// Grounded geographic forecast points. Coordinates are illustrative forecast sample points,
// not live resort sensors. Elevation is the target elevation in meters for model downscaling.
export const RESORTS = [
  {id:'beech',slug:'beech-mountain',name:'Beech Mountain',region:'High Country',town:'Beech Mountain',lat:36.195,lon:-81.878,elevation:1678,baseElevation:1400,site:'https://www.beechmountainresort.com/',report:'https://www.beechmountainresort.com/mountain/winter-trail-map/',map:'https://www.beechmountainresort.com/mountain/winter-trail-map/',webcam:'https://www.beechmountainresort.com/mountain/webcams/',station:'beech',radius:3000},
  {id:'sugar',slug:'sugar-mountain',name:'Sugar Mountain',region:'High Country',town:'Sugar Mountain',lat:36.129,lon:-81.866,elevation:1615,baseElevation:1250,site:'https://skisugar.com/',report:'https://skisugar.com/trailmap/',map:'https://skisugar.com/trailmap/',webcam:'https://skisugar.com/',station:'beech',radius:3200},
  {id:'app',slug:'appalachian-ski-mtn',name:'Appalachian Ski Mtn.',region:'High Country',town:'Blowing Rock',lat:36.174,lon:-81.662,elevation:1219,baseElevation:1113,site:'https://appskimtn.com/',report:'https://appskimtn.com/',map:'https://appskimtn.com/',webcam:'https://appskimtn.com/',station:'beech',radius:2300},
  {id:'cataloochee',slug:'cataloochee',name:'Cataloochee',region:'Smoky Mountains',town:'Maggie Valley',lat:35.562,lon:-83.090,elevation:1646,baseElevation:1400,site:'https://cataloochee.com/',report:'https://cataloochee.com/the-mountain/snow-report/',map:'https://cataloochee.com/',webcam:'https://cataloochee.com/',station:null,radius:3100},
  {id:'hatley',slug:'hatley-pointe',name:'Hatley Pointe',region:'Asheville Area',town:'Mars Hill',lat:35.873,lon:-82.512,elevation:1433,baseElevation:1150,site:'https://www.hatleypointe.com/',report:'https://www.hatleypointe.com/',map:'https://www.hatleypointe.com/',webcam:'https://www.hatleypointe.com/',station:null,radius:3100}
];
export const PEAKS = [
 {id:'mitchell',name:'Mount Mitchell',region:'Black Mountains',town:'Yancey County',lat:35.765,lon:-82.265,elevation:2037,station:'mitchell'},
 {id:'roan',name:'Roan Mountain',region:'High Country',town:'NC / TN border',lat:36.104,lon:-82.136,elevation:1916},
 {id:'grandfather',name:'Grandfather Mountain',region:'High Country',town:'Linville',lat:36.111,lon:-81.811,elevation:1812},
 {id:'black-balsam',name:'Black Balsam Knob',region:'Pisgah Highlands',town:'Haywood County',lat:35.329,lon:-82.874,elevation:1894},
 {id:'kuwohi',name:'Kuwohi',region:'Smoky Mountains',town:'Great Smoky Mountains',lat:35.562,lon:-83.498,elevation:2025},
 {id:'max-patch',name:'Max Patch',region:'Smoky Mountains',town:'Madison County',lat:35.795,lon:-82.956,elevation:1412},
 {id:'boone',name:'Boone',region:'High Country',town:'Watauga County',lat:36.216,lon:-81.675,elevation:1017},
 {id:'asheville',name:'Asheville',region:'Asheville Area',town:'Buncombe County',lat:35.595,lon:-82.551,elevation:650}
];
export const LOCATIONS = [...RESORTS.map(r=>({...r,type:'resort'})), ...PEAKS.map(p=>({...p,type:'peak'}))];
export const STATIONS = [
 {id:'beech',name:'Beech Mountain NOAA station',ghcn:'USC00310645',lat:36.18738,lon:-81.87409,elevation:1542,source:'NOAA GHCN-Daily',url:'https://www.ncdc.noaa.gov/cdo-web/datasets/GHCND/stations/GHCND%3AUSC00310645/detail'},
 {id:'mitchell',name:'Mount Mitchell NOAA station',ghcn:'USC00315923',lat:35.7585,lon:-82.2711,elevation:1902,source:'NOAA GHCN-Daily',url:'https://www.ncdc.noaa.gov/cdo-web/datasets/GHCND/stations/GHCND%3AUSC00315923/detail'}
];
export const getLocation = id => LOCATIONS.find(p=>p.id===id) || LOCATIONS.find(p=>p.slug===id);
export const getResort = id => RESORTS.find(r=>r.id===id || r.slug===id);
export const getStation = id => STATIONS.find(s=>s.id===id);
