const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync('index.html','utf8'),main=html.match(/<script>([\s\S]*?)<\/script>/)[1];
const nodes=new Map(),$=id=>{if(!nodes.has(id))nodes.set(id,{attributes:{},setAttribute(k,v){this.attributes[k]=v}});return nodes.get(id)};
const ctx=vm.createContext({console,$,Math});
const run=s=>vm.runInContext(s,ctx);
for(const n of ['dirs','elementDominance','combatValue'])run('const '+n+'='+main.match(new RegExp('const '+n+'=([^;]+);'))[1]+';');
run(main.slice(main.indexOf('const rulePresets='),main.indexOf("let currentRuleKey=")));
run("let currentMode='pantheon-caleizis',currentRuleKey='basic-open',pantheonOpponent='caleizis',board=[],hands={p:[],a:[]},blindHands={p:false};function randomLegalHand(){return []}");
function load(name){const start=main.indexOf('function '+name+'('),end=main.indexOf('\nfunction ',start+1);assert(start>=0,name);const line=main.slice(start,main.indexOf('\n',start));run(line.endsWith('}')?line:main.slice(start,end<0?undefined:end))}
for(const n of ['neighbors','contactValue','capture','applyRulePreset','pantheonDuelRule','updateDuelRuleInfo'])load(n);
run('applyRulePreset(pantheonDuelRule());updateDuelRuleInfo()');
assert.equal(run('currentRuleKey'),'elements-same-plus-dark');
assert.equal($('#gameApp').attributes['data-duel-mode'],'pantheon-caleizis');
assert.equal($('#openRule').checked,false);assert.equal($('#sameRule').checked,true);assert.equal($('#plusRule').checked,true);
for(const id of ['#openRule','#sameRule','#plusRule'])assert.equal($(id).disabled,true);
assert.equal($('#duelRuleLabel').textContent,'Obscur éléments + identique + addition');
assert(html.includes("'elements-same-plus-dark':'Éléments + Identique + Addition · Obscur'"));
// One placement activates elemental equality AND elemental sums on different contacts.
run(`const card=(element,v)=>({element,v});const g=Array(9).fill(null);
g[4]={owner:'p',card:card('water',[4,6,3,2])};
g[1]={owner:'a',card:card('fire',[1,1,5,1])};
g[5]={owner:'a',card:card('neutral',[1,1,1,6])};
g[7]={owner:'a',card:card('neutral',[7,1,1,1])};
g[3]={owner:'a',card:card('neutral',[1,8,1,1])};
const before=JSON.stringify(g.map(x=>x?.card));const copy=()=>g.map(x=>x?{owner:'a',card:x.card}:null);
const flips=capture(4,'p',g);`);
assert.equal(run('flips.size'),4);
assert.equal(run("flips.get(1).type"),'same');assert.equal(run('flips.get(1).attack'),5);
assert.equal(run("flips.get(5).type"),'same');
for(const p of [7,3]){assert.equal(run(`flips.get(${p}).type`),'plus');assert.equal(run(`flips.get(${p}).total`),10)}
assert.equal(run('JSON.stringify(g.map(x=>x?.card))'),run('before'));
// A simple superior side still captures; equal sides without two matches do not.
run("const plain=Array(9).fill(null);plain[4]={owner:'p',card:card('neutral',[1,7,1,1])};plain[5]={owner:'a',card:card('neutral',[1,1,1,6])};");
assert.equal(run("capture(4,'p',plain).get(5).type"),'basic');
// Pantheon AI simulates the same combined rule, without mutating the live board.
run(`board=Array.from({length:9},()=>({owner:'p',card:card('neutral',[1,1,1,1])}));
for(const p of [1,5,7,3])board[p]={owner:'p',card:g[p].card};board[4]=null;
hands={p:[],a:[g[4].card]};const originalOwners=board.map(x=>x?.owner).join();`);
run(fs.readFileSync('pantheon-ai.js','utf8'));
assert.equal(run('choosePantheonMove().bi'),4);assert.equal(run('board.map(x=>x?.owner).join()'),run('originalOwners'));
run("pantheonOpponent='hilam';applyRulePreset(pantheonDuelRule());updateDuelRuleInfo()");
assert.equal(run('currentRuleKey'),'elements-plus-open');assert.equal($('#duelRuleLabel').textContent,'Clair éléments + addition');
for(const id of ['#openRule','#sameRule','#plusRule'])assert.equal($(id).disabled,false);
console.log('Caleïzis rules: Obscur, elemental Same + Plus together, classic captures, AI simulation and rule labels verified.');

// Header layout follows the active mode, including leaving the trial and Story Caleïzis.
for(const mode of ['quick','deck','pvp','pantheon-hilam','story-caleizis','pantheon-caleizis']){
 run(`currentMode='${mode}';updateDuelRuleInfo()`);
 assert.equal($('#gameApp').attributes['data-duel-mode'],mode);
}
const headerCSS=html.slice(html.indexOf('/* Let the mobile header contain wrapped rules'),html.indexOf('</style>',html.indexOf('/* Let the mobile header contain wrapped rules')));
for(const line of headerCSS.split('\n').filter(line=>line.includes('#gameApp')))assert(line.includes('#gameApp[data-duel-mode="pantheon-caleizis"]'));
console.log('Mobile header adjustment is isolated to the Pantheon Caleïzis duel.');
