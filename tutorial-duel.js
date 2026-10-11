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
 const style=document.createElement('style');
 style.textContent=`
  #startupScreen .menu-actions .learn-kayla,#menuScreen .menu-actions .learn-kayla{
   grid-column:1/-1!important;display:flex!important;align-items:center;justify-content:center;gap:12px;
   width:100%!important;min-height:58px!important;margin:8px 0 0!important;padding:12px 18px!important;
   border:2px solid #d9bd78!important;border-radius:14px!important;
   background:linear-gradient(125deg,#386f5e,#183e40)!important;color:#fff0c5!important;
   font-size:17px!important;font-weight:800!important;text-decoration:none!important;
   box-shadow:0 4px 0 #091f27, inset 0 1px 0 #fff5cb44,0 0 16px #dfbd6030!important;
   transition:background .18s,box-shadow .18s;
  }
  #startupScreen .learn-kayla::before,#menuScreen .learn-kayla::before,
  #startupScreen .learn-kayla::after,#menuScreen .learn-kayla::after{content:none!important}
  .learn-kayla .learn-icon{display:inline-flex;flex:none;width:28px;height:28px;color:#f0d285}
  .learn-kayla .learn-icon svg{width:100%;height:100%}
  #startupScreen .menu-actions .learn-kayla:hover,#menuScreen .menu-actions .learn-kayla:hover{
   background:linear-gradient(125deg,#46836f,#225358)!important;box-shadow:0 4px 0 #091f27,0 0 20px #dfbd6055!important;
  }
  .learn-kayla:focus-visible{outline:3px solid #fff2c1;outline-offset:4px}
 `;document.head.append(style);
 for(const parent of ['#startupScreen .menu-actions','#menuScreen .menu-actions']){
  const button=document.createElement('button');
  button.className='menu-btn learn-kayla';
  button.innerHTML='<span class="learn-icon" aria-hidden="true"><svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8C12 5 6 5 3 7v18c4-2 9-2 13 1 4-3 9-3 13-1V7c-3-2-9-2-13 1Z"/><path d="M16 8v18M7 11l5 1M7 16l5 1M20 12l5-1M20 17l5-1"/></svg></span><span>Apprendre à jouer</span>';
  button.onclick=openTutorial;$(parent).append(button);
 }
}
