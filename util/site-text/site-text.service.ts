import { SiteText } from './site-text.constants'

// Allowed languages and tracking what the current language being used is
type AllowedLangs = 'en' | 'es';
let currLang: AllowedLangs = 'en';

/***********************************************************
***************** WHAT IS MY PURPOSE? **********************
 - Keep track of what language we are using
 - Deliver site text based on relevant parameters
************************************************************
 **********************************************************/
export class SiteTextService {
  // todo when this instantiates, we need to check cookies (or whatever) to see if there are any preferred languages
  // todo when the language is changed, how does this render? do we need to re-render the whole app??
  //  - we probably want to set the curr lang as a cookie, then grab it before the page is rendered and load it in
  //  - then reload the whole page
  /**
   * @method
   * @description
   * Changes the current language
   * @param newLang {AllowedLangs}
  **/
  public static changeLangTo(newLang: AllowedLangs): void {
    currLang = newLang;
  }
  /**
   * @method
   * @description
   * Gets the requested text
   * @param componentName {string} name of the component
   * @param textName {string} name of the text block
   * @return {string} the requested text
  **/
  public static getText(componentName: string, textName: string): string {
    // Deliver the text in the current language if we have it, otherwise deliver it in english
    return SiteText[componentName][textName][currLang] && SiteText[componentName][textName]['en'];
  }
}