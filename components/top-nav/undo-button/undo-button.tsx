import React, { useEffect, useState } from 'react';
import { Subscription } from 'rxjs';
import ButtonService from '../../services/button.service';

/**
 * @method
 * @description
 * Wrapper function to click this button
 **/
function button2Click(): void {
  ButtonService.clickButton2();
}

const UndoButtonComponent = () => {
  // Keeping an eye on getting our text
  const [text, setText] = useState<string>('');
  /**
   * @method
   * @description
   * Keeping an eye on whether the menu is open or not
   **/
  useEffect(() => {
    const allSubs: Subscription = new Subscription();
    // Listening for changes to the current score
    allSubs.add(ButtonService.navButton2Text.subscribe(
      (newText: string) => {
        setText(newText);
      }
    ));
    // Unsubscribe when we are finished
    return function cleanup() {
      allSubs.unsubscribe();
    };
  });
  
  return (
    text.length > 0?
      <button className='nav' type="button" onClick={button2Click}>
        {text}
      </button>
      : <div></div>
  );
}

export default UndoButtonComponent;