import ComponentUtil from '../../util/component-util';
import SettingsComponent from '../../components/settings/settings.component';
import { AppConstants } from '../../util/app.constants'

const SettingsComponentOuter = () => {
  return ComponentUtil.renderNormalPageComponent(SettingsComponent, {
    title: AppConstants.appName + ' Settings',
    description: 'Settings for the next game of ' + AppConstants.appName,
    siteUrl: AppConstants.appRoot + 'settings'
  });
};

export default SettingsComponentOuter;
