import React, { useEffect, useState } from 'react';
import { Subscription } from 'rxjs';
import GameStateService, { GameState } from '../../game/services/game-state.service'
import HiscoreService, { Score } from '../../game/services/hiscore.service'

const ScoreComponent = () => {
  const [score, setScore] = useState<number>(0);
  // And hiscore
  const [hiscore, setHiscore] = useState<Score>(undefined);
  /**
   * @method
   * @description
   * Keeping an eye on whether the menu is open or not
   **/
  useEffect(() => {
    const allSubs: Subscription = new Subscription();
    // Listening for changes to the current score
    allSubs.add(GameStateService.gameState.subscribe(
      (newGameState: GameState) => {
        setScore(newGameState.score);
      }
    ));
    // Listening for changes to the hiscore
    allSubs.add(HiscoreService.hiscore.subscribe(
      (newHiscore: Score) => {
        setHiscore(newHiscore);
      }
    ));
    // Unsubscribe when we are finished
    return function cleanup() {
      allSubs.unsubscribe();
    };
  });
  
  return (
    <p style={{color: 'white'}}>
      {score === 0? '' : score}<br/>
      ({hiscore === undefined? 0 : hiscore.value})
    </p>
  );
}

export default ScoreComponent;