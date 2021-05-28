import { BehaviorSubject, Subject } from 'rxjs'
import GeneralUtil from '../../../util/general-util';
import BrowserStorage from '../../../util/storage.util';
import GameStateService, { GameState } from './game-state.service'
import GameSettingsService, { GameSettings } from './game-settings.service'

export type Score = {
  value: number,
  date: Date,
  gameSettings: GameSettings
};

export class HiscoreService {
  private static myName: string = 'Hiscore';
  private static myCollection: string = 'AllScores';
  // The highest score matching the current game settings
  private hiscore$: BehaviorSubject<Score> = new BehaviorSubject<Score>(HiscoreService.initHiscore());
  get hiscore(): BehaviorSubject<Score> {return this.hiscore$;}
  // List of all scores
  private allScores: Score[] = HiscoreService.initAllScores();
  // telling other services that scores have been added
  private newScoreAdded$: Subject<boolean> = new Subject<boolean>();
  get newScoreAdded(): Subject<boolean> {return this.newScoreAdded$;}
  // List of most recent score (helps us record scores correctly)
  private lastRecordedScore: Score;
  // Only record scores over this value
  private static minimumAcceptableScore: number = 500;
  
  constructor() {
    // We want to listen in on the game states -- when a game is reset, we want to grab the last recorded score
    GameStateService.gameState.subscribe(
      (newGameState: GameState) => {this.handleNewGameState(newGameState);}
    );
    // Then we want to listen for new game settings
    GameSettingsService.gameSettings.subscribe(
      (newSettings: GameSettings) => {this.handleNewGameSettings(newSettings);}
    );
  }
  /****************************************************************************************
  * Initialization
  ****************************************************************************************/
  /**
   * @method
   * @description
   * Checks if we have a hi score saved, if not then it returns zero, otherwise it returns the hi score
  **/
  private static initHiscore(): Score {
    return HiscoreService.getHiscoreFromStorageMatchingSettings(GameSettingsService.getGameSettings());
  }
  /**
   * @method
   * @description
   * More generic function where settings is an input and we can grab any hi score from storage matching the
   * given game settings
   * @param settings {GameSettings} the settings we are trying to match
   * @return {Score} the hiscore matching the given game settings
  **/
  private static getHiscoreFromStorageMatchingSettings(settings: GameSettings): Score {
    // Check to see if we have hiscores saved
    const hiscores: Score[] | null = GeneralUtil.onServer()?
      null : BrowserStorage.load(HiscoreService.myName);
    // If we dont have anything saved or the list is empty, then init a new high score for these settings
    if (hiscores === null || hiscores.length === 0) {
      // If not (or if score is not defined) then we return new game settings instead
      return {value: 0, date: new Date(), gameSettings: settings};
    }
    // We have a non empty list, so we look for a hiscore matching the current settings
    const matchingHiscore: Score | null = HiscoreService.findScoreMatchingSettings(
      hiscores, settings
    );
    // If we do not have a matching hi score, then we just create a new one
    if (matchingHiscore === null) {
      return {value: 0, date: new Date(), gameSettings: settings};
    }
    // Otherwise return the matching hi score
    return matchingHiscore;
  }
  /**
   * @method
   * @description
   * Checks if we have a set of scores saved, if not then it returns and empty list, otherwise it gives us the
   * list of all recorded scores
  **/
  private static initAllScores(): Score[] {
    // Check to see if we have a saved scores
    const scores: Score[] | null = GeneralUtil.onServer()?
      null : BrowserStorage.load(HiscoreService.myCollection);
    if (scores === null) {
      // If not (or if score is not defined) then we return an empty list instead
      return [];
    }
    // We need to serialize the dates back into a real date format
    for (let score of scores) {
      score.date = new Date(score.date);
    }
    // if we do then return the saved scores
    return scores;
  }
  /****************************************************************************************
  * Listener Callbacks
  ****************************************************************************************/
  /**
   * @method
   * @description
   * Updates the last recorded score, adds new scores when a game is reset
   * @param newGameState {GameState} the new game state
   * @return {void}
  **/
  private handleNewGameState(newGameState: GameState): void {
    // Check if we have yet to initialize last recorded score
    if (this.lastRecordedScore === undefined) {
      this.lastRecordedScore = {
        value: newGameState.score, date: new Date(), gameSettings: GameSettingsService.getGameSettings()
      };
    } else if (newGameState.score === 0 && this.lastRecordedScore.value > HiscoreService.minimumAcceptableScore) {
      // If we reset the game state and the last recorded score was above the minimum acceptable
      this.recordScore(this.lastRecordedScore);
    } else {
      // Otherwise we update the last recorded score
      this.lastRecordedScore = {
        value: newGameState.score, date: new Date(), gameSettings: GameSettingsService.getGameSettings()
      };
      // I KNOW THIS CAN BE COMBINED with a previous if statement -- but these are different situations and I
      // want to keep them separate in case we change our mind in the future about how to handle things
    }
  }
  /**
   * @method
   * @description
   * When we get new game settings, we need to go grab the correct hi score to display
   * @param newSettings {GameSettings} the game settings we want to find a high score for
   * @return {void}
  **/
  private handleNewGameSettings(newSettings: GameSettings): void {
    // We get the correct hiscore and send it out
    this.hiscore$.next(HiscoreService.getHiscoreFromStorageMatchingSettings(newSettings));
  }
  /****************************************************************************************
  * Recording scores
  ****************************************************************************************/
  /**
   * @method
   * @description
   * Records a new score (saves to all scores, checks against hiscore)
   * @param newScore {number} the value of the new score
   * @return {void}
  **/
  private recordScore(newScore: Score): void {
    // First we need to add this to the list of all scores, along with a date
    this.addScoreToAllScores(newScore);
    // Then we need to check if it should be our new hi score by comparing it to the matching hiscore
    if (newScore.value > HiscoreService.getHiscoreFromStorageMatchingSettings(newScore.gameSettings).value) {
      this.replaceHiscore(newScore);
    }
  }
  /**
   * @method
   * @description
   * Adds a new score to the list of all scores
   * @param newScore {Score} the new score details
   * @return {void}
  **/
  private addScoreToAllScores(newScore: Score): void {
    // Push to the local object
    this.allScores.push(newScore);
    // Persist to storage
    BrowserStorage.persist(HiscoreService.myCollection, this.allScores);
    // Then tell everyone that we got a new score
    this.newScoreAdded$.next(true);
  }
  /**
   * @method
   * @description
   * Tells everyone about our new hiscore then persists to storage
   * @param newHiscore {Score} the newest hiscore
   * @return {void}
  **/
  private replaceHiscore(newHiscore: Score): void {
    // Replace the hiscore in the browser storage
    HiscoreService.replaceHiscoreInStorage(newHiscore);
    // Then if the scores setting matches the current settings, then we push it locally
    if (GameSettingsService.gameSettingsMatch(newHiscore.gameSettings, GameSettingsService.getGameSettings())) {
      this.hiscore$.next(newHiscore);
    }
  }
  /**
   * @method
   * @description
   * Adds or replaces a new hi score in browser storage
   * @param newHiscore {Score} the new hiscore
   * @return {void}
  **/
  private static replaceHiscoreInStorage(newHiscore: Score): void {
    // Check to see if we have hiscores saved
    const hiscores: Score[] | null = GeneralUtil.onServer()?
      null : BrowserStorage.load(HiscoreService.myName);
    // If we dont have anything saved or the list is empty, then we just save a new list
    if (hiscores === null || hiscores.length === 0) {
      BrowserStorage.persist(HiscoreService.myName, [newHiscore]);
    } else {
      const matchingIndex: number = HiscoreService.findIndexOfScoreMatchingSettings(hiscores, newHiscore.gameSettings);
      // If nothing in the list matches, then we just add it at the end
      if (matchingIndex === -1) {
        hiscores.push(newHiscore);
      } else {
        // Otherwise we replace the object at the correct index
        hiscores[matchingIndex] = newHiscore;
      }
      // Then persist to storage
      BrowserStorage.persist(HiscoreService.myName, hiscores);
    }
  }
  /**
   * @method
   * @description
   * Returns the first score object in a list with settings matching the given settings
   * @param scores {Score[]} list of scores we are searching through
   * @param settings {GameSettings} the settings we are looking to match
   * @return {Score | null} the first matching score, or null if nothing was found
  **/
  private static findScoreMatchingSettings(scores: Score[], settings: GameSettings): Score | null {
    const matchingIndex: number = HiscoreService.findIndexOfScoreMatchingSettings(scores, settings);
    if (matchingIndex === -1) {
      return null;
    }
    return scores[matchingIndex];
  }
  /**
   * @method
   * @description
   * Returns the index of the first score object that matches the given settings
   * @param scores {Score[]} list of scores we are searching through
   * @param settings {GameSettings} the settings we are looking to match
   * @return {number} index of the first score in the list with settings that match the given settings
  **/
  private static findIndexOfScoreMatchingSettings(scores: Score[], settings: GameSettings): number {
    for (let i = 0; i < scores.length; i++) {
      if (GameSettingsService.gameSettingsMatch(scores[i].gameSettings, settings)) {
        return i;
      }
    }
    return -1;
  }
  /****************************************************************************************
  * Interface with ScoresService
  ****************************************************************************************/
  /**
   * @method
   * @description
   * Gives all scores to the scores service to allow for processing and display of data
   * @return {Score[]} all of our scores
  **/
  public getAllScores(): Score[] {return this.allScores;}
}

const hiscoreService: HiscoreService = new HiscoreService();
export default hiscoreService;