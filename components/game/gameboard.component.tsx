import React, { KeyboardEvent, TouchEvent, useEffect, useState } from 'react';
import GameStateService, { GameState } from './services/game-state.service';
import {Subscription} from 'rxjs';
import GameboardKeyService from './services/gameboard-key.service';
import GameboardTouchService, { TouchType } from './services/gameboard-touch.service';
import GeneralUtil from '../../util/general-util';

/**
 * @method
 * @description
 * Generates the gameboard indices we need to display the blocks
 * @param boardSize {number} size of the gameboard
 * @return {{x: number, y: number}[]} the gameboard indices
**/
function createGameboardIndices(boardSize: number): {x: number, y: number}[] {
  let returnList: {x: number, y: number}[] = [];
  for (let x = 0; x < boardSize; x++) {
    for (let y = 0; y < boardSize; y++) {
      returnList.push({x: x, y: y});
    }
  }
  return returnList;
}
/**
 * @method
 * @description
 * Wrapper to preserve 'this-ness' of the keyboard listening service
 * @param keyEvent {KeyboardEvent} the key down event
 * @return {void}
**/
function handleKeyDownEvent(keyEvent: KeyboardEvent): void {
  GameboardKeyService.handleKeyEvent(keyEvent);
}
/**
 * @method
 * @description
 * Wrapper to preserve 'this-ness' of the touch listening service
 * @param touchEvent {TouchEvent} a touch event
 * @param touchStartOrEnd {TouchType} whether this was a start or end touch event
 * @return {void}
**/
function handleTouchEvent(touchEvent: TouchEvent, touchStartOrEnd: TouchType): void {
  GameboardTouchService.handleTouchEvent(touchEvent, touchStartOrEnd);
}
function handleTouchStartEvent(touchEvent: TouchEvent): void {handleTouchEvent(touchEvent, 'start')}
function handleTouchEndEvent(touchEvent: TouchEvent): void {handleTouchEvent(touchEvent, 'end')}
/**
 * @method
 * @description
 * Creates an RGB color value that scales with the log of the valueForLog variable (base 2)
 * @param maxColorValue {number} the color value we want to be at when we hit log(valueForLog) === maxLog
 * @param minColorValue {number} the color value we want to be at when we have log(valueForLog) === 1
 * @param valueForLog {number} the value we are taking the log (base 2) of
 * @param maxLog {number} the maximum log(valueForLog) we expect (helps us scale the value correctly)
 * @return {number} the correct RGB value we want to input
**/
function colorLogValue(maxColorValue: number, minColorValue: number, valueForLog: number, maxLog: number): number {
  return (maxColorValue - minColorValue) / maxLog * GeneralUtil.log(valueForLog, 2) + minColorValue;
}
/**
 * @method
 * @description
 * Generates the RGB string we want for the background color of our blocks
 * @param valueForLog {number} the value we want the color to scale off of
 * @return {string} string for RGB value
**/
function createRGBStringForBlocks(valueForLog: number): string {
  // If this is a zero value, we want to use black
  if (valueForLog === 0) {
    return '#000';
  }
  // Otherwise calculate correct color to use
  return 'rgb(' + colorLogValue(175, 5, valueForLog, 14) + ',' +
    colorLogValue(175, 5, valueForLog, 14) + ',' +
    colorLogValue(175, 5, valueForLog, 14) + ')';
}
/**
 * @method
 * @description
 * Gameboard component
**/
const GameboardComponent = () => {
  const [gameState, setGameState] = useState<GameState>(undefined);
  /**
   * @method
   * @description
   * Need to subscribe to gameboard data so that we know when and how to update
  **/
  useEffect(() => {
    // Subscribe to game state
    const gameStateSub: Subscription = GameStateService.gameState.subscribe(
      (newGameState: GameState) => {
        setGameState(newGameState);
      }
    );
    // Then unsubscribe when we are finished
    return function cleanup() {
      gameStateSub.unsubscribe();
    };
  });
  
  return (
    gameState === undefined?
    <div>
      <p>Wait a sec</p>
    </div> :
    <div
      style={{// We want an acceptably sized gameboard regardless of screen size (but without much effort)
        display: 'grid',
        gridTemplateColumns: 'auto 80vmin auto',
        gridTemplateRows: 'auto 80vmin auto',
        backgroundColor: '#000'
      }}
    >
      <div
        style={{
          gridColumn: '2', gridRow: '2',
          height: '100%', width: '100%',
          display: 'grid',
          // Every block should be square
          gridTemplateColumns: 'repeat(' + gameState.board.length.toString() + ', 1fr)',
          gridTemplateRows: 'repeat(' + gameState.board.length.toString() + ', 1fr)'
        }}
        onKeyDown={handleKeyDownEvent}
        onTouchStart={handleTouchStartEvent}
        onTouchEnd={handleTouchEndEvent}
        tabIndex={0}
      >
        {createGameboardIndices(gameState.board.length).map((gameboardIndex) =>
          <div
            key={'(' + gameboardIndex.x + ', ' + gameboardIndex.y + ')'}
            style={{
              gridColumn: (gameboardIndex.x + 1).toString(),
              gridRow: (gameboardIndex.y + 1).toString(),
              backgroundColor: createRGBStringForBlocks(gameState.board[gameboardIndex.y][gameboardIndex.x]),
              border: '2px solid white'
            }}
            className='center-contents'
          >
            <p style={{
              fontSize: '4vmin', margin: '0', fontWeight: 'bold',
              color: 'white'
            }}>
              {// If the value is zero, we just want the block to have no text
                gameState.board[gameboardIndex.y][gameboardIndex.x] === 0?
                  '' : gameState.board[gameboardIndex.y][gameboardIndex.x]
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default GameboardComponent;