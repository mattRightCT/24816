import React, { KeyboardEvent, TouchEvent, useEffect, useState } from 'react';
import GameStateService, { GameState } from './services/game-state.service';
import ScreenService from '../../util/screen.service';
import {Subscription} from 'rxjs';
import GameboardKeyService from './services/gameboard-key.service';
import GameboardTouchService, { TouchType } from './services/gameboard-touch.service';
import { GameboardStyleService } from './services/gameboard-style.service';
import ButtonService from '../services/button.service';
import ComponentUtil from '../../util/component-util';

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
        {GameboardStyleService.createGameboardIndices(gameState.board.length).map((gameboardIndex) =>
          <div
            key={'(' + gameboardIndex.x + ', ' + gameboardIndex.y + ')'}
            style={{
              gridColumn: (gameboardIndex.x + 1).toString(),
              gridRow: (gameboardIndex.y + 1).toString(),
              backgroundColor: GameboardStyleService.createRGBStringForBlocks(
                gameState.board[gameboardIndex.y][gameboardIndex.x]
              ),
              border: '2px solid white'
            }}
            className='center-contents'
          >
            <p style={{
              fontSize: GameboardStyleService.determineBoardFontSize(
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