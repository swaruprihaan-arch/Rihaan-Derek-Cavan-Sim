const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {JSDOM,VirtualConsole}=require('jsdom'),THREE=require('three');
function harness(renderer){
 const dom=new JSDOM('<div id="app"></div><div id="flight"></div>',{url:'https://contrail.test/',runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:new VirtualConsole()});
 const w=dom.window;
 const ctx=new Proxy({measureText:t=>({width:String(t).length*7}),createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}})},{get:(o,k)=>k in o?o[k]:()=>{}});
 w.HTMLCanvasElement.prototype.getContext=()=>ctx;
 class Renderer{constructor(){this.shadowMap={};}setPixelRatio(){}setSize(){}render(){}dispose(){}}
 w.__THREE={...THREE,WebGLRenderer:renderer||Renderer};
 w.eval(fs.readFileSync('data.js','utf8'));
 let source=fs.readFileSync('sim.js','utf8').replace('let THREE = null;','let THREE = window.__THREE;');
 source=source.replace('  window.CT_SIM =','  window.__audit = {Session,makeTerrain};\n  window.CT_SIM =');
 w.eval(source);
 const D=w.CT_DATA;
 const cfg=(id,start='air')=>({ac:D.AIRCRAFT.find(a=>a.id===id),airport:D.AIRPORTS[0],runway:D.AIRPORTS[0].rwys[0],livery:D.liverySetFor(D.AIRCRAFT.find(a=>a.id===id))[0].c,start,weather:{...D.WEATHER_PRESETS[0],clouds:0,precip:0},hour:14,fuelPct:70,payloadPct:50,settings:{quality:'low',viewDist:10,sound:false,clouds:false,aiTraffic:false,keys:D.DEFAULT_KEYS,realism:{crashes:false},simpleFlight:true}});
 const close=()=>{w.CT_SIM.stop();w.close();};
 return {w,D,cfg,close};
}
test('all aircraft build finite meshes with usable dimensions',()=>{
 const h=harness();try{for(const ac of h.D.AIRCRAFT){const mesh=h.w.CT_SIM.buildAircraftMesh(ac,h.D.liverySetFor(ac)[0].c);assert(mesh.length>0&&mesh.span>0,ac.id);assert(Number.isFinite(mesh.bottom),ac.id);mesh.group.traverse(o=>{if(o.geometry){const p=o.geometry.attributes.position;if(p)assert(Array.from(p.array).every(Number.isFinite),ac.id);o.geometry.dispose();}if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose());});}}finally{h.close();}
});
test('all airport terrains are finite and runway centreline stays flat',()=>{
 const h=harness();try{for(const ap of h.D.AIRPORTS)for(const r of ap.rwys){const t=h.w.__audit.makeTerrain(ap.terrain,r.hdg*Math.PI/180,r.len/3.28084,5);for(const x of [-20000,-1000,0,1000,20000])for(const z of [-20000,0,20000])assert(Number.isFinite(t.h(x,z)),ap.icao);assert(Math.abs(t.h(0,0))<.001,ap.icao);}}finally{h.close();}
});
test('representative flight models initialise, advance physics and change cameras',async()=>{
 const h=harness();try{
  const models=['jetliner','fighter','ga','heliLight','glider','warbird'];
  for(const model of models){const ac=h.D.AIRCRAFT.find(a=>a.fm===model);assert(ac,model);await h.w.CT_SIM.start(h.cfg(ac.id),()=>{});const s=h.w.CT_SIM.session;assert(s&&s.s,ac.id);h.w.cancelAnimationFrame(s.raf);s.alive=false;
   for(let frame=0;frame<600;frame++){s.readControls(1/60);s.step(1/60);}
   for(const v of [...s.s.p.toArray(),...s.s.v.toArray(),...s.s.q.toArray(),s.s.fuel,s.s.ias])assert(Number.isFinite(v),ac.id);
   assert(Math.abs(s.s.q.length()-1)<1e-8,ac.id);assert(s.s.fuel>=0,ac.id);
   for(const mode of ['chase','cockpit','orbit','tower','flyby']){s.setCam(mode);s.updateCamera(1/60);assert(s.camera.position.toArray().every(Number.isFinite),ac.id+mode);}
   h.w.CT_SIM.stop();assert.equal(h.w.document.querySelector('#flight').classList.contains('on'),false);
  }
 }finally{h.close();}
});
test('renderer startup failure provides a working exit instead of a stuck loading screen',async()=>{
 const h=harness(class {constructor(){throw Error('WebGL unavailable');}});let exited=false;
 try{await h.w.CT_SIM.start(h.cfg('b738'),()=>{exited=true;});const b=h.w.document.querySelector('#fl-bail');assert(b);b.click();assert(exited);assert.equal(h.w.CT_SIM.session,null);}finally{h.close();}
});
test('stopping during asynchronous startup cancels the flight',async()=>{
 const h=harness();try{const pending=h.w.CT_SIM.start(h.cfg('b738'),()=>{});h.w.CT_SIM.stop();await pending;assert.equal(h.w.CT_SIM.session,null);assert.equal(h.w.document.querySelector('#flight').innerHTML,'');}finally{h.close();}
});
test('all aircraft remain finite in runway, approach and airborne starts',()=>{
 const h=harness();try{h.w.document.querySelector('#flight').innerHTML='<div id="fl-end"></div><div id="fl-msg"></div>';
 for(const ac of h.D.AIRCRAFT)for(const start of ['runway','final','air']){
  const cfg=h.cfg(ac.id,start),s=new h.w.__audit.Session(cfg,()=>{},h.w.document.querySelector('#flight'));
  s.hdg=cfg.runway.hdg*Math.PI/180;s.rwyLen=cfg.runway.len/3.28084;s.rwyW=45;s.elevM=cfg.airport.elev/3.28084;s.terrain=h.w.__audit.makeTerrain(cfg.airport.terrain,s.hdg,s.rwyLen,5);
  s.gearH=2;s.retract=true;s.scene=new THREE.Scene();s.windBase=new THREE.Vector3();s.turb=0;s.model={length:20,span:20};s.kb=cfg.settings.keys;s.reset();
  for(let i=0;i<240;i++){s.readControls(1/60);s.step(1/60);}
  assert([...s.s.p.toArray(),...s.s.v.toArray(),...s.s.q.toArray(),s.s.fuel].every(Number.isFinite),ac.id+' '+start);
 }
 }finally{h.close();}
});
test('in-flight extensions initialise and replay restores live flight configuration',async()=>{
 const h=harness();try{h.w.eval(fs.readFileSync('keypad.js','utf8'));h.w.eval(fs.readFileSync('ext.js','utf8'));await h.w.CT_SIM.start(h.cfg('b738'),()=>{});const s=h.w.CT_SIM.session;h.w.cancelAnimationFrame(s.raf);s.alive=false;
 assert.equal(s.ext.length,h.w.CT_EXT.length-2); // traffic and tutorial are explicitly disabled in this scenario
 const recorder=s.ext.find(x=>x.replay);assert(recorder);
 s.s.thr=.2;s.s.gear=1;for(let i=0;i<30;i++)recorder.frame(.06,false);
 s.s.thr=.8;s.s.gear=0;const pos=s.s.p.clone();recorder.replay();recorder.frame(.05,true);recorder.stop();
 assert.equal(s.s.thr,.8);assert.equal(s.s.gear,0);assert(s.s.p.equals(pos));
 h.w.CT_RESUME.save(s);assert.equal(h.w.CT_RESUME.get().ac,'b738');
 }finally{h.close();}
});
test('invalid resume snapshots are ignored',()=>{
 const h=harness();try{h.w.eval(fs.readFileSync('ext.js','utf8'));for(const value of ['{','{}','null','{"ac":"b738","p":[1,2]}']){h.w.localStorage.setItem('contrail.resume',value);assert.equal(h.w.CT_RESUME.get(),null);}}finally{h.close();}
});
test('restart clears prior results and pending completion, and disposal ignores late finishes',async()=>{
 const h=harness();try{await h.w.CT_SIM.start(h.cfg('b738'),()=>{});const s=h.w.CT_SIM.session;h.w.cancelAnimationFrame(s.raf);s.alive=false;
 s.s.t=100;s.finish('landed','Test landing',900);assert.equal(s.summary().score,900);s.reset();assert.equal(s.summary().score,undefined);assert.equal(s.summary().time,0);
 s.scheduleFinish('failed','Old attempt',0,10);s.reset();await new Promise(r=>setTimeout(r,20));assert.equal(s.endShown,false);
 h.w.CT_SIM.stop();assert.doesNotThrow(()=>s.finish('failed','Late callback',0));
 }finally{h.close();}
});
test('resume preserves helicopter collective, payload, trim and adjusted weather',async()=>{
 const h=harness();try{h.w.eval(fs.readFileSync('ext.js','utf8'));await h.w.CT_SIM.start(h.cfg('r44'),()=>{});let s=h.w.CT_SIM.session;h.w.cancelAnimationFrame(s.raf);s.alive=false;
 s.s.collective=.73;s.s.payload=.2;s.s.trim=.4;s.windBase.set(5,0,-3);s.turb=.6;h.w.CT_RESUME.save(s);const saved=h.w.CT_RESUME.get();assert(saved);
 const cfg=h.cfg('r44');cfg.resume=saved;cfg.weather=saved.weather;await h.w.CT_SIM.start(cfg,()=>{});s=h.w.CT_SIM.session;h.w.cancelAnimationFrame(s.raf);s.alive=false;
 assert.equal(s.s.collective,.73);assert.equal(s.s.payload,.2);assert.equal(s.s.trim,.4);assert(Math.abs(s.turb-.6)<1e-10);assert(s.windBase.distanceTo(new THREE.Vector3(5,0,-3))<1e-8);
 }finally{h.close();}
});
test('overlapping starts keep only the latest flight and can cancel during scenery loading',async()=>{
 const h=harness();try{const first=h.w.CT_SIM.start(h.cfg('b738'),()=>{});const second=h.w.CT_SIM.start(h.cfg('r44'),()=>{});await Promise.all([first,second]);assert.equal(h.w.CT_SIM.session.ac.id,'r44');
 const pending=h.w.CT_SIM.start(h.cfg('b738'),()=>{});await Promise.resolve();assert(h.w.CT_SIM.session);h.w.CT_SIM.stop();await pending;assert.equal(h.w.CT_SIM.session,null);assert.equal(h.w.document.querySelector('#flight').childElementCount,0);
 }finally{h.close();}
});
test('pause controls keep native keys and resume restores flight focus',async()=>{
 const h=harness();try{await h.w.CT_SIM.start(h.cfg('b738'),()=>{});const s=h.w.CT_SIM.session;h.w.cancelAnimationFrame(s.raf);s.alive=false;s.keys.KeyW=true;s.togglePause(true);assert.deepEqual(Object.keys(s.keys),[]);
 const button=h.w.document.querySelector('#fl-pause [data-a="resume"]');assert.equal(h.w.document.activeElement,button);const event=new h.w.KeyboardEvent('keydown',{key:' ',code:'Space',bubbles:true,cancelable:true});button.dispatchEvent(event);assert.equal(event.defaultPrevented,false);button.click();assert.equal(s.paused,false);assert.equal(h.w.document.activeElement,s.canvas);
 }finally{h.close();}
});
