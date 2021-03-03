import React from 'react'
import Head from 'next/head'
import { AppConstants } from '../../util/app.constants'
import { SiteTextService } from '../../util/site-text/site-text.service'
import { ImageHeightWidth } from '../../util/images/images.interface'
import { DefaultMetaImage } from '../../util/images/images.constants'
import { SocialMediaConstants } from '../../util/social-media/social-media.constants'

export interface XLHeadProps {
  title: string,
  description: string,
  image?: ImageHeightWidth,
  siteUrl: string,
  type?: string,
  twitterType?: string
}

export interface XLHeadMetaTagProps {
  title: MetaTagProps[],
  description: MetaTagProps[],
  image: MetaTagProps[],
  siteUrl: MetaTagProps[],
  type: MetaTagProps[],
  twitterType: MetaTagProps[],
  key: string
}

export interface MetaTagProps {
  property?: string,
  content?: string,
  name?: string,
  itemProp?: string
}

export class XLHeadUtils {
  private static componentName: string = 'XLHead';
  
  /****************************************************************************************
   * Creating meta tag jsx elements
   ****************************************************************************************/
  /**
   * @method
   * @description
   * Generates the actual JSX elements we want to insert into our head
   * @return {JSX.Element[]} the list of meta elements that we want in the head
   **/
  public static generateMetaTagJSXElements(props: XLHeadMetaTagProps): JSX.Element[] {
    const returnObj: JSX.Element[] = [];
    // Go through all props, which are exclusively about creating meta tags
    for (let attrName of Object.keys(props)) {
      // For each one, map them to the appropriate meta tag, then flatten the list of meta tags
      returnObj.push(
        ...props[attrName].map(
          (metaTagProps: MetaTagProps) =>
            <meta {...metaTagProps} key={attrName + (metaTagProps.property || metaTagProps.name)}/>
        )
      );
    }
    return returnObj;
  }
  
  /****************************************************************************************
   * Creating / Validating meta tag information (before it even enters the component)
   ****************************************************************************************/
  /**
   * @method
   * @description
   * Gives a static function we can use to streamline upstream code by validating input data and converting everything
   * to meta tag properties that we want to insert dynamically into meta tags
   * @param minimumXLHeadProps {XLHeadProps} the minimum information we need  in order to generate XLHeadProps
   * @return {XLHeadProps} the actual props this component will be using to generate meta tags
   **/
  public static generateXLHeadProps(minimumXLHeadProps: XLHeadProps): XLHeadMetaTagProps {
    const returnObj: XLHeadMetaTagProps = {
      title: [],
      description: [],
      image: [],
      siteUrl: [],
      type: [],
      twitterType: [],
      key: 'head'
    };
    // If we got undefined here, then we go ahead and generate default values
    if (minimumXLHeadProps === undefined) {
      return XLHeadUtils.generateDefaultMetaTags();
    }
    // Now we need to go through and update everything into MetaTagProps format
    returnObj.title = [{ property: 'og:title', itemProp: 'name', content: minimumXLHeadProps.title }];
    returnObj.description = [
      {
        property: 'og:description',
        itemProp: 'description',
        content: minimumXLHeadProps.description
      },
      {
        name: 'description',
        content: minimumXLHeadProps.description
      }
    ];
    returnObj.siteUrl = [{ property: 'og:url', content: minimumXLHeadProps.siteUrl }];
    const imageInfo: ImageHeightWidth = minimumXLHeadProps.image || DefaultMetaImage;
    returnObj.image = [
      {
        property: 'og:image',
        content: imageInfo.url
      },
      {
        property: 'og:image:width',
        content: imageInfo.width
      },
      {
        property: 'og:image:height',
        content: imageInfo.height
      }
    ];
    returnObj.type = [
      {property: "og:type", content: "website"},
      {property: "fb:app_id", content: SocialMediaConstants.facebookID},
      {property: "twitter:site", content: SocialMediaConstants.twitterID}
    ];
    returnObj.twitterType = [{property: "twitter:card", content: "summary"}];
    return returnObj
  }
  /**
   * @method
   * @description
   * Generates default meta tags for us
   * @return {XLHeadProps} the correct properties for XLHead to display meta tags
   **/
  private static generateDefaultMetaTags(): XLHeadMetaTagProps {
    return XLHeadUtils.generateXLHeadProps({
      title: AppConstants.appName,
      description: SiteTextService.getText(XLHeadUtils.componentName, 'SiteDescription'),
      siteUrl: AppConstants.appRoot
    });
  }
}

const XLHead = (props: XLHeadMetaTagProps) => {
  return (
    <Head>
      <link rel="preconnect" href="https://fonts.gstatic.com">
      </link>
      <link href="https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;600;700&display=swap" rel="stylesheet">
      </link>
      <title>{props.title[0].content || AppConstants.appName}</title>
      <link rel="icon" href="/favicon.ico"/>
      {XLHeadUtils.generateMetaTagJSXElements(props)}
    </Head>
  );
};

export default XLHead;
