import { BehaviorSubject } from 'rxjs'

export type MenuStatus = 'open' | 'closed';

class OpenMenuService {
  // Open menu triggered
  private menuStatus$: BehaviorSubject<MenuStatus> = new BehaviorSubject<MenuStatus>('closed');
  get menuStatus(): BehaviorSubject<MenuStatus> {return this.menuStatus$;}
  /**
   * @method
   * @description
   * Opens the side menu
   * @return {void}
   **/
  public openMenu(): void {
    this.menuStatus$.next('open');
  }
  /**
   * @method
   * @description
   * Closes the side menu
   * @return {void}
  **/
  public closeMenu(): void {
    this.menuStatus$.next('closed');
  }
}

const openMenuService: OpenMenuService = new OpenMenuService();

export default openMenuService;
