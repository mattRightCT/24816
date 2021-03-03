import React, { KeyboardEvent, TouchEvent, useEffect, useState } from 'react';
import GameStateService, { GameState } from './services/game-state.service';
import ScreenService from '../../util/screen.service';
import {Subscription} from 'rxjs';
import GameboardKeyService from './services/gameboard-key.service';
import GameboardTouchService, { TouchType } from './services/gameboard-touch.service';
import GeneralUtil from '../../util/general-util';
import ButtonService from '../services/button.service';
import ComponentUtil from '../../util/component-util';

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
 * Determines the font size based on the block value (to ensure it always fits)
 * @param blockValue {number} the value displayed in the current block
 * @param boardLength {number} the number of blocks in one dimension of the board
 * @param boardSize {number} the size of the board visually in vmins
 * @return {string} the font size (in vmins) we want to use
**/
function determineBoardFontSize(blockValue: number, boardLength: number, boardSize: number): string {
  // Five digit numbers on a 4x4 board are perfect at this size
  const baseFontSize: number = boardSize / boardLength / 4;
  let fontSize: number = blockValue < 10? baseFontSize * 2.75 :
    blockValue < 100? baseFontSize * 2.25 :
    blockValue < 1000? baseFontSize * 1.75 :
    blockValue < 10000? baseFontSize * 1.3 :
    blockValue < 100000? baseFontSize : baseFontSize * 0.5;
  return fontSize.toString() + 'vmin';
}
/**
 * @method
 * @description
 * Gameboard component
**/
const GameboardComponent = () => {
  // Game state
  const [gameState, setGameState] = useState<GameState>(undefined);
  // Window width is bigger or not
  const [gameboardSize, setGbSize] = useState<number>(ComponentUtil.determineBoardSize());
  /**
   * @method
   * @description
   * Need to subscribe to gameboard data so that we know when and how to update
  **/
  useEffect(() => {
    // When we are instantiated, we need to tell the nav bar what our buttons and listen for them being clicked
    ButtonService.setButton1Text('Reset');
    ButtonService.setButton2Text('Undo');
    // All subscriptions
    const allSubs: Subscription = new Subscription();
    // Subscribe to game state
    allSubs.add(GameStateService.gameState.subscribe(
      (newGameState: GameState) => {
        setGameState(newGameState);
      }
    ));
    // Subscribe to window resizing
    allSubs.add(ScreenService.screenResized.subscribe(
      (resized: boolean) => {
        if (resized) {
          setGbSize(ComponentUtil.determineBoardSize)
        }
      }
    ));
    // Subscribe to clicking the reset button
    allSubs.add(ButtonService.navButton1.subscribe(
      (button: boolean) => {
        if (button) {
          GameStateService.resetGameState();
        }
      }
    ));
    // Subscribe to clicking the undo button
    allSubs.add(ButtonService.navButton2.subscribe(
      (button: boolean) => {
        if (button) {
          GameStateService.undoLatestMove();
        }
      }
    ));
    // Then unsubscribe when we are finished
    return function cleanup() {
      allSubs.unsubscribe();
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
        gridTemplateColumns: 'auto ' + gameboardSize.toString() + 'vmin auto',
        gridTemplateRows: 'auto ' + gameboardSize.toString() + 'vmin auto',
        backgroundColor: '#000'
      }}
      onKeyDown={handleKeyDownEvent}
      onTouchStart={handleTouchStartEvent}
      onTouchEnd={handleTouchEndEvent}
      tabIndex={0}
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
              fontSize: determineBoardFontSize(
                gameState.board[gameboardIndex.y][gameboardIndex.x],
                gameState.board.length,
                gameboardSize
              ),
              margin: '0', fontWeight: 'bold', color: 'white'
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