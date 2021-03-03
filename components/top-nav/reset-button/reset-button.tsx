import React, { useEffect, useState } from 'react';
import ButtonService from '../../services/button.service';
import { Subscription } from 'rxjs';

/**
 * @method
 * @description
 * Wrapper function to click this button
 **/
function button1Click(): void {
  ButtonService.clickButton1();
}

const ResetButtonComponent = () => {
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
    allSubs.add(ButtonService.navButton1Text.subscribe(
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
      <button className='nav' type="button" onClick={button1Click}>
        {text}
      </button>
      : <div></div>
  );
}

export default ResetButtonComponent;