import React, { useEffect, useState } from 'react';
import OpenMenuService, { MenuStatus } from './open-menu.service';
import { Subscription } from 'rxjs';
import {NavObjects, NavObject} from './nav-objects';
import Link from 'next/link';

const MenuComponent = () => {
  const [menuState, setMenuState] = useState<MenuStatus>('closed');
  /**
   * @method
   * @description
   * Keeping an eye on whether the menu should be open or not
   **/
  useEffect(() => {
    const allSubs: Subscription = new Subscription();
    allSubs.add(OpenMenuService.menuStatus.subscribe(
      (newMenuStatus: MenuStatus) => {
        // If menu status has changed, then we update
        if (newMenuStatus !== menuState) {
          setMenuState(newMenuStatus);
        }
      }
    ));
    // Unsubscribe when we are finished
    return function cleanup() {
      allSubs.unsubscribe();
    };
  });
  
  return (
    // If we are closed, then we hide this component
    menuState === 'closed'?
      <div style={{ width: '0', height: '0', position: 'fixed' }} className='menu-frame'></div>
      :
      // Otherwise we open it up with an animation
      <div className='menu-frame open' style={{
        position: 'absolute',
        width: '80%',
        height: '95%',
        backgroundColor: '#040404',
        display: 'grid',
        gridTemplateColumns: '10% 90%',
        gridTemplateRows: '75px 10% auto'
      }}>
        <div style={{
          gridColumn: 2,
          gridRow: 3
        }}>
          <ul style={{padding: 0}}>
            {NavObjects.map((navObject: NavObject) =>
              <li key={navObject.href} style={{margin: '10px 0'}}>
                <Link href={navObject.href}>
                  <a className='menu'>{navObject.text}</a>
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
  );
};

export default MenuComponent;