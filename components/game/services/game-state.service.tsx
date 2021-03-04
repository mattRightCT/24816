import GameMoveService from './game-move.service';
import GameSettingsService, { GameSettings } from './game-settings.service'
import { AllGameMoves, GameMove } from './game-move.class'
import { BehaviorSubject } from 'rxjs'
import BrowserStorage from '../../../util/storage.util'
import GeneralUtil from '../../../util/general-util'

export type GameState = {
  board: number[][];
  score: number;
}

type CombineValuesOutcome = {addThis: number, previousValue: number, incrementIndex: boolean, increaseScore: number};

/**
 * @class
 * @description
 * Manages the game state
**/
export class GameStateService {
  private static myName: string = 'GameState';
  // Game state
  private gameState$: BehaviorSubject<GameState> = new BehaviorSubject<GameState>(GameStateService.initGameState());
  get gameState(): BehaviorSubject<GameState> {return this.gameState$;}
  // Keeping track of all past states, so that we can undo moves
  private allPastStates: GameState[] = [GameStateService.initGameState()];
  // Initialize game state and movement subscription
  constructor() {
    // Set up subscription to game settings
    GameSettingsService.gameSettings.subscribe(
      (newSettings: GameSettings) => {
        // We only update if the board size is different, other settings dont reset board
        if (newSettings.boardSize !== this.gameState$.getValue().board.length) {
          this.resetGameState();
        }
      }
    );
    // Set up subscription to game movements
    GameMoveService.gameMove.subscribe(
      (nextMove: GameMove) => {
        this.executeNextMove(nextMove);
      }
    );
  }
  /****************************************************************************************
  * Initialization
  ****************************************************************************************/
  /**
   * @method
   * @description
   * Initializes game state from local storage or just makes a new game if it cant find one
   * @return {GameState} initial game state
  **/
  private static initGameState(): GameState {
    // Check to see if we have a saved game state
    const savedGameState: GameState | null = GeneralUtil.onServer()?
      null : BrowserStorage.load(GameStateService.myName);
    if (savedGameState === null || savedGameState.score === undefined) {
      // If not (or if score is not defined) then we return new game settings instead
      return GameStateService.newGameState(GameSettingsService.getGameSettings());
    }
    // if we do then return the saved settings
    return savedGameState;
  }
  /**
   * @method
   * @description
   * Creates a new game state object (with one block already placed)
   * @param gameSettings {GameSettings} relevant game settings to produce the new game state
   * @return {GameState} new game state
  **/
  private static newGameState(gameSettings: GameSettings): GameState {
    // Initialize the new board
    let gameBoard: number[][] = GameStateService.newGameboard(gameSettings.boardSize);
    // Then add a new block and return
    GameStateService.addNewBlock(gameBoard, gameSettings);
    return {board: gameBoard, score: 0};
  }
  /**
   * @method
   * @description
   * Creates a brand new gameboard, given a board size
   * @param boardSize {number} the size of the board (always a square gameboard)
   * @return {number[][]} fresh new gameboard
  **/
  private static newGameboard(boardSize: number): number[][] {
    // Initialize the new board
    let gameBoard: number[][] = [];
    for (let i = 0; i < boardSize; i++) {
      // Push a new list
      gameBoard.push([]);
      for (let j = 0; j < boardSize; j++) {
        // Then push a bunch of zeros
        gameBoard[i].push(0)
      }
    }
    return gameBoard
  }
  /****************************************************************************************
  * Public interface
  ****************************************************************************************/
  /**
   * @method
   * @description
   * Undoes the last move (applies to all past moves)
   * @return {void}
   **/
  public undoLatestMove(): void {
    // Should only execute if we have game moves to undo -- otherwise could break
    if (this.allPastStates.length > 1) {
      // Remove the latest game move
      this.allPastStates.pop();
      // Then emit the last one in the list
      this.gameState$.next(this.allPastStates[this.allPastStates.length - 1]);
    }
  }
  /**
   * @method
   * @description
   * Resets the game state and emits
   * @return {void}
  **/
  public resetGameState(newGameState?: GameState): void {
    // Remove all previous game states
    this.allPastStates = []
    // if we received a new game state, then we emit that
    if (newGameState) {
      this.emitNextGameState(newGameState);
    } else {
      // Otherwise create and emit a brand new game state
      this.emitNextGameState(GameStateService.newGameState(GameSettingsService.getGameSettings()));
    }
  }
  /**
   * @method
   * @description
   * Resets current game and sets up game matching the edited game state
   * @param editedGameState {GameState} game state created in the editor
  **/
  public playEditedGame(editedGameState: GameState): void {
    this.resetGameState(editedGameState);
  }
  /****************************************************************************************
  * Emitting game states
  ****************************************************************************************/
  /**
   * @method
   * @description
   * Emits the next game state, and all accompanying activities
   * @param nextGameState {GameState} the next game state we want to emit
   * @return {void}
  **/
  private emitNextGameState(nextGameState: GameState): void {
    // Add to our list of old game states
    this.allPastStates.push(nextGameState);
    // Then emit
    this.gameState$.next(nextGameState);
    // Save the current game state
    BrowserStorage.persist(GameStateService.myName, nextGameState);
  }
  /****************************************************************************************
  * Picking new block
  ****************************************************************************************/
  /**
   * @method
   * @description
   * Adds a new block to a gameboard
   * @param gameBoard {number[][]} gameboard we want to add a block to
   * @param gameSettings {GameSettings} applicable game settings
   * @return {void}
  **/
  private static addNewBlock(gameBoard: number[][], gameSettings: GameSettings): void {
    // Determine number of open blocks; if none exist, then throw an error
    const numOpenBlocks: number = GameStateService.calcNumOpenBlocks(gameBoard);
    // Pick a random slot to add a new block
    const addToThisBlock: number = GameStateService.pickRandomInt(numOpenBlocks);
    // Then pick a random number
    const newBlockValue: number = GameStateService.pickNewBlockValue(gameSettings);
    // Then find that block and put in the random number
    let howManyZeros: number = -1;
    for (let i = 0; i < gameBoard.length; i++) {
      for (let j = 0; j < gameBoard[i].length; j++) {
        // If we find a zero block, then we add one and ask if this is the block we want to modify
        if (gameBoard[i][j] === 0) {
          howManyZeros++;
          if (howManyZeros === addToThisBlock) {
            // Modify the right block then return, cause nothing else to do
            gameBoard[i][j] = newBlockValue;
            return;
          }
        }
      }
    }
  }
  /**
   * @method
   * @description
   * Picks a new block value for us
   * @param gameSettings {GameSettings} game settings we use to determine block value
   * @return {number}
  **/
  private static pickNewBlockValue(gameSettings: GameSettings): number {
    // Just comparing a random value to the four block percent chance
    if (Math.random() * 100 <= gameSettings.fourBlockPerc) {
      return 4;
    }
    return 2;
  }
  /**
   * @method
   * @description
   * Calculates the number of open blocks (i.e. those with value == 0)
   * @param gameBoard {number[][]} gameboard we are looking for open blocks
   * @return {number} number of open blocks
  **/
  private static calcNumOpenBlocks(gameBoard: number[][]): number {
    return gameBoard.flat().reduce(
      (numZeros, currBlock) => {
        if (currBlock === 0) {
          return numZeros + 1;
        }
        return numZeros;
      }, 0
    );
  }
  /**
   * @method
   * @description
   * Picks a random integer between 0 and (upToInt - 1)
   * @param upToInt {number} pick a random integer up to this integer
   * @return {number} random integer between 0 and (upToInt - 1)
  **/
  private static pickRandomInt(upToInt: number): number {
    return Math.floor(Math.random() * upToInt);
  }
  /****************************************************************************************
  * Executing game moves
  ****************************************************************************************/
  /**
   * @method
   * @description
   * Executes the next game move, if possible
   * @param nextMove {GameMove} executes the next game move
   * @return {void}
  **/
  private executeNextMove(nextMove: GameMove): void {
    // First we determine if we can move the blocks
    if (GameStateService.canMoveInDirection(nextMove, this.gameState$.getValue().board)) {
      // Get the new gameboard after the move
      let updateGameState: {board: number[][], increaseScore: number} = GameStateService.moveBlocks(
        nextMove, this.gameState$.getValue().board
      );
      // Then we add a new block
      GameStateService.addNewBlock(updateGameState.board, GameSettingsService.getGameSettings());
      // and emit the move
      this.emitNextGameState({
        board: updateGameState.board,
        score: updateGameState.increaseScore +  this.gameState$.getValue().score
      });
    } else {
      // if we cant move our blocks, then we ask them what they want to do
      if (!GameStateService.canStillMove(nextMove, this.gameState$.getValue().board)) {
        // todo
      } // if we can still move the blocks, then we dont do anything
    }
  }
  /**
   * @method
   * @description
   * Tries to move gameboard blocks as per the specified move (throws error if cannot move)
   * @param move {GameMove} game move to move the blocks
   * @param gameboard {number[][]} the gameboard we are moving
   * @return {number[][]} the gameboard after the move
  **/
  private static moveBlocks(move: GameMove, gameboard: number[][]): {board: number[][], increaseScore: number} {
    // Init a new gameboard
    let newGameboard: number[][] = GameStateService.newGameboard(gameboard.length);
    // Init increase in score
    let increaseScore: number = 0;
    for (let i = 0; i < gameboard.length; i++) {
      // Pull out the relevant row
      const relevantRow: number[] = GameStateService.getRelevantRow(gameboard, i, move);
      // Convert into row after move
      const rowAfterMove: {newRow: number[], increaseScore: number} = GameStateService.getRowAfterMove(
        relevantRow, gameboard.length
      );
      // Then put it into the new gameboard
      GameStateService.updateNewGameboard(newGameboard, rowAfterMove.newRow, i, move);
      // And update the score
      increaseScore += rowAfterMove.increaseScore;
    }
    return {board: newGameboard, increaseScore: increaseScore};
  }
  /**
   * @method
   * @description
   * Updates the new gameboard with the values after moving
   * @param newGameboard {number[][]} the gameboard we are updating with the new values
   * @param addRow {number[]} the row of 'moved' values we are updating in the gameboard
   * @param currIndex {number} the current index we want to update
   * @param move {GameMove} the move executed by the user
   * @return {}
  **/
  private static updateNewGameboard(
    newGameboard: number[][],
    addRow: number[],
    currIndex: number,
    move: GameMove
  ): void {
    // Re-reverse the row in case it needs to be
    if (GameStateService.needToReverse(move)) {
      addRow.reverse();
    }
    const getFromFirstDim: boolean = GameStateService.getFromFirstDimension(move);
    // Then add it to the new gameboard
    for (let i = 0; i < addRow.length; i++) {
      // Determine which dimension of the array want to put it in
      if (getFromFirstDim) {
        newGameboard[currIndex][i] = addRow[i];
      } else {
        newGameboard[i][currIndex] = addRow[i];
      }
    }
  }
  /**
   * @method
   * @description
   * Grabs the relevant 'row' that we are moving, then puts it into a standard format (always moving towards the front
   * of the list, regardless of the actual layout on the gameboard)
   * @param gameboard {number[][]} gameboard we are grabbing values from
   * @param rowNum {number} the row number we are currently on
   * @param move {GameMove} the game move we are executing
   * @return {number[]} the relevant 'row' of values that are moving
  **/
  private static getRelevantRow(gameboard: number[][], rowNum: number, move: GameMove): number[] {
    let relevantRow: number[] = [];
    const getFromFirstDim: boolean = GameStateService.getFromFirstDimension(move);
    // Go through each of the values we need
    for (let i = 0; i < gameboard.length; i++) {
      let firstDim: number = getFromFirstDim? rowNum : i;
      let secondDim: number = getFromFirstDim? i : rowNum;
      // only want to add it if it's greater than zero, otherwise nothing in the row is relevant
      if (gameboard[firstDim][secondDim] > 0) {
        relevantRow.push(gameboard[firstDim][secondDim]);
      }
    }
    // If we are moving to the right or downwards, then we need to reverse the row, so its in a standard format
    if (GameStateService.needToReverse(move)) {
      relevantRow.reverse();
    }
    return relevantRow;
  }
  /**
   * @method
   * @description
   * Tells us whether a list needs to be reversed based on which game move it is
   * @param move {GameMove} the type of game move made by user
   * @return {boolean} whether the list needs to be reversed or not
  **/
  private static needToReverse(move: GameMove): boolean {
    return move === 'right' || move === 'down';
  }
  /**
   * @method
   * @description
   * Whether we are going along the 'first' dimension in a gameboard or the second dimension
   * @param move {GameMove} move made by user
   * @return {boolean} whether we are getting data from first dim or second dim of the gameboard array
  **/
  private static getFromFirstDimension(move: GameMove): boolean {
    return move === 'left' || move === 'right';
  }
  /**
   * @method
   * @description
   * Moves just one row, always towards the front of the current list (just to make indexing clearer)
   * @param row {number[]} the row of values
   * @param boardSize {number} the size of the gameboard
   * @return {number[]} the row after we moved everything towards the front
  **/
  private static getRowAfterMove(row: number[], boardSize: number): {newRow: number[], increaseScore: number} {
    let rowAfterMove: number[] = [];
    let previousValue: number = 0;
    let increaseScore: number = 0;
    // Go through each of the row values to calculate what the end value will be
    for (let i = 0; i < row.length; i++) {
      // For each we need to get what should happen
      let combineOutcome: CombineValuesOutcome = GameStateService.calcCombineOutcome(row, previousValue, i);
      // Then we push the next value
      rowAfterMove.push(combineOutcome.addThis);
      // Calculate what should be used as the previous value
      previousValue = combineOutcome.previousValue;
      // Add up the increase in score
      increaseScore += combineOutcome.increaseScore;
      // Then increment the index if required
      if (combineOutcome.incrementIndex) {i++;}
    }
    // At the end, we need to check if we still have one in the tank
    if (previousValue > 0) {
      rowAfterMove.push(previousValue);
    }
    // Then fill in the empty slots with zeros
    for (let i = rowAfterMove.length; i < boardSize; i++) {
      rowAfterMove.push(0);
    }
    return {newRow: rowAfterMove, increaseScore: increaseScore};
  }
  /**
   * @method
   * @description
   * Determines the outcome of trying to combine at this index in the row, given a previous value
   * @param row {number[]} the row in question
   * @param previousValue {number} the value carried over from last iteration
   * @param index {number} the current index in the row
   * @return {CombineValuesOutcome} the value we want to add, the previous value to carry over, and whether to
   * increment the index or not
  **/
  private static calcCombineOutcome(row: number[], previousValue: number, index: number): CombineValuesOutcome {
    // If the previous value is zero, then we need to use the next two numbers
    if (previousValue === 0) {
      // Unless we are at the end, in which case we just add the next value
      if ((index + 1) === row.length) {
        return {addThis: row[index], previousValue: 0, incrementIndex: false, increaseScore: 0}
      }
      // Otherwise we use the next two values and make sure to increment the index
      return Object.assign(GameStateService.combineTwoValues(row[index], row[index+1]), {incrementIndex: true});
    }
    // Otherwise is a 'normal' approach where we try to combine the previous (non zero) value and the current value
    return Object.assign(GameStateService.combineTwoValues(previousValue, row[index]), {incrementIndex: false});
  }
  /**
   * @method
   * @description
   * Combines two values (as if b tries moving towards a)
   * @return {addThis: number, previousValue: number, increaseScore: number} which value should be added, which
   * should be used as carry over value, and how much we need to increase the score by
   * the previous value for the next step
  **/
  private static combineTwoValues(
    a: number, b: number
  ): {addThis: number, previousValue: number, increaseScore: number} {
    if (a === b) {
      return {addThis: a + b, previousValue: 0, increaseScore: a + b};
    }
    return {addThis: a, previousValue: b, increaseScore: 0};
  }
  /**
   * @method
   * @description
   * Determines whether we are able to still move
   * @param triedThisMove {GameMove} the move the user tried but could not
   * @param gameboard {number[][]} gameboard we are seeing if it can move
   * @return {boolean} whether a move can be executed on this gameboard
  **/
  private static canStillMove(triedThisMove: GameMove, gameboard: number[][]): boolean {
    // Go through each of the other game moves to see if we can move in that direction
    for (let gameMove of AllGameMoves) {
      if (gameMove !== triedThisMove) {
        // If so, then we return true
        if (GameStateService.canMoveInDirection(gameMove, gameboard)) {
          return true;
        }
      }
    }
    // if no other game moves work, then return false
    return false;
  }
  /**
   * @method
   * @description
   * Looks at the board from the perspective of the game move to see if it can (looks for zeros, or consecutive values)
   * @param moveInDirection {GameMove} the move we want to try
   * @param gameboard {number[][]} the gameboard we are trying to move
   * @return {boolean} whether we can move in that direction or not
  **/
  private static canMoveInDirection(moveInDirection: GameMove, gameboard: number[][]): boolean {
    // Helps us determine the index and index offset to simplify the loop
    let getFromFirstDim: boolean = GameStateService.getFromFirstDimension(moveInDirection);
    let reverseIt: boolean = GameStateService.needToReverse(moveInDirection);
    // Start first dimension loop
    for (let i = 0; i < gameboard.length; i++) {
      // Keeps track of whether we have found a zero in the opposite direction of movement -- if we have, then we know
      // that we can move it, unless the whole row is zeros
      let foundZero: boolean = false;
      // Keeping an eye on the previous value, as blocks only interact with the 'previous' block in the direction
      // of movement
      let previousValue: number = 0;
      for (let j = 0; j < gameboard.length; j++) {
        // Somewhat complicated logic to determine indices
        let firstDim: number = getFromFirstDim?
          reverseIt? gameboard.length - (i + 1) : i :
          reverseIt? gameboard.length - (j + 1) : j;
        let secondDim: number = getFromFirstDim?
          reverseIt? gameboard.length - (j + 1) : j :
          reverseIt? gameboard.length - (i + 1) : i;
        let currValue: number = gameboard[firstDim][secondDim];
        // First condition: if we already had a zero and we find a non zero value, then we can move
        // second condition: if the previous non-zero value and current value are equal, then we can move
        if ((foundZero && currValue > 0) || (previousValue > 0 && currValue === previousValue)) {
          return true;
        }
        // Otherwise we need to set up variables for next iteration
        if (currValue === 0) {
          foundZero = true;
        }
        previousValue = currValue;
      }
    }
    // if we get here then we didnt find that we could move
    return false;
  }
  /**
   * @method
   * @description
   * Compares two gameboards to check if they are equivalent
   * @param gameboard1 {number[][]}
   * @param gameboard2 {number[][]}
   * @return {boolean} whether the two gameboards are equivalent
  **/
  private static gameboardsAreTheSame(gameboard1: number[][], gameboard2: number[][]): boolean {
    // First check lengths
    if (gameboard1.length !== gameboard2.length) {
      return false;
    }
    // Then go through each item
    for (let i = 0; i < gameboard1.length; i++) {
      // check sub-lengths
      if (gameboard1[i].length !== gameboard2[i].length) {
        return false;
      }
      // Then check items
      for (let j = 0; j < gameboard1[i].length; j++) {
        if (gameboard1[i][j] !== gameboard2[i][j]) {
          return false;
        }
      }
    }
    // if we get here then each item is equal
    return true;
  }
}

const gameStateService = new GameStateService();

export default gameStateService;
