// Every failed story duel returns to the chapter menu and restarts its whole part.
function returnToStoryAfterDefeat(counts){
 if(counts.p>counts.a)return false;
 const parts={
  story:['part1'],
  'story-forest':['part2'],
  'story-mine':['part4','mineStep','mineChallengeWon'],
  'story-mine-finale':['part5','finalMineStep','finalMineWon'],
  'story-wolves':['part6','rescueStep','rescueWon'],
  'story-ven':['part6bis','newFacesStep','newFacesWon'],
  'story-ghosts':['part7','caveStep','caveWon'],
  'story-caleizis':['part8','lakeStep','lakeWon'],
  'story-lake-finale':['part9','finaleStep','finaleWon'],
  'story-release':['part10','releaseStep','releaseWon'],
  'story-nahakin':['chapter2Part1','trialStep','trialWon'],
  'story-zackarie':['chapter2Part2','councilVisitStep','councilVisitWon'],
  'story-dassom-golem':['chapter2Part4','visitStep','visitWon'],
  'story-pixies':['chapter2Part5','fairyMistsStep','fairyMistsWon'],
  'story-larvae':['chapter2Part6','lostCompanionsStep','lostCompanionsWon']
 };
 const entry=parts[currentMode];if(!entry)return false;
 const [part,step,won]=entry;
 if(story[part]!=='complete')story[part]='new';
 if(step)story[step]=0;if(won)story[won]=false;
 if(part==='part8'){story.lakeEncounterResolved=false;story.lakePath=null}
 story.stage='story-menu';
 try{localStorage.removeItem('hackenia-story-match')}catch{}
 matchInProgress=false;passing=false;memoryPending=false;locked=false;selected=null;
 cancelBattleResult();$('#storyScene').classList.add('hidden');
 $('#turnCover').classList.add('hidden');$('#memoryReveal').classList.add('hidden');$('#memoryChoice').classList.add('hidden');
 saveStory();showStoryMenu();
 const accordion=$(part.startsWith('chapter2')?'#chapter2Accordion':'#chapter1Accordion');if(accordion)accordion.open=true;
 return true;
}

// Chapter 1, part 4: the torch's challenge. Only a victory opens the epilogue.
function renderMineMenu() {
  const unlocked = story.part3 === 'complete', complete = story.part4 === 'complete';
  $('#storyPart4').classList.toggle('locked', !unlocked);
  $('#storyPart4').classList.toggle('complete', complete);
  $('#chapter1Part4Btn').disabled = !unlocked;
  $('#chapter1Part4Btn').textContent = !unlocked ? 'Verrouillé' : complete ? 'Rejouer' : String(story.stage).startsWith('part4') ? 'Continuer' : 'Commencer';
  $('#chapter1Part4Status').textContent = !unlocked ? 'Terminez la partie 3 pour rejoindre les mines.' : complete ? 'Partie terminée — une araignée blanche a fui dans un tunnel.' : story.part4 === 'retry' ? 'Remportez le défi de la torche pour avancer.' : 'Des mineurs en danger et deux torches bleues.';
  $('#chapter2Card').classList.toggle('locked', !complete);
  $('#chapter2Status').textContent = complete ? 'La suite de l’aventure sera ajoutée prochainement.' : 'Terminez la partie 4 pour continuer.';
  $('#chapter2Btn').textContent = complete ? 'Bientôt disponible' : 'Verrouillé';
}
function startMinePart() {
  if (story.part3 !== 'complete') return;
  const saved = readSaved('hackenia-story-match', null);
  if (story.stage === 'part4-match' && saved?.mode === 'story-mine') { restoreStoryMatch(saved); return; }
  if (story.stage === 'part4-victory') { showMineVictory(); return; }
  if (story.part4 === 'retry') { startMineGame(); return; }
  const resume = story.stage === 'part4-intro' ? story.mineStep : 0;
  story.part4 = 'started'; story.stage = 'part4-intro'; story.mineChallengeWon = false; saveStory();
  runStorySequence([
    {speaker:'Voix off',location:'Berdésa',cast:['grimgors','jhimm'],mood:'surprised',text:'À Berdésa, un villageois les interpelle : des mineurs sont en danger ! Grimgors et Jhimm partent aussitôt en tête du groupe.'},
    {speaker:'Voix off',location:'Les mines de Berdésa',cast:[],text:'Dans l’entrée de la mine, des wagons renversés et des pioches brisées encombrent le sol. Deux torches bleues éclairent une unique porte de bois.'},
    {speaker:'Kala',location:'Les mines de Berdésa',cast:['kala'],text:'Cette lumière… Attendez, je prends une torche.'},
    {speaker:'La voix de la torche',location:'Les mines de Berdésa',cast:['kala'],text:'Accepte mon défi et tu verras plus clair que jamais.'},
    {speaker:'Kala',location:'Les mines de Berdésa',cast:['kala'],text:'Alors montre-moi le chemin.',finalLabel:'Accepter le défi'}
  ], startMineGame, resume);
}
function startMineGame() {
  if (story.part3 !== 'complete') return;
  if (activeDeck().cards.length === 5 && !validDeck(activeDeck())) { renderDeckBuilder(); openPanel('#deckScreen'); return; }
  applyRulePreset('basic-open'); currentMode = 'story-mine'; gameType = 'ai';
  const chosen = validDeck(activeDeck()) ? deckCardsWithFoil(activeDeck()) : ['p27','p23','p04','p08','p13'].map(catalogById);
  const opponent = ['p38','p36','p60','p17','p01'].map(catalogById);
  board = Array(9).fill(null); hands = {p:chosen.map(playerCard), a:opponent.map(cloneCard)};
  selected = null; turn = 'p'; locked = false; passing = false; matchRewarded = false; matchInProgress = true;
  resetMemories(); story.part4 = 'started'; story.stage = 'part4-match'; story.mineChallengeWon = false; story.mineStep = 0; saveStory();
  $('#storyScene').classList.add('hidden'); $('#menuScreen').classList.add('hidden');
  document.querySelectorAll('.panel-screen').forEach(x => x.classList.add('hidden'));
  $('#gameApp').classList.remove('hidden'); $('#leftLabel').textContent = 'Kala • votre main'; $('#rightLabel').textContent = 'La voix de la torche'; $('#rulesBtn').style.display = 'none';
  msg('Le défi de la torche', 'Remportez ce duel pour éclairer la suite du chemin.'); render(); saveStoryMatch();
}
function endMineGame(counts) {
  try { localStorage.removeItem('hackenia-story-match'); } catch {}
  if (counts.p > counts.a) {
    story.stage = 'part4-victory'; story.mineChallengeWon = true; story.mineStep = 0; saveStory();
    msg('Le défi est remporté', 'La lumière bleue révèle le chemin à Kala.'); setTimeout(showMineVictory, 1200);
  } else {
    story.part4 = 'retry'; story.stage = 'part4-retry'; story.mineChallengeWon = false; saveStory();
    msg(counts.p === counts.a ? 'Égalité' : 'Le défi continue', 'La torche vous attend pour une nouvelle tentative.');
    setTimeout(() => runStorySequence([{speaker:'La voix de la torche',location:'Les mines de Berdésa',cast:['kala'],text:'La lumière reste voilée. Reviens tenter le défi.',finalLabel:'Réessayer le duel'}], startMineGame), 1200);
  }
}
function showMineVictory() {
  if (!story.mineChallengeWon) return;
  const resume = story.stage === 'part4-victory' ? story.mineStep : 0;
  story.stage = 'part4-victory'; saveStory();
  runStorySequence([
    {speaker:'Kala',location:'Les mines de Berdésa',cast:['kala'],mood:'surprised',text:'Je vois les galeries… comme si j’étais déjà venue ici.'},
    {speaker:'Voix off',location:'Les mines de Berdésa',cast:['grimgors'],text:'Deux secondes plus tard, Grimgors enfonce la porte de bois. Le groupe s’engouffre dans le passage.'},
    {speaker:'Voix off',location:'Les mines de Berdésa',cast:[],text:'Une horde d’araignées noires leur barre la route. Ensemble, les aventuriers les repoussent sans difficulté.'},
    {speaker:'Kala',location:'Les mines de Berdésa',cast:['kala'],mood:'surprised',text:'Là ! Une araignée blanche… Elle s’enfuit dans cet autre tunnel.'},
    {speaker:'Voix off',location:'Les mines de Berdésa',cast:['kala'],text:'La petite silhouette disparaît dans l’obscurité. Fin de la partie 4 — un booster et 50 pièces d’or à la première réussite.',finalLabel:'Terminer la partie 4'}
  ], finishMinePart, resume);
}
function finishMinePart() {
  if (!story.mineChallengeWon) return;
  queueStoryBooster('part4');
  story.part4 = 'complete'; story.chapter1 = story.part6 === 'complete' ? 'complete' : 'started'; story.part5 = story.part5 === 'complete' ? 'complete' : 'new'; story.stage = 'part4-complete'; story.mineStep = 0; story.unlocked = Math.max(2, story.unlocked);
  if (!economy.storyRewards.part4) { economy.storyRewards.part4 = true; awardGold(50); }
  saveCollection(); saveStory(); showStoryMenu();
}

// Chapter 1, part 5. Rewards and narrative progress survive replay and reload.
function renderFinalMineMenu(){
 const unlocked=story.part4==='complete',complete=story.part5==='complete';
 $('#storyPart5').classList.toggle('locked',!unlocked);$('#storyPart5').classList.toggle('complete',complete);
 $('#chapter1Part5Btn').disabled=!unlocked;$('#chapter1Part5Btn').textContent=!unlocked?'Verrouillé':complete?'Rejouer':String(story.stage).startsWith('part5')?'Continuer':'Commencer';
 $('#chapter1Part5Status').textContent=!unlocked?'Terminez la partie 4.':complete?'Partie terminée — les mineurs sont en sécurité.':'Sauvez les mineurs et affrontez l’araignée géante.';
 $('#chapter2Card').classList.toggle('locked',!complete);$('#chapter2Status').textContent=complete?'La suite sera ajoutée prochainement.':'Terminez la partie 5 pour continuer.';$('#chapter2Btn').textContent=complete?'Bientôt disponible':'Verrouillé';
}
function startFinalMinePart(){
 if(story.part4!=='complete')return;
 const saved=readSaved('hackenia-story-match',null);
 if(story.stage==='part5-match'&&saved?.mode==='story-mine-finale'){restoreStoryMatch(saved);return}
 if(story.stage==='part5-victory'){showFinalMineVictory();return}
 if(story.part5==='retry'){startFinalMineGame();return}
 const resume=story.stage==='part5-intro'?story.finalMineStep:0;
 story.part5='started';story.chapter1='started';story.stage='part5-intro';story.finalMineWon=false;saveStory();
 runStorySequence([
  {speaker:'Voix off',location:'Les mines de Berdésa',cast:['kala','grimgors','eberien'],text:'Dans les galeries, Kala observe les araignées blanches. Elles s’écartent des mineurs sans jamais les attaquer.'},
  {speaker:'Kala',location:'Les mines de Berdésa',cast:['kala','grimgors','jhimm'],text:'Attendez… les araignées blanches sont inoffensives pour les humains ! Inutile de les combattre. Occupons-nous des mineurs.'},
  {speaker:'Jhimm',location:'Les mines de Berdésa',cast:['jhimm','kala'],text:'Je les emmène en lieu sûr. Restez ensemble et suivez-moi ! Je reviens dès qu’ils sont à l’abri.'},
  {speaker:'Voix off',location:'Les mines de Berdésa',cast:['jhimm'],text:'Jhimm aide les mineurs à avancer et les conduit rapidement hors de la mine. Une fois tout le monde en sécurité, il retourne retrouver ses amis.'},
  {speaker:'Jhimm',location:'Les mines de Berdésa',cast:['jhimm','bolduc','grimgors'],mood:'neutral',text:'Ils sont à l’abri. Vous pouvez compter sur moi pour la suite !'},
  {speaker:'Voix off',location:'Les mines de Berdésa',cast:['spider'],text:'Au dernier renfoncement, une énorme araignée noire se dresse devant le groupe. Celle-ci n’a rien des paisibles araignées blanches : elle leur barre le passage.'},
  {speaker:'Bolduc',location:'Les mines de Berdésa',cast:['bolduc','grimgors','eberien'],text:'Alors on va se frayer un chemin !',finalLabel:'Affronter l’araignée'}
 ],startFinalMineGame,resume);
}
function startFinalMineGame(){
 if(story.part4!=='complete')return;
 if(activeDeck().cards.length===5&&!validDeck(activeDeck())){renderDeckBuilder();openPanel('#deckScreen');return}
 applyRulePreset('basic-open');currentMode='story-mine-finale';gameType='ai';
 const chosen=validDeck(activeDeck())?deckCardsWithFoil(activeDeck()):['p27','p23','p04','p08','p13'].map(catalogById);
 board=Array(9).fill(null);hands={p:chosen.map(playerCard),a:Array.from({length:5},()=>cloneCard(catalogById('p02')))};
 selected=null;turn='p';locked=false;passing=false;matchRewarded=false;matchInProgress=true;resetMemories();
 story.part5='started';story.stage='part5-match';story.finalMineWon=false;story.finalMineStep=0;saveStory();
 $('#storyScene').classList.add('hidden');$('#menuScreen').classList.add('hidden');document.querySelectorAll('.panel-screen').forEach(x=>x.classList.add('hidden'));
 $('#gameApp').classList.remove('hidden');$('#leftLabel').textContent='Les aventuriers';$('#rightLabel').textContent='L’araignée géante';$('#rulesBtn').style.display='none';
 msg('La dernière galerie','Remportez le duel pour dégager le passage.');render();saveStoryMatch();
}
function endFinalMineGame(counts){
 try{localStorage.removeItem('hackenia-story-match')}catch{}
 if(counts.p>counts.a){story.stage='part5-victory';story.finalMineWon=true;story.finalMineStep=0;saveStory();msg('La voie est libre !','Bolduc s’avance pour porter le dernier coup.');setTimeout(showFinalMineVictory,1200)}
 else{story.part5='retry';story.stage='part5-retry';story.finalMineWon=false;saveStory();msg(counts.p===counts.a?'Égalité':'L’araignée vous barre la route','Réessayez pour ouvrir le passage.');setTimeout(()=>runStorySequence([{speaker:'Bolduc',location:'Les mines de Berdésa',cast:['bolduc'],text:'On reprend notre souffle… et on y retourne !',finalLabel:'Réessayer'}],startFinalMineGame),1200)}
}
function showFinalMineVictory(){
 if(!story.finalMineWon)return;
 const resume=story.stage==='part5-victory'?story.finalMineStep:0;story.stage='part5-victory';saveStory();
 runStorySequence([
  {speaker:'Voix off',location:'Les mines de Berdésa',cast:['bolduc','grimgors'],text:'Bolduc abat son gourdin sur l’immense tête de l’araignée. Le choc résonne dans toute la galerie : la créature s’effondre enfin.'},
  {speaker:'Voix off',location:'Berdésa',cast:['kala','jhimm','bolduc'],mood:'neutral',text:'Les aventuriers rejoignent au village les mineurs que Jhimm a mis à l’abri. Ils sont enfin en sécurité.'},
  {speaker:'Voix off',location:'Berdésa',cast:['grimgors','bolduc','eberien'],mood:'neutral',text:'À l’auberge, un repas chaud et une nuit de repos leur rendent des forces. Puis ils reprennent la route vers la grotte des jumeaux, le passage qui mène au lac.',finalLabel:'Terminer la partie 5'}
 ],finishFinalMinePart,resume);
}
function finishFinalMinePart(){
 if(!story.finalMineWon)return;
 queueStoryBooster('part5');story.part5='complete';story.part6=story.part6==='complete'?'complete':'new';story.chapter1=story.part10==='complete'?'complete':'started';story.stage='part5-complete';story.finalMineStep=0;story.unlocked=Math.max(2,story.unlocked);
 if(!economy.storyRewards.part5){economy.storyRewards.part5=true;awardGold(50)}saveCollection();saveStory();showStoryMenu();
}


// A scripted encounter: the wolf pack intentionally has five copies of p16.
function renderRescueMenu(){
 const unlocked=story.part5==='complete',complete=story.part6==='complete';
 $('#storyPart6').classList.toggle('locked',!unlocked);$('#storyPart6').classList.toggle('complete',complete);
 $('#chapter1Part6Btn').disabled=!unlocked;$('#chapter1Part6Btn').textContent=!unlocked?'Verrouillé':String(story.stage).startsWith('part6')&&story.stage!=='part6-complete'?'Continuer':complete?'Rejouer':'Commencer';
 $('#chapter1Part6Status').textContent=!unlocked?'Terminez la partie 5.':complete?'Messire Balai a rejoint les aventuriers.':'Une chute, une horde de loups et une rencontre inattendue.';
 $('#chapter2Card').classList.toggle('locked',!complete);$('#chapter2Status').textContent=complete?'La suite sera ajoutée prochainement.':'Terminez la partie 6 pour continuer.';$('#chapter2Btn').textContent=complete?'Bientôt disponible':'Verrouillé';
}
function startRescuePart(){
 if(story.part5!=='complete')return;
 const saved=readSaved('hackenia-story-match',null);
 if(story.stage==='part6-match'&&saved?.mode==='story-wolves'){restoreStoryMatch(saved);return}
 if(story.stage==='part6-victory'){showRescueVictory();return}
 if(story.stage==='part6-match'||story.part6==='retry'){startRescueGame();return}
 const resume=story.stage==='part6-intro'?story.rescueStep:0;
 story.part6='started';story.chapter1='started';story.stage='part6-intro';story.rescueWon=false;saveStory();
 runStorySequence([
  {speaker:'Voix off',location:'Le Bois Tendre',cast:['kala','grimgors','eberien'],mood:'surprised',text:'Les aventuriers poursuivent leur route vers la grotte des jumeaux. Soudain, un énorme CRAC retentit au-dessus d’eux !'},
  {speaker:'Voix off',location:'Le Bois Tendre',cast:[],text:'Un portail s’est ouvert dans le ciel. Une chose en tombe et disparaît derrière les arbres dans un fracas de branches.'},
  {speaker:'Jhimm',location:'Le Bois Tendre',cast:['jhimm','kala'],mood:'surprised',text:'Quelqu’un a peut-être besoin de nous ! Vite, allons voir !'},
  {speaker:'Voix off',location:'Le Bois Tendre',cast:['bolduc','grimgors','eberien'],text:'Ni une ni deux, les aventuriers courent vers le lieu de la chute. En approchant, ils entendent une voix : « Au secours ! À l’aide ! »'},
  {speaker:'Voix off',location:'Le Bois Tendre',cast:['wolves'],text:'Les appels viennent de derrière un arbre. Une pauvre victime y est encerclée par une horde de loups affamés.'},
  {speaker:'Grimgors',location:'Le Bois Tendre',cast:['grimgors','jhimm','bolduc'],text:'Tenez bon ! Nous allons éloigner ces loups ! Attention : ce duel se joue avec la règle « Addition » (Clair). Si les valeurs de deux côtés adjacents forment la même somme, les cartes concernées peuvent être capturées !',finalLabel:'Affronter les loups'}
 ],startRescueGame,resume);
}
function startRescueGame(){
 if(story.part5!=='complete')return;
 if(activeDeck().cards.length===5&&!validDeck(activeDeck())){renderDeckBuilder();openPanel('#deckScreen');return}
 applyRulePreset('plus-open');currentMode='story-wolves';gameType='ai';
 const chosen=validDeck(activeDeck())?deckCardsWithFoil(activeDeck()):['p27','p23','p04','p08','p13'].map(catalogById);
 board=Array(9).fill(null);hands={p:chosen.map(playerCard),a:Array.from({length:5},()=>cloneCard(catalogById('p16')))};
 selected=null;turn='p';locked=false;passing=false;matchRewarded=false;matchInProgress=true;resetMemories();
 story.part6='started';story.stage='part6-match';story.rescueWon=false;story.rescueStep=0;saveStory();
 $('#storyScene').classList.add('hidden');$('#menuScreen').classList.add('hidden');document.querySelectorAll('.panel-screen').forEach(x=>x.classList.add('hidden'));
 $('#gameApp').classList.remove('hidden');$('#leftLabel').textContent='Les aventuriers';$('#rightLabel').textContent='Horde de loups affamés';$('#rulesBtn').style.display='none';
 msg('Attention : règle Addition !','Pour affronter les loups, la règle « Addition » (Clair) est active. Deux sommes adjacentes égales peuvent déclencher des captures. Sauvez la personne encerclée !');render();saveStoryMatch();
}
function endRescueGame(counts){
 try{localStorage.removeItem('hackenia-story-match')}catch{}
 if(counts.p>counts.a){story.stage='part6-victory';story.rescueWon=true;story.rescueStep=0;saveStory();setTimeout(showRescueVictory,1200)}
 else{story.part6='retry';story.stage='part6-retry';story.rescueWon=false;saveStory();setTimeout(()=>runStorySequence([{speaker:'Jhimm',location:'Le Bois Tendre',cast:['jhimm'],text:'Les loups sont encore là. Ne lâchons rien, cette personne compte sur nous !',finalLabel:'Réessayer'}],startRescueGame),1200)}
}
function showRescueVictory(){
 if(!story.rescueWon)return;
 const resume=story.stage==='part6-victory'?story.rescueStep:0;story.stage='part6-victory';saveStory();
 runStorySequence([
  {speaker:'Voix off',location:'Le Bois Tendre',cast:['kala','grimgors','eberien'],mood:'neutral',text:'Les loups s’enfuient enfin. Les aventuriers se précipitent derrière l’arbre pour vérifier que la victime n’a rien.'},
  {speaker:'Jhimm',location:'Le Bois Tendre',cast:['jhimm','balai'],mood:'surprised',text:'Vous êtes blessé ?… Par toutes les étoiles, c’est un balai à chiottes !'},
  {speaker:'Messire Balai',location:'Le Bois Tendre',cast:['balai','grimgors'],emotions:{balai:'neutral',grimgors:'surprised'},text:'Un balai à chiottes qui parle, oui ! Messire Balai, pour vous servir. Merci, j’ai bien cru finir entre les crocs de ces loups !'},
  {speaker:'Voix off',location:'Le Bois Tendre',cast:['kala','balai','bolduc'],mood:'surprised',text:'Le groupe reste un instant bouche bée devant cet étrange rescapé. Puis les couleurs s’effacent : un souvenir d’une autre aventure apparaît…'},
  {speaker:'Voix off',location:'Le Bois Tendre',cast:['violette','mirahel','dede'],flashback:true,text:'Dans ce souvenir en noir et blanc, Violette, Mirahel et Dédé la bricole viennent eux aussi de sauver Messire Balai des loups.'},
  {speaker:'Messire Balai',location:'Le Bois Tendre',cast:['balai','violette'],flashback:true,mood:'neutral',text:'Messire Balai, fidèle serviteur ! Je vous dois une fière chandelle !'},
  {speaker:'Violette',location:'Le Bois Tendre',cast:['violette','balai'],flashback:true,mood:'surprised',text:'Attends… on vient de sauver un balai à chiottes qui parle ?!'},
  {speaker:'Voix off',location:'Le Bois Tendre',cast:['violette','mirahel','dede'],flashback:true,mood:'happy',text:'Violette, Mirahel et Dédé la bricole se regardent, puis explosent de rire. Messire Balai ne sait plus où donner des brins !'},
  {speaker:'Voix off',location:'Le Bois Tendre',cast:['grimgors','balai','kala'],text:'Le souvenir s’estompe et les couleurs reviennent. Messire Balai est toujours là, sain et sauf, auprès des aventuriers.'},
  {speaker:'Ébérien',location:'Le Bois Tendre',cast:['eberien','balai','jhimm'],emotions:{eberien:'neutral',balai:'neutral',jhimm:'neutral'},text:'Venez avec nous, Messire Balai. Vous serez plus en sécurité en bonne compagnie.'},
  {speaker:'Messire Balai',location:'Le Bois Tendre',cast:['balai','bolduc','grimgors'],mood:'neutral',text:'Avec grand plaisir ! Et, si possible, loin des loups !'},
  {speaker:'Voix off',location:'Le Bois Tendre',cast:['grimgors','balai','eberien'],mood:'neutral',text:'Messire Balai se joint au groupe. Les aventuriers reprennent enfin la route vers la grotte des jumeaux.',finalLabel:'Terminer la partie 6'}
 ],finishRescuePart,resume);
}
function finishRescuePart(){
 if(!story.rescueWon)return;
 queueStoryBooster('part6');story.part6='complete';story.part6bis=story.part6bis==='complete'?'complete':'new';story.part7=story.part7==='complete'?'complete':'new';story.chapter1=story.part10==='complete'?'complete':'started';story.stage='part6-complete';story.rescueStep=0;story.unlocked=Math.max(2,story.unlocked);
 if(!economy.storyRewards.part6){economy.storyRewards.part6=true;awardGold(50)}saveCollection();saveStory();showStoryMenu();
}


function renderCaveMenu(){
 const unlocked=caveAccessible(),complete=story.part7==='complete';
 $('#storyPart7').classList.toggle('locked',!unlocked);$('#storyPart7').classList.toggle('complete',complete);
 $('#chapter1Part7Btn').disabled=!unlocked;$('#chapter1Part7Btn').textContent=!unlocked?'Verrouillé':String(story.stage).startsWith('part7')&&story.stage!=='part7-complete'?'Continuer':complete?'Rejouer':'Commencer';
 $('#chapter1Part7Status').textContent=!unlocked?'Terminez la partie 6 bis.':complete?'La traversée est achevée — un portail lumineux vous attend.':'Une énigme, des pièges et trois soldats fantomatiques.';
 $('#chapter2Card').classList.toggle('locked',!complete);$('#chapter2Status').textContent=complete?'La suite sera ajoutée prochainement.':'Terminez la partie 7 pour continuer.';$('#chapter2Btn').textContent=complete?'Bientôt disponible':'Verrouillé';
}
function startCavePart(){
 if(!caveAccessible())return;
 const saved=readSaved('hackenia-story-match',null);
 if(story.stage==='part7-match'&&saved?.mode==='story-ghosts'){restoreStoryMatch(saved);return}
 if(story.stage==='part7-victory'){showCaveVictory();return}
 if(story.stage==='part7-match'||story.part7==='retry'){startCaveGame();return}
 const resume=story.stage==='part7-intro'?story.caveStep:0;
 story.part7='started';story.chapter1='started';story.stage='part7-intro';story.caveWon=false;saveStory();
 runStorySequence([
 {speaker:'Voix off',entrance:true,cast:['kala','eberien','balai'],text:'Les aventuriers arrivent enfin devant la porte de la grotte des jumeaux. Deux visages sculptés encadrent une inscription.'},
 {speaker:'Kala',entrance:true,cast:['kala','eberien'],text:'« Abandonne et renaît. » Voilà ce que dit la porte…'},
 {speaker:'Ébérien',entrance:true,cast:['eberien','kala','grimgors'],text:'Abandonner quoi ? Nos possessions ? Nos certitudes ? Il doit y avoir un sens à cette énigme.'},
 {speaker:'Voix off',entrance:true,cast:['jhimm','bolduc','grimgors'],text:'Ils réfléchissent un long moment. Les tentatives se succèdent, mais la porte reste immobile.'},
 {speaker:'Messire Balai',entrance:true,cast:['balai','kala','eberien'],text:'Peut-être devez-vous être sans tous vos atours pour passer cette porte ?'},
 {speaker:'Bolduc',entrance:true,cast:['bolduc','jhimm','grimgors'],emotions:{bolduc:'happy',jhimm:'embarrassed',grimgors:'neutral'},text:'Ah ! Enfin une énigme qui me plaît !'},
 {speaker:'Jhimm',entrance:true,cast:['jhimm','kala','eberien'],emotions:{jhimm:'embarrassed',kala:'neutral',eberien:'neutral'},text:'Vraiment… tout ? Bon. Si c’est le seul moyen de passer…'},
 {speaker:'Voix off',entrance:true,cast:[],text:'Les aventuriers déposent leurs armes, puis leurs vêtements, et se retrouvent nus devant la porte. Bolduc est ravi ; Jhimm beaucoup moins. Les autres restent presque de marbre. Aussitôt, une lumière les enveloppe et les téléporte à l’intérieur du donjon.'},
 {speaker:'Voix off',cast:['grimgors','jhimm','bolduc'],text:'Le groupe se retrouve entièrement équipé : vêtements, armures et armes ont repris leur place, comme si rien n’avait été enlevé.'},
 {speaker:'Kala',cast:['kala','balai','eberien'],text:'Abandonner pour renaître… Tu avais vu juste, Messire Balai.'},
 {speaker:'Voix off',cast:['grimgors','bolduc','jhimm'],text:'La traversée commence. Une dalle déclenche des pointes ; un passage rassurant dissimule une fosse. Les aventuriers déjouent ces pièges malins, parfois franchement sournois, en avançant avec prudence.'},
 {speaker:'Grimgors',cast:['grimgors','kala','eberien'],text:'Ne vous fiez pas au chemin le plus facile. Regardez les marques au sol avant de faire un pas.'},
 {speaker:'Voix off',cast:[],text:'Au bout du passage, trois soldats fantomatiques leur barrent la route. Probablement d’anciens aventuriers qui ont péri durant cette même traversée…'},
 {speaker:'Jhimm',cast:['jhimm','grimgors','balai'],text:'Ils ne nous laisseront pas passer. Restez ensemble ! Attention : ce duel se joue avec la règle « Identique » (Clair). Si les valeurs de plusieurs côtés en contact sont identiques, vous pouvez retourner plusieurs cartes à la fois.',finalLabel:'Affronter les soldats fantomatiques'}
 ].map(beat=>({location:'La grotte des jumeaux',mood:'neutral',...beat})),startCaveGame,resume);
}
function startCaveGame(){
 if(!caveAccessible())return;
 if(activeDeck().cards.length===5&&!validDeck(activeDeck())){renderDeckBuilder();openPanel('#deckScreen');return}
 applyRulePreset('same-open');currentMode='story-ghosts';gameType='ai';
 const chosen=validDeck(activeDeck())?deckCardsWithFoil(activeDeck()):['p27','p23','p04','p08','p13'].map(catalogById);
 board=Array(9).fill(null);hands={p:chosen.map(playerCard),a:Array.from({length:5},()=>cloneCard(catalogById('p37')))};
 selected=null;turn='p';locked=false;passing=false;matchRewarded=false;matchInProgress=true;resetMemories();
 story.part7='started';story.stage='part7-match';story.caveWon=false;story.caveStep=0;saveStory();
 $('#storyScene').classList.add('hidden');$('#menuScreen').classList.add('hidden');document.querySelectorAll('.panel-screen').forEach(x=>x.classList.add('hidden'));
 $('#gameApp').classList.remove('hidden');$('#leftLabel').textContent='Les aventuriers';$('#rightLabel').textContent='Soldats fantomatiques';$('#rulesBtn').style.display='none';
 msg('Attention : règle Identique !','Dans ce duel contre les soldats fantomatiques, la règle « Identique » (Clair) est active. Faites correspondre les valeurs des côtés en contact pour déclencher des captures supplémentaires !');render();saveStoryMatch();
}

function endCaveGame(counts){
 try{localStorage.removeItem('hackenia-story-match')}catch{}
 if(counts.p>counts.a){story.stage='part7-victory';story.caveWon=true;story.caveStep=0;saveStory();setTimeout(showCaveVictory,1200)}
 else{story.part7='retry';story.stage='part7-retry';story.caveWon=false;saveStory();setTimeout(()=>runStorySequence([{speaker:'Jhimm',location:'La grotte des jumeaux',cast:['jhimm','grimgors'],mood:'neutral',text:'Le passage reste gardé. Reprenons notre souffle avant de tenter à nouveau.',finalLabel:'Réessayer'}],startCaveGame),1200)}
}
function showCaveVictory(){
 if(!story.caveWon)return;
 const resume=story.stage==='part7-victory'?story.caveStep:0;story.stage='part7-victory';saveStory();
 runStorySequence([
 {speaker:'Voix off',location:'La grotte des jumeaux',cast:['kala','grimgors','jhimm'],mood:'neutral',text:'Les trois soldats fantomatiques s’effacent. Le silence revient dans la grotte.'},
 {speaker:'Voix off',location:'La grotte des jumeaux',cast:[],portal:true,text:'Un portail lumineux s’ouvre devant les aventuriers. Sa lumière éclaire la pierre : la traversée de la grotte est achevée.',finalLabel:'Terminer la partie 7'}
 ],finishCavePart,resume);
}
function finishCavePart(){
 if(!story.caveWon)return;
 queueStoryBooster('part7');story.part7='complete';story.part8=story.part8==='complete'?'complete':'new';story.chapter1=story.part10==='complete'?'complete':'started';story.stage='part7-complete';story.caveStep=0;story.unlocked=Math.max(2,story.unlocked);
 if(!economy.storyRewards.part7){economy.storyRewards.part7=true;awardGold(50)}saveCollection();saveStory();showStoryMenu();
}


// Preserve access for saves already inside or beyond part 7.
function caveAccessible(){return story.part6==='complete'&&(story.part6bis==='complete'||story.part7==='complete'||String(story.stage).startsWith('part7'))}
function renderNewFacesMenu(){
 const unlocked=story.part6==='complete',complete=story.part6bis==='complete';
 $('#storyPart6bis').classList.toggle('locked',!unlocked);$('#storyPart6bis').classList.toggle('complete',complete);
 $('#chapter1Part6bisBtn').disabled=!unlocked;$('#chapter1Part6bisBtn').textContent=!unlocked?'Verrouillé':String(story.stage).startsWith('part6bis')&&story.stage!=='part6bis-complete'?'Continuer':complete?'Rejouer':'Commencer';
 $('#chapter1Part6bisStatus').textContent=!unlocked?'Terminez la partie 6.':complete?'Ven a été vaincu — le chemin de la grotte vous attend.':'Trois voyageurs, quelques questions et un duel imposé.';
}
function startNewFacesPart(){
 if(story.part6!=='complete')return;
 const saved=readSaved('hackenia-story-match',null);
 if(story.stage==='part6bis-match'&&saved?.mode==='story-ven'){restoreStoryMatch(saved);return}
 if(story.stage==='part6bis-victory'){showNewFacesVictory();return}
 if(story.stage==='part6bis-match'||story.part6bis==='retry'){startNewFacesGame();return}
 const resume=story.stage==='part6bis-intro'?story.newFacesStep:0;
 story.part6bis='started';story.stage='part6bis-intro';story.newFacesWon=false;saveStory();
 runStorySequence([
 {speaker:'Voix off',cast:['balai','kala','jhimm'],text:'Messire Balai sauvé, les aventuriers s’apprêtent à reprendre la route. Des bruits de pas les retiennent : trois voyageurs approchent entre les arbres.'},
 {speaker:'Voix off',cast:['pennedra','ven','frolgor'],emotions:{pennedra:'friendly',ven:'haughty',frolgor:'neutral'},text:'Pennedra leur adresse un signe amical. Ven les dévisage, le menton haut. À leurs côtés, Frolgor observe la scène sans dire un mot.'},
 {speaker:'Pennedra',cast:['pennedra','ven','frolgor'],emotions:{pennedra:'friendly',ven:'haughty'},text:'Salut à vous ! Moi, c’est Pennedra. Voici Ven et Frolgor.'},
 {speaker:'Ven',cast:['ven','pennedra'],emotions:{ven:'haughty',pennedra:'friendly'},text:'Oui, les présentations suffiront. Qu’est-ce que vous faites ici, au juste ?'},
 {speaker:'Ébérien',cast:['eberien','kala','balai'],text:'Nous sommes de passage. Nous avons encore un peu de route à faire.'},
 {speaker:'Voix off',cast:['grimgors','ven','frolgor'],emotions:{grimgors:'proud',ven:'haughty',frolgor:'neutral'},text:'Grimgors bombe le torse et se redresse : leur groupe sait se défendre. Ven ne paraît guère impressionné. Frolgor garde le silence.'},
 {speaker:'Ven',cast:['ven','grimgors'],emotions:{ven:'haughty',grimgors:'proud'},text:'De passage ? D’où venez-vous ? Et pourquoi traîner dans ces bois ?'},
 {speaker:'Kala',cast:['kala','jhimm','bolduc'],text:'De Berdésa. Nous avons aidé des mineurs qui étaient en danger.'},
 {speaker:'Jhimm',cast:['jhimm','ven','pennedra'],emotions:{ven:'haughty',pennedra:'friendly'},text:'Vous étiez dans les environs, vous aussi ? Vous n’avez pas entendu parler de ce qui se passait dans la mine ?'},
 {speaker:'Ven',cast:['ven','frolgor','pennedra'],emotions:{ven:'haughty',frolgor:'neutral',pennedra:'friendly'},text:'Si, bien sûr. Mais nous avions plus important à faire.'},
 {speaker:'Voix off',cast:['kala','eberien','bolduc'],mood:'blasé',text:'Les aventuriers échangent des regards blasés. Ah oui… d’accord. Ils avaient donc laissé les mineurs se débrouiller seuls.'},
 {speaker:'Grimgors',cast:['grimgors','jhimm','balai'],mood:'blasé',text:'Plus important. Je vois.'},
 {speaker:'Voix off',cast:['frolgor','ven','pennedra'],emotions:{frolgor:'neutral',ven:'haughty',pennedra:'friendly'},text:'Frolgor ne commente pas. Son regard passe tranquillement de Ven aux aventuriers.'},
 {speaker:'Ven',cast:['ven','grimgors'],emotions:{ven:'haughty',grimgors:'proud'},text:'Puisque vous semblez si sûrs de vous, nous allons régler cela avec une partie de Triade. Je vous défie. Pas question de vous défiler.'},
 {speaker:'Grimgors',cast:['grimgors','ven','bolduc'],emotions:{grimgors:'proud',ven:'haughty',bolduc:'neutral'},text:'Laissez-moi faire. Je vais lui montrer ce que vaut notre groupe.',finalLabel:'Affronter Ven avec Grimgors'}
 ].map(beat=>({location:'Le Bois Tendre',mood:'neutral',...beat})),startNewFacesGame,resume);
}

function newFacesOpponentHand(){
 const pennedra={id:'story-pennedra',name:'Pennedra',v:[3,3,7,7],element:'wind',rarity:'common',kind:'playable',image:{src:'assets/story/pennedra-card.webp',full:true},a:'#7aa98b',r:'✦'};
 return [catalogById('p42'),catalogById('p10'),pennedra,catalogById('p10'),pennedra].map(cloneCard);
}
function startNewFacesGame(){
 if(story.part6!=='complete')return;
 if(activeDeck().cards.length===5&&!validDeck(activeDeck())){renderDeckBuilder();openPanel('#deckScreen');return}
 applyRulePreset('basic-open');currentMode='story-ven';gameType='ai';
 const chosen=validDeck(activeDeck())?deckCardsWithFoil(activeDeck()):['p27','p23','p04','p08','p13'].map(catalogById);
 board=Array(9).fill(null);hands={p:chosen.map(playerCard),a:newFacesOpponentHand()};
 selected=null;turn='p';locked=false;passing=false;matchRewarded=false;matchInProgress=true;resetMemories();
 story.part6bis='started';story.stage='part6bis-match';story.newFacesWon=false;story.newFacesStep=0;saveStory();
 $('#storyScene').classList.add('hidden');$('#menuScreen').classList.add('hidden');document.querySelectorAll('.panel-screen').forEach(x=>x.classList.add('hidden'));
 $('#gameApp').classList.remove('hidden');$('#leftLabel').textContent='Grimgors';$('#rightLabel').textContent='Ven';$('#rulesBtn').style.display='none';
 msg('De nouveaux visages','Grimgors relève le défi de Ven.');render();saveStoryMatch();
}


function endNewFacesGame(counts){
 try{localStorage.removeItem('hackenia-story-match')}catch{}
 if(counts.p>counts.a){story.stage='part6bis-victory';story.newFacesWon=true;story.newFacesStep=0;saveStory();setTimeout(showNewFacesVictory,1200)}
 else{story.part6bis='retry';story.stage='part6bis-retry';story.newFacesWon=false;saveStory();setTimeout(()=>runStorySequence([{speaker:'Grimgors',location:'Le Bois Tendre',cast:['grimgors','ven'],emotions:{grimgors:'neutral',ven:'haughty'},text:'Une revanche. Je n’en ai pas terminé avec toi.',finalLabel:'Réessayer'}],startNewFacesGame),1200)}
}
function showNewFacesVictory(){
 if(!story.newFacesWon)return;
 const resume=story.stage==='part6bis-victory'?story.newFacesStep:0;story.stage='part6bis-victory';saveStory();
 runStorySequence([
 {speaker:'Grimgors',location:'Le Bois Tendre',cast:['grimgors','ven','frolgor'],emotions:{grimgors:'proud',ven:'haughty',frolgor:'neutral'},text:'Voilà. Nous avons encore de la route. Bonne continuation.'},
 {speaker:'Voix off',location:'Le Bois Tendre',cast:['balai','kala','eberien'],mood:'neutral',text:'Le duel terminé, les aventuriers reprennent leur chemin vers la grotte des jumeaux.',finalLabel:'Terminer la partie 6 bis'}
 ],finishNewFacesPart,resume);
}
function finishNewFacesPart(){
 if(!story.newFacesWon)return;
 queueStoryBooster('part6bis');story.part6bis='complete';story.part7=story.part7==='complete'?'complete':'new';story.chapter1=story.part10==='complete'?'complete':'started';story.stage='part6bis-complete';story.newFacesStep=0;
 if(!economy.storyRewards.part6bis){economy.storyRewards.part6bis=true;awardGold(50)}saveCollection();saveStory();showStoryMenu();
}

 
// Optional narrative interlude after part 6 bis. It never gates the main story.
function renderJordanBonusMenu(){
 const unlocked=story.part6bis==='complete',complete=story.part6bonus==='complete';
 $('#storyPart6bonus').classList.toggle('locked',!unlocked);
 $('#storyPart6bonus').classList.toggle('complete',complete);
 $('#chapter1Part6bonusBtn').disabled=!unlocked;
 $('#chapter1Part6bonusBtn').textContent=!unlocked?'Verrouillé':String(story.stage).startsWith('part6bonus')&&story.stage!=='part6bonus-complete'?'Continuer':complete?'Revoir':'Découvrir';
 $('#chapter1Part6bonusStatus').textContent=!unlocked?'Disponible après la partie 6 bis.':complete?'Jordan a rejoint le groupe — bonus terminé.':'Bonus facultatif, sans duel ni récompense obligatoire.';
}
function startJordanBonusPart(){
 if(story.part6bis!=='complete')return;
 const resume=story.stage==='part6bonus-intro'?story.jordanBonusStep||0:0;
 story.stage='part6bonus-intro';saveStory();
 runStorySequence([
  {speaker:'Voix off',location:'La cabane du vieux fermier',cast:['kala','bolduc','eberien'],text:'En repassant devant la cabane du vieux fermier, les aventuriers remarquent que celui-ci a disparu. Il ne reste que son petit cheval nain, qui broute tranquillement près de la barrière.'},
  {speaker:'Voix off',location:'La cabane du vieux fermier',cast:['jordanHorse','bolducHorse'],text:'Bolduc a une idée. Pour parler au cheval, il décide de se transformer lui-même en cheval. Même sous cette forme, impossible de ne pas reconnaître sa crinière rousse et ses longues tresses de barbe !'},
  {speaker:'Bolduc-cheval',location:'La cabane du vieux fermier',cast:['bolducHorse','jordanHorse'],emotions:{bolducHorse:'happy'},text:'Salut Blacky !'},
  {speaker:'Jordan',location:'La cabane du vieux fermier',cast:['jordanHorse','bolducHorse'],text:'Hein ? Moi, c’est Jordan. T’as des carottes ?'},
  {speaker:'Bolduc-cheval',location:'La cabane du vieux fermier',cast:['bolducHorse','jordanHorse'],text:'Non, mais je peux te donner des baies si tu veux. Je te trouverai des carottes plus tard.'},
  {speaker:'Voix off',location:'La cabane du vieux fermier',cast:['jordanHorse','berry','bolducHorse'],text:'Jordan accepte volontiers les baies et se met à les grignoter, ravi d’avoir enfin quelque chose à manger.'},
  {speaker:'Bolduc-cheval',location:'La cabane du vieux fermier',cast:['bolducHorse','jordanHorse'],text:'T’as qu’à venir avec nous ! On te ramènera à Dassom. Ton maître est peut-être là-bas.'},
  {speaker:'Voix off',location:'La cabane du vieux fermier',cast:['jordanHorse','kala','bolducHorse'],text:'Jordan acquiesce et décide de suivre les aventuriers jusqu’à Dassom, avec l’espoir d’y retrouver son maître.',finalLabel:'Terminer le bonus'}
 ],finishJordanBonusPart,resume);
}
function finishJordanBonusPart(){
 story.part6bonus='complete';story.stage='part6bonus-complete';story.jordanBonusStep=0;saveStory();showStoryMenu();
}


function renderLakeMenu(){
 const unlocked=story.part7==='complete',complete=story.part8==='complete';
 $('#storyPart8').classList.toggle('locked',!unlocked);$('#storyPart8').classList.toggle('complete',complete);
 $('#chapter1Part8Btn').disabled=!unlocked;$('#chapter1Part8Btn').textContent=!unlocked?'Verrouillé':String(story.stage).startsWith('part8')&&story.stage!=='part8-complete'?'Continuer':complete?'Rejouer':'Commencer';
 $('#chapter1Part8Status').textContent=!unlocked?'Terminez la partie 7.':complete?'Le temple est derrière vous — le lac rose se dévoile.':'Un portail, une rencontre troublante et un choix risqué.';
 $('#chapter2Card').classList.toggle('locked',!complete);$('#chapter2Status').textContent=complete?'La suite sera ajoutée prochainement.':'Terminez la partie 8 pour continuer.';$('#chapter2Btn').textContent=complete?'Bientôt disponible':'Verrouillé';
}
function restartLakePart(){
 if(story.part7!=='complete')return;
 story.stage='part8-intro';story.lakeStep=0;story.lakePath=null;story.lakeWon=false;story.lakeEncounterResolved=false;
 try{localStorage.removeItem('hackenia-story-match')}catch{}saveStory();startLakePart();
}
function startLakePart(){
 if(story.part7!=='complete')return;
 const saved=readSaved('hackenia-story-match',null);
 if(story.stage==='part8-match'&&saved?.mode==='story-caleizis'){restoreStoryMatch(saved);return}
 if(story.stage==='part8-epilogue'&&story.lakeEncounterResolved){showLakeEpilogue();return}
 if(story.stage==='part8-match'){startLakeGame();return}
 const resume=story.stage==='part8-intro'?story.lakeStep:0;
 story.part8='started';story.chapter1='started';story.stage='part8-intro';story.lakeWon=false;story.lakeEncounterResolved=false;story.lakePath=null;saveStory();
 runStorySequence([
 {speaker:'Grimgors',location:'La grotte des jumeaux',portal:true,cast:['grimgors','bolduc','jhimm'],text:'Avant de nous y jeter, essayons avec un caillou.'},
 {speaker:'Voix off',location:'La grotte des jumeaux',portal:true,cast:['grimgors','kala','eberien'],text:'Grimgors lance un caillou à travers le portail. Il disparaît dans la lumière… et ne revient pas.'},
 {speaker:'Bolduc',location:'La grotte des jumeaux',portal:true,cast:['bolduc','balai','jhimm'],text:'Je pourrais y passer la tête, juste pour regarder de l’autre côté…'},
 {speaker:'Voix off',location:'La grotte des jumeaux',portal:true,cast:['bolduc','kala','grimgors'],mood:'surprised',text:'Finalement, Bolduc tend la main. À peine touche-t-il le portail qu’il est aspiré ! Ses amis n’hésitent pas et passent aussitôt après lui.'},
 {speaker:'Voix off',location:'Le temple des jumeaux',cast:['bolduc','jhimm','balai'],text:'Tous se retrouvent dans une grande salle éclairée de torches bleutées. Les sculptures sur les murs représentent des couples de figures : un temple des jumeaux.'},
 {speaker:'Kala',location:'Le temple des jumeaux',cast:['kala','eberien','grimgors'],text:'Une autre pièce, à gauche… et la sortie là-bas, à une trentaine de mètres.'},
 {speaker:'Voix off',location:'Le temple des jumeaux',cast:['caleizis'],text:'Un immense tourbillon de volutes violettes se déploie dans la salle. Caleizis apparaît au milieu de cette lumière, telle un mirage.'},
 {speaker:'Caleizis',location:'Le temple des jumeaux',cast:['caleizis','kala'],text:'Vous voilà enfin. Vous portez bien plus que vos armes… Je connais les histoires que vous préférez taire.'},
 {speaker:'Voix off',location:'Le temple des jumeaux',cast:['eberien','jhimm','bolduc'],text:'Elle évoque des noms, des lieux et des instants précis de leurs vies. Certains réveillent une douleur ancienne ; d’autres, une rancœur qu’ils croyaient enfouie. Elle en sait beaucoup trop.'},
 {speaker:'Grimgors',location:'Le temple des jumeaux',cast:['grimgors','caleizis'],text:'Assez. Comment sais-tu tout cela ?'},
 {speaker:'Voix off',location:'Le temple des jumeaux',cast:['kala','jhimm','grimgors'],mood:'surprised',text:'Ils tentent de réagir, mais quelque chose dans l’air les paralyse tous. Impossible de faire un pas. La puissance de Caleizis dépasse clairement la leur.'},
 {speaker:'Caleizis',location:'Le temple des jumeaux',cast:['caleizis'],text:'Eh bien ? Plus personne n’a rien à dire ?',choices:[
  {label:'Provoquer Caleizis — duel Éléments actifs (Clair)',onChoose:()=>chooseLakeReaction('duel')},
  {label:'Garder le silence',secondary:true,onChoose:()=>chooseLakeReaction('silence')}
 ]}
 ].map(beat=>({mood:'neutral',...beat})),null,resume);
}
function chooseLakeReaction(path){
 if(story.stage!=='part8-intro'||!['duel','silence'].includes(path))return;
 story.lakePath=path;story.lakeStep=0;saveStory();
 if(path==='duel')startLakeGame();
 else{story.lakeEncounterResolved=true;story.stage='part8-epilogue';saveStory();showLakeEpilogue()}
}
function startLakeGame(){
 if(story.part7!=='complete')return;
 if(activeDeck().cards.length===5&&!validDeck(activeDeck())){renderDeckBuilder();openPanel('#deckScreen');return}
 applyRulePreset('elements-open');currentMode='story-caleizis';gameType='ai';
 const chosen=validDeck(activeDeck())?deckCardsWithFoil(activeDeck()):['p27','p23','p04','p08','p13'].map(catalogById);
 board=Array(9).fill(null);hands={p:chosen.map(playerCard),a:['p56','p56','p56','p05','p05'].map(id=>cloneCard(catalogById(id)))};
 selected=null;turn='p';locked=false;passing=false;matchRewarded=false;matchInProgress=true;resetMemories();
 story.lakePath='duel';story.lakeEncounterResolved=false;story.part8='started';story.stage='part8-match';story.lakeWon=false;story.lakeStep=0;saveStory();
 $('#storyScene').classList.add('hidden');$('#menuScreen').classList.add('hidden');document.querySelectorAll('.panel-screen').forEach(x=>x.classList.add('hidden'));
 $('#gameApp').classList.remove('hidden');$('#leftLabel').textContent='Les aventuriers';$('#rightLabel').textContent='Caleizis';$('#rulesBtn').style.display='none';
 msg('Le défi de Caleizis — Éléments actifs','La règle « Éléments actifs » (Clair) est en vigueur ! Les interactions entre éléments peuvent modifier les valeurs des cartes.');render();saveStoryMatch();
}


function endLakeGame(counts){
 try{localStorage.removeItem('hackenia-story-match')}catch{}
 if(counts.p>counts.a){if(awardCaleizisVictory())msg('Défi accompli !','Dos de carte « Caleizis en larmes » débloqué dans les Options !');story.lakeWon=true;story.lakeEncounterResolved=true;story.stage='part8-epilogue';story.lakeStep=0;saveStory();setTimeout(showLakeEpilogue,1200)}
 else{story.part8='retry';story.stage='part8-retry';story.lakeWon=false;story.lakeEncounterResolved=false;story.lakeStep=0;story.lakePath=null;saveStory();setTimeout(()=>runStorySequence([{speaker:'Voix off',location:'Le temple des jumeaux',cast:['caleizis'],text:'Caleizis a pris le dessus. Il faut reprendre la partie 8 depuis le début.',finalLabel:'Recommencer la partie 8'}],restartLakePart),1200)}
}
function showLakeEpilogue(){
 if(!story.lakeEncounterResolved)return;
 const resume=story.stage==='part8-epilogue'?story.lakeStep:0;story.stage='part8-epilogue';saveStory();
 const departure=story.lakePath==='duel'?
 [{speaker:'Caleizis',location:'Le temple des jumeaux',cast:['caleizis'],mood:'crying',text:'Non… Ce n’est pas possible ! Vous… !'},
 {speaker:'Voix off',location:'Le temple des jumeaux',cast:['caleizis'],mood:'crying',text:'Caleizis s’emporte. Des larmes coulent sur ses joues ; ses volutes se déchirent et elle disparaît, furieuse et en pleurs.'}]:
 [{speaker:'Caleizis',location:'Le temple des jumeaux',cast:['caleizis'],text:'Votre silence est bien décevant…'},
 {speaker:'Voix off',location:'Le temple des jumeaux',cast:['caleizis'],text:'Un peu vexée de ne recevoir aucune réponse, Caleizis finit par disparaître dans ses volutes.'}];
 runStorySequence([...departure,
 {speaker:'Jhimm',location:'Le temple des jumeaux',cast:['jhimm','kala','grimgors'],text:'Je peux à nouveau bouger. Tout le monde va bien ?'},
 {speaker:'Ébérien',location:'Le temple des jumeaux',cast:['eberien','bolduc','balai'],text:'Allons voir cette pièce à gauche avant de partir.'},
 {speaker:'Voix off',location:'La salle de rituel',cast:[],artwork:'ice-ritual-background',artworkAlt:'Deux statues dans la salle de rituel et la source élémentaire de glace',text:'Les aventuriers fouillent la salle de rituel. Deux belles statues y sont installées, face à face.'},
 {speaker:'Kala',location:'La salle de rituel',cast:['kala','eberien'],text:'Au fond… une source élémentaire de glace !'},
 {speaker:'Voix off',location:'La salle de rituel',cast:[],artwork:'ice-ritual-background',artworkAlt:'Deux statues dans la salle de rituel et la source élémentaire de glace',text:'Des cristaux bleus s’élèvent au-dessus d’une eau lumineuse. La source de glace éclaire les sculptures d’une lueur froide.'},
 {speaker:'Voix off',location:'Le lac rose',cast:[],artwork:'pink-lake-background',artworkAlt:'Panorama du lac rose sous une lune rose entre les montagnes',text:'Enfin, ils sortent de la grotte. Devant eux s’étend un panorama magnifique : le lac rose scintille entre les montagnes sous la lumière de la lune.'},
 {speaker:'Voix off',location:'Le lac rose',cast:['grimgors','kala','jhimm'],text:'Après les pièges et cette rencontre troublante, les aventuriers s’arrêtent un instant pour contempler le lac. La partie 8 s’achève ici.',finalLabel:'Terminer la partie 8'}
 ].map(beat=>({mood:'neutral',...beat})),finishLakePart,resume);
}
function finishLakePart(){
 if(!story.lakeEncounterResolved||story.part7!=='complete')return;
 queueStoryBooster('part8');story.part8='complete';story.part9=story.part9==='complete'?'complete':'new';story.chapter1=story.part10==='complete'?'complete':'started';story.stage='part8-complete';story.lakeStep=0;story.unlocked=Math.max(2,story.unlocked);
 if(!economy.storyRewards.part8){economy.storyRewards.part8=true;awardGold(50)}saveCollection();saveStory();showStoryMenu();
}

function renderFinaleMenu(){
 const unlocked=story.part8==='complete',complete=story.part9==='complete';
 $('#storyPart9').classList.toggle('locked',!unlocked);$('#storyPart9').classList.toggle('complete',complete);
 $('#chapter1Part9Btn').disabled=!unlocked;$('#chapter1Part9Btn').textContent=!unlocked?'Verrouillé':String(story.stage).startsWith('part9')&&story.stage!=='part9-complete'?'Continuer':complete?'Rejouer':'Commencer';
 $('#chapter1Part9Status').textContent=!unlocked?'Terminez la partie 8.':complete?'Les nouveaux jumeaux sont retrouvés.':'Une veille au bord du lac… et un dernier danger.';
 $('#chapter2Card').classList.toggle('locked',!complete);$('#chapter2Status').textContent=complete?'La suite sera ajoutée prochainement.':'Terminez la partie 9 pour continuer.';$('#chapter2Btn').textContent=complete?'Bientôt disponible':'Verrouillé';
}
function startFinalePart(){
 if(story.part8!=='complete')return;
 const saved=readSaved('hackenia-story-match',null);
 if(story.stage==='part9-match'&&saved?.mode==='story-lake-finale'){restoreStoryMatch(saved);return}
 if(story.stage==='part9-victory'&&story.finaleWon){showFinaleVictory();return}
 if(['part9-match','part9-retry'].includes(story.stage)){startFinaleGame();return}
 const resume=story.stage==='part9-intro'?story.finaleStep:0;
 story.part9='started';story.stage='part9-intro';story.finaleWon=false;saveStory();
 runStorySequence([
 {speaker:'Voix off',location:'Le lac rose',cast:[],artwork:'pink-lake-background',text:'Les aventuriers atteignent enfin le fameux lac rose. C’est ici qu’ils doivent trouver les nouveaux jumeaux. Pourtant, personne ne les attend.'},
 {speaker:'Kala',location:'Le lac rose',cast:['kala','eberien','jhimm'],text:'Pas une silhouette… Restons dans les environs.'},
 {speaker:'Grimgors',location:'La rive du lac rose',cast:['grimgors','bolduc','balai'],text:'Le bois longe le lac sur la droite. Nous pourrons y passer la nuit tout en surveillant la rive.'},
 {speaker:'Voix off',location:'La rive du lac rose',cast:['kala','jhimm','eberien'],text:'Ils s’installent entre les arbres, assez près de l’eau pour apercevoir au loin une éventuelle arrivée. Ils organisent une ronde pour la nuit.'},
 {speaker:'Jhimm',location:'La rive du lac rose',cast:['jhimm','grimgors'],text:'Je prends le premier tour. Reposez-vous.'},
 {speaker:'Voix off',location:'La rive du lac rose',cast:['jhimm'],text:'La veille de Jhimm se déroule calmement. Seuls le vent dans les branches et le clapotis du lac troublent le silence.'},
 {speaker:'Kala',location:'La rive du lac rose',cast:['kala','jhimm'],text:'À mon tour. Va dormir, je garde un œil sur le lac.'},
 {speaker:'Voix off',location:'La rive du lac rose',cast:['kala'],mood:'surprised',text:'Kala entend soudain des voix dans sa tête. Douces, insistantes, elles l’invitent à entrer dans le lac… à les rejoindre sous la surface.'},
 {speaker:'Ébérien',location:'La rive du lac rose',cast:['eberien','kala'],mood:'surprised',text:'Kala… Ces voix, tu les entends aussi ?'},
 {speaker:'Voix off',location:'La rive du lac rose',cast:['eberien','kala'],mood:'surprised',text:'Ébérien vient de se réveiller. Le même charme s’empare de lui. Malgré leurs efforts, tous deux se sentent attirés vers les profondeurs du lac.'},
 {speaker:'Kala',location:'La rive du lac rose',cast:['kala','eberien'],mood:'surprised',text:'Réveillez-vous ! Aidez-nous ! Quelque chose nous attire dans l’eau !'},
 {speaker:'Voix off',location:'Le lac rose',cast:[],artwork:'lake-attack-chibi',artworkAlt:'Trois gardiennes rouges et deux hydrelithes bleus émergent du lac rose, en version chibi',text:'Leurs amis se précipitent hors du campement. Les gardiennes commencent à sortir du lac, suivies de deux hydrelithes mineurs.'},
 {speaker:'Voix off',location:'Le lac rose',cast:[],artwork:'lake-attack-chibi',text:'Au loin, le rire de Caleizis résonne dans la nuit, comme si elle était satisfaite de ce qui se déroule devant eux.'},
 {speaker:'Grimgors',location:'Le lac rose',cast:['grimgors','jhimm','bolduc'],text:'Tenez bon ! On est là !',finalLabel:'Affronter les créatures du lac'}
 ].map(beat=>({mood:'neutral',...beat})),startFinaleGame,resume);
}
function startFinaleGame(){
 if(story.part8!=='complete')return;
 if(activeDeck().cards.length===5&&!validDeck(activeDeck())){renderDeckBuilder();openPanel('#deckScreen');return}
 applyRulePreset('basic-open');currentMode='story-lake-finale';gameType='ai';
 const chosen=validDeck(activeDeck())?deckCardsWithFoil(activeDeck()):['p27','p23','p04','p08','p13'].map(catalogById);
 board=Array(9).fill(null);hands={p:chosen.map(playerCard),a:['p11','p11','p11','p17','p17'].map(id=>cloneCard(catalogById(id)))};
 selected=null;turn='p';locked=false;passing=false;matchRewarded=false;matchInProgress=true;resetMemories();
 story.part9='started';story.stage='part9-match';story.finaleWon=false;story.finaleStep=0;saveStory();
 $('#storyScene').classList.add('hidden');$('#menuScreen').classList.add('hidden');document.querySelectorAll('.panel-screen').forEach(x=>x.classList.add('hidden'));
 $('#gameApp').classList.remove('hidden');$('#leftLabel').textContent='Les aventuriers';$('#rightLabel').textContent='Les gardiennes du lac';$('#rulesBtn').style.display='none';
 msg('Fin de la mission','Libérez Kala et Ébérien du charme du lac.');render();saveStoryMatch();
}
function endFinaleGame(counts){
 try{localStorage.removeItem('hackenia-story-match')}catch{}
 if(counts.p>counts.a){story.finaleWon=true;story.stage='part9-victory';story.finaleStep=0;saveStory();setTimeout(showFinaleVictory,1200)}
 else{story.part9='retry';story.stage='part9-retry';story.finaleWon=false;saveStory();setTimeout(()=>runStorySequence([{speaker:'Voix off',location:'Le lac rose',cast:[],artwork:'lake-attack-chibi',text:'Les créatures tiennent encore la rive. Il faut les vaincre pour libérer Kala et Ébérien.',finalLabel:'Réessayer le duel'}],startFinaleGame),1200)}
}
function showFinaleVictory(){
 if(!story.finaleWon)return;
 const resume=story.stage==='part9-victory'?story.finaleStep:0;story.stage='part9-victory';saveStory();
 runStorySequence([
 {speaker:'Voix off',location:'Le lac rose',cast:['kala','eberien','jhimm'],text:'Les créatures disparaissent dans les eaux roses. Le charme se brise : Kala et Ébérien retrouvent enfin le contrôle de leurs mouvements.'},
 {speaker:'Jhimm',location:'Le lac rose',cast:['jhimm','kala','eberien'],text:'Vous êtes avec nous. Éloignons-nous du bord.'},
 {speaker:'Messire Balai',location:'Le lac rose',cast:['balai','grimgors','bolduc'],mood:'surprised',text:'Regardez… quelque chose remonte !'},
 {speaker:'Voix off',location:'Le lac rose',cast:['twinsBubble'],text:'Une énorme bulle émerge lentement du lac. Des reflets irisés courent sur sa surface. À l’intérieur reposent les nouveaux jumeaux.'},
 {speaker:'Kala',location:'Le lac rose',cast:['kala','eberien'],mood:'happy',text:'Les voilà… Nous les avons enfin trouvés.'},
 {speaker:'Voix off',location:'Le lac rose',cast:['twinsBound'],text:'Au moment où les aventuriers se rapprochent des nouveaux jumeaux pour les ramener sur la terre ferme, la bulle éclate délicatement et les laisse les récupérer.',finalLabel:'Terminer la partie 9'}
 ].map(beat=>({mood:'neutral',...beat})),finishFinalePart,resume);
}
function finishFinalePart(){
 if(!story.finaleWon||story.part8!=='complete')return;
 queueStoryBooster('part9');story.part9='complete';story.part10=story.part10==='complete'?'complete':'new';story.chapter1=story.part10==='complete'?'complete':'started';story.stage='part9-complete';story.finaleStep=0;story.unlocked=Math.max(2,story.unlocked);
 if(!economy.storyRewards.part9){economy.storyRewards.part9=true;awardGold(50)}saveCollection();saveStory();showStoryMenu();
}

const releaseIntro=[{"speaker":"Voix off","cast":["twinsBound"],"text":"Les nouveaux jumeaux sont enfin sur la terre ferme. Pourtant, des lianes magiques serrent encore leurs bras et leurs jambes."},{"speaker":"Ébérien","cast":["eberien","twinsBound"],"text":"Des cristaux de glace sur le jeune homme… et une lumière crépitante sur la jeune femme. Ces liens ne sont pas des plantes ordinaires."},{"speaker":"Bolduc","cast":["bolduc","grimgors"],"text":"Un bon coup de hache et nous pourrons repartir !"},{"speaker":"Voix off","cast":["bolduc","twinsBound"],"mood":"surprised","text":"Au contact des lianes, la hache de Bolduc est violemment repoussée. Elle lui échappe et s’envole avant de retomber plus loin sur la rive."},{"speaker":"Bolduc","cast":["bolduc","balai"],"mood":"surprised","text":"Bon… Elles n’ont pas apprécié."},{"speaker":"Voix off","cast":["grimgors","kala","twinsBound"],"mood":"surprised","text":"Grimgors et Kala tentent d’écarter une liane du jeune homme. Leurs doigts se couvrent aussitôt de givre : ils retirent leurs mains, incapables de forcer les liens."},{"speaker":"Jhimm","cast":["jhimm","eberien","kala"],"text":"Essayons avec de petites quantités d’énergie, loin de leur peau."},{"speaker":"Voix off","cast":["twinsBound","eberien"],"text":"Les premiers essais font vibrer les lianes sans les briser. Puis une étincelle de feu amollit un cristal bleu. Les aventuriers comprennent : il faut un élément opposé."},{"speaker":"Ébérien","cast":["eberien","kala"],"text":"Le feu prend l’avantage sur la glace. Et la terre devrait dissiper ces filaments de foudre !"},{"speaker":"Kala","cast":["kala","jhimm","grimgors"],"text":"Un dernier effort ensemble ! Règle Éléments, en Clair : choisissons les bons contacts pour défaire cette protection sans blesser les jumeaux.","finalLabel":"Briser les liens — Éléments · Clair"}],releaseOutro=[{"speaker":"Voix off","cast":["twinsFree"],"text":"Les cristaux se dissolvent en poussière bleutée. Les filaments dorés se dénouent et s’éteignent. Les nouveaux jumeaux sont enfin libérés… mais dorment toujours profondément."},{"speaker":"Jhimm","cast":["jhimm","twinsFree"],"text":"Leur souffle est régulier. Gardons-les au chaud."},{"speaker":"Kala","cast":["kala","grimgors"],"text":"Je préviens Kayla et Hilam immédiatement."},{"speaker":"Voix off","cast":["kala","hilam"],"text":"Sans perdre une seconde, Kala sort le miroir de communication. Sa surface s’illumine et révèle les visages de Kayla et Hilam."},{"speaker":"Kala","cast":["kala","kayla","hilam"],"text":"Nous avons les nouveaux jumeaux. Leurs liens sont brisés, mais ils ne se réveillent pas. Nous sommes au lac rose."},{"speaker":"Hilam","cast":["hilam","kayla"],"text":"Restez ensemble. Nous vous envoyons un transporteur immédiatement."},{"speaker":"Voix off","cast":["grimgors","bolduc","twinsFree"],"portal":true,"text":"Dix secondes plus tard, un portail se déploie sur la rive. Un transporteur en sort et leur fait signe d’approcher."},{"speaker":"Le transporteur","cast":["kala","jhimm"],"portal":true,"text":"Empruntez le passage, vite ! Je ne pourrai pas le maintenir longtemps… Cette magie épuise mes forces."},{"speaker":"Voix off","cast":["grimgors","jhimm","twinsFree"],"portal":true,"text":"Grimgors et Jhimm prennent les jumeaux avec précaution. Le groupe franchit le portail sans attendre ; Bolduc récupère sa hache avant de suivre ses compagnons."},{"speaker":"Bolduc","cast":["bolduc","kala","balai"],"mood":"happy","text":"Cette fois, notre mission est vraiment accomplie. Et je ne dirais pas non à un bon repas !"},{"speaker":"Voix off","cast":["kala","eberien","grimgors"],"mood":"happy","text":"Les aventuriers quittent enfin le lac rose, ravis d’avoir ramené les nouveaux jumeaux en sécurité. Ils peuvent savourer un peu de répit… Fin du chapitre 1.","finalLabel":"Terminer le chapitre 1"}];
function renderReleaseMenu(){
 const unlocked=story.part9==='complete',complete=story.part10==='complete';
 $('#storyPart10').classList.toggle('locked',!unlocked);$('#storyPart10').classList.toggle('complete',complete);$('#chapter1Part10Btn').disabled=!unlocked;
 $('#chapter1Part10Btn').textContent=!unlocked?'Verrouillé':String(story.stage).startsWith('part10')&&story.stage!=='part10-complete'?'Continuer':complete?'Rejouer':'Commencer';
 $('#chapter2Card').classList.toggle('locked',!complete);$('#chapter2Status').textContent=complete?'La suite sera ajoutée prochainement.':'Terminez la partie 10 pour continuer.';$('#chapter2Btn').textContent=complete?'Bientôt disponible':'Verrouillé';
}
function startReleasePart(){
 if(story.part9!=='complete')return;
 const saved=readSaved('hackenia-story-match',null);
 if(story.stage==='part10-match'&&saved?.mode==='story-release'){restoreStoryMatch(saved);return}
 if(story.stage==='part10-victory'&&story.releaseWon){showReleaseVictory();return}
 if(['part10-match','part10-retry'].includes(story.stage)){startReleaseGame();return}
 const resume=story.stage==='part10-intro'?story.releaseStep:0;
 story.part10='started';story.chapter1='started';story.stage='part10-intro';story.releaseWon=false;saveStory();
 runStorySequence(releaseIntro.map(b=>({location:'Le lac rose',mood:'neutral',...b})),startReleaseGame,resume);
}
function startReleaseGame(){
 if(story.part9!=='complete')return;
 if(activeDeck().cards.length===5&&!validDeck(activeDeck())){renderDeckBuilder();openPanel('#deckScreen');return}
 cancelBattleResult();applyRulePreset('elements-open');currentMode='story-release';gameType='ai';
 const chosen=validDeck(activeDeck())?deckCardsWithFoil(activeDeck()):['p27','p23','p04','p08','p13'].map(catalogById);
 const rivals=['p69','p122','p49','p40','p36'].map(id=>cloneCard(catalogById(id)));
 board=Array(9).fill(null);hands={p:chosen.map(playerCard),a:rivals};selected=null;turn=Math.random()<.5?'p':'a';locked=turn==='a';passing=false;matchRewarded=false;matchInProgress=true;resetMemories();
 story.part10='started';story.stage='part10-match';story.releaseWon=false;story.releaseStep=0;saveStory();
 $('#storyScene').classList.add('hidden');$('#menuScreen').classList.add('hidden');document.querySelectorAll('.panel-screen').forEach(x=>x.classList.add('hidden'));$('#gameApp').classList.remove('hidden');$('#leftLabel').textContent='Les aventuriers';$('#rightLabel').textContent='Les liens élémentaires';$('#rulesBtn').style.display='none';
 msg('Briser les liens — Éléments · Clair','Le Feu domine la Glace ; la Terre domine la Foudre. Remportez le duel pour libérer les jumeaux.');render();saveStoryMatch();if(turn==='a')setTimeout(aiMove,700);
}
function endReleaseGame(c){
 try{localStorage.removeItem('hackenia-story-match')}catch{}
 if(c.p>c.a){story.releaseWon=true;story.stage='part10-victory';story.releaseStep=0;saveStory();setTimeout(showReleaseVictory,1200)}
 else{story.part10='retry';story.stage='part10-retry';story.releaseWon=false;saveStory();setTimeout(()=>runStorySequence([{speaker:'Ébérien',location:'Le lac rose',cast:['eberien','twinsBound'],text:'La protection résiste encore. Reprenons calmement avec les bons éléments.',finalLabel:'Réessayer le duel'}],startReleaseGame),1200)}
}
function showReleaseVictory(){
 if(!story.releaseWon)return;
 const resume=story.stage==='part10-victory'?story.releaseStep:0;story.stage='part10-victory';saveStory();
 runStorySequence(releaseOutro.map(b=>({location:'Le lac rose',mood:'neutral',...b})),finishReleasePart,resume);
}
function finishReleasePart(){
 if(!story.releaseWon||story.part9!=='complete')return;
 queueStoryBooster('part10');story.part10='complete';story.chapter1='complete';story.stage='part10-complete';story.releaseStep=0;story.unlocked=Math.max(2,story.unlocked);
 if(!economy.storyRewards.part10){economy.storyRewards.part10=true;awardGold(50)}saveCollection();saveStory();checkChallenges();showStoryMenu();
}

// Chapter 2, part 1: the council asks a Nahakin to judge the adventurers.
function renderTrialMenu(){
 const unlocked=story.part10==='complete',complete=story.chapter2Part1==='complete';
 $('#chapter2Card').classList.toggle('locked',!unlocked);
 $('#storyChapter2Part1').classList.toggle('locked',!unlocked);
 $('#storyChapter2Part1').classList.toggle('complete',complete);
 $('#chapter2Btn').disabled=!unlocked;
 $('#chapter2Btn').textContent=!unlocked?'Verrouillé':String(story.stage).startsWith('chapter2-part1-')&&story.stage!=='chapter2-part1-complete'?'Continuer':complete?'Rejouer':'Commencer';
 $('#chapter2Status').textContent=!unlocked?'Terminez le chapitre 1.':complete?'Partie terminée — les Nahakins vous jugent dignes.':'Le conseil de Dassom attend les aventuriers.';
}
function startTrialPart(){
 if(story.part10!=='complete')return;
 const saved=readSaved('hackenia-story-match',null);
 if(story.stage==='chapter2-part1-match'&&saved?.mode==='story-nahakin'){restoreStoryMatch(saved);return}
 if(story.stage==='chapter2-part1-victory'&&story.trialWon){showTrialVictory();return}
 if(['chapter2-part1-match','chapter2-part1-retry'].includes(story.stage)){startTrialGame();return}
 const resume=story.stage==='chapter2-part1-intro'?story.trialStep:0;
 story.chapter2='started';story.chapter2Part1='started';story.stage='chapter2-part1-intro';story.trialWon=false;saveStory();
 runStorySequence([
  {speaker:'Voix off',location:'Le grand hall de Dassom',cast:['grimgors','jhimm','twinsFree'],text:'Les aventuriers franchissent le portail et se retrouvent dans le grand hall du palais de Dassom. Les nouveaux jumeaux dorment toujours profondément.'},
  {speaker:'Voix off',location:'Le grand hall de Dassom',cast:['kayla','hilam','kala'],emotions:{kayla:'blasé',hilam:'neutral',kala:'neutral'},text:'Kayla les attend auprès d’Hilam. Son visage est fermé ; malgré leur retour, quelque chose semble la préoccuper.'},
  {speaker:'Voix off',location:'Le grand hall de Dassom',cast:['myconides','twinsFree','jhimm'],text:'Des soigneurs myconides recueillent les jumeaux endormis avec précaution et les emmènent pour prendre soin d’eux.'},
  {speaker:'Kayla',location:'Le grand hall de Dassom',cast:['kayla','hilam','kala'],mood:'neutral',text:'Venez avec nous. Le conseil nous attend dans la salle de réunion.'},
  {speaker:'Voix off',location:'La salle du conseil',cast:[],text:'Ils pénètrent dans une immense pièce magnifique. Un conseil y siège déjà autour d’une grande table. À leur arrivée, les conversations s’interrompent, puis des murmures parcourent l’assemblée.'},
  {speaker:'Soryan',location:'La salle du conseil',cast:['soryan','kayla','hilam'],text:'Faire confiance à des inconnus pour un voyage aussi important et dangereux, c’est une hérésie !'},
  {speaker:'Kayla',location:'La salle du conseil',cast:['kayla','hilam','soryan'],text:'Ces aventuriers, nous les avons choisis nous-mêmes. Ils ont toute notre confiance. Ils ont accompli la mission et ramené les jumeaux en sécurité.'},
  {speaker:'Hilam',location:'La salle du conseil',cast:['hilam','kayla','soryan'],text:'Nous répondons de notre choix. Leur courage et leurs actes parlent pour eux. Ils méritent notre confiance.'},
  {speaker:'Soryan',location:'La salle du conseil',cast:['soryan','hilam','kayla'],text:'Cette décision n’était pas uniquement la vôtre, et ne pas nous prévenir était risqué…'},
  {speaker:'Voix off',location:'La salle du conseil',cast:['nahakin','kala','eberien'],text:'Les Nahakins s’approchent du groupe. Ces hommes-chats prophètes observent les aventuriers en silence. L’un d’eux finit par prendre la parole.'},
  {speaker:'Le Nahakin',location:'La salle du conseil',cast:['nahakin','kala','eberien'],text:'Hum… Je ne vois pas d’intention néfaste envers Dassom ou son peuple… Un petit duel m’aiderait à y voir plus clair…'},
  {speaker:'Le Nahakin',location:'La salle du conseil',cast:['nahakin'],text:'Nous jouerons en Clair, avec Addition et Identique réunies. Deux sommes égales peuvent déclencher Addition ; deux valeurs égales en contact peuvent déclencher Identique. Montrez-moi votre manière de jouer.',finalLabel:'Accepter le duel — Clair · Addition + Identique'}
 ],startTrialGame,resume);
}
function startTrialGame(){
 if(story.part10!=='complete')return;
 if(activeDeck().cards.length===5&&!validDeck(activeDeck())){renderDeckBuilder();openPanel('#deckScreen');return}
 cancelBattleResult();applyRulePreset('same-plus-open');currentMode='story-nahakin';gameType='ai';
 const chosen=validDeck(activeDeck())?deckCardsWithFoil(activeDeck()):['p27','p23','p04','p08','p13'].map(catalogById);
 const opponent=['p58','p67','p29','p09','p149'].map(id=>cloneCard(catalogById(id)));
 board=Array(9).fill(null);hands={p:chosen.map(playerCard),a:opponent};selected=null;turn=Math.random()<.5?'p':'a';locked=turn==='a';passing=false;matchRewarded=false;matchInProgress=true;resetMemories();
 story.chapter2='started';story.chapter2Part1='started';story.stage='chapter2-part1-match';story.trialWon=false;story.trialStep=0;saveStory();
 $('#storyScene').classList.add('hidden');$('#menuScreen').classList.add('hidden');document.querySelectorAll('.panel-screen').forEach(x=>x.classList.add('hidden'));$('#gameApp').classList.remove('hidden');$('#leftLabel').textContent='Les aventuriers';$('#rightLabel').textContent='Le Nahakin';$('#rulesBtn').style.display='none';
 msg('Le procès — Clair · Addition + Identique','Les deux règles sont actives ensemble. Remportez le duel pour obtenir le jugement du prophète.');render();saveStoryMatch();if(turn==='a')setTimeout(aiMove,700);
}
function endTrialGame(counts){
 try{localStorage.removeItem('hackenia-story-match')}catch{}
 if(counts.p>counts.a){story.trialWon=true;story.stage='chapter2-part1-victory';story.trialStep=0;saveStory();setTimeout(showTrialVictory,1200)}
 else{story.chapter2Part1='retry';story.stage='chapter2-part1-retry';story.trialWon=false;saveStory();setTimeout(()=>runStorySequence([{speaker:'Le Nahakin',location:'La salle du conseil',cast:['nahakin'],text:'Hum… Une autre partie m’aiderait à y voir plus clair.',finalLabel:'Réessayer le duel'}],startTrialGame),1200)}
}
function showTrialVictory(){
 if(!story.trialWon)return;
 const resume=story.stage==='chapter2-part1-victory'?story.trialStep:0;story.stage='chapter2-part1-victory';saveStory();
 runStorySequence([
  {speaker:'Voix off',location:'La salle du conseil',cast:['nahakin'],mood:'happy',text:'Le duel remporté, le Nahakin observe une dernière fois les aventuriers, puis sourit doucement.'},
  {speaker:'Le Nahakin',location:'La salle du conseil',cast:['nahakin'],mood:'happy',text:'Ils m’ont l’air dignes…'},
  {speaker:'Voix off',location:'La salle du conseil',cast:['kayla','hilam','nahakin'],mood:'neutral',text:'Fin de la partie 1 du chapitre 2 : Le procès.',finalLabel:'Terminer la partie 1'}
 ],finishTrialPart,resume);
}
function finishTrialPart(){
 if(!story.trialWon||story.part10!=='complete')return;
 queueStoryBooster('chapter2Part1');story.chapter2Part1='complete';story.chapter2Part2=story.chapter2Part2==='complete'?'complete':'new';story.chapter2='started';story.stage='chapter2-part1-complete';story.trialStep=0;
 if(!economy.storyRewards.chapter2Part1){economy.storyRewards.chapter2Part1=true;awardGold(50)}
 saveCollection();saveStory();showStoryMenu();
}

// Chapter 2, part 2: two more sages meet the group; Zackarie challenges Bolduc.
function renderCouncilVisitMenu(){
 const unlocked=story.chapter2Part1==='complete',complete=story.chapter2Part2==='complete';
 $('#storyChapter2Part2').classList.toggle('locked',!unlocked);
 $('#storyChapter2Part2').classList.toggle('complete',complete);
 $('#chapter2Part2Btn').disabled=!unlocked;
 $('#chapter2Part2Btn').textContent=!unlocked?'Verrouillé':String(story.stage).startsWith('chapter2-part2-')&&story.stage!=='chapter2-part2-complete'?'Continuer':complete?'Rejouer':'Commencer';
 $('#chapter2Part2Status').textContent=!unlocked?'Terminez Le procès.':complete?'Partie terminée — le duel contre Zackarie est remporté.':'Sameron et Zackarie viennent à votre rencontre.';
}
function startCouncilVisitPart(){
 if(story.chapter2Part1!=='complete')return;
 const saved=readSaved('hackenia-story-match',null);
 if(story.stage==='chapter2-part2-match'&&saved?.mode==='story-zackarie'){restoreStoryMatch(saved);return}
 if(story.stage==='chapter2-part2-victory'&&story.councilVisitWon){showCouncilVisitVictory();return}
 if(['chapter2-part2-match','chapter2-part2-retry'].includes(story.stage)){startCouncilVisitGame();return}
 if(story.councilVisitIntroRevision!==2){
  if(story.stage==='chapter2-part2-intro'&&Number.isInteger(story.councilVisitStep)&&story.councilVisitStep>4)story.councilVisitStep--;
  story.councilVisitIntroRevision=2;
 }
 const resume=story.stage==='chapter2-part2-intro'?story.councilVisitStep:0;
 story.chapter2='started';story.chapter2Part2='started';story.stage='chapter2-part2-intro';story.councilVisitWon=false;saveStory();
 runStorySequence([
  {speaker:'Voix off',cast:['jhimm','soryan','nahakin'],text:'Après le jugement du Nahakin, Jhimm raconte au conseil tout ce que les aventuriers ont vécu : leur rencontre avec Caleïzis, les événements du lac rose… et les hydrelithes.'},
  {speaker:'Voix off',cast:['jhimm','soryan'],text:'À ce dernier mot, un murmure parcourt l’assemblée. La foule s’agite un instant, puis se calme rapidement.'},
  {speaker:'Soryan',cast:['soryan','jhimm','nahakin'],text:'Nous devons en discuter absolument. Il y a des choses étranges dans cette histoire, mais soit…'},
  {speaker:'Voix off',cast:['soryan','nahakin','jhimm'],text:'Soryan semble accepter silencieusement les dires des Nahakins. L’ambiance s’apaise peu à peu dans la salle.'},
  {speaker:'Voix off',cast:['zackarie','sameron','bolduc'],text:'Deux autres personnes s’approchent des aventuriers : Zackarie et Sameron. Ils se trouvent encore à une dizaine de mètres du groupe.'},
  {speaker:'Voix off',cast:['bolduc','zackarie'],emotions:{bolduc:'surprised',zackarie:'neutral'},text:'Sans prévenir, Zackarie lance une aiguille. Elle frôle la tête de Bolduc et va se planter dans un pilier. Bolduc sursaute de surprise !'},
  {speaker:'Zackarie',cast:['zackarie','bolduc'],emotions:{zackarie:'neutral',bolduc:'surprised'},text:'Eh bien, tu n’as pas l’air bien courageux…',},
  {speaker:'Voix off',cast:['zackarie','bolduc'],text:'Zackarie lui adresse un regard malicieux. Kayla se retourne aussitôt.'},
  {speaker:'Kayla',cast:['kayla','zackarie','bolduc'],text:'Oh, t’abuses, Zack ! Tu viens tout juste de les rencontrer !'},
  {speaker:'Sameron',cast:['sameron','kala','grimgors'],text:'Et honnêtement, ils sont très courageux, de ce que j’ai vu…'},
  {speaker:'Voix off',cast:['kala','sameron','grimgors'],emotions:{kala:'surprised',sameron:'neutral',grimgors:'neutral'},text:'Kala comprend alors : Sameron s’était déguisé en vieux fermier ! C’est bien lui qu’ils ont rencontré avec Jordan, le cheval nain.'},
  {speaker:'Voix off',cast:['farmer','horse'],text:'Les aventuriers se souviennent de la cabane du vieux fermier et de son étrange petit cheval. Sameron les observait donc déjà pendant leur voyage…'},
  {speaker:'Voix off',cast:['grimgors','sameron'],text:'Grimgors n’apprécie pas vraiment de découvrir qu’on les a espionnés à leur insu.'},
  {speaker:'Kayla',cast:['kayla','soryan','grimgors'],text:'Ne jugez pas Soryan trop vite non plus. Il peut être un peu… dur, parfois.'},
  {speaker:'Hilam',cast:['hilam','kayla','jhimm'],text:'Vos quartiers vous attendent afin que vous puissiez vous reposer. Vous pouvez vous rendre librement dans la ville si vous le souhaitez, mais ne partez pas pour le moment…'},
  {speaker:'Jhimm',cast:['jhimm','kayla','hilam'],text:'Et pourquoi cela ?'},
  {speaker:'Kayla',cast:['kayla','jhimm','hilam'],text:'Votre rencontre avec des hydrelithes est… mauvais signe. J’ai peur que le reste du conseil vous prenne pour des fuyards qui ont finalement des choses à se reprocher…'},
  {speaker:'Kayla',cast:['kayla','hilam','jhimm'],text:'Promis, nous revenons vers vous dès que nous avons fait un point avec le conseil !'},
  {speaker:'Zackarie',cast:['zackarie','bolduc'],text:'En attendant…'},
  {speaker:'Voix off',cast:['zackarie','bolduc'],text:'Zackarie se rapproche de Bolduc, toujours avec ce regard malicieux.'},
  {speaker:'Zackarie',cast:['zackarie','bolduc'],text:'Je ne suis pas fan de la Triade, mais avec toi, pourquoi pas ?'},
  {speaker:'Voix off',cast:['zackarie','bolduc'],text:'Le duel contre Zackarie se joue en Obscur, avec la règle Éléments. Sa main reste cachée : choisissez les bons contacts élémentaires pour prendre l’avantage.',finalLabel:'Affronter Zackarie — Obscur · Éléments'}
 ].map(beat=>({location:'La salle du conseil',mood:'neutral',...beat})),startCouncilVisitGame,resume);
}
function startCouncilVisitGame(){
 if(story.chapter2Part1!=='complete')return;
 if(activeDeck().cards.length===5&&!validDeck(activeDeck())){renderDeckBuilder();openPanel('#deckScreen');return}
 cancelBattleResult();applyRulePreset('elements-dark');currentMode='story-zackarie';gameType='ai';
 const chosen=validDeck(activeDeck())?deckCardsWithFoil(activeDeck()):['p27','p23','p04','p08','p13'].map(catalogById);
 const opponent=['p85','p84','p04','p149','p03'].map(id=>cloneCard(catalogById(id)));
 board=Array(9).fill(null);hands={p:chosen.map(playerCard),a:opponent};selected=null;turn=Math.random()<.5?'p':'a';locked=turn==='a';passing=false;matchRewarded=false;matchInProgress=true;resetMemories();
 story.chapter2='started';story.chapter2Part2='started';story.stage='chapter2-part2-match';story.councilVisitWon=false;story.councilVisitStep=0;saveStory();
 $('#storyScene').classList.add('hidden');$('#menuScreen').classList.add('hidden');document.querySelectorAll('.panel-screen').forEach(x=>x.classList.add('hidden'));$('#gameApp').classList.remove('hidden');$('#leftLabel').textContent='Bolduc • votre main';$('#rightLabel').textContent='Zackarie';$('#rulesBtn').style.display='none';
 msg('Zackarie — Obscur · Éléments','La main adverse est cachée et les affinités élémentaires s’appliquent. Remportez ce duel pour terminer la partie 2.');render();saveStoryMatch();if(turn==='a')setTimeout(aiMove,700);
}
function endCouncilVisitGame(counts){
 try{localStorage.removeItem('hackenia-story-match')}catch{}
 if(counts.p>counts.a){story.councilVisitWon=true;story.stage='chapter2-part2-victory';story.councilVisitStep=0;saveStory();setTimeout(showCouncilVisitVictory,1200)}
 else{story.chapter2Part2='retry';story.stage='chapter2-part2-retry';story.councilVisitWon=false;saveStory();setTimeout(()=>runStorySequence([{speaker:'Voix off',location:'La salle du conseil',cast:['zackarie','bolduc'],text:counts.p===counts.a?'La partie se termine à égalité. Bolduc peut retenter le duel contre Zackarie.':'Zackarie remporte cette manche. Bolduc peut retenter le duel.',finalLabel:'Réessayer le duel'}],startCouncilVisitGame),1200)}
}
function showCouncilVisitVictory(){
 if(!story.councilVisitWon)return;
 const resume=story.stage==='chapter2-part2-victory'?story.councilVisitStep:0;story.stage='chapter2-part2-victory';saveStory();
 runStorySequence([{speaker:'Voix off',location:'La salle du conseil',cast:['bolduc','zackarie'],text:'Bolduc remporte le duel contre Zackarie. Fin de la partie 2 du chapitre 2 : Sameron, Soryan et Zackarie.',finalLabel:'Terminer la partie 2'}],finishCouncilVisitPart,resume);
}
function finishCouncilVisitPart(){
 if(!story.councilVisitWon||story.chapter2Part1!=='complete')return;
 queueStoryBooster('chapter2Part2');story.chapter2Part2='complete';story.chapter2Part3=story.chapter2Part3==='complete'?'complete':'new';story.chapter2='started';story.stage='chapter2-part2-complete';story.councilVisitStep=0;
 if(!economy.storyRewards.chapter2Part2){economy.storyRewards.chapter2Part2=true;awardGold(50)}
 saveCollection();saveStory();showStoryMenu();
}

// Chapter 2, part 3: a purely narrative night, with no match or victory required.
const nightNarrative=[
 {speaker:'Voix off',location:'Les quartiers des aventuriers',cast:['bolduc','jhimm','kala'],text:'Les aventuriers rejoignent les quartiers qui leur ont été préparés. Les chambres sont très jolies et épurées : du bois chaleureux, des teintes vert bouteille et tout le nécessaire pour une bonne nuit de repos.'},
 {speaker:'Voix off',location:'La chambre de Bolduc et Jhimm',cast:['bolduc','jhimm'],text:'Bolduc et Jhimm font chambre commune. Après les événements de la journée, le calme de la pièce semble enfin leur promettre un peu de repos.'},
 {speaker:'Voix off',location:'La chambre de Grimgors et Kala',cast:['grimgors','kala'],text:'Grimgors et Kala s’installent dans une autre chambre, tout aussi agréable. Les dernières lumières s’éteignent peu à peu.'},
 {speaker:'Voix off',location:'La chambre d’Ébérien et Messire Balai',cast:['eberien','balai'],text:'Ébérien partage la troisième chambre avec Messire Balai. Le palais s’apaise ; chacun finit par trouver sa place pour la nuit.'},
 {speaker:'Voix off',location:'La chambre de Bolduc et Jhimm',cast:['bolduc'],text:'Bolduc s’endort. Son esprit glisse vers un rêve baigné de douceur…'},
 {speaker:'Voix off',location:'Le rêve de Bolduc',cast:[],dream:true,artwork:'night-bolduc-blessing',artworkAlt:'Bolduc chibi reçoit la bénédiction de Shauntéa dans un jardin onirique',text:'Dans son rêve, Bolduc rencontre Shauntéa, la déesse Mère Nature. Elle lui offre sa bénédiction.'},
 {speaker:'Voix off',location:'Le rêve de Bolduc',cast:[],dream:true,artwork:'night-bolduc-blessing',text:'Un sourire un peu bête aux lèvres, Bolduc accepte en tendant une main. Dans la chambre, sa main se lève dans le vide…'},
 {speaker:'Voix off',location:'Le rêve de Jhimm',cast:[],dream:true,artwork:'night-jhimm-message',artworkAlt:'Jhimm chibi tente d’entendre Heaum malgré l’interférence de Caleïzis',text:'Jhimm, lui, est contacté par Heaum. La divinité tente de lui parler, mais ses paroles lui parviennent brisées, presque incompréhensibles.'},
 {speaker:'Heaum',location:'Le rêve de Jhimm',cast:[],dream:true,artwork:'night-jhimm-message',text:'… Nord… là-bas…'},
 {speaker:'Voix off',location:'Le rêve de Jhimm',cast:[],dream:true,artwork:'night-jhimm-message',text:'Le rire de Caleïzis traverse soudain le rêve. Jhimm comprend : c’est elle qui empêche Heaum de parler comme la divinité le souhaite. Il ne lui reste que ces bribes de mots.'},
 {speaker:'Voix off',location:'Le rêve de Grimgors',cast:[],dream:true,artwork:'night-grimgors-light',artworkAlt:'Orcus arrache symboliquement un éclat de lumière du torse de Grimgors chibi',text:'Grimgors rencontre Orcus dans son rêve. Le démon le provoque et s’efforce de semer le doute dans les pensées du demi-orc.'},
 {speaker:'Voix off',location:'Le rêve de Grimgors',cast:[],dream:true,artwork:'night-grimgors-light',text:'Orcus approche sa main de son torse et en arrache un éclat de lumière. Le doute s’insinue davantage dans l’esprit de Grimgors…'},
 {speaker:'Voix off',location:'Le rêve de Kala',cast:['kala'],dream:true,flashback:true,personalMemory:true,text:'Kala revoit son passé de soldat. Autour d’elle s’étendent des terrains dévastés par la guerre. Les images de ce passé l’enferment dans un cauchemar.'},
 {speaker:'Voix off',location:'Le rêve de Kala',cast:['kala'],dream:true,text:'Puis la vision commence à s’estomper. Une voix chaleureuse se fait entendre.'},
 {speaker:'Une voix chaleureuse',location:'Le rêve de Kala',cast:['kala'],dream:true,text:'Stop, ça suffit.'},
 {speaker:'Voix off',location:'Le rêve de Kala',cast:[],dream:true,artwork:'night-kala-courage',artworkAlt:'Le cauchemar de Kala se dissipe et les aventuriers chibi combattent fièrement ensemble',text:'Le cauchemar devient un rêve. Kala se voit avec les autres aventuriers : ils combattent ensemble, fièrement, unis dans le même élan.'},
 {speaker:'Voix off',location:'Le rêve d’Ébérien',cast:[],dream:true,artwork:'night-eberien-parchment',artworkAlt:'Caleïzis rejoint Ébérien chibi dans la vision de son village abandonné',text:'Enfin, Ébérien est contacté par Caleïzis. Elle lui montre à nouveau son village abandonné : les mêmes maisons silencieuses, la même absence…'},
 {speaker:'Voix off',location:'Le rêve d’Ébérien',cast:[],dream:true,artwork:'night-eberien-parchment',text:'À la fin de cette vision, Caleïzis glisse même une main dans sa robe de sorcier. Elle y laisse un souvenir avant que le rêve ne s’efface.'},
 {speaker:'Voix off',location:'La chambre d’Ébérien et Messire Balai',cast:['eberien','balai'],emotions:{eberien:'surprised',balai:'neutral'},text:'Au réveil, Ébérien porte la main sous sa robe. Un parchemin magique y est apparu… Le souvenir laissé par Caleïzis ne s’est pas évanoui avec le rêve.'},
 {speaker:'Voix off',location:'Les quartiers des aventuriers',cast:['eberien','kala','jhimm'],text:'Fin de la partie 3 du chapitre 2 : Une nuit mouvementée.',finalLabel:'Terminer la partie 3'}
].map(beat=>({mood:'neutral',...beat}));
function renderNightMenu(){
 const unlocked=story.chapter2Part2==='complete',complete=story.chapter2Part3==='complete';
 $('#storyChapter2Part3').classList.toggle('locked',!unlocked);$('#storyChapter2Part3').classList.toggle('complete',complete);$('#chapter2Part3Btn').disabled=!unlocked;
 $('#chapter2Part3Btn').textContent=!unlocked?'Verrouillé':story.stage==='chapter2-part3-intro'?'Continuer':complete?'Rejouer':'Commencer';
 $('#chapter2Part3Status').textContent=!unlocked?'Terminez la partie 2.':complete?'Partie terminée — une nuit troublante et un parchemin mystérieux.':'Une nuit de rêves, de cauchemars et de visites inattendues.';
}
function startNightPart(){
 if(story.chapter2Part2!=='complete')return;
 const resume=story.stage==='chapter2-part3-intro'?story.nightStep:0;
 cancelBattleResult();matchInProgress=false;currentMode='story-night';
 story.chapter2='started';story.chapter2Part3='started';story.stage='chapter2-part3-intro';saveStory();
 runStorySequence(nightNarrative,finishNightPart,resume);
}
function finishNightPart(){
 if(story.chapter2Part2!=='complete'||story.stage!=='chapter2-part3-intro'||story.nightStep!==nightNarrative.length-1)return;
 queueStoryBooster('chapter2Part3');story.chapter2Part3='complete';story.chapter2Part4=story.chapter2Part4==='complete'?'complete':'new';story.chapter2='started';story.stage='chapter2-part3-complete';story.nightStep=0;
 if(!economy.storyRewards.chapter2Part3){economy.storyRewards.chapter2Part3=true;awardGold(50)}
 saveCollection();saveStory();showStoryMenu();
}

// Chapter 2, part 4: reunions in the market, then a runaway stone golem.
function renderDassomVisitMenu(){
 const unlocked=story.chapter2Part3==='complete',complete=story.chapter2Part4==='complete';
 $('#storyChapter2Part4').classList.toggle('locked',!unlocked);$('#storyChapter2Part4').classList.toggle('complete',complete);$('#chapter2Part4Btn').disabled=!unlocked;
 $('#chapter2Part4Btn').textContent=!unlocked?'Verrouillé':String(story.stage).startsWith('chapter2-part4-')&&story.stage!=='chapter2-part4-complete'?'Continuer':complete?'Rejouer':'Commencer';
 $('#chapter2Part4Status').textContent=!unlocked?'Terminez Une nuit mouvementée.':complete?'Partie terminée — en route vers le Griffon Doré.':'Une visite au marché et des retrouvailles pour Kala.';
}
function startDassomVisitPart(){
 if(story.chapter2Part3!=='complete')return;
 const saved=readSaved('hackenia-story-match',null);
 if(story.stage==='chapter2-part4-match'&&saved?.mode==='story-dassom-golem'){restoreStoryMatch(saved);return}
 if(story.stage==='chapter2-part4-victory'&&story.visitWon){showDassomVisitVictory();return}
 if(['chapter2-part4-match','chapter2-part4-retry'].includes(story.stage)){startDassomVisitGame();return}
 const resume=story.stage==='chapter2-part4-intro'?story.visitStep:0;
 story.chapter2='started';story.chapter2Part4='started';story.stage='chapter2-part4-intro';story.visitWon=false;saveStory();
 runStorySequence([
  {speaker:'Voix off',location:'Les quartiers des aventuriers',morningQuarters:true,cast:['bolduc','jhimm','grimgors'],text:'Au petit matin, les aventuriers se retrouvent et se confient sur ce qu’ils ont vu et ressenti durant la nuit.'},
  {speaker:'Voix off',location:'Les quartiers des aventuriers',morningQuarters:true,cast:['kala','eberien','balai'],text:'La bénédiction de Bolduc, les paroles interrompues de Heaum, les visions de Grimgors et de Kala, le parchemin d’Ébérien… Chacun partage son expérience avec les autres.'},
  {speaker:'Voix off',location:'Les quartiers des aventuriers',morningQuarters:true,cast:['kala','bolduc','jhimm'],text:'Ils décident de sortir visiter Dassom et de dépenser un peu de l’argent reçu pour le succès de leur mission. Kayla et Hilam leur ont confié de jolies bourses en récompense.'},
  {speaker:'Voix off',location:'Le quartier marchand',cast:[],text:'Les aventuriers rejoignent le quartier marchand. Les étals débordent de produits plus intéressants les uns que les autres.'},
  {speaker:'Voix off',location:'Le quartier marchand',cast:['bolduc','kala','eberien'],text:'Potions, étoffes, objets curieux et matériel de voyage attirent leurs regards. Le groupe prend le temps de zieuter toutes ces merveilles.'},
  {speaker:'Voix off',location:'Le quartier marchand',cast:['kala','velmarys'],text:'Au milieu des étals, Kala retrouve Velmarys. Heureux de revoir une vieille camarade, il s’arrête auprès d’elle.'},
  {speaker:'Velmarys',location:'Le quartier marchand',cast:['velmarys','kala'],text:'Kala ! Quel plaisir de te revoir. Nous pourrions discuter en soirée, quand tu seras un peu plus tranquille.'},
  {speaker:'Voix off',location:'Le quartier marchand',cast:['velmarys','kala'],text:'Velmarys s’apprête à repartir lorsqu’un fracas interrompt la visite.'},
  {speaker:'Voix off',location:'Le quartier marchand',cast:[],artwork:'dassom-golem-incident',artworkAlt:'Un magicien maladroit se fait écraser par son propre golem de pierre, en style chibi',text:'Un magicien, manifestement peu doué, vient de se faire écraser par sa propre création : un golem de pierre !'},
  {speaker:'Voix off',location:'Le quartier marchand',cast:[],artwork:'dassom-golem-incident',text:'La lourde créature de pierre menace les passants et les étals. Les aventuriers interviennent pour l’arrêter.'},
  {speaker:'Voix off',location:'Le quartier marchand',cast:['grimgors','jhimm','bolduc'],text:'Le duel contre le golem se joue en Obscur, avec la règle Addition. Deux sommes égales sur des contacts adjacents peuvent déclencher des captures.',finalLabel:'Affronter le golem — Obscur · Addition'}
 ].map(beat=>({mood:'neutral',...beat})),startDassomVisitGame,resume);
}
function startDassomVisitGame(){
 if(story.chapter2Part3!=='complete')return;
 if(activeDeck().cards.length===5&&!validDeck(activeDeck())){renderDeckBuilder();openPanel('#deckScreen');return}
 cancelBattleResult();applyRulePreset('plus-dark');currentMode='story-dassom-golem';gameType='ai';
 const chosen=validDeck(activeDeck())?deckCardsWithFoil(activeDeck()):['p27','p23','p04','p08','p13'].map(catalogById);
 const opponent=['p89','p89','p89','p58','p81'].map(id=>cloneCard(catalogById(id)));
 board=Array(9).fill(null);hands={p:chosen.map(playerCard),a:opponent};selected=null;turn=Math.random()<.5?'p':'a';locked=turn==='a';passing=false;matchRewarded=false;matchInProgress=true;resetMemories();
 story.chapter2='started';story.chapter2Part4='started';story.stage='chapter2-part4-match';story.visitWon=false;story.visitStep=0;saveStory();
 $('#storyScene').classList.add('hidden');$('#menuScreen').classList.add('hidden');document.querySelectorAll('.panel-screen').forEach(x=>x.classList.add('hidden'));$('#gameApp').classList.remove('hidden');$('#leftLabel').textContent='Les aventuriers';$('#rightLabel').textContent='Le golem de pierre';$('#rulesBtn').style.display='none';
 msg('Le golem — Obscur · Addition','La main adverse est cachée. Utilisez les sommes égales pour arrêter la création du magicien.');render();saveStoryMatch();if(turn==='a')setTimeout(aiMove,700);
}
function endDassomVisitGame(counts){
 try{localStorage.removeItem('hackenia-story-match')}catch{}
 if(counts.p>counts.a){story.visitWon=true;story.stage='chapter2-part4-victory';story.visitStep=0;saveStory();setTimeout(showDassomVisitVictory,1200)}
 else{story.chapter2Part4='retry';story.stage='chapter2-part4-retry';story.visitWon=false;saveStory();setTimeout(()=>runStorySequence([{speaker:'Voix off',location:'Le quartier marchand',cast:[],artwork:'dassom-golem-incident',text:'Le golem menace encore le quartier marchand. Les aventuriers doivent retenter le duel pour l’arrêter.',finalLabel:'Réessayer le duel'}],startDassomVisitGame),1200)}
}
function showDassomVisitVictory(){
 if(!story.visitWon)return;
 const resume=story.stage==='chapter2-part4-victory'?story.visitStep:0;story.stage='chapter2-part4-victory';saveStory();
 runStorySequence([
  {speaker:'Voix off',location:'Le quartier marchand',cast:[],artwork:'dassom-market-help',artworkAlt:'Le golem est détruit ; des gardes chibi dégagent le marché et soignent les passants',text:'Le golem est détruit. Des gardes arrivent en renfort pour aider à ranger les étals, dégager les débris et prodiguer des soins aux passants.'},
  {speaker:'Voix off',location:'Le quartier marchand',cast:['kala','jhimm','grimgors'],text:'Le quartier marchand retrouve peu à peu son calme. Les aventuriers peuvent reprendre leur visite de Dassom.'},
  {speaker:'Voix off',location:'Le quartier des chasseurs',cast:['bolduc','eberien','balai'],text:'Ils continuent leur route vers le quartier des chasseurs pour trouver la taverne du Griffon Doré.'},
  {speaker:'Voix off',location:'Le quartier des chasseurs',cast:['kala','jhimm','grimgors'],text:'Fin de la partie 4 du chapitre 2 : Visite de Dassom.',finalLabel:'Terminer la partie 4'}
 ].map(beat=>({mood:'neutral',...beat})),finishDassomVisitPart,resume);
}
function finishDassomVisitPart(){
 if(!story.visitWon||story.chapter2Part3!=='complete')return;
 queueStoryBooster('chapter2Part4');story.chapter2Part4='complete';story.chapter2Part5=story.chapter2Part5==='complete'?'complete':'new';story.chapter2='started';story.stage='chapter2-part4-complete';story.visitStep=0;
 if(!economy.storyRewards.chapter2Part4){economy.storyRewards.chapter2Part4=true;awardGold(50)}
 saveCollection();saveStory();showStoryMenu();
}

// Chapter 2, part 5: the guild's empty board and the pixies' detour.
function renderFairyMistsMenu(){
 const unlocked=story.chapter2Part4==='complete',complete=story.chapter2Part5==='complete';
 $('#storyChapter2Part5').classList.toggle('locked',!unlocked);$('#storyChapter2Part5').classList.toggle('complete',complete);$('#chapter2Part5Btn').disabled=!unlocked;
 $('#chapter2Part5Btn').textContent=!unlocked?'Verrouillé':String(story.stage).startsWith('chapter2-part5-')&&story.stage!=='chapter2-part5-complete'?'Continuer':complete?'Rejouer':'Commencer';
 $('#chapter2Part5Status').textContent=!unlocked?'Terminez Visite de Dassom.':complete?'Partie terminée — Bolduc vous attend chez les myconides.':'Maebril, un tableau mystérieux et des pixies malicieuses.';
}
function startFairyMistsPart(){
 if(story.chapter2Part4!=='complete')return;
 const saved=readSaved('hackenia-story-match',null);
 if(story.stage==='chapter2-part5-match'&&saved?.mode==='story-pixies'){restoreStoryMatch(saved);return}
 if(story.stage==='chapter2-part5-victory'&&story.fairyMistsWon){showFairyMistsVictory();return}
 if(['chapter2-part5-match','chapter2-part5-retry'].includes(story.stage)){startFairyMistsGame();return}
 const resume=story.stage==='chapter2-part5-intro'?story.fairyMistsStep:0;
 story.chapter2='started';story.chapter2Part5='started';story.stage='chapter2-part5-intro';story.fairyMistsWon=false;saveStory();
 runStorySequence([
  {speaker:'Voix off',location:'La taverne du Griffon Doré',cast:['kala','bolduc','maebril'],text:'Les aventuriers entrent dans la taverne du Griffon Doré. Ils saluent Maebril, qui leur rend chaleureusement leur bonjour.'},
  {speaker:'Maebril',location:'La taverne du Griffon Doré',cast:['maebril','jhimm','eberien'],text:'Bonjour à vous ! Bienvenue au Griffon Doré.'},
  {speaker:'Voix off',location:'La taverne du Griffon Doré',cast:['grimgors','kala','balai'],text:'Le groupe observe le tableau des primes. Pas une quête, pas une annonce… Il leur paraît bien vide.'},
  {speaker:'Maebril',location:'La taverne du Griffon Doré',cast:['maebril','kala'],text:'Il faut le mériter pour pouvoir lire le tableau.'},
  {speaker:'Voix off',location:'La taverne du Griffon Doré',cast:['maebril','jhimm'],text:'Le tableau de primes n’affiche les quêtes qu’aux membres de la guilde. Pour les aventuriers, sa surface reste entièrement vierge.'},
  {speaker:'Maebril',location:'La taverne du Griffon Doré',cast:['maebril','eberien','bolduc'],text:'Avant de vous donner des quêtes, pouvez-vous vous rendre au quartier des myconides ? Ils auraient un petit souci… Vous pouvez vous y rendre par le quartier des brumes ou le quartier noble.'},
  {speaker:'Voix off',location:'Le quartier des brumes féeriques',cast:['kala','jhimm','bolduc'],text:'Les aventuriers choisissent de passer par le quartier des brumes féeriques. Une douce brume colorée enveloppe les rues à leur arrivée.'},
  {speaker:'Voix off',location:'Le quartier des brumes féeriques',cast:['pixie','pixieCrying','bolduc'],text:'À peine sont-ils entrés que des pixies leur jettent des charmes. Des lueurs virevoltent autour d’eux… et Bolduc disparaît !'},
  {speaker:'Voix off',location:'Le quartier des brumes féeriques',cast:[],artwork:'kala-catches-pixie',artworkAlt:'Kala chibi attrape une petite pixie en pleurs dans les brumes féeriques',text:'Excédée, Kala parvient de justesse à attraper une petite pixie avant qu’elle ne lui échappe.'},
  {speaker:'Kala',location:'Le quartier des brumes féeriques',cast:[],artwork:'kala-catches-pixie',text:'Qu’est-ce que t’as fait de mon ami ! Il est où ?!'},
  {speaker:'La petite pixie',location:'Le quartier des brumes féeriques',cast:[],artwork:'kala-catches-pixie',text:'C’était juste pour s’amuser…',mood:'crying'},
  {speaker:'Kala',location:'Le quartier des brumes féeriques',cast:[],artwork:'kala-catches-pixie',text:'Envoie-nous aussi avec lui.'},
  {speaker:'Une autre pixie',location:'Le quartier des brumes féeriques',cast:['pixie','kala'],text:'D’accord, mais on peut jouer un peu avant ? Je te promets que ton ami va bien.'},
  {speaker:'Voix off',location:'Le quartier des brumes féeriques',cast:['kala','pixie','eberien'],text:'Irritée, Kala accepte le duel pour retrouver Bolduc.'},
  {speaker:'Voix off',location:'Le quartier des brumes féeriques',cast:['pixie','kala'],text:'La pixie joue en Clair, avec toutes les règles : Addition, Identique et Éléments actifs. Sa main est visible, et les bonus élémentaires s’appliquent aux contacts avant les captures.',finalLabel:'Défier la pixie — Clair · Addition · Identique · Éléments'}
 ].map(beat=>({mood:'neutral',...beat})),startFairyMistsGame,resume);
}
function startFairyMistsGame(){
 if(story.chapter2Part4!=='complete')return;
 if(activeDeck().cards.length===5&&!validDeck(activeDeck())){renderDeckBuilder();openPanel('#deckScreen');return}
 cancelBattleResult();applyRulePreset('elements-same-plus-open');currentMode='story-pixies';gameType='ai';
 const chosen=validDeck(activeDeck())?deckCardsWithFoil(activeDeck()):['p27','p23','p04','p08','p13'].map(catalogById);
 const opponent=['p76','p76','p66','p63','p145'].map(id=>cloneCard(catalogById(id)));
 board=Array(9).fill(null);hands={p:chosen.map(playerCard),a:opponent};selected=null;turn=Math.random()<.5?'p':'a';locked=turn==='a';passing=false;matchRewarded=false;matchInProgress=true;resetMemories();
 story.chapter2='started';story.chapter2Part5='started';story.stage='chapter2-part5-match';story.fairyMistsWon=false;story.fairyMistsStep=0;saveStory();
 $('#storyScene').classList.add('hidden');$('#menuScreen').classList.add('hidden');document.querySelectorAll('.panel-screen').forEach(x=>x.classList.add('hidden'));$('#gameApp').classList.remove('hidden');$('#leftLabel').textContent='Kala • votre main';$('#rightLabel').textContent='La pixie';$('#rulesBtn').style.display='none';
 msg('La pixie — Clair · Addition · Identique · Éléments','Sa main est visible. Remportez le duel pour rejoindre Bolduc.');render();saveStoryMatch();if(turn==='a')setTimeout(aiMove,700);
}
function endFairyMistsGame(counts){
 try{localStorage.removeItem('hackenia-story-match')}catch{}
 if(counts.p>counts.a){story.fairyMistsWon=true;story.stage='chapter2-part5-victory';story.fairyMistsStep=0;saveStory();setTimeout(showFairyMistsVictory,1200)}
 else{story.chapter2Part5='retry';story.stage='chapter2-part5-retry';story.fairyMistsWon=false;saveStory();setTimeout(()=>runStorySequence([{speaker:'Une autre pixie',location:'Le quartier des brumes féeriques',cast:['pixie','kala'],text:'Encore une partie ? Ton ami va bien, promis !',finalLabel:'Réessayer le duel'}],startFairyMistsGame),1200)}
}
function showFairyMistsVictory(){
 if(!story.fairyMistsWon)return;
 const resume=story.stage==='chapter2-part5-victory'?story.fairyMistsStep:0;story.stage='chapter2-part5-victory';saveStory();
 runStorySequence([
  {speaker:'Voix off',location:'Le quartier des brumes féeriques',cast:['kala','pixie','eberien'],fairyTeleport:true,text:'Une seconde après le duel, un élan de paillettes arc-en-ciel emporte les aventuriers.'},
  {speaker:'Voix off',location:'Le quartier myconide',cast:['kala','jhimm','grimgors'],text:'Ils se retrouvent dans le quartier des myconides : un endroit végétal sous terre, couvert de verdure et de maisons champignons blanches.'},
  {speaker:'Voix off',location:'Le quartier myconide',cast:[],artwork:'bolduc-myconide-reunion',artworkAlt:'Bolduc chibi attend calmement près d’un myconide silencieux, devant les maisons champignons blanches du quartier souterrain',text:'Bolduc est bien là. Il attend tranquillement en compagnie d’un myconide silencieux.'},
  {speaker:'Voix off',location:'Le quartier myconide',cast:[],artwork:'bolduc-myconide-reunion',text:'Fin de la partie 5 du chapitre 2 : Maebril et le quartier des brumes féeriques.',finalLabel:'Terminer la partie 5'}
 ].map(beat=>({mood:'neutral',...beat})),finishFairyMistsPart,resume);
}
function finishFairyMistsPart(){
 if(!story.fairyMistsWon||story.chapter2Part4!=='complete')return;
 queueStoryBooster('chapter2Part5');story.chapter2Part5='complete';story.chapter2Part6=story.chapter2Part6==='complete'?'complete':'new';story.chapter2='started';story.stage='chapter2-part5-complete';story.fairyMistsStep=0;
 if(!economy.storyRewards.chapter2Part5){economy.storyRewards.chapter2Part5=true;awardGold(50)}
 saveCollection();saveStory();showStoryMenu();
}



// Chapter 2, part 6: the missing myconides and the cavern parasites.
function renderLostCompanionsMenu(){
 const unlocked=story.chapter2Part5==='complete',complete=story.chapter2Part6==='complete';
 $('#storyChapter2Part6').classList.toggle('locked',!unlocked);$('#storyChapter2Part6').classList.toggle('complete',complete);$('#chapter2Part6Btn').disabled=!unlocked;
 $('#chapter2Part6Btn').textContent=!unlocked?'Verrouillé':String(story.stage).startsWith('chapter2-part6-')&&story.stage!=='chapter2-part6-complete'?'Continuer':complete?'Rejouer':'Commencer';
 $('#chapter2Part6Status').textContent=!unlocked?'Terminez la partie 5.':complete?'Partie terminée — la recherche des disparus continue.':'Les myconides ont perdu le contact avec leurs compagnons.';
}
function startLostCompanionsPart(){
 if(story.chapter2Part5!=='complete')return;
 const saved=readSaved('hackenia-story-match',null);
 if(story.stage==='chapter2-part6-match'&&saved?.mode==='story-larvae'){restoreStoryMatch(saved);return}
 if(story.stage==='chapter2-part6-victory'&&story.lostCompanionsWon){showLostCompanionsVictory();return}
 if(['chapter2-part6-match','chapter2-part6-retry'].includes(story.stage)){startLostCompanionsGame();return}
 const resume=story.stage==='chapter2-part6-intro'?story.lostCompanionsStep:0;
 story.chapter2='started';story.chapter2Part6='started';story.stage='chapter2-part6-intro';story.lostCompanionsWon=false;saveStory();
 runStorySequence([
  {speaker:'Voix off',location:'Le quartier myconide',cast:['myconides','bolduc','kala'],text:'Les aventuriers retrouvent Bolduc auprès des myconides. Sans qu’aucune bouche ne s’ouvre, une voix résonne dans leurs esprits : les habitants communiquent par télépathie.'},
  {speaker:'Les myconides',location:'Le quartier myconide',cast:['myconides','jhimm'],text:'Plusieurs des nôtres se sont aventurés dans les cavernes environnantes. Nous avons perdu le contact avec eux…'},
  {speaker:'Les myconides',location:'Le quartier myconide',cast:['myconides','grimgors','eberien'],text:'D’autres aventuriers sont déjà partis les chercher. Eux non plus ne sont pas revenus.'},
  {speaker:'Voix off',location:'Le quartier myconide',cast:['kala','bolduc','grimgors'],text:'Les aventuriers partent aussitôt à leur rescousse, déterminés à retrouver les disparus et à découvrir la source du mal.'},
  {speaker:'Voix off',location:'Les cavernes humides',cast:['kala','jhimm','eberien'],text:'Dans les cavernes humides, chaque pas demande de la prudence. Des lianes vivantes se tendent sur leur passage ; des champignons libèrent des spores soporifiques.'},
  {speaker:'Voix off',location:'Les cavernes humides',cast:['grimgors','bolduc','kala'],text:'Le groupe repère les pièges naturels à temps. Les aventuriers enjambent les lianes et contournent les nuages de spores sans se laisser surprendre.'},
  {speaker:'Voix off',location:'Les cavernes humides',cast:['jhimm','eberien'],text:'Plus loin, des larves étranges se tortillent entre les rochers. Elles se précipitent soudain sur les aventuriers !'},
  {speaker:'Voix off',location:'Les cavernes humides',cast:['grimgors','kala','bolduc'],text:'Les larves cherchent à s’accrocher aux aventuriers. Le groupe se prépare à les repousser.',finalLabel:'Affronter les larves'}
 ].map(beat=>({mood:'neutral',...beat})),startLostCompanionsGame,resume);
}
function startLostCompanionsGame(){
 if(story.chapter2Part5!=='complete')return;
 if(activeDeck().cards.length===5&&!validDeck(activeDeck())){renderDeckBuilder();openPanel('#deckScreen');return}
 cancelBattleResult();applyRulePreset('basic-open');currentMode='story-larvae';gameType='ai';
 const chosen=validDeck(activeDeck())?deckCardsWithFoil(activeDeck()):['p27','p23','p04','p08','p13'].map(catalogById);
 const opponent=['p65','p65','p65','p82','p82'].map(id=>cloneCard(catalogById(id)));
 board=Array(9).fill(null);hands={p:chosen.map(playerCard),a:opponent};selected=null;turn=Math.random()<.5?'p':'a';locked=turn==='a';passing=false;matchRewarded=false;matchInProgress=true;resetMemories();
 story.chapter2='started';story.chapter2Part6='started';story.stage='chapter2-part6-match';story.lostCompanionsWon=false;story.lostCompanionsStep=0;saveStory();
 $('#storyScene').classList.add('hidden');$('#menuScreen').classList.add('hidden');document.querySelectorAll('.panel-screen').forEach(x=>x.classList.add('hidden'));$('#gameApp').classList.remove('hidden');$('#leftLabel').textContent='Votre main';$('#rightLabel').textContent='Les larves';$('#rulesBtn').style.display='none';
 msg('Les larves — Clair','Remportez le duel pour repousser les créatures.');render();saveStoryMatch();if(turn==='a')setTimeout(aiMove,700);
}
function endLostCompanionsGame(counts){
 try{localStorage.removeItem('hackenia-story-match')}catch{}
 if(counts.p>counts.a){story.lostCompanionsWon=true;story.stage='chapter2-part6-victory';story.lostCompanionsStep=0;saveStory();setTimeout(showLostCompanionsVictory,1200)}
 else{story.chapter2Part6='retry';story.stage='chapter2-part6-retry';story.lostCompanionsWon=false;saveStory();setTimeout(()=>runStorySequence([{speaker:'Voix off',location:'Les cavernes humides',cast:['grimgors','jhimm','kala'],text:'Les créatures empêchent encore le groupe de progresser. Les aventuriers doivent retenter le duel pour les repousser.',finalLabel:'Réessayer le duel'}],startLostCompanionsGame),1200)}
}
function showLostCompanionsVictory(){
 if(!story.lostCompanionsWon)return;
 const resume=story.stage==='chapter2-part6-victory'?story.lostCompanionsStep:0;story.stage='chapter2-part6-victory';saveStory();
 runStorySequence([
  {speaker:'Voix off',cast:['jhimm','bolduc','eberien'],text:'Certains aventuriers se font mordre. Les larves cherchent à prendre possession de leurs corps, mais le groupe parvient à les arracher et à se débarrasser des créatures.'},
  {speaker:'Voix off',cast:['kala','bolduc','grimgors'],text:'En fouillant les environs, les aventuriers découvrent une précieuse relique : un sac sans fond !'},
  {speaker:'Voix off',cast:['eberien','kala'],text:'Ce sac magique peut contenir de grandes quantités d’équipement, d’or et d’objets. Une découverte bien utile pour la suite de leur voyage.'},
  {speaker:'Voix off',cast:['jhimm','grimgors','bolduc'],text:'Le groupe reprend son exploration. Mais des lianes magiques jaillissent du plafond de la grotte et s’abattent sur les aventuriers !'},
  {speaker:'Voix off',cast:['jhimm','kala','eberien'],text:'Jhimm n’a pas le temps de les éviter. Les lianes s’enroulent autour de lui et le ligotent, le laissant immobilisé pendant que ses compagnons combattent.'},
  {speaker:'Jhimm',cast:['jhimm','grimgors'],text:'Si quelqu’un pouvait me libérer… ce serait le moment !'},
  {speaker:'Voix off',cast:['grimgors','jhimm'],text:'Grimgors se porte à son secours. Il tranche les lianes qui emprisonnent Jhimm et le libère, tandis que les autres repoussent les dernières plantes vivantes.'},
  {speaker:'Voix off',cast:['jhimm','grimgors','kala'],text:'Jhimm retrouve enfin sa liberté. Le groupe se rassemble : leurs compagnons disparus restent à retrouver, et la source du mal demeure inconnue.'},
  {speaker:'Voix off',cast:['kala','bolduc','grimgors'],text:'Fin de la partie 6 du chapitre 2 : Compagnons perdus.',finalLabel:'Terminer la partie 6'}
 ].map(beat=>({mood:'neutral',location:'Les cavernes humides',...beat})),finishLostCompanionsPart,resume);
}
function finishLostCompanionsPart(){
 if(!story.lostCompanionsWon||story.chapter2Part5!=='complete')return;
 queueStoryBooster('chapter2Part6');story.chapter2Part6='complete';story.chapter2='started';story.stage='chapter2-part6-complete';story.lostCompanionsStep=0;
 if(!economy.storyRewards.chapter2Part6){economy.storyRewards.chapter2Part6=true;awardGold(50)}
 saveCollection();saveStory();showStoryMenu();
}
