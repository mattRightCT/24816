import ComponentUtil from '../../util/component-util';
import ScoresComponent from '../../components/scores/scores.component';
import { AppConstants } from '../../util/app.constants'

const ScoresComponentOuter = () => {
  return ComponentUtil.renderNormalPageComponent(ScoresComponent, {
    title: AppConstants.appName + ' Scores',
    description: 'Historical score data for ' + AppConstants.appName,
    siteUrl: AppConstants.appRoot + 'scores'
  });
};

export default ScoresComponentOuter;
