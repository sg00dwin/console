import * as React from 'react';
// import { Button } from '@patternfly/react-core';
import { Button, Checkbox } from '@patternfly/react-core';
import { InfoCircleIcon } from '@patternfly/react-icons/dist/esm/icons/info-circle-icon';
import { FormikValues, useField, useFormikContext } from 'formik';
import { isEmpty } from 'lodash';
import { useTranslation } from 'react-i18next';
import {
  useResolvedExtensions,
  isYAMLTemplate,
  YAMLTemplate,
  WatchK8sResource,
} from '@console/dynamic-plugin-sdk';
import { AsyncComponent } from '@console/internal/components/utils';
import { useK8sWatchResource } from '@console/internal/components/utils/k8s-watch-hook';
import { ConsoleYAMLSampleModel } from '@console/internal/models';
import { getYAMLTemplates } from '@console/internal/models/yaml-templates';
import { definitionFor, K8sResourceCommon, referenceForModel } from '@console/internal/module/k8s';
import {
  SHOW_YAML_EDITOR_TOOLTIPS_USER_SETTING_KEY,
  SHOW_YAML_EDITOR_TOOLTIPS_LOCAL_STORAGE_KEY,
  useUserSettingsCompatibility,
} from '@console/shared';
import { getResourceSidebarSamples } from '../../utils';
import { CodeEditorFieldProps } from './field-types';

import './CodeEditorField.scss';
// import ShowTooltips from '../editor/CodeEditorToolbarConfigs';

const SampleResource: WatchK8sResource = {
  kind: referenceForModel(ConsoleYAMLSampleModel),
  isList: true,
};

const CodeEditorField: React.FC<CodeEditorFieldProps> = ({
  name,
  label,
  model,
  schema,
  showSamples,
  showShortcuts,
  showMiniMap,
  minHeight,
  onSave,
  language,
}) => {
  const [showTooltips, setShowTooltips] = useUserSettingsCompatibility(
    SHOW_YAML_EDITOR_TOOLTIPS_USER_SETTING_KEY,
    SHOW_YAML_EDITOR_TOOLTIPS_LOCAL_STORAGE_KEY,
    true,
    true,
  );

  // console.log('==>showShortcuts:', showShortcuts);
  console.log('==>showToolTips:', showTooltips);
  const [field] = useField(name);
  const { setFieldValue } = useFormikContext<FormikValues>();
  const { t } = useTranslation();

  const editorRef = React.useRef();
  console.log('==>editorRef:', editorRef);
  console.log('==>editorRef.current', editorRef?.current);

  const [sidebarOpen, setSidebarOpen] = React.useState<boolean>(true);

  const [sampleResources, loaded, loadError] = useK8sWatchResource<K8sResourceCommon[]>(
    SampleResource,
  );

  const { samples, snippets } = model
    ? getResourceSidebarSamples(
        model,
        {
          data: sampleResources,
          loaded,
          loadError,
        },
        t,
      )
    : { samples: [], snippets: [] };

  const definition = model ? definitionFor(model) : { properties: [] };
  const hasSchema = !!schema || (!!definition && !isEmpty(definition.properties));
  const hasSidebarContent = hasSchema || (showSamples && !isEmpty(samples)) || !isEmpty(snippets);

  const [templateExtensions] = useResolvedExtensions<YAMLTemplate>(isYAMLTemplate);

  const sanitizeYamlContent = React.useCallback(
    (id: string = 'default', yaml: string = '', kind: string) => {
      if (yaml) {
        return yaml;
      }
      const yamlByExtension: string = getYAMLTemplates(
        templateExtensions?.filter((e) => e.properties.model.kind === kind),
      ).getIn([kind, id]);
      return yamlByExtension?.trim() || '';
    },
    [templateExtensions],
  );

  const toggleShowTooltips = (event, checked) => {
    setShowTooltips(checked);
    (editorRef.current as any).editor.updateOptions({ hover: checked });
  };

  const tooltipCheckBox = (
    <Checkbox
      label={t('public~Show tooltips')}
      id="showTooltips"
      isChecked={showTooltips}
      data-checked-state={showTooltips}
      onChange={toggleShowTooltips}
    />
  );

  return (
    <div className="osc-yaml-editor" data-test="yaml-editor">
      <div className="osc-yaml-editor__editor red">
        <AsyncComponent
          loader={() => import('../editor/CodeEditor').then((c) => c.default)}
          forwardRef={editorRef}
          value={field.value}
          minHeight={minHeight ?? '222px'}
          onChange={(yaml: string) => setFieldValue(name, yaml)}
          onSave={onSave}
          showShortcuts
          showTooltips={showTooltips}
          showMiniMap={showMiniMap}
          language={language}
          toolbarLinks={
            !sidebarOpen && hasSidebarContent
              ? [
                  // <ShowTooltips />,
                  tooltipCheckBox,
                  <Button isInline variant="link" onClick={() => setSidebarOpen(true)}>
                    <InfoCircleIcon className="co-icon-space-r co-p-has-sidebar__sidebar-link-icon" />
                    {t('console-shared~View sidebar')}
                  </Button>,
                ]
              : [tooltipCheckBox]
            // <ShowTooltips />,
          }
        />
      </div>
      {sidebarOpen && hasSidebarContent && (
        <div className="osc-yaml-editor__sidebar">
          <AsyncComponent
            loader={() => import('../editor/CodeEditorSidebar').then((c) => c.default)}
            editorRef={editorRef}
            model={model}
            schema={schema}
            samples={showSamples ? samples : []}
            snippets={snippets}
            sanitizeYamlContent={sanitizeYamlContent}
            sidebarLabel={label}
            toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          />
        </div>
      )}
    </div>
  );
};

export default CodeEditorField;
