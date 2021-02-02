import React from 'react'
import GameStateService from '../../game/services/game-state.service';

/**
 * @method
 * @description
 * Wrapper function to undo the latest move
 **/
function reset(): void {
  GameStateService.resetGameState();
}

const ResetButtonComponent = () => {
  return (
    <button className='nav' type="button" onClick={reset}>
      Reset
    </button>
  );
}

export default ResetButtonComponent;