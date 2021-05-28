import React, { ChangeEvent, useEffect, useState } from 'react'
import { Subscription } from 'rxjs';
import ScreenService from '../../util/screen.service';
import ComponentUtil from '../../util/component-util';
import ButtonService from '../services/button.service';
import PlotComponent from '../plot/basic/basic-plot.component';
import GeneralUtil from '../../util/general-util';
import ScoresService from './services/scores.service';
import DropdownComponent from '../forms/dropdown/dropdown.component'


// todo
//  - Get all of the setting types
//  - Pass these to a drop down
//  - Whenever dropdown is updated, we listen in -- if different, then we grab different data and pass to plot
//  - Different plot types?

// todo Mar 12
//  - Double check the height and width of the plot
//  - Try to figure out how we can do plot without line (perhaps stroke is transparent?)
//  - Think of other analyses that will be more interesting
//    - 10 game average
//    - Monthly average with block spread thing

const ScoresComponent = () => {
  // All settings
  const allSettings: string[] = ScoresService.getScoreSettings();
  // Window width is bigger or not
  const [containerSize, setContSize] = useState<number>(ComponentUtil.determineBoardSize());
  // Setting options to pick which data to view
  const [settingPicked, pickNewSetting] = useState<string>(allSettings[0])
  function checkAndPickNewSetting(event: ChangeEvent<HTMLSelectElement>): void {
    pickNewSetting(event.target.value);
  }
  // Setting up data
  const data: number[][] = ScoresService.getDatesAndScoresBySetting(settingPicked);
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
          setContSize(ComponentUtil.determineBoardSize);
        }
      }
    ));
    // Subscribe to user clicking the save button
    allSubs.add(ButtonService.navButton1.subscribe(
      () => {
        // todo
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
        {// Only render it if we are in the browser
          GeneralUtil.onServer()? '' :
            <div>
              <DropdownComponent
                label={'Pick data to view:'} inputName={'data-to-view'} id={'data-to-view'}
                value={settingPicked} onChange={checkAndPickNewSetting} options={allSettings}
              />
              <PlotComponent
                details={{
                  title: 'Scores',
                  id: 'scores-chart',
                  seriesLabel: 'Scores'
                }}
                data={data}
              />
            </div>
        }
      </div>
    </div>
  );
};

export default ScoresComponent;
