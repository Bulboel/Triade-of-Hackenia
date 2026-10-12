const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync('index.html','utf8'),main=html.match(/<script>([\s\S]*?)<\/script>/)[1];new vm.Script(main);
const nodes=new Map(),$=id=>{if(!nodes.has(id))nodes.set(id,{classList:{add(){},remove(){}},style:{},setAttribute(){},focus(){}});return nodes.get(id)};
const ctx=vm.createContext({console,window:{},Math,$,document:{querySelectorAll:()=>[],getElementById:id=>$('#'+id)},setTimeout(){},aiMove(){},alert(){throw Error('Unavailable card')}});
for(const f of ['assets/data/card-stats.js','assets/data/september28-cards.js','assets/data/card-numbers.js','collection-polish.js','collection-updates.js','assets/pantheon-exclusive/cards.js'])vm.runInContext(fs.readFileSync(f,'utf8'),ctx);
vm.runInContext(main.slice(0,main.indexOf('const memoryCards=')),ctx);
const run=code=>vm.runInContext(code,ctx),plain=code=>JSON.parse(JSON.stringify(run(code)));
function loadFunction(name){const start=main.indexOf('function '+name+'('),end=main.indexOf('\nfunction ',start+1);assert(start>=0,name);run(main.slice(start,end<0?undefined:end));}
run(main.split('\n').find(l=>l.startsWith('const combatValue=')));
loadFunction('cloneCard');loadFunction('pantheonCaleizisDeck');run('initializeCardStats();');
const base=plain("catalogById('p05').v");
assert.deepEqual(plain('pantheonCaleizisDeck().map(c=>c.id)'),['pantheon-caleizis-time-marks','pantheon-caleizis-truth','p05','p64','p56']);
assert.deepEqual(plain('pantheonCaleizisDeck()[0].v'),[7,8,10,8]);assert.deepEqual(plain('pantheonCaleizisDeck()[1].v'),[9,10,10,8]);
assert.deepEqual(plain('pantheonCaleizisDeck()[2].v'),base.map(v=>v+1));
for(const [i,id] of [[3,'p64'],[4,'p56']])assert.deepEqual(plain(`pantheonCaleizisDeck()[${i}].v`),plain(`catalogById('${id}').v`));
run('pantheonCaleizisDeck()[2].v[0]=999');assert.deepEqual(plain("catalogById('p05').v"),base);assert.deepEqual(plain('pantheonCaleizisDeck()[2].v'),base.map(v=>v+1));
assert.equal(run('pool.some(c=>c.exclusiveOpponent)'),false);
for(const c of plain('Object.values(window.HACKENIA_PANTHEON_TEASERS)')){assert.equal(c.collectible,false);assert.equal(run(`catalogById('${c.id}')`),undefined);assert(fs.existsSync(c.image.src));}
run(`let economy={pantheonRewards:{}},saveSlotActive=false,pantheonOpponent='',hands,board,currentMode,gameType,turn,selected,locked,passing,matchRewarded,matchInProgress,boscoSneezeUsed,soryanTacticUsed;
let starts=0;function showGeorgesStoryStep(){starts++}function saveEconomy(){}function syncProgressSave(){}function activeDeck(){return {cards:[]}}function cancelBattleResult(){}function pantheonPlayerHand(){return [catalogById('p04')]}function resetMemories(){}function render(){}function msg(){}function applyRulePreset(key){appliedRule=key}let appliedRule;function playerCard(c){return cloneCard(c)}function pantheonGeorgesWon(){return false}`);
loadFunction('startPantheonCaleizis');loadFunction('recordPantheonCaleizisVictory');loadFunction('updatePantheonGeorges');
run('updatePantheonGeorges();startPantheonCaleizis()');assert.equal(run('starts'),0);assert.equal($('#pantheonCaleizisBtn').disabled,true);
run('economy.pantheonRewards.hilam=true;updatePantheonGeorges();startPantheonCaleizis()');assert.equal(run('starts'),1);assert.equal($('#pantheonCaleizisBtn').disabled,false);
run(main.split('\n').find(l=>l.startsWith('function newGame(')));
for(let i=0;i<2;i++){run("newGame('pantheon-caleizis')");assert.equal(run('appliedRule'),'elements-same-plus-dark');assert.deepEqual(plain('hands.a.map(c=>c.id)'),plain('pantheonCaleizisDeck().map(c=>c.id)'));assert.deepEqual(plain('hands.a[2].v'),base.map(v=>v+1));}
run('recordPantheonCaleizisVictory();recordPantheonCaleizisVictory()');assert.equal(run('economy.challenges.pantheonCaleizis'),true);
assert(html.includes("$('#pantheonCaleizisBtn').onclick=startPantheonCaleizis"));
console.log('Caleïzis: exact deck, bonus at launch, no stacking, catalog isolation, unlock and victory verified.');
