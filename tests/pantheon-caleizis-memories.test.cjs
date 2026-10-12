const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync('index.html','utf8'),main=html.match(/<script>([\s\S]*?)<\/script>/)[1];
new vm.Script(main);
const nodes=new Map();
function node(){const classes=new Set(['hidden']);return {classList:{add:c=>classes.add(c),remove:c=>classes.delete(c),contains:c=>classes.has(c)},style:{},setAttribute(){},focus(){},querySelector(tag){return this.children[tag]||(this.children[tag]=node())},children:{}}}
const $=id=>nodes.get(id)||null;
const document={createElement:()=>node(),body:{append(n){nodes.set('#'+n.id,n)}}};
const ctx=vm.createContext({console,$,document});
function run(code){return vm.runInContext(code,ctx)}
function load(name){const start=main.indexOf('function '+name+'('),end=main.indexOf('\nfunction ',start+1);assert(start>=0,name);run(main.slice(start,end<0?undefined:end))}
run(`let currentMode='pantheon-caleizis',turn='a',memoryPending=true,locked=false,memoryDraws={p:2,a:2},memoryBlocked={p:false,a:false},memoryDeck=['rock','fire'],revealedMemory=null,battleResultGeneration=1,matchInProgress=true,renderCount=0,postTurns=0;
function render(){renderCount++}function finishPostTurn(){postTurns++;memoryPending=false;turn='p';locked=false}
const AudioEngine={sfx(){throw new Error('regular draw')}};`);
load('canDrawMemory');load('showCaleizisMemoryBurn');load('drawMemory');
assert.equal(run("canDrawMemory('a')"),true);
run("drawMemory('a')");
assert.equal(run('memoryBlocked.a'),true);assert.equal(run('memoryDraws.a'),0);
assert.equal(run('memoryBlocked.p'),false);assert.equal(run('memoryDraws.p'),2);
assert.equal(run('memoryDeck.join()'),'rock,fire');assert.equal(run('revealedMemory'),null);
assert.equal(run('memoryPending'),false);assert.equal(run('locked'),true);assert.equal(run('postTurns'),0);
const overlay=$('#caleizisMemoryBurn'),button=overlay.querySelector('button');
assert.equal(overlay.classList.contains('hidden'),false);assert(overlay.innerHTML.includes('Caleizis-souvenirs-brulants.webp'));
button.onclick();assert.equal(run('postTurns'),1);assert.equal(overlay.classList.contains('hidden'),true);
run("turn='a';memoryPending=true;locked=false;drawMemory('a')");assert.equal(run('postTurns'),1);assert.equal(overlay.classList.contains('hidden'),true);
assert.equal(run("canDrawMemory('a')"),false);assert.equal(run("canDrawMemory('p')"),true);
// Player draws and other opponents still follow the regular drawing path.
run("turn='p';memoryPending=true;locked=false");assert.throws(()=>run("drawMemory('p')"),/regular draw/);
run("currentMode='story-caleizis';turn='a';memoryBlocked.a=false;memoryDraws.a=2;memoryPending=true;locked=false");assert.throws(()=>run("drawMemory('a')"),/regular draw/);
// A restarted duel can trigger its own scene; an old Continue cannot advance it.
run("currentMode='pantheon-caleizis';memoryPending=true;locked=false;drawMemory('a')");
assert.equal(overlay.classList.contains('hidden'),false);
run('battleResultGeneration++;');button.onclick();assert.equal(run('postTurns'),1);
assert(main.includes("$('#caleizisMemoryBurn')?.classList.add('hidden')"));
assert(main.includes('memoryDraws,memoryBlocked')); // Existing match snapshots persist the restriction.
console.log('Caleïzis memory burn: pre-draw interception, one scene per duel, blocked AI, intact deck/player draws and stale callback verified.');
