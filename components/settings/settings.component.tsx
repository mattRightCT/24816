import React, { ChangeEvent, useEffect, useState } from 'react';
import { Subscription } from 'rxjs';
import ScreenService from '../../util/screen.service';
import ComponentUtil from '../../util/component-util';
import ButtonService from '../services/button.service';
import BoardSizeComponent from './board-size/board-size.component';
import FourPercComponent from './four-perc/four-perc.component';
import GameSettingsService from '../game/services/game-settings.service';
import {useRouter} from 'next/router';

const SettingsComponent = () => {
  // Setting up router
  const router = useRouter();
  // Window width is bigger or not
  const [containerSize, setContSize] = useState<number>(ComponentUtil.determineBoardSize());
  // Setting board size
  const [boardSize, setBoardSize] = useState<number>(GameSettingsService.getBoardSize());
  function checkAndSetBoardSize(event: ChangeEvent<HTMLInputElement>): void {
    const newBoardSize: number = parseInt(event.target.value);
    if (newBoardSize > GameSettingsService.maxBoardSize) {
      // todo we want to ask them if they are sure, board will be unusable
    } else {
      setBoardSize(newBoardSize);
    }
  }
  // Setting how common the four block is
  const [fourPerc, setFourPerc] = useState<number>(GameSettingsService.getFourBlockPerc());
  function checkAndSetFourPerc(event: ChangeEvent<HTMLInputElement>): void {
    const newFourPerc: number = parseInt(event.target.value);
    if (newFourPerc > GameSettingsService.maxFourPerc) {
      // todo we should tell them that anything above 100 cannot be used
    } else {
      setFourPerc(newFourPerc)
    }
  }
  /**
   * @method
   * @description
   * Keeping up with window resizing and top nav button clicks (so we know when to save)
   **/
  useEffect(() => {
    // When we are instantiated, we need to tell the nav bar the button text and listen for them being clicked
    ButtonService.setButton1Text('Save');
    ButtonService.setButton2Text('');
    // All subscriptions
    const allSubs: Subscription = new Subscription();
    // Subscribe to window resizing
    allSubs.add(ScreenService.screenResized.subscribe(
      (resized: boolean) => {
        if (resized) {
          setContSize(ComponentUtil.determineBoardSize)
        }
      }
    ));
    // Subscribe to user clicking the save button
    allSubs.add(ButtonService.navButton1.subscribe(
      () => {
        // Send the changes
        GameSettingsService.setNewGameSettings({ boardSize: boardSize, fourBlockPerc: fourPerc });
        // Then navigate back to the gameboard
        router.push('/').then(/* intentionally blank */);
      }
    ));
    // Then unsubscribe when we are finished
    return function cleanup() {
      allSubs.unsubscribe();
    };
  });
  
  return (
    <div style={{// We want an acceptably sized gameboard regardless of screen size (but without much effort)
      display: 'grid',
      gridTemplateColumns: 'auto ' + containerSize.toString() + 'vmin auto',
      gridTemplateRows: 'auto ' + containerSize.toString() + 'vmin auto',
      backgroundColor: '#000'
    }}>
      <div style={{gridColumn: 2, gridRow: 2}}>
        <BoardSizeComponent boardSize={boardSize} onBoardSizeChange={checkAndSetBoardSize}></BoardSizeComponent>
        <FourPercComponent fourPerc={fourPerc} onFourPercChange={checkAndSetFourPerc}></FourPercComponent>
      </div>
    </div>
  );
};

export default SettingsComponent;
