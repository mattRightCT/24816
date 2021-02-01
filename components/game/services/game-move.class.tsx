import { Subject } from 'rxjs';


export type GameMove = 'right' | 'left' | 'up' | 'down';
export const AllGameMoves: GameMove[] = ['right', 'left', 'up', 'down'];

export class GameMoveClass {
  // Game move
  protected gameMove$: Subject<GameMove> = new Subject<GameMove>();
  get gameMove(): Subject<GameMove> {return this.gameMove$;}
  /**
   * @method
   * @description
   * Emits a new move
   * @param newMove {GameMove} the new move we want to emit
   * @return {void}
  **/
  protected newMove(newMove: GameMove): void {
    this.gameMove$.next(newMove);
  }
}
