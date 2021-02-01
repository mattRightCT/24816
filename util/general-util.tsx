

class GeneralUtil {
  /**
   * @method
   * @description
   * tells us whether we are on the server or not
   * @return {boolean} whether we are on the server or not
  **/
  public static onServer(): boolean {
    return typeof window === 'undefined';
  }
  /**
   * @method
   * @description
   * Gives us the logarithm of a value and a base
   * @param value {number} value we want to take the log of
   * @param base {number} log base
   * @return {number} log of value for given base
  **/
  public static log(value: number, base: number): number {
    return Math.log(value) / Math.log(base);
  }
}

export default GeneralUtil