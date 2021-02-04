import {BehaviorSubject} from 'rxjs';
import BrowserStorage from '../../../util/storage.util'
import GeneralUtil from '../../../util/general-util'

export type GameSettings = {
  boardSize: number,
  fourBlockPerc: number,
};


/**
 * @class
 * @description
 * Manages the games settings
**/
class GameSettingsService {
  // Game settings name
  private static myName: string = 'GameSettings';
  // Game settings observable
  private gameSettings$: BehaviorSubject<GameSettings> = new BehaviorSubject<GameSettings>(
    GameSettingsService.initGameSettings()
  );
  get gameSettings(): BehaviorSubject<GameSettings> {return this.gameSettings$;}
  /**
   * @method
   * @description
   * Initializes game settings from local storage or gives new game settings
   * @return {GameSettings} game settings for initialization
  **/
  private static initGameSettings(): GameSettings {
    // Check to see if we have a saved game settings
    const savedGameSettings: GameSettings | null = GeneralUtil.onServer()?
      null : BrowserStorage.load(GameSettingsService.myName);
    if (savedGameSettings === null) {
      // If not then we return new game settings instead
      return GameSettingsService.newGameSettings();
    }
    // if we do then return the saved settings
    return savedGameSettings;
  }
  /**
   * @method
   * @description
   * Gives brand new game settings (for instance, if they never changed their or first loaded)
   * @return {GameSettings} new game settings
  **/
  private static newGameSettings(): GameSettings {
    return {boardSize: 4, fourBlockPerc: 25};
  }
  /**
   * @method
   * @description
   * Gives the current board size
   * @return {number} current board size
  **/
  public getBoardSize(): number {return this.gameSettings$.getValue().boardSize;}
  /**
   * @method
   * @description
   * Gives the percent time the four block should appear
   * @return {number} percent of the time four block should appear
  **/
  public getFourBlockPerc(): number {return this.gameSettings$.getValue().fourBlockPerc;}
  /**
   * @method
   * @description
   * Gives us a non-observable version of the game settings, in case we need to use it
   * @return {GameSettings} the current game settings
  **/
  public getGameSettings(): GameSettings {return this.gameSettings$.getValue();}
  /**
   * @method
   * @description
   * Compare every relevant game setting property to ensure both game setting objects are the same
   * @param gs1 {GameSettings}
   * @param gs2 {GameSettings}
   * @return {boolean} whether the two given gamesetting objects are the same
  **/
  public gameSettingsMatch(gs1: GameSettings, gs2: GameSettings): boolean {
    // First we check if the list of keys are the same size
    if (Object.keys(gs1).length !== Object.keys(gs2).length) {
      return false;
    }
    // Then we check that all keys are the same, with the same values
    for (let propName of Object.keys(gs1)) {
      // Make sure second object has this property name
      if (gs2[propName] === undefined) {
        return false;
      }
      // Then ensure that the values are the same
      if (gs2[propName] !== gs1[propName]) {
        return false;
      }
    }
    // if we get here then the two settings are the same
    return true;
  }
}

const gameSettingsService = new GameSettingsService();

export default gameSettingsService;