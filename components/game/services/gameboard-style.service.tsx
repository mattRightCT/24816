import GeneralUtil from '../../../util/general-util';


export class GameboardStyleService {
  /**
   * @method
   * @description
   * Generates the gameboard indices we need to display the blocks
   * @param boardSize {number} size of the gameboard
   * @return {{x: number, y: number}[]} the gameboard indices
   **/
  public static createGameboardIndices(boardSize: number): {x: number, y: number}[] {
    let returnList: {x: number, y: number}[] = [];
    for (let x = 0; x < boardSize; x++) {
      for (let y = 0; y < boardSize; y++) {
        returnList.push({x: x, y: y});
      }
    }
    return returnList;
  }
  /**
   * @method
   * @description
   * Creates an RGB color value that scales with the log of the valueForLog variable (base 2)
   * @param maxColorValue {number} the color value we want to be at when we hit log(valueForLog) === maxLog
   * @param minColorValue {number} the color value we want to be at when we have log(valueForLog) === 1
   * @param valueForLog {number} the value we are taking the log (base 2) of
   * @param maxLog {number} the maximum log(valueForLog) we expect (helps us scale the value correctly)
   * @return {number} the correct RGB value we want to input
   **/
  public static colorLogValue(
    maxColorValue: number, minColorValue: number, valueForLog: number, maxLog: number
  ): number {
    return (maxColorValue - minColorValue) / maxLog * GeneralUtil.log(valueForLog, 2) + minColorValue;
  }
  /**
   * @method
   * @description
   * Generates the RGB string we want for the background color of our blocks
   * @param valueForLog {number} the value we want the color to scale off of
   * @return {string} string for RGB value
   **/
  public static createRGBStringForBlocks(valueForLog: number): string {
    // If this is a zero value, we want to use black
    if (valueForLog === 0) {
      return '#000';
    }
    // Otherwise calculate correct color to use
    return 'rgb(' + GameboardStyleService.colorLogValue(175, 5, valueForLog, 14) + ',' +
      GameboardStyleService.colorLogValue(175, 5, valueForLog, 14) + ',' +
      GameboardStyleService.colorLogValue(175, 5, valueForLog, 14) + ')';
  }
  /**
   * @method
   * @description
   * Determines the font size based on the block value (to ensure it always fits)
   * @param blockValue {number} the value displayed in the current block
   * @param boardLength {number} the number of blocks in one dimension of the board
   * @param boardSize {number} the size of the board visually in vmins
   * @return {string} the font size (in vmins) we want to use
   **/
  public static determineBoardFontSize(blockValue: number, boardLength: number, boardSize: number): string {
    // Five digit numbers on a 4x4 board are perfect at this size
    const baseFontSize: number = boardSize / boardLength / 4;
    let fontSize: number = blockValue < 10? baseFontSize * 2.75 :
      blockValue < 100? baseFontSize * 2.25 :
        blockValue < 1000? baseFontSize * 1.75 :
          blockValue < 10000? baseFontSize * 1.3 :
            blockValue < 100000? baseFontSize : baseFontSize * 0.5;
    return fontSize.toString() + 'vmin';
  }
}