import React, { useEffect, useState } from 'react';
import { Subscription } from 'rxjs';
import GameStateService, { GameState } from '../../game/services/game-state.service'

const ScoreComponent = () => {
  const [score, setScore] = useState<number>(0);
  /**
   * @method
   * @description
   * Keeping an eye on whether the menu is open or not
   **/
  useEffect(() => {
    const scoreSub: Subscription = GameStateService.gameState.subscribe(
      (newGameState: GameState) => {
        setScore(newGameState.score);
      }
    );
    // Unsubscribe when we are finished
    return function cleanup() {
      scoreSub.unsubscribe();
    };
  });
  
  return (score === 0?
      // If the menu is closed, then we have an inactive hamburger where onclick triggers open menu
      (<p></p>) :
      // Conversely, open menu gives us active hamburger and onclick triggers closing the menu
      (<p style={{color: 'white'}}>{score}</p>)
  );
}

export default ScoreComponent;