const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {JSDOM,VirtualConsole}=require('jsdom');
async function boot(saved){
 const errors=[],launches=[];
 const dom=new JSDOM(fs.readFileSync('index.html','utf8'),{url:'https://contrail.test/',runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:new VirtualConsole().on('jsdomError',e=>errors.push(e.message))});
 const w=dom.window;await new Promise(r=>w.addEventListener('load',r,{once:true}));
 if(saved!==undefined)w.localStorage.setItem('contrail.v1',typeof saved==='string'?saved:JSON.stringify(saved));
 for(const f of ['data.js','art.js','keypad.js','ext.js','race.js','portal.js'])w.eval(fs.readFileSync(f,'utf8'));
 w.CT_SIM={session:null,preload:()=>Promise.resolve(),start:(cfg,done)=>launches.push({cfg,done})};
 w.eval(fs.readFileSync('app.js','utf8'));w.document.dispatchEvent(new w.Event('DOMContentLoaded'));
 const $=s=>w.document.querySelector(s);
 const nav=path=>{w.history.replaceState(null,'','#/'+path);w.CT_UI.route();assert.equal(errors.length,0,errors.join('\n'));};
 const key=(el,key,code=key)=>el.dispatchEvent(new w.KeyboardEvent('keydown',{key,code,bubbles:true,cancelable:true}));
 return {dom,w,$,nav,key,errors,launches,close:()=>dom.window.close()};
}
async function scenario(fn,saved){const a=await boot(saved);try{await fn(a);assert.deepEqual(a.errors,[]);}finally{a.close();}}
test('first visit, chooser links, racing simulator menus, return to flight',()=>scenario(({w,$,nav})=>{
 assert.equal(w.document.querySelectorAll('.sim-choice').length,2);assert.equal($('.flight-choice').hash,'#/home');assert.equal($('.racing-choice').hash,'#/race');
 nav('race');assert($('#r-go'));for(const r of ['race/garage','race/tracks','race/howto','race/settings']){nav(r);assert($('#page h1'),r);}
 nav('racing');assert($('#r-go'));nav('home');assert(!w.document.body.classList.contains('portal-mode'));assert($('.sim-switch'));nav('choose');assert(w.document.body.classList.contains('portal-mode'));
}));
test('all main pages and settings sections render',()=>scenario(({nav,$})=>{
 for(const r of ['home','hangar','fly/route','fly/weather','fly/time','fly/load','missions/career','missions/challenges','tutorial',...['graphics','controls','realism','audio','hud','data'].map(x=>'settings/'+x)]){nav(r);assert($('#page').textContent.trim(),r);assert(!$('#page').textContent.includes('NaN'),r);}
}));
test('every aircraft, paint shop and challenge renders with valid data',()=>scenario(({nav,w,$})=>{
 const D=w.CT_DATA;assert.equal(new Set(D.AIRCRAFT.map(a=>a.id)).size,D.AIRCRAFT.length);
 for(const a of D.AIRCRAFT){assert(D.FM[a.fm],a.id);assert(D.liverySetFor(a).length,a.id);nav('aircraft/'+a.id);assert($('#dsel'));nav('liveries/'+a.id);assert($('#lsave'));}
 for(const m of D.MISSIONS){assert(D.AIRCRAFT.some(a=>a.id===m.ac),m.id);assert(D.AIRPORTS.some(a=>a.icao===m.apt),m.id);nav('missions/challenges/'+m.id);assert($('#mstart'));}
}));
test('unknown nested routes recover without throwing',()=>scenario(({nav,$})=>{nav('settings/unknown');assert($('#sbody'));nav('fly/unknown');assert($('#fdep'));nav('nonsense');assert($('#page'));}));
test('hangar search, filters, favourites and sorting work',()=>scenario(({w,$,nav})=>{
 nav('hangar');$('#hq').value='no-such-aircraft';$('#hq').dispatchEvent(new w.Event('input'));assert.match($('#hcount').textContent,/^0 /);
 $('#hq').value='cessna';$('#hq').dispatchEvent(new w.Event('input'));assert(w.document.querySelectorAll('#hgrid .ac').length>0);
 $('#hq').value='';$('#hq').dispatchEvent(new w.Event('input'));$('#hs').value='speed';$('#hs').dispatchEvent(new w.Event('change'));
 const button=$('[data-fav]'),id=button.dataset.fav,was=w.CT_UI.state().favs.includes(id);button.click();assert.equal(w.CT_UI.state().favs.includes(id),!was);
 $('#hfav').click();assert.equal(w.document.querySelectorAll('#hgrid .ac').length,w.CT_UI.state().favs.length);
}));
test('flight route, runway and start settings persist',()=>scenario(({w,$,nav})=>{
 nav('fly/route');$('#fdep').value='KLAX';$('#fdep').dispatchEvent(new w.Event('change'));assert.equal(w.CT_UI.state().flight.dep,'KLAX');assert.equal($('#frwy').value,w.CT_UI.state().flight.rwy);
 $('#fstart [data-s="air"]').click();assert.equal(JSON.parse(w.localStorage.getItem('contrail.v1')).flight.start,'air');
}));
test('settings sliders, switches and segments persist',()=>scenario(({w,$,nav})=>{
 nav('settings/graphics');$('[data-sw="shadows"]').click();assert.equal(w.CT_UI.state().settings.shadows,true);
 $('[data-seg="quality"] [data-v="low"]').click();assert.equal(w.CT_UI.state().settings.quality,'low');
 $('#s-fov').value=80;$('#s-fov').dispatchEvent(new w.Event('input'));assert.equal(JSON.parse(w.localStorage.getItem('contrail.v1')).settings.fov,80);
}));
test('Tab in flight setup retains normal focus navigation',()=>scenario(({nav,$,key})=>{nav('fly/route');assert.equal(key($('[data-tab="route"]'),'Tab'),true);assert($('#fdep'));}));
test('livery editing, safe text, save and keyboard selection',()=>scenario(({w,$,nav,key})=>{
 nav('liveries/b738');$('#lname').value='<img src=x onerror=alert(1)>';$('#lname').dispatchEvent(new w.Event('input'));$('#lsave').click();assert.equal(w.CT_UI.state().custom.b738.length,1);assert.equal(w.document.querySelectorAll('#page img').length,0);
 const first=$('[data-lv]');key(first,' ');assert.equal(w.CT_UI.state().liveryByAc.b738,first.dataset.lv);
}));
test('blank livery names receive a useful fallback',()=>scenario(({w,$,nav})=>{nav('liveries/b738');$('#lname').value='   ';$('#lname').dispatchEvent(new w.Event('input'));$('#lsave').click();assert.equal(w.CT_UI.state().custom.b738[0].name,'Custom');}));
test('confirmation dialog labels, focus trap and cancel restore focus',()=>scenario(({w,$,nav,key})=>{
 nav('settings/data');const opener=$('#dall');opener.focus();opener.click();const dialog=$('[role="dialog"]');assert(dialog.getAttribute('aria-labelledby'));assert.equal(w.document.activeElement,$('[data-x]'));
 $('[data-ok]').focus();key($('[data-ok]'),'Tab');assert.equal(w.document.activeElement,$('[data-x]'));key($('[data-x]'),'Escape');assert.equal($('.modal'),null);assert.equal(w.document.activeElement,opener);
}));
test('key binding swaps and cancellation preserve settings',()=>scenario(({w,$,nav,key})=>{
 nav('settings/controls');const s=w.CT_UI.state().settings,old=s.keys.rollLeft,right=s.keys.rollRight;$('[data-bind="rollLeft"]').click();key(w.document.body,'d',right);assert.equal(s.keys.rollLeft,right);assert.equal(s.keys.rollRight,old);
 $('[data-bind="rollLeft"]').click();key(w.document.body,'Escape','Escape');assert.equal(s.keys.rollLeft,right);
}));
test('leaving key binding screen cancels capture',()=>scenario(({w,$,nav,key})=>{nav('settings/controls');const before=w.CT_UI.state().settings.keys.rollLeft;$('[data-bind="rollLeft"]').click();nav('home');key(w.document.body,'x','KeyX');assert.equal(w.CT_UI.state().settings.keys.rollLeft,before);assert($('#h-fly'));}));
test('free flight, tutorials, missions, contracts and results dispatch correctly',()=>scenario(({w,$,nav,launches})=>{
 nav('home');$('#h-fly').click();assert.equal(launches.at(-1).cfg.ac.id,'b738');
 nav('tutorial');$('#t-heli').click();assert.equal(launches.at(-1).cfg.ac.id,'r44');assert.equal(launches.at(-1).cfg.tutorial,true);
 for(const m of w.CT_DATA.MISSIONS){w.CT_UI.launchMission(m);assert.equal(launches.at(-1).cfg.mission.id,m.id);assert.equal(launches.at(-1).cfg.airport.icao,m.apt);}
 const c=w.CT_UI.contracts()[0];w.CT_UI.launchContract(c);assert.equal(launches.at(-1).cfg.airport.icao,c.arr);launches.at(-1).done({time:60,kind:'landed',touch:{fpm:150},mission:'contract',score:75});assert.equal(w.CT_UI.state().contractsDone,1);assert.equal(w.CT_UI.state().log.length,1);
}));
test('malformed JSON falls back to usable state',()=>scenario(({nav,$})=>{nav('home');assert($('#h-fly'));},'{broken'));
test('structurally corrupted saved state recovers',()=>scenario(({nav,$})=>{nav('home');assert($('#h-fly'));nav('hangar');nav('settings/data');},{hours:'oops',log:null,favs:42,custom:null,loadout:null,settings:{keys:null}}));
test('weather presets, manual weather and time updates remain on their tabs',()=>scenario(({w,$,nav})=>{
 nav('fly/weather');const preset=$('#wpre button');preset.click();assert($('#wmetar'));const slider=$('#flyBody input[type="range"]');slider.value=slider.max;slider.dispatchEvent(new w.Event('input'));assert.equal(w.CT_UI.state().weather.preset,'custom');assert(!$('#wmetar').textContent.includes('undefined'));
 nav('fly/time');const time=$('#flyBody input[type="range"]');time.value=0;time.dispatchEvent(new w.Event('input'));assert.match($('#page').textContent,/00:00/);nav('fly/load');const fuel=$('#l-fuelPct');fuel.value=fuel.min;fuel.dispatchEvent(new w.Event('input'));assert.equal(w.CT_UI.state().flight.fuelPct,+fuel.min);
}));
test('aircraft registration is escaped in SVG artwork',()=>scenario(({w,$,nav})=>{nav('aircraft/b738');$('#dreg').value='<image/>';$('#dreg').dispatchEvent(new w.Event('change'));assert.equal(w.document.querySelectorAll('#page image').length,0);assert.match($('#page').textContent,/<IMAGE\/>/);}));
test('storage write failure reports a status message without crashing',()=>scenario(({w,$,nav})=>{w.Storage.prototype.setItem=()=>{throw Error('quota');};nav('settings/audio');$('[data-sw="sound"]').click();assert.match($('#toast').textContent,/Could not save/);}));
test('confirmed reset clears the resume snapshot too',()=>scenario(({w,$,nav})=>{w.localStorage.setItem('contrail.resume','{"ac":"b738"}');nav('settings/data');$('#dall').click();$('[data-ok]').click();assert.equal(w.localStorage.getItem('contrail.resume'),null);}));
test('multiple key capture clicks leave only one active binding',()=>scenario(({w,$,nav,key})=>{nav('settings/controls');const before=w.CT_UI.state().settings.keys.rollLeft;$('[data-bind="rollLeft"]').click();$('[data-bind="rollRight"]').click();key(w.document.body,'x','KeyX');assert.equal(w.CT_UI.state().settings.keys.rollLeft,before);assert.equal(w.CT_UI.state().settings.keys.rollRight,'KeyX');}));
test('pages pass automated semantic accessibility checks (layout checks excluded)',()=>scenario(async({w,nav})=>{
 w.HTMLCanvasElement.prototype.getContext=()=>null;
 w.eval(require('axe-core').source);
 const failures=[];
 for(const path of ['choose','racing','home','hangar','aircraft/b738','liveries/b738','fly/route','fly/weather','fly/time','fly/load','missions/career','missions/challenges','tutorial','settings/graphics','settings/controls','settings/audio','settings/data']){
  nav(path);const result=await w.axe.run(w.document,{rules:{'color-contrast':{enabled:false}}});
  for(const v of result.violations)failures.push({path,id:v.id,nodes:v.nodes.slice(0,3).map(n=>n.target)});
 }
 assert.deepEqual(failures,[]);
}));
test('tab arrow keys select sections without trapping normal Tab',()=>scenario(async({w,nav,$,key})=>{nav('fly/route');key($('[data-tab="route"]'),'ArrowRight');await new Promise(r=>setTimeout(r,10));assert($('#wmetar'));assert.equal(w.document.activeElement.dataset.tab,'weather');assert.equal(key(w.document.activeElement,'Tab'),true);}));
