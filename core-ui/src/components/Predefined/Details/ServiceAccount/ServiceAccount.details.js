import React from 'react';
import { useTranslation } from 'react-i18next';
import { GenericSecrets } from './GenericSecrets';
import { ServiceAccountTokenStatus } from 'shared/components/ServiceAccountTokenStatus';
import { ResourceDetails } from 'react-shared';
import { ServiceAccountsCreate } from '../../Create/ServiceAccounts/ServiceAccounts.create';

const ServiceAccountSecrets = serviceAccount => {
  const namespace = serviceAccount.metadata.namespace;
  const listKey = 'service-account-secrets';
  const title = 'Secrets';
  const filterBySecret = secret =>
    serviceAccount.secrets.find(
      ({ name: secretName }) => secret.metadata.name === secretName,
    );

  return serviceAccount.secrets ? (
    <GenericSecrets
      key={listKey}
      namespace={namespace}
      filter={filterBySecret}
      listKey={listKey}
      title={title}
      allowKubeconfigDownload
    />
  ) : null;
};

const ServiceAccountImagePullSecrets = serviceAccount => {
  const namespace = serviceAccount.metadata.namespace;
  const listKey = 'service-account-imagepullsecrets';
  const title = 'Image Pull Secrets';
  const filterBySecret = secret =>
    serviceAccount.imagePullSecrets.find(
      ({ name: secretName }) => secret.metadata.name === secretName,
    );

  return serviceAccount.imagePullSecrets ? (
    <GenericSecrets
      key={listKey}
      namespace={namespace}
      filter={filterBySecret}
      listKey={listKey}
      title={title}
    />
  ) : null;
};

export const ServiceAccountsDetails = props => {
  const { t } = useTranslation();
  const customColumns = [
    {
      header: t('service-accounts.headers.auto-mount-token'),
      value: value => (
        <ServiceAccountTokenStatus
          automount={value.automountServiceAccountToken}
        />
      ),
    },
  ];
  return (
    <ResourceDetails
      customComponents={[ServiceAccountSecrets, ServiceAccountImagePullSecrets]}
      customColumns={customColumns}
      createResourceForm={ServiceAccountsCreate}
      {...props}
    />
  );
};

export default ServiceAccountsDetails;
