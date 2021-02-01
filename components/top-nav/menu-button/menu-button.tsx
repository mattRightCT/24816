import React, { useEffect, useState } from 'react'
import OpenMenuService, { MenuStatus } from '../../menu/open-menu.service';
import { Subscription } from 'rxjs'

/**
 * @method
 * @description
 * Wrapper functions to help us open and close the menu
 * @return {void}
**/
function openMenu(): void {
  OpenMenuService.openMenu();
}
function closeMenu(): void {
  OpenMenuService.closeMenu();
}

const MenuButtonComponent = () => {
  const [menuState, setMenuState] = useState<MenuStatus>('closed');
  /**
   * @method
   * @description
   * Keeping an eye on whether the menu is open or not
  **/
  useEffect(() => {
    const menuStatusSub: Subscription = OpenMenuService.menuStatus.subscribe(
      (newMenuStatus: MenuStatus) => {
        // If menu status has changed, then we update
        if (newMenuStatus !== menuState) {
          setMenuState(newMenuStatus);
        }
      }
    );
    // Unsubscribe when we are finished
    return function cleanup() {
      menuStatusSub.unsubscribe();
    };
  });
  
  return (menuState === 'closed'?
      // If the menu is closed, then we have an inactive hamburger where onclick triggers open menu
      (<button className='hamburger hamburger--boring' type="button" onClick={openMenu}>
        <span className='hamburger-box'>
          <span className='hamburger-inner'></span>
        </span>
      </button>) :
      // Conversely, open menu gives us active hamburger and onclick triggers closing the menu
      (<button className='hamburger hamburger--boring is-active' type="button" onClick={closeMenu}>
        <span className='hamburger-box'>
          <span className='hamburger-inner'></span>
        </span>
      </button>)
  );
}

export default MenuButtonComponent;