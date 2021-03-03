import React, { ClassType, ReactNode } from 'react';
import XLHead, { XLHeadProps, XLHeadUtils } from '../components/head/xlhead';
import TopNavComponent from '../components/top-nav/top-nav';
import FooterComponent from '../components/footer/footer';
import GeneralUtil from './general-util';

class ComponentUtil {
  /**
   * @method
   * @description
   * This renders a normal page component by adding in the head, top nav, and footer in the correct order
   * @param pageNode {ReactNode} the JSX element we want to render for the current page component
   * @return {ReactNode} the entire page for rendering
  **/
  public static renderNormalPageComponent(pageNode: ClassType<any, any, any>, headProps: XLHeadProps): ReactNode {
    return [
      React.createElement(XLHead, XLHeadUtils.generateXLHeadProps(headProps)),
      React.createElement(TopNavComponent, {key: 'topnav'}),
      React.createElement(pageNode, {key: 'displayed'}),
      React.createElement(FooterComponent, {key: 'footer'})
    ];
  }
  /**
   * @method
   * @description
   * Determines the size of the board in vmins (in utils in order to allow a consistent size between components)
   * @return {number} size of the board in vmins
   **/
  public static determineBoardSize(): number {
    // If we are on the server, cannot call the window object, so we need a default value
    if (GeneralUtil.onServer()) {
      return 97;
    }
    // Set the largest and smallest gameboard sizes (as vmins)
    const largestGameboardSize: number = 97;
    const smallestGameboardSize: number = 85;
    // If the width is bigger, then we just use the smallest size
    // Otherwise we take the minimum of 97 and the size of the height in vmins minus 15
    return window.innerWidth >= window.innerHeight? smallestGameboardSize :
      Math.min(largestGameboardSize, window.innerHeight / window.innerWidth * 100 - 15);
  }
}

export default ComponentUtil;