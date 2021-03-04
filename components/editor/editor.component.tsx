import React, { useEffect, useState, MouseEvent } from 'react';
import ScreenService from '../../util/screen.service';
import {Subscription} from 'rxjs';
import ButtonService from '../services/button.service';
import ComponentUtil from '../../util/component-util';
import { GameboardStyleService } from '../game/services/gameboard-style.service';
import EditorBoardService from './services/editor-board.service';
import {GameState} from '../game/services/game-state.service';
import {useRouter} from 'next/router';

/**
 * @method
 * @description
 * increments the block at the given coordinates
**/
function incrementThisBlock(x: number, y: number): void {
  // pass coordinates to editor service
  EditorBoardService.incrementBlock(x, y);
}
/**
 * @method
 * @description
 * resets the block at the given coordinates
**/
function resetThisBlock(e: MouseEvent, x: number, y: number): void {
  // Prevent default behavior
  e.preventDefault();
  // Then pass coordinates to editor service
  EditorBoardService.resetBlock(x, y);
}

/**
 * @method
 * @description
 * Gameboard component
 **/
const EditorComponent = () => {
  // Routing
  const router = useRouter();
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
    ButtonService.setButton1Text('Play');
    ButtonService.setButton2Text('');
    // All subscriptions
    const allSubs: Subscription = new Subscription();
    // Subscribe to game state
    allSubs.add(EditorBoardService.editorBoard.subscribe(
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
          // Tell everyone we want to play this board
          EditorBoardService.playEditorBoard();
          // Then navigate to the gameboard
          router.push('/').then(/* Intentionally blank */);
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
              onClick={() => incrementThisBlock(gameboardIndex.x, gameboardIndex.y)}
              onContextMenu={(e) => resetThisBlock(e, gameboardIndex.x, gameboardIndex.y)}
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

export default EditorComponent;
