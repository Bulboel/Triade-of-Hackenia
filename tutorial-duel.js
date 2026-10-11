// The training entry point reuses the real story duel and Kayla's guide.
// Keep the previous runtime match intact; training never writes progress.
let tutorialBackup=null;
function openTutorial(){
 if(currentMode!=='tutorial'){
  tutorialBackup={board,hands,turn,selected,locked,passing,currentMode,gameType,
   matchInProgress,matchRewarded,memoryDeck,memoryDraws,memoryBlocked,memoryJoker,
   blindHands,playedOrder,moveHistory,memoryPending,rule:currentRuleKey,
   startup:!$('#startupScreen').classList.contains('hidden')};
 }
 $('#startupScreen').classList.add('hidden');
 startStoryGame(true);
 $('#saveGameBtn').hidden=true;
}
function closeTutorial(){
 if(!tutorialBackup)return;
 cancelBattleResult();clearBoardChoice();
 const saved=tutorialBackup;tutorialBackup=null;
 ({board,hands,turn,selected,locked,passing,currentMode,gameType,
  matchInProgress,matchRewarded,memoryDeck,memoryDraws,memoryBlocked,memoryJoker,
  blindHands,playedOrder,moveHistory,memoryPending}=saved);
 revealedMemory=null;choiceState=null;
 applyRulePreset(saved.rule);
 $('#saveGameBtn').hidden=false;
 if(saved.startup)$('#startupScreen').classList.remove('hidden');
}
function initTutorial(){
 for(const parent of ['#startupScreen .menu-actions','#menuScreen .menu-actions']){
  const button=document.createElement('button');
  button.className='menu-btn secondary';button.textContent='Apprendre à jouer';
  button.onclick=openTutorial;$(parent).append(button);
 }
}
