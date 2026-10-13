const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync('index.html','utf8'),main=html.match(/<script>([\s\S]*?)<\/script>/)[1];
const nodes=new Map(),$=key=>{if(!nodes.has(key))nodes.set(key,{textContent:'',disabled:false,style:{},attributes:{},setAttribute(k,v){this.attributes[k]=v},classList:{toggle(){},add(){},remove(){}}});return nodes.get(key)};
const c={console,$,story:{part10:'new'},economy:{gold:0,storyRewards:{}},collection:{},readSaved:()=>null,saveStory(){},saveCollection(){},saveStoryMatch(){c.saved=true},cancelBattleResult(){},activeDeck:()=>({cards:[]}),validDeck:()=>false,catalogById:id=>({id}),playerCard:x=>({...x}),cloneCard:x=>({...x}),resetMemories(){},render(){},msg(){},aiMove(){},showStoryMenu(){},document:{querySelectorAll:()=>[]},localStorage:{removeItem(){}},setTimeout:fn=>fn(),awardGold:n=>c.economy.gold+=n,queueStoryBooster:part=>{c.collection[part]??=1},runStorySequence:(sequence,after,start=0)=>{c.sequence=sequence;c.after=after;c.step=start},restoreStoryMatch:saved=>c.restored=saved};
vm.createContext(c);const run=s=>vm.runInContext(s,c);
run(main.slice(main.indexOf('const rulePresets='),main.indexOf('let currentRuleKey=')));
run("let currentRuleKey='basic-open';");
function load(name){const start=main.indexOf('function '+name+'('),end=main.indexOf('\nfunction ',start+1);assert(start>=0);const line=main.slice(start,main.indexOf('\n',start));run(line.endsWith('}')?line:main.slice(start,end))}
load('applyRulePreset');load('updateDuelRuleInfo');
run(fs.readFileSync('story-mine.js','utf8'));
c.renderTrialMenu();assert.equal($('#chapter2Btn').disabled,true);c.startTrialPart();assert.equal(c.sequence,undefined);
c.story.part10='complete';c.renderTrialMenu();assert.equal($('#chapter2Btn').disabled,false);c.startTrialPart();
assert(c.sequence.some(b=>b.cast.includes('myconides')&&b.text.includes('jumeaux endormis')));
assert(c.sequence.some(b=>b.speaker==='Soryan'&&b.text.includes('hérésie')));
assert(c.sequence.some(b=>b.speaker==='Kayla'&&b.text.includes('confiance')));
assert(c.sequence.some(b=>b.speaker==='Hilam'&&b.text.includes('confiance')));
assert(c.sequence.at(-1).text.includes('Addition et Identique'));
c.story.trialStep=7;c.startTrialPart();assert.equal(c.step,7);c.after();
assert.equal(c.currentMode,'story-nahakin');assert.equal(run('currentRuleKey'),'same-plus-open');
assert.equal($('#openRule').checked,true);assert.equal($('#sameRule').checked,true);assert.equal($('#plusRule').checked,true);
c.updateDuelRuleInfo();assert.equal($('#duelRuleLabel').textContent,'Clair identique + addition');
assert.deepEqual(Array.from(c.hands.a,x=>x.id),['p58','p67','p29','p09','p149']);assert.equal(new Set(c.hands.a).size,5);assert(c.saved);
c.story.stage='chapter2-part1-match';c.readSaved=()=>({mode:'story-nahakin',rule:'same-plus-open'});c.startTrialPart();assert.equal(c.restored.mode,'story-nahakin');c.readSaved=()=>null;
for(const counts of [{p:3,a:6},{p:4,a:4}]){c.endTrialGame(counts);assert.equal(c.story.trialWon,false);c.finishTrialPart();assert.equal(c.economy.gold,0);assert.equal(c.collection.chapter2Part1,undefined);c.after()}
c.endTrialGame({p:5,a:4});assert(c.sequence.some(b=>b.speaker==='Le Nahakin'&&b.text==='Ils m’ont l’air dignes…'));c.story.trialStep=1;c.startTrialPart();assert.equal(c.step,1);c.after();assert.equal(c.story.chapter2Part1,'complete');assert.equal(c.story.chapter2,'started');assert.equal(c.economy.gold,50);c.finishTrialPart();assert.equal(c.economy.gold,50);assert.equal(c.collection.chapter2Part1,1);
// One placement triggers Identique on two contacts and Addition on two others.
for(const n of ['dirs','elementDominance','combatValue'])run('const '+n+'='+main.match(new RegExp('const '+n+'=([^;]+);'))[1]+';');
for(const n of ['neighbors','contactValue','capture'])load(n);
run(`applyRulePreset('same-plus-open');const card=v=>({element:'neutral',v});const g=Array(9).fill(null);
g[4]={owner:'p',card:card([5,6,3,2])};g[1]={owner:'a',card:card([1,1,5,1])};g[5]={owner:'a',card:card([1,1,1,6])};g[7]={owner:'a',card:card([7,1,1,1])};g[3]={owner:'a',card:card([1,8,1,1])};const flips=capture(4,'p',g);`);
assert.equal(run('flips.size'),4);for(const p of [1,5])assert.equal(run(`flips.get(${p}).type`),'same');for(const p of [7,3])assert.equal(run(`flips.get(${p}).type`),'plus');
// Confirm that the fifth card exists in the real extension data.
run(fs.readFileSync('assets/data/september28-cards.js','utf8').replaceAll('window.','globalThis.'));
assert(fs.readFileSync('assets/data/september28-cards.js','utf8').includes('"id": "p149"'));
console.log('PASS: chapter gate, narrative resume, exact deck, combined captures, saved duel, defeat/draw guards, victory ending and one-time rewards.');
