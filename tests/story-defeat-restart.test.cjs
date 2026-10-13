const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync('index.html','utf8'),main=html.match(/<script>([\s\S]*?)<\/script>/)[1],nodes=new Map();
const $=key=>{if(!nodes.has(key))nodes.set(key,{textContent:'',disabled:false,style:{},attributes:{},setAttribute(k,v){this.attributes[k]=v},classList:{toggle(){},add(){},remove(){}}});return nodes.get(key)};
const c={console,$,story:{chapter2Part4:'started'},economy:{gold:0,storyRewards:{}},collection:{},readSaved:()=>null,saveStory(){},saveCollection(){},saveStoryMatch(){c.saved=true},cancelBattleResult(){},activeDeck:()=>({cards:[]}),validDeck:()=>false,catalogById:id=>({id,v:[6,5,5,5]}),playerCard:x=>({...x,v:[...x.v]}),cloneCard:x=>({...x,v:[...x.v]}),resetMemories(){},render(){},msg(){},aiMove(){},showStoryMenu(){},renderDeckBuilder(){c.editingDeck=true},openPanel(){},document:{querySelectorAll:()=>[]},localStorage:{removeItem(){}},setTimeout:fn=>fn(),awardGold:n=>c.economy.gold+=n,queueStoryBooster:part=>{c.collection[part]??=1},runStorySequence:(sequence,after,start=0)=>{c.sequence=sequence;c.after=after;c.step=start},restoreStoryMatch:saved=>c.restored=saved};
vm.createContext(c);const run=s=>vm.runInContext(s,c);
run(main.slice(main.indexOf('const rulePresets='),main.indexOf('let currentRuleKey=')));run("let currentRuleKey='basic-open';");
function load(name){const start=main.indexOf('function '+name+'('),end=main.indexOf('\nfunction ',start+1);assert(start>=0);const line=main.slice(start,main.indexOf('\n',start));run(line.endsWith('}')?line:main.slice(start,end))}
load('applyRulePreset');load('updateDuelRuleInfo');run(fs.readFileSync('story-mine.js','utf8'));

const cases=[
 ['story','part1',null,null,'startChapter1'],['story-forest','part2',null,null,'startForestPart'],
 ['story-mine','part4','mineStep','mineChallengeWon','startMinePart'],['story-mine-finale','part5','finalMineStep','finalMineWon','startFinalMinePart'],
 ['story-wolves','part6','rescueStep','rescueWon','startRescuePart'],['story-ven','part6bis','newFacesStep','newFacesWon','startNewFacesPart'],
 ['story-ghosts','part7','caveStep','caveWon','startCavePart'],['story-caleizis','part8','lakeStep','lakeWon','startLakePart'],
 ['story-lake-finale','part9','finaleStep','finaleWon','startFinalePart'],['story-release','part10','releaseStep','releaseWon','startReleasePart'],
 ['story-nahakin','chapter2Part1','trialStep','trialWon','startTrialPart'],['story-zackarie','chapter2Part2','councilVisitStep','councilVisitWon','startCouncilVisitPart'],
 ['story-dassom-golem','chapter2Part4','visitStep','visitWon','startDassomVisitPart'],['story-pixies','chapter2Part5','fairyMistsStep','fairyMistsWon','startFairyMistsPart'],
 ['story-larvae','chapter2Part6','lostCompanionsStep','lostCompanionsWon','startLostCompanionsPart']
];
c.startStoryGame=()=>{};c.startForestGame=()=>{};load('startChapter1');load('startForestPart');
run(main.slice(main.indexOf('function finishGameResults('),main.indexOf('\nfunction msg(',main.indexOf('function finishGameResults('))));
c.showStoryMenu=()=>{c.menuShown=true;$('#gameApp').classList.add('hidden')};
c.localStorage.removeItem=key=>c.removed=key;
c.cancelBattleResult=()=>c.cancelled=true;
for(const [mode,part,step,won,start] of cases){
 c.story=Object.fromEntries(['part1','part2','part3','part4','part5','part6','part6bis','part7','part8','part9','part10','chapter2Part1','chapter2Part2','chapter2Part3','chapter2Part4','chapter2Part5'].map(key=>[key,'complete']));
 c.story[part]='started';c.story.stage='old-match';if(step)c.story[step]=6;if(won)c.story[won]=true;
 c.currentMode=mode;c.board=Array.from({length:9},(_,i)=>({owner:i<3?'p':'a'}));c.menuShown=false;c.removed=null;c.cancelled=false;
 c.finishGameResults();assert(c.menuShown,mode+' returns to menu');assert(c.cancelled);assert.equal(c.removed,'hackenia-story-match');assert.equal(c.story.stage,'story-menu');assert.equal(c.story[part],'new');if(step)assert.equal(c.story[step],0);if(won)assert.equal(c.story[won],false);
 c.sequence=null;c[start]();assert(c.sequence?.length,mode+' starts narration');assert.equal(c.step,0,mode+' restarts first beat');
}
for(const mode of ['quick','deck','tutorial','pantheon-caleizis','pvp']){c.currentMode=mode;assert.equal(c.returnToStoryAfterDefeat({p:3,a:6}),false)}
c.currentMode='story-larvae';c.story={chapter2Part6:'started',stage:'chapter2-part6-match'};assert.equal(c.returnToStoryAfterDefeat({p:5,a:4}),false);assert.equal(c.story.stage,'chapter2-part6-match','victory remains on existing path');
c.story.chapter2Part6='complete';assert(c.returnToStoryAfterDefeat({p:3,a:6}));assert.equal(c.story.chapter2Part6,'complete','replay loss preserves earned completion');
new vm.Script(main);console.log('PASS: all 15 story duels return to menu after defeat, clear saved match, reset narration, preserve wins/rewards and other modes.');
