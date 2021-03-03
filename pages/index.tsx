import ComponentUtil from '../util/component-util';
import GameboardComponent from '../components/game/gameboard.component';


const HomeComponentOuter = () => {
  return ComponentUtil.renderNormalPageComponent(GameboardComponent, undefined);
};

export default HomeComponentOuter;
