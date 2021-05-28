import { GameSettingsService } from '../../game/services/game-settings.service';
import HiscoreService, { Score } from '../../game/services/hiscore.service';

/**
 * @class
 * @description
 * Keeps track of scores for a given setting and gives us a simple interface for interacting with them
**/
export class ScoresBySetting {
  private scores: number[] = [];
  private dates: Date[] = [];
  // Set up using the very first score (dont need to track or check the setting)
  constructor(firstScore: Score) {
    this.addNewScore(firstScore);
  }
  /**
   * @method
   * @description
   * Adds a new score to this object
  **/
  public addNewScore(newScore: Score): void {
    this.scores.push(newScore.value);
    this.dates.push(newScore.date);
  }
  /**
   * @method
   * @description
   * Number of scores for this setting
  **/
  public numOfScores(): number {
    return this.scores.length;
  }
  /**
   * @method
   * @description
   * Gives us a list containing the scores and dates in a format we can insert directly into uPlot
  **/
  public getScoresAndDates(): [number[], number[]] {
    return [this.dates.map((date) => Math.floor(date.getTime()/1000)), this.scores];
  }
}

export class ScoresService {
  // Keeping track of whether we need to update the scores or not
  private newScoreAdded: boolean = false;
  // Different settings as hash keys, for that setting, a list of the values and corresponding dates
  private scoresAndSettings: {[key: string]: ScoresBySetting} = {};
  
  constructor() {
    // Sub to any new scores added, if we get a message then its true
    HiscoreService.newScoreAdded.subscribe(() => {this.newScoreAdded = true;});
  }
  /****************************************************************************************
  * Initialization
  ****************************************************************************************/
  /**
   * @method
   * @description
   * Checks to see if we need to init scores and settings, if so, then we do so
  **/
  private checkAndInitScoresAndSettings(): void {
    // Check to see if we need to update scores and settings (or if it hasnt been init'ed) -- if so, then update
    if (this.newScoreAdded || Object.keys(this.scoresAndSettings).length === 0) {
      this.scoresAndSettings = ScoresService.initScoresAndSettings();
    } // otherwise do nothing
  }
  /**
   * @method
   * @description
   * Initializes scores and settings from the hiscore service
   * @return {[key: string]: ScoresBySetting} mapping of setting names to scores by setting objects
  **/
  private static initScoresAndSettings(): {[key: string]: ScoresBySetting} {
    const allScores: Score[] = HiscoreService.getAllScores();
    let returnDict: {[key: string]: ScoresBySetting} = {};
    // Need to add each score
    for (let score of allScores) {
      // Get the id for the game settings
      let settingsID: string = GameSettingsService.gameSettingsID(score.gameSettings);
      // if we already have this setting, then we just add the score
      if (returnDict[settingsID]) {
        returnDict[settingsID].addNewScore(score);
      } else {
        // Otherwise we need to add a new object
        returnDict[settingsID] = new ScoresBySetting(score);
      }
    }
    return returnDict;
  }
  /****************************************************************************************
  * Interface with Scores Component
  ****************************************************************************************/
  /**
   * @method
   * @description
   * Returns the list of score settings, sorted in descending order by the number of scores
   * @return {string[]} names of settings in descending order of scores
  **/
  public getScoreSettings(): string[] {
    // Check on scores and settings first
    this.checkAndInitScoresAndSettings();
    let settingNames: string[] = Object.keys(this.scoresAndSettings);
    // Then we sort in descending order by number of scores
    settingNames.sort((a: string, b: string) => {
      return this.scoresAndSettings[b].numOfScores() - this.scoresAndSettings[a].numOfScores();
    });
    return settingNames;
  }
  /**
   * @method
   * @description
   * Gives us the scores by setting object for the given setting, or nothing if it doesnt exist
   * @param setting {string} id the setting we want
   * @return {ScoresBySetting | null} the scores for that setting or null if nothing is there
  **/
  public getDatesAndScoresBySetting(setting: string): [number[], number[]] | null {
    // Check on scores and settings first
    this.checkAndInitScoresAndSettings();
    // If we dont have anything, then we return null, otherwise get the scores and dates
    return this.scoresAndSettings[setting]? this.scoresAndSettings[setting].getScoresAndDates() : null;
  }
}

const scoresService: ScoresService = new ScoresService();
export default scoresService;
