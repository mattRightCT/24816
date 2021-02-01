import React, { ClassType, ReactNode } from 'react'
import XLHead, { XLHeadProps, XLHeadUtils } from '../components/head/xlhead'
import TopNavComponent from '../components/top-nav/top-nav'
import FooterComponent from '../components/footer/footer'

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
      React.createElement(TopNavComponent),
      React.createElement(pageNode),
      React.createElement(FooterComponent)
    ];
  }
}

export default ComponentUtil;