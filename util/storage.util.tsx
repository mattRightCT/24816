

export default class BrowserStorage {
  // Prefix
  private static prefix: string = '$24816$';
  /**
   * @method get
   * @param {string} key Storage key name
   * @return {any}
   * @description
   * The getter will return any type of data persisted in localStorage.
   **/
  private static get(key: string): any {
    // Need to wrap this in a check for browser
    const data: string = localStorage.getItem(key);
    return BrowserStorage.parse(data);
  }
  /**
   * @method set
   * @param {string} key Storage key name
   * @param {any} value Any value
   * @return {void}
   * @description
   * The setter will return any type of data persisted in localStorage.
   **/
  private static set(key: string, value: any): void {
    localStorage.setItem(
      key,
      typeof value === 'object' ? JSON.stringify(value) : value
    );
  }
  /**
   * @method remove
   * @param {string} key Storage key name
   * @return {void}
   * @description
   * This method will remove a localStorage item from the client.
   **/
  private static remove(key: string): void {
    if (localStorage[key]) {
      localStorage.removeItem(key);
    } else {
      console.log('Trying to remove unexisting key: ', key);
    }
  }
  /**
   * @method parse
   * @param {any} value Input data expected to be JSON
   * @return {void}
   * @description
   * This method will parse the string as JSON if possible, otherwise will
   * return the value itself.
   **/
  private static parse(value: any) {
    try {
      return JSON.parse(value);
    } catch (e) {
      return value;
    }
  }
  /**
   * @method load
   * @param objName {string} name of object we are loading
   * @return {any} Any information persisted in storage
   * @description
   * This method will load either from local storage or cookies the provided property.
   **/
  public static load(objName: string): any {
    return BrowserStorage.get(`${BrowserStorage.prefix}${objName}`);
  }
  /**
   * @method clear
   * @return {void}
   * @description
   * This method will clear cookies or the local storage.
   **/
  public static clear(objName: string): void {
    BrowserStorage.remove(`${BrowserStorage.prefix}${objName}`);
  }
  /**
   * @method persist
   * @return {void}
   * @description
   * This method saves values to storage
   **/
  public static persist(objName: string, objValue: any): void {
    try {
      BrowserStorage.set(
        `${BrowserStorage.prefix}${objName}`,
        (typeof objValue === 'object') ? JSON.stringify(objValue) : objValue
      );
    }
    catch (err) {
      console.error('Cannot access local/session storage:', err);
    }
  }
}