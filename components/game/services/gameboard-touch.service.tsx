import { TouchEvent, Touch } from 'react'
import { GameMove, GameMoveClass } from './game-move.class'

export type TouchType = 'start' | 'end';
export type TouchDistAndDirection = {
  dist: number,
  direction: GameMove
};

class GameboardTouchService extends GameMoveClass {
  // Minimum distance touch needs to move to count
  private minTouchDist: number = 10;
  // Current start of touch
  private startTouch: Touch;
  /**
   * @method
   * @description
   * Handles a touch event, translates it into games moves
   * @param touchEvent {TouchEvent} a touch event
   * @param touchStartOrEnd {TouchType} whether this was a start or end touch event
   * @return {void}
  **/
  public handleTouchEvent(touchEvent: TouchEvent, touchStartOrEnd: TouchType): void {
    if (touchStartOrEnd === 'start') {
      this.handleTouchStart(touchEvent);
    } else {
      this.handleTouchEnd(touchEvent);
    }
  }
  /**
   * @method
   * @description
   * Handles the start of a touch event -- pretty much just sets a temp var so we can compare
   * @param touchEvent {TouchEvent} the latest touch event
   * @return {void}
  **/
  private handleTouchStart(touchEvent: TouchEvent): void {
    this.startTouch = touchEvent.targetTouches[0];
  }
  /**
   * @method
   * @description
   * Handles a touch end event
   * @param touchEvent {TouchEvent} touch end event
   * @return {void}
  **/
  private handleTouchEnd(touchEvent: TouchEvent): void {
    // Make sure that we have a start touch
    if (this.startTouch) {
      // Calculate the touch distance and direction
      const touchDistAndDir: TouchDistAndDirection = GameboardTouchService.greatestDistanceFromTouchStartToEnd(
        this.startTouch, touchEvent.changedTouches[0]
      );
      // If the touch went at least our minimum distance, then we execute a game move
      if (touchDistAndDir.dist >= this.minTouchDist) {
        this.gameMove$.next(touchDistAndDir.direction);
      }
    }
  }
  /**
   * @method
   * @description
   * determines the greatest distance (x or y), and which direction that represents
   * @param startTouch {Touch} the starting touch object
   * @param endTouch {Touch} the ending touch object
   * @return {TouchDistAndDirection} the distance and direction of the touch
  **/
  private static greatestDistanceFromTouchStartToEnd(startTouch: Touch, endTouch: Touch): TouchDistAndDirection {
    // Increases from 0,0 in the top left hand corner
    // get the x and y distances moved
    const xdist: number = endTouch.clientX - startTouch.clientX;
    const ydist: number = endTouch.clientY - startTouch.clientY;
    // determine the direction
    const direction: GameMove = GameboardTouchService.determineDirectionOfTouch(xdist, ydist);
    // Then determine the greatest absolute value, combine with direction and return
    return {
      direction: direction,
      dist: Math.max(Math.abs(xdist), Math.abs(ydist))
    };
  }
  /**
   * @method
   * @description
   * Determines the direction of the touch from the xdistance and ydistance
   * @param xdist {number} distance the touch moved measured by clientX
   * @param ydist {number} distance the touch moved measured by clientY
   * @return {GameMove} the game move corresponding to the primary direction of the touch
  **/
  private static determineDirectionOfTouch(xdist: number, ydist: number): GameMove {
    // If they are equal, then we assume they meant to go right / left; x > y means left and right for sure
    if (Math.abs(xdist) >= Math.abs(ydist)) {
      return xdist > 0? 'right' : 'left';
    }
    // Otherwise they meant to go up / down
    return ydist > 0? 'down' : 'up';
  }
}

const gameboardTouchService = new GameboardTouchService();

export default gameboardTouchService;