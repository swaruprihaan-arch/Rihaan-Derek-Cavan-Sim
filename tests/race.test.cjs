const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {JSDOM,VirtualConsole}=require('jsdom'),T=require('three');
function harness({saved,fail=false}={}){
 const errors=[],dom=new JSDOM('<div id="app"></div>',{url:'https://contrail.test/',runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:new VirtualConsole().on('jsdomError',e=>errors.push(e.message))}),w=dom.window;
 Object.defineProperty(w.HTMLElement.prototype,'clientWidth',{get:()=>1280});Object.defineProperty(w.HTMLElement.prototype,'clientHeight',{get:()=>720});
 const ctx=new Proxy({measureText:t=>({width:String(t).length*7}),createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}})},{get:(o,k)=>k in o?o[k]:()=>{}});w.HTMLCanvasElement.prototype.getContext=()=>ctx;
 class Renderer{constructor(){if(fail)throw Error('WebGL unavailable');this.shadowMap={};}setPixelRatio(){}setSize(){}render(){}dispose(){}}
 w.CT_SIM={preload:async()=>({...T,WebGLRenderer:Renderer})};if(saved)w.localStorage.setItem('contrail.race',JSON.stringify(saved));
 w.eval(fs.readFileSync('keypad.js','utf8'));w.eval(fs.readFileSync('race.js','utf8').replace('  window.CT_RACE =','  window.__raceAudit = {Race,fmt};\n  window.CT_RACE ='));
 w.CT_RACE.state().sound=false;
 const cfg=(car=0,track=0)=>({car:w.CT_RACE.CARS[car],color:'#F5B942',track:w.CT_RACE.TRACKS[track],laps:3,opp:2,diff:'normal',time:'auto',weather:'dry'});
 async function start(config=cfg()){await w.CT_RACE.start(config,()=>{});const r=w.CT_RACE.session;if(r){w.cancelAnimationFrame(r.raf);r.alive=false;}return r;}
 return {w,cfg,start,errors,close(){w.CT_RACE.stop();w.close();}};
}
test('all racing tracks initialise and all car physics remain finite in dry and rain',async()=>{
 const h=harness();try{for(let track=0;track<5;track++){const r=await h.start(h.cfg(0,track));assert(r);assert(r.len>500);assert(r.P.every(p=>p.toArray().every(Number.isFinite)));r.phase='race';
 for(const car of h.w.CT_RACE.CARS)for(const weather of ['dry','rain']){r.reset();r.phase='race';r.cfg.weather=weather;r.me.car=car;r.keys.KeyW=true;for(let n=0;n<240;n++){for(const c of r.cars)r.stepCar(c,1/60);r.collide();}assert([...r.me.pos.toArray(),...r.me.vel.toArray(),r.me.heading,r.me.rpm].every(Number.isFinite),car.id+weather);assert(r.me.vel.length()>0);}
 for(const mode of ['chase','far','hood']){r.camMode=mode;r.updateCamera(1/60);assert(r.camera.position.toArray().every(Number.isFinite));}
 }assert.deepEqual(h.errors,[]);}finally{h.close();}
});
test('racing startup failure gives a working return action',async()=>{const h=harness({fail:true});try{await h.start();assert(h.w.document.querySelector('#r-bail'));h.w.document.querySelector('#r-bail').click();assert.equal(h.w.CT_RACE.session,null);}finally{h.close();}});
test('racing startup cancellation and overlap never resurrect an old race',async()=>{const h=harness();try{const pending=h.w.CT_RACE.start(h.cfg(),()=>{});h.w.CT_RACE.stop();await pending;assert.equal(h.w.CT_RACE.session,null);const a=h.w.CT_RACE.start(h.cfg(0),()=>{}),b=h.w.CT_RACE.start(h.cfg(1),()=>{});await Promise.all([a,b]);assert.equal(h.w.CT_RACE.session.cfg.car.id,'rally');}finally{h.close();}});
test('race restart clears results, key state and previous lap markers',async()=>{const h=harness();try{const r=await h.start();r.result={pos:1};r.me._prevIdx=1;r.me.lapStart=99;r.keys.KeyW=true;r.reset();assert.equal(r.result,null);assert.equal(r.me._prevIdx,r.me.idx);assert.equal(r.me.lapStart,0);assert.deepEqual(Object.keys(r.keys),[]);}finally{h.close();}});
test('disposed races ignore delayed result callbacks',async()=>{const h=harness();try{const r=await h.start();h.w.CT_RACE.stop();assert.doesNotThrow(()=>r.showResults());}finally{h.close();}});
test('race lap timer rounds cleanly at a minute boundary',()=>{const h=harness();try{assert.equal(h.w.__raceAudit.fmt(59.999),'1:00.00');assert.equal(h.w.__raceAudit.fmt(60.01),'1:00.01');}finally{h.close();}});
test('racing saved-state corruption is sanitized',()=>{const h=harness({saved:{history:null,best:null,opp:1e9,laps:-1,color:'bad',races:'oops'}});try{const s=h.w.CT_RACE.state();assert(Array.isArray(s.history));assert(s.best&&typeof s.best==='object');assert(s.opp<=11);assert(s.laps>=1);assert.equal(typeof s.races,'number');assert.equal(s.color,'');}finally{h.close();}});
test('one-lap race requires a circuit before recording a finish',async()=>{const h=harness();try{const cfg=h.cfg();cfg.laps=1;const r=await h.start(cfg),c=r.me;r.phase='race';
 const cross=()=>{c._prevIdx=r.N-1;c.idx=0;c.pos.copy(r.P[0]);c.vel.set(0,0,0);r.stepCar(c,1/120);};cross();assert.equal(c.lap,1);assert.equal(c.finished,false);
 c.idx=Math.floor(r.N*.5);c.pos.copy(r.P[c.idx]);r.stepCar(c,1/120);r.raceT=90;cross();assert.equal(c.finished,true);assert.equal(c.laps.length,1);assert.equal(c.finishT,90);
 }finally{h.close();}});
test('race results persist once and an abandoned restart does not record the old result',async()=>{const h=harness();try{
 await h.w.CT_RACE.launch({opp:0,laps:1});let r=h.w.CT_RACE.session;h.w.cancelAnimationFrame(r.raf);r.alive=false;assert.equal(r.cars.length,1);r.raceT=90;Object.assign(r.me,{finished:true,finishT:90,best:90,lap:2,place:1});r.showResults();r.menu('exit');let s=h.w.CT_RACE.state();assert.equal(s.races,1);assert.equal(s.wins,1);assert.equal(s.best.coast.t,90);
 await h.w.CT_RACE.launch({opp:0,laps:1});r=h.w.CT_RACE.session;h.w.cancelAnimationFrame(r.raf);r.alive=false;r.result={pos:1,best:80,track:'coast',car:'sports'};r.reset();r.menu('exit');assert.equal(s.races,1);assert.equal(s.history.length,1);
 }finally{h.close();}});
test('countdown holds the grid still even with accelerator pressed',async()=>{const h=harness();try{const r=await h.start();const p=r.me.pos.clone();r.keys.KeyW=true;for(let i=0;i<120;i++)r.stepCar(r.me,1/60);assert(r.me.pos.distanceTo(p)<.001);assert.equal(r.me.vel.length(),0);}finally{h.close();}});
test('maximum racing field renders scene updates in wet night conditions',async()=>{const h=harness();try{const config=h.cfg();Object.assign(config,{opp:11,weather:'rain',time:'night'});const r=await h.start(config);assert.equal(r.cars.length,12);let now=r.last;for(let i=0;i<300;i++){now+=1000/60;r.frame(now);}assert.equal(r.phase,'race');assert(r.camera.projectionMatrix.elements.every(Number.isFinite));assert(r.cars.every(c=>[...c.pos.toArray(),...c.vel.toArray(),c.heading].every(Number.isFinite)));assert(!h.w.document.querySelector('#r-speed').textContent.includes('NaN'));}finally{h.close();}});
