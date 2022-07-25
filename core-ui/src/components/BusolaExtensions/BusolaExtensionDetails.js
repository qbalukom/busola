import React from 'react';
import { Link } from 'shared/components/Link/Link';
import { Trans, useTranslation } from 'react-i18next';
import { createPatch } from 'rfc6902';
import { LayoutPanel, MessageStrip } from 'fundamental-react';
import { useParams } from 'react-router-dom';

import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { ControlledBy } from 'shared/components/ControlledBy/ControlledBy';
import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import { ReadonlyEditorPanel } from 'shared/components/ReadonlyEditorPanel';
import { Button } from 'fundamental-react';
import { useFeature } from 'shared/hooks/useFeature';
import { useUpdate } from 'shared/hooks/BackendAPI/useMutation';
import { useNotification } from 'shared/contexts/NotificationContext';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';

import {
  formatCurrentVersion,
  getLatestVersion,
  getSupportedVersions,
  migrateToLatest,
  getMigrationFunctions,
} from '../../components/Extensibility/migration';

import { BusolaExtensionEdit } from './BusolaExtensionEdit';

export function BusolaExtensionDetails(props) {
  console.log('BusolaExtensionDetails', props);
  const { t } = useTranslation();
  const { namespace, name } = useParams();

  const updateResourceMutation = useUpdate(props.resourceUrl);
  const notification = useNotification();

  const BusolaExtensionEditor = resource => {
    const { data } = resource;
    return Object.keys(data || {}).map(key => (
      <ReadonlyEditorPanel
        title={key}
        value={data[key]}
        key={key + JSON.stringify(data[key])}
      />
    ));
  };

  const updateBusolaExtension = async (newBusolaExtension, configmap) => {
    try {
      const diff = createPatch(configmap, newBusolaExtension);
      await updateResourceMutation(props.resourceUrl, diff);
      notification.notifySuccess({
        content: t('components.resource-details.messages.success', {
          resourceType: 'BusolaExtension',
        }),
      });
    } catch (e) {
      console.error(e);
      notification.notifyError({
        content: t('components.resource-details.messages.failure', {
          resourceType: 'BusolaExtension',
          error: e.message,
        }),
      });
      throw e;
    }
  };

  const ExtensibilityVersion = configmap => {
    const { t } = useTranslation();
    const { isEnabled: isExtensibilityEnabled } = useFeature('EXTENSIBILITY');
    const hasExtensibilityLabel =
      configmap?.metadata?.labels &&
      configmap?.metadata?.labels['busola.io/extension'] === 'resource';

    if (!(isExtensibilityEnabled && hasExtensibilityLabel)) return null;

    const currentVersion = formatCurrentVersion(configmap?.data?.version);
    const hasMigrationFunction = getMigrationFunctions().some(
      version => version === currentVersion?.replace('.', ''),
    );
    const isCurrentVersion = getLatestVersion() === currentVersion;
    const isSupportedVersion = getSupportedVersions().some(
      version => version === currentVersion,
    );

    const showMessage = () => {
      if (isCurrentVersion) {
        return null;
      } else if (isSupportedVersion) {
        return (
          <MessageStrip type="information" className="fd-margin-bottom--sm">
            {t('extensibility.message.old-version')}
          </MessageStrip>
        );
      } else if (hasMigrationFunction) {
        return (
          <MessageStrip type="error" className="fd-margin-bottom--sm">
            {t('extensibility.message.unsupported-version')}
          </MessageStrip>
        );
      } else {
        return (
          <MessageStrip type="error" className="fd-margin-bottom--sm">
            <Trans i18nKey="extensibility.message.unnown-version">
              <Link
                className="fd-link"
                url="https://github.com/kyma-project/busola/tree/main/docs/extensibility"
              />
            </Trans>
          </MessageStrip>
        );
      }
    };
    return (
      <LayoutPanel className="fd-margin--md">
        <LayoutPanel.Header>
          <LayoutPanel.Head title={t('extensibility.title')} />
          <LayoutPanel.Actions>
            {hasMigrationFunction && (
              <>
                {currentVersion && (
                  <Button
                    disabled={currentVersion === getLatestVersion()}
                    glyph="forward" // generate-shortcut journey-arrive journey-change tools-opportunity trend-up
                    onClick={() => {
                      const newBusolaExtension = migrateToLatest(configmap);
                      updateBusolaExtension(newBusolaExtension, configmap);
                    }}
                  >
                    {t('config-maps.buttons.migrate')}
                  </Button>
                )}
              </>
            )}
          </LayoutPanel.Actions>
        </LayoutPanel.Header>
        <LayoutPanel.Body>
          {showMessage()}
          <LayoutPanelRow
            name={t('extensibility.version.current')}
            value={currentVersion || EMPTY_TEXT_PLACEHOLDER}
          />
          <LayoutPanelRow
            name={t('extensibility.version.latest')}
            value={getLatestVersion()}
          />
        </LayoutPanel.Body>
      </LayoutPanel>
    );
  };

  const customColumns = [
    {
      header: t('common.headers.owner'),
      value: secret => (
        <ControlledBy ownerReferences={secret.metadata.ownerReferences} />
      ),
    },
  ];

  /*
i18n: I18n {observers: {…}, options: {…}, services: {…}, logger: Logger, modules: {…}, …}
namespace: "default"
readOnly: false
resourceGraphConfig: {Function: {…}, StatefulSet: {…}, Job: {…}, ReplicaSet: {…}, CronJob: {…}, …}
resourceName: "crds-status"
resourceTitle: ""
*/
  return (
    <ResourceDetails
      customComponents={[ExtensibilityVersion, BusolaExtensionEditor]}
      customColumns={customColumns}
      createResourceForm={BusolaExtensionEdit}
      resourceType="ConfigMaps"
      resourceUrl={`/api/v1/namespaces/${namespace}/configmaps/${name}`}
      // {...props}
    />
  );
}

export default BusolaExtensionDetails;
