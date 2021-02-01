import { GameMove, GameMoveClass } from './game-move.class'
import { KeyboardEvent } from 'react'


class GameboardKeyService extends GameMoveClass {
  // Maps keycodes to game moves
  private keycodeToGameMove: {[key: number]: GameMove} = {
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down',
  }
  /**
   * @method
   * @description
   * Handles a keyboard event, turns it into a game move
   * @param keyEvent {KeyboardEvent} key event
   * @return {void}
  **/
  public handleKeyEvent(keyEvent: KeyboardEvent): void {
    // only use onKeyDown: https://stackoverflow.com/questions/5597060/detecting-arrow-key-presses-in-javascript
    // Check to see if this is a key event we want to keep track of
    if (this.keycodeToGameMove[keyEvent.keyCode]) {
      // Then execute the appropriate game move
      this.gameMove$.next(this.keycodeToGameMove[keyEvent.keyCode]);
    }
  }
}

const gameboardKeyService = new GameboardKeyService();

export default gameboardKeyService;