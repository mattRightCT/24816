import {GameStateService} from '../../../components/game/services/game-state.service';


describe('GameStateService', () => {
  describe('determines whether gameboard can be moved', () => {
    test('when we have matching values', () => {
      let g1: number[][] = [
        [2, 2, 4, 8],
        [4, 8, 16, 32],
        [32, 16, 8, 16],
        [64, 32, 64, 128]
      ];
      expect(GameStateService['canMoveInDirection']('left', g1)).toBe(true);
      expect(GameStateService['canMoveInDirection']('up', g1)).toBe(false);
      expect(GameStateService['canMoveInDirection']('right', g1)).toBe(true);
      expect(GameStateService['canMoveInDirection']('down', g1)).toBe(false);
    });
    test('when we have a zero', () => {
      let g2: number[][] = [
        [0, 2, 4, 8],
        [4, 8, 16, 32],
        [32, 16, 8, 16],
        [64, 32, 64, 128]
      ];
      expect(GameStateService['canMoveInDirection']('left', g2)).toBe(true);
      expect(GameStateService['canMoveInDirection']('up', g2)).toBe(true);
      expect(GameStateService['canMoveInDirection']('right', g2)).toBe(false);
      expect(GameStateService['canMoveInDirection']('down', g2)).toBe(false);
    });
  });
  describe('can move gameboard', () => {
    /****************************************************************************************
    * Simple board
    ****************************************************************************************/
    let simple: number[][] = [
      [2, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ];
    test('simple board moves right', () => {
      let simpleRightExpected: number[][] = [
        [0, 0, 0, 2],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ];
      expect(
        GameStateService['gameboardsAreTheSame'](
          simpleRightExpected,
          GameStateService['moveBlocks']('right', simple)
        )
      ).toBe(true);
    });
    test('simple board moves left', () => {
      expect(
        GameStateService['gameboardsAreTheSame'](
          simple,
          GameStateService['moveBlocks']('left', simple)
        )
      ).toBe(true);
    });
    /****************************************************************************************
    * Combines values
    ****************************************************************************************/
    test('combines correctly to the right', () => {
      let combinesRight: number[][] = [
        [4, 4, 4, 4],
        [0, 2, 16, 64],
        [0, 8, 32, 256],
        [0, 2, 16, 1024]
      ];
      let combinesRightExpected: number[][] = [
        [0, 0, 8, 8],
        [0, 2, 16, 64],
        [0, 8, 32, 256],
        [0, 2, 16, 1024]
      ];
      expect(
        GameStateService['gameboardsAreTheSame'](
          combinesRightExpected,
          GameStateService['moveBlocks']('right', combinesRight)
        )
      ).toBe(true);
    });
    test('combines correctly up', () => {
      let combinesUp: number[][] = [
        [4, 2, 16, 64],
        [0, 0, 16, 128],
        [0, 2, 8, 256],
        [2, 0, 2, 1024]
      ];
      let combinesUpExpected: number[][] = [
        [4, 4, 32, 64],
        [2, 0, 8, 128],
        [0, 0, 2, 256],
        [0, 0, 0, 1024]
      ];
      expect(
        GameStateService['gameboardsAreTheSame'](
          combinesUpExpected,
          GameStateService['moveBlocks']('up', combinesUp)
        )
      ).toBe(true);
    });
    test('combines correctly down', () => {
      let combinesDown: number[][] = [
        [4, 2, 16, 64],
        [0, 0, 16, 128],
        [0, 2, 8, 256],
        [2, 0, 2, 1024]
      ];
      let combinesDownExpected: number[][] = [
        [0, 0, 0, 64],
        [0, 0, 32, 128],
        [4, 0, 8, 256],
        [2, 4, 2, 1024]
      ];
      expect(
        GameStateService['gameboardsAreTheSame'](
          combinesDownExpected,
          GameStateService['moveBlocks']('down', combinesDown)
        )
      ).toBe(true);
    });
  });
});