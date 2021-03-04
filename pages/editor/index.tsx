import ComponentUtil from '../../util/component-util';
import EditorComponent from '../../components/editor/editor.component';
import { AppConstants } from '../../util/app.constants'

const EditorComponentOuter = () => {
  return ComponentUtil.renderNormalPageComponent(EditorComponent, {
    title: AppConstants.appName + ' Board Editor',
    description: 'Create your own starting board for ' + AppConstants.appName,
    siteUrl: AppConstants.appRoot + 'editor'
  });
};

export default EditorComponentOuter;
