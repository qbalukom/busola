import React, { useState } from 'react';
import { useMicrofrontendContext } from 'react-shared';
import { useTranslation } from 'react-i18next';
import { ResourceForm } from 'shared/ResourceForm';
import { createNetworkPolicyTemplate } from './templates';
import { matchBySelector } from 'shared-repo';

function NetworkPoliciesCreate({
  formElementRef,
  onChange,
  setCustomValid,
  resourceUrl,
}) {
  const { namespaceId } = useMicrofrontendContext();
  const [networkPolicy, setNetworkPolicy] = useState(
    createNetworkPolicyTemplate(namespaceId),
  );
  const { t } = useTranslation();

  return (
    <ResourceForm
      pluralKind="networkpolicies"
      singularName={t('network-policies.name_singular')}
      resource={networkPolicy}
      setResource={setNetworkPolicy}
      onlyYaml
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={resourceUrl}
      setCustomValid={setCustomValid}
    />
  );
}
NetworkPoliciesCreate.resourceGraphConfig = (t, context) => ({
  networkFlowKind: true,
  networkFlowLevel: -1,
  relations: [
    {
      kind: 'Pod',
    },
  ],
  matchers: {
    Pod: (policy, pod) =>
      matchBySelector(policy.spec.podSelector.matchLabels, pod.metadata.labels),
  },
});
export { NetworkPoliciesCreate };
