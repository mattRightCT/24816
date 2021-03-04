import GameStateService, { GameState } from '../../game/services/game-state.service';
import { BehaviorSubject } from 'rxjs';
import GameSettingsService from '../../game/services/game-settings.service';

export class EditorBoardService {
  private editorBoard$: BehaviorSubject<GameState> = new BehaviorSubject<GameState>(
    EditorBoardService.newEditorBoard()
  );
  get editorBoard(): BehaviorSubject<GameState> {return this.editorBoard$;}
  
  constructor() {
    GameSettingsService.gameSettings.subscribe(
      () => {
        // on new settings, we reset the current editor board
        this.editorBoard$.next(EditorBoardService.newEditorBoard());
      }
    );
  }
  /****************************************************************************************
  * Creating boards
  ****************************************************************************************/
  /**
   * @method
   * @description
   * Produces a brand new board for the editor based on current game settings
  **/
  private static newEditorBoard(): GameState {
    const boardSize: number = GameSettingsService.getBoardSize();
    let returnBoard: number[][] = [];
    for (let i = 0; i < boardSize; i++) {
      returnBoard.push([]);
      for (let j = 0; j < boardSize; j++) {
        returnBoard[i].push(0);
      }
    }
    return {board: returnBoard, score: 0};
  }
  /**
   * @method
   * @description
   * Resets the editor board and sends it over the subscription
  **/
  public createAndSendNewEditorBoard(): void {
    this.editorBoard$.next(EditorBoardService.newEditorBoard());
  }
  /****************************************************************************************
  * Updating boards
  ****************************************************************************************/
  /**
   * @method
   * @description
   * Increments the block at the given coordinates
   * @param x {number} x coordinate
   * @param y {number} y coordinate
  **/
  public incrementBlock(x: number, y: number): void {
    let currBoard: GameState = this.editorBoard$.getValue();
    // Double check that x and y are acceptable values, return if not
    if (EditorBoardService.coordinatesNotOK(x, y, currBoard.board.length)) {return;}
    // Otherwise we want to update the correct value on the board
    const currValue: number = currBoard.board[y][x];
    // if its zero, up to 2, if its less than zero, weird we just reset it, otherwise we double the value
    currBoard.board[y][x] = currValue === 0? 2 : currValue < 0? 0 : currValue * 2;
    // Then we send out the updated game state
    this.editorBoard$.next({ board: currBoard.board, score: 0 });
  }
  /**
   * @method
   * @description
   * Resets the block at the given coordinate to 0
   * @param x {number} x coordinate
   * @param y {number} y coordinate
  **/
  public resetBlock(x: number, y: number): void {
    let currBoard: GameState = this.editorBoard$.getValue();
    // Double check that x and y are acceptable values, return if not
    if (EditorBoardService.coordinatesNotOK(x, y, currBoard.board.length)) {return;}
    // then we zero out the value and send
    currBoard.board[y][x] = 0;
    this.editorBoard$.next({ board: currBoard.board, score: 0 });
  }
  /**
   * @method
   * @description
   * Ensures that the given coordinates are valid given the current size of the board
   * @param x {number} x coordinate
   * @param y {number} y coordinate
   * @param board {number[][]} the current board
   * @return {boolean} whether the given coordinates are acceptable and can be used without issue
  **/
  private static coordinatesNotOK(x: number, y: number, boardLength: number): boolean {
    return x >= boardLength || y >= boardLength || x < 0 || y < 0;
  }
  /****************************************************************************************
  * Play the editor board
  ****************************************************************************************/
  public playEditorBoard(): void {
    GameStateService.playEditedGame(this.editorBoard$.getValue());
  }
}

const editorBoardService: EditorBoardService = new EditorBoardService();
export default editorBoardService;