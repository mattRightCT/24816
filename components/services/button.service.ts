import { Subject } from 'rxjs';

class NavButtonService {
  /**
   * @method
   * @description
   * Set up for the navigation button number 1 (on the left)
  **/
  private navButton1Text$: Subject<string> = new Subject<string>();
  get navButton1Text(): Subject<string> { return this.navButton1Text$; }
  public setButton1Text(text: string): void {
    this.navButton1Text$.next(text);
  }
  private navButton1$: Subject<boolean> = new Subject<boolean>();
  get navButton1(): Subject<boolean> { return this.navButton1$; }
  public clickButton1(): void {
    this.navButton1$.next(true);
  }
  /**
  /**
   * @method
   * @description
   * Set up for the navigation button number 2 (on the right)
   **/
  private navButton2Text$: Subject<string> = new Subject<string>();
  get navButton2Text(): Subject<string> { return this.navButton2Text$; }
  public setButton2Text(text: string): void {
    this.navButton2Text$.next(text);
  }
  private navButton2$: Subject<boolean> = new Subject<boolean>();
  get navButton2(): Subject<boolean> { return this.navButton2$; }
  public clickButton2(): void {
    this.navButton2$.next(true);
  }
}

const navButtonService: NavButtonService = new NavButtonService();
export default navButtonService;