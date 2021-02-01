
import { GameMoveClass } from './game-move.class'
import GameboardKeyService from './gameboard-key.service';
import GameboardTouchService from './gameboard-touch.service';

/**
 * @class
 * @description
 * Manages the game state
 **/
class GameMoveService extends GameMoveClass {
  // Services we want to keep an eye on to collect game movements
  private gameMoveServices: GameMoveClass[] = [
    GameboardKeyService,
    GameboardTouchService
  ];
  
  constructor() {
    super();
    // keep an eye on game movement services
    for (let gameMoveService of this.gameMoveServices) {
      this.setupMoveSubscription(gameMoveService);
    }
  }
  /**
   * @method
   * @description
   * Sets up a subscription for each game move service
   * @param gameMoveService {GameMoveClass} the game move service we want to keep an eye on
   * @return {void}
  **/
  private setupMoveSubscription(gameMoveService: GameMoveClass): void {
    gameMoveService.gameMove.subscribe(
      (newMove) => {
        this.gameMove$.next(newMove);
      }
    );
  }
}

const gameMoveService = new GameMoveService();

export default gameMoveService;
