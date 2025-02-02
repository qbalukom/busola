import React from 'react';

import { useTranslation } from 'react-i18next';

import {
  CopiableApiRuleHost,
  ApiRuleServiceInfo,
} from 'components/ApiRules/components';
import ApiRuleStatus from 'components/ApiRules/ApiRuleStatus/ApiRuleStatus';
import AccessStrategies from 'components/ApiRules/AccessStrategies/AccessStrategies';
import ApiRuleServices from './Services';
import { ResourceDetails } from 'react-shared';
import { APIRulesCreate } from '../../Create/ApiRules/ApiRules.create';

const ApiRulesDetails = props => {
  const { t } = useTranslation();

  const customColumns = [
    {
      header: t('api-rules.list.headers.status'),
      value: resource => <ApiRuleStatus apiRule={resource} />,
    },
    {
      header: t('api-rules.list.headers.service-name'),
      value: resource => <ApiRuleServiceInfo apiRule={resource} />,
    },
    {
      header: t('api-rules.list.headers.host'),
      value: resource => <CopiableApiRuleHost apiRule={resource} />,
    },
  ];

  const ApiRulesAccessStrategies = (resource, resourceUrl) => {
    return (
      <AccessStrategies
        key={`access-strategies-${resource?.metadata.name}`}
        strategies={resource?.spec?.rules || []}
      />
    );
  };

  return (
    <ResourceDetails
      customColumns={customColumns}
      customComponents={[ApiRulesAccessStrategies, ApiRuleServices]}
      createResourceForm={APIRulesCreate}
      {...props}
    />
  );
};
export default ApiRulesDetails;
