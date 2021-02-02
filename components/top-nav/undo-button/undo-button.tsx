import React from 'react'
import GameStateService from '../../game/services/game-state.service';

/**
 * @method
 * @description
 * Wrapper function to undo the latest move
**/
function undo(): void {
  GameStateService.undoLatestMove();
}

const UndoButtonComponent = () => {
  return (
    <button className='nav' type="button" onClick={undo}>
      Undo
    </button>
  );
}

export default UndoButtonComponent;