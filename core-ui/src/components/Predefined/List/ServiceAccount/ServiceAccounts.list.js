import React from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { ServiceAccountTokenStatus } from 'shared/components/ServiceAccountTokenStatus';
import { Link, ResourcesList } from 'react-shared';
import { ServiceAccountsCreate } from '../../Create/ServiceAccounts/ServiceAccounts.create';

const ServiceAccountsList = props => {
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

  const description = (
    <Trans i18nKey="service-accounts.description">
      <Link
        className="fd-link"
        url="https://kubernetes.io/docs/tasks/configure-pod-container/configure-service-account/"
      />
    </Trans>
  );

  return (
    <ResourcesList
      customColumns={customColumns}
      description={description}
      resourceName={t('service-accounts.title')}
      createResourceForm={ServiceAccountsCreate}
      {...props}
    />
  );
};

export default ServiceAccountsList;
