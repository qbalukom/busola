import React from 'react';
import LuigiClient from '@luigi-project/client';
import { useTranslation } from 'react-i18next';
import {
  PageHeader,
  useMicrofrontendContext,
  useGetList,
  Spinner,
  prettifyNameSingular,
  ResourceNotFound,
} from 'react-shared';
import { HelmReleaseData } from './HelmReleaseData';
import { Link } from 'fundamental-react';
import { HelmReleaseStatus } from './HelmReleaseStatus';
import { OtherReleaseVersions } from './OtherReleaseVersions';
import { findRecentRelease } from './findRecentRelease';

function HelmReleasesDetails({ releaseName }) {
  const { t, i18n } = useTranslation();
  const { namespaceId: namespace } = useMicrofrontendContext();
  const breadcrumbItems = [
    { name: t('helm-releases.title'), path: '/' },
    { name: '' },
  ];

  const { data, loading } = useGetList(s => s.type === 'helm.sh/release.v1')(
    `/api/v1/namespaces/${namespace}/secrets?labelSelector=name==${releaseName}`,
  );

  if (loading) return <Spinner />;
  const releaseSecret = findRecentRelease(data || []);

  if (!releaseSecret) {
    return (
      <ResourceNotFound
        resource={prettifyNameSingular(undefined, t('helm-releases.title'))}
        breadcrumbs={breadcrumbItems}
        i18n={i18n}
      />
    );
  }

  return (
    <>
      <PageHeader title={releaseName} breadcrumbItems={breadcrumbItems}>
        {releaseSecret && (
          <>
            <PageHeader.Column title={t('secrets.name_singular')}>
              <Link
                className="fd-link"
                onClick={() =>
                  LuigiClient.linkManager()
                    .fromContext('namespace')
                    .navigate(`secrets/details/${releaseSecret.metadata.name}`)
                }
              >
                {releaseSecret.metadata.name}
              </Link>
            </PageHeader.Column>
            <PageHeader.Column title={t('helm-releases.headers.revision')}>
              {releaseSecret.metadata.labels.version}
            </PageHeader.Column>
            <PageHeader.Column title={t('common.headers.status')}>
              <HelmReleaseStatus
                status={releaseSecret.metadata.labels.status}
              />
            </PageHeader.Column>
          </>
        )}
      </PageHeader>
      <HelmReleaseData
        encodedRelease={releaseSecret.data.release}
        simpleHeader
      />
      <OtherReleaseVersions releaseSecret={releaseSecret} secrets={data} />
    </>
  );
}
export default HelmReleasesDetails;
