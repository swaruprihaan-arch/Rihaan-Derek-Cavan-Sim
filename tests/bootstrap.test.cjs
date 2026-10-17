const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {JSDOM,VirtualConsole}=require('jsdom');
test('actual HTML script order boots, assets exist, scripts and styles parse',async()=>{
 const errors=[],dom=new JSDOM(fs.readFileSync('index.html','utf8'),{url:'https://contrail.test/',runScripts:'outside-only',virtualConsole:new VirtualConsole().on('jsdomError',e=>errors.push(e.message))});
 const w=dom.window;try{await new Promise(r=>w.addEventListener('load',r,{once:true}));
 for(const link of w.document.querySelectorAll('link[rel="stylesheet"]')){const path=link.getAttribute('href');if(path.startsWith('https:'))continue;assert(fs.existsSync(path),path);const style=w.document.createElement('style');style.textContent=fs.readFileSync(path,'utf8');w.document.head.appendChild(style);assert(style.sheet,path);}
 for(const el of w.document.querySelectorAll('script[src]')){const path=el.getAttribute('src');assert(fs.existsSync(path),path);const source=fs.readFileSync(path,'utf8');assert.doesNotThrow(()=>new vm.Script(source),path);w.eval(source);}
 w.document.dispatchEvent(new w.Event('DOMContentLoaded'));assert(w.CT_UI);assert(w.CT_SIM);assert(w.CT_KEYPAD);assert.equal(w.document.querySelectorAll('.sim-choice').length,2);for(const img of w.document.querySelectorAll('img[src]')){assert(fs.existsSync(img.getAttribute('src')),img.src);assert(img.alt);}
 assert.deepEqual(errors,[]);
 }finally{w.close();}
});
test('on-screen keypad presses, releases, highlights and cleans up',()=>{
 const dom=new JSDOM('<div id="root"></div>',{runScripts:'outside-only'}),w=dom.window;
 try{w.eval(fs.readFileSync('keypad.js','utf8'));const events=[];w.addEventListener('keydown',e=>events.push(['down',e.code]));w.addEventListener('keyup',e=>events.push(['up',e.code]));
 const pad=w.CT_KEYPAD(w.document.querySelector('#root'),[{code:'KeyW',label:'faster',row:0,col:0}],{}),b=pad.el.querySelector('button');
 b.dispatchEvent(new w.Event('pointerdown',{bubbles:true,cancelable:true}));b.dispatchEvent(new w.Event('pointercancel'));assert.deepEqual(events,[['down','KeyW'],['up','KeyW']]);pad.update({KeyW:true},[]);assert(b.classList.contains('down'));assert.match(pad.el.textContent,/faster/);pad.update({},['KeyW']);assert(b.classList.contains('hint'));assert(!b.classList.contains('down'));pad.toggle(false);assert.equal(pad.el.style.display,'none');pad.dispose();assert.equal(w.document.querySelector('#root').childElementCount,0);
 }finally{w.close();}
});
