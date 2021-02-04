import { Subject } from 'rxjs';
import GeneralUtil from './general-util';


class ScreenService {
  // Whether width is bigger or height is bigger -- if on server, give token answer, else we give
  // the correct answer
  private screenResized$: Subject<boolean> = new Subject<boolean>();
  get screenResized(): Subject<boolean> {return this.screenResized$;}
  
  constructor() {
    if (!GeneralUtil.onServer()) {
      // If the screen is resized, we want to capture the right size
      window.addEventListener('resize', () => {
        this.screenResized$.next(true);
      });
    }
  }
}

const screenService: ScreenService = new ScreenService();
export default screenService;