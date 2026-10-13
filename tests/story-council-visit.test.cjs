const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync('index.html','utf8'),main=html.match(/<script>([\s\S]*?)<\/script>/)[1];
const nodes=new Map(),$=key=>{if(!nodes.has(key))nodes.set(key,{textContent:'',disabled:false,style:{},attributes:{},setAttribute(k,v){this.attributes[k]=v},classList:{toggle(){},add(){},remove(){}}});return nodes.get(key)};
const c={console,$,story:{part10:'complete',chapter2Part1:'new'},economy:{gold:0,storyRewards:{}},collection:{},readSaved:()=>null,saveStory(){},saveCollection(){},saveStoryMatch(){c.saved=true},cancelBattleResult(){},activeDeck:()=>({cards:[]}),validDeck:()=>false,catalogById:id=>({id}),playerCard:x=>({...x}),cloneCard:x=>({...x}),resetMemories(){},render(){},msg(){},aiMove(){},showStoryMenu(){},renderDeckBuilder(){c.editingDeck=true},openPanel(){},document:{querySelectorAll:()=>[]},localStorage:{removeItem(){}},setTimeout:fn=>fn(),awardGold:n=>c.economy.gold+=n,queueStoryBooster:part=>{c.collection[part]??=1},runStorySequence:(sequence,after,start=0)=>{c.sequence=sequence;c.after=after;c.step=start},restoreStoryMatch:saved=>c.restored=saved};
vm.createContext(c);const run=s=>vm.runInContext(s,c);
run(main.slice(main.indexOf('const rulePresets='),main.indexOf('let currentRuleKey=')));
run("let currentRuleKey='basic-open';");
function load(name){const start=main.indexOf('function '+name+'('),end=main.indexOf('\nfunction ',start+1);assert(start>=0);const line=main.slice(start,main.indexOf('\n',start));run(line.endsWith('}')?line:main.slice(start,end))}
load('applyRulePreset');load('updateDuelRuleInfo');run(fs.readFileSync('story-mine.js','utf8'));
c.renderCouncilVisitMenu();assert.equal($('#chapter2Part2Btn').disabled,true);c.startCouncilVisitPart();assert.equal(c.sequence,undefined);
c.story.chapter2Part1='complete';c.renderCouncilVisitMenu();assert.equal($('#chapter2Part2Btn').disabled,false);c.startCouncilVisitPart();
assert(c.sequence.some(b=>b.speaker==='Voix off'&&b.cast.includes('jhimm')&&b.text.includes('Caleïzis')&&b.text.includes('hydrelithes')));
assert(c.sequence.some(b=>b.text.includes('murmure')));
assert(c.sequence.some(b=>b.text.includes('aiguille')&&b.text.includes('pilier')&&b.emotions.bolduc==='surprised'));
assert(c.sequence.some(b=>b.speaker==='Kayla'&&b.text.includes('t’abuses')));
assert(c.sequence.some(b=>b.speaker==='Sameron'&&b.text.includes('courageux')));
assert(c.sequence.some(b=>b.text.includes('vieux fermier')&&b.text.includes('Jordan')));
assert(c.sequence.some(b=>b.cast.includes('grimgors')&&b.text.includes('espionnés')));
assert(c.sequence.some(b=>b.speaker==='Hilam'&&b.text.includes('ne partez pas')));
assert(c.sequence.some(b=>b.speaker==='Kayla'&&b.text.includes('fuyards')));
assert(c.sequence.at(-1).finalLabel.includes('Obscur · Éléments'));
assert(c.sequence.every(b=>b.location==='La salle du conseil'));
assert.equal(c.sequence.length,22);
assert(c.sequence.every(b=>!b.cast.includes('twinsFree')),'The removed twin/soigneurs scene does not appear in part 2');
for(const [oldStep,newStep] of [[4,4],[5,4],[12,11],[22,21]]){
 c.story.councilVisitIntroRevision=undefined;c.story.stage='chapter2-part2-intro';c.story.councilVisitStep=oldStep;
 c.startCouncilVisitPart();assert.equal(c.step,newStep);c.story.councilVisitStep=newStep;c.startCouncilVisitPart();assert.equal(c.step,newStep,'Resume migration applies only once');
}
c.story.councilVisitStep=12;c.startCouncilVisitPart();assert.equal(c.step,12);c.after();
assert.equal(c.currentMode,'story-zackarie');assert.equal(run('currentRuleKey'),'elements-dark');
assert.equal($('#openRule').checked,false);assert.equal($('#sameRule').checked,false);assert.equal($('#plusRule').checked,false);
c.updateDuelRuleInfo();assert.equal($('#duelRuleLabel').textContent,'Obscur éléments');
assert.deepEqual(Array.from(c.hands.a,x=>x.id),['p85','p84','p04','p149','p03']);assert.equal(new Set(c.hands.a).size,5);assert(c.saved);assert.equal($('#leftLabel').textContent,'Bolduc • votre main');assert.equal($('#rightLabel').textContent,'Zackarie');
c.story.stage='chapter2-part2-match';c.readSaved=()=>({mode:'story-zackarie',rule:'elements-dark'});c.startCouncilVisitPart();assert.equal(c.restored.mode,'story-zackarie');c.readSaved=()=>null;
for(const counts of [{p:3,a:6},{p:4,a:4}]){c.endCouncilVisitGame(counts);assert.equal(c.story.councilVisitWon,false);c.finishCouncilVisitPart();assert.equal(c.economy.gold,0);assert.equal(c.collection.chapter2Part2,undefined);c.after()}
c.endCouncilVisitGame({p:5,a:4});assert(c.sequence.at(-1).text.includes('Bolduc remporte'));c.startCouncilVisitPart();assert.equal(c.story.stage,'chapter2-part2-victory');c.after();assert.equal(c.story.chapter2Part2,'complete');assert.equal(c.story.chapter2,'started');assert.equal(c.economy.gold,50);c.finishCouncilVisitPart();assert.equal(c.economy.gold,50);assert.equal(c.collection.chapter2Part2,1);
c.renderCouncilVisitMenu();assert.equal($('#chapter2Part2Btn').textContent,'Rejouer');
// An invalid complete player deck must open the editor instead of starting another duel.
c.activeDeck=()=>({cards:[1,2,3,4,5]});c.saved=false;c.startCouncilVisitGame();assert(c.editingDeck);assert.equal(c.saved,false);
// The source hooks this duel into completion, replay and saved hand labels.
assert(html.includes("currentMode==='story-zackarie'){endCouncilVisitGame(c);return}"));
assert(html.includes("currentMode==='story-zackarie'?startCouncilVisitGame():"));
assert(html.includes("currentMode==='story-zackarie'?'Zackarie':"));
assert(html.includes("story.councilVisitStep=storyStep;saveStory()"));
assert(html.includes('id="chapter2Part2Btn"'));
console.log('PASS: council story, farmer revelation, chapter gate, exact Zackarie deck, dark elements, resume, retries, victory, one-time rewards and invalid deck guard.');


assert(html.includes("['nahakin','sameron','zackarie'].includes(key))return {mood,file:key+'-chibi-v2'}"));
