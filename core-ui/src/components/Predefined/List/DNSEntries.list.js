import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, ResourcesList, ResourceStatus } from 'react-shared';
import { Trans } from 'react-i18next';
import { DNSEntriesCreate } from '../Create/DNSEntries/DNSEntries.create';

const DNSEntriesList = params => {
  const { t, i18n } = useTranslation();
  const customColumns = [
    {
      header: t('dnsentries.headers.status'),
      value: dnsentry => (
        <ResourceStatus
          status={dnsentry.status}
          resourceKind="dnsentries"
          i18n={i18n}
        />
      ),
    },
  ];

  const description = (
    <Trans i18nKey="dnsentries.description">
      <Link
        className="fd-link"
        url="https://kyma-project.io/docs/kyma/latest/03-tutorials/00-api-exposure/apix-01-own-domain"
      />
    </Trans>
  );

  return (
    <ResourcesList
      customColumns={customColumns}
      description={description}
      resourceName="DNS Entries"
      createResourceForm={DNSEntriesCreate}
      {...params}
    />
  );
};
export default DNSEntriesList;
