import React from 'react';
import { useTranslation } from 'react-i18next';
import { Tokens } from 'shared/components/Tokens';
import { LayoutPanel } from 'fundamental-react';
import { NetworkPolicyPorts } from './Ports';
import { NetworkPolicyPeers } from './Peers';
import { Selector } from 'shared/components/Selector/Selector';
import { ResourceDetails } from 'react-shared';
import { NetworkPoliciesCreate } from '../../Create/NetworkPolicies/NetworkPolicies.create';

function NetworkPoliciesDetails(props) {
  const { t } = useTranslation();

  const customColumns = [
    {
      header: t('network-policies.headers.policy-types'),
      value: ({ spec }) => <Tokens tokens={spec.policyTypes || []} />,
    },
  ];

  const Ingresses = ({ spec }) => {
    if (!spec.ingress?.length) return null;

    return spec.ingress.map((ingress, idx) => (
      <LayoutPanel className="fd-margin--md" key={idx}>
        <LayoutPanel.Header>
          <LayoutPanel.Head
            title={t('network-policies.headers.ingress') + ` #${idx + 1}`}
          />
        </LayoutPanel.Header>
        <NetworkPolicyPeers
          peers={ingress.from}
          title={t('network-policies.headers.policy-peer')}
        />
        <NetworkPolicyPorts
          ports={ingress.ports}
          title={t('network-policies.headers.policy-port')}
        />
      </LayoutPanel>
    ));
  };

  const Egresses = ({ spec }) => {
    if (!spec.egress?.length) return null;

    return spec.egress.map((egress, idx) => (
      <LayoutPanel className="fd-margin--md" key={idx}>
        <LayoutPanel.Header>
          <LayoutPanel.Head
            title={t('network-policies.headers.egress') + ` #${idx + 1}`}
          />
        </LayoutPanel.Header>
        <NetworkPolicyPeers
          peers={egress.to}
          title={t('network-policies.headers.policy-peer')}
        />
        <NetworkPolicyPorts
          ports={egress.ports}
          title={t('network-policies.headers.policy-port')}
        />
      </LayoutPanel>
    ));
  };

  const PodSelector = policy => {
    const { t } = useTranslation();

    return (
      <Selector
        namespace={policy.metadata.namespace}
        labels={policy.spec.podSelector?.matchLabels}
        expressions={policy.spec.podSelector?.matchExpressions}
        title={t('network-policies.headers.pod-selector')}
        selector={policy.spec.podSelector}
      />
    );
  };

  const customComponents = [Ingresses, Egresses, PodSelector];

  return (
    <ResourceDetails
      customColumns={customColumns}
      customComponents={customComponents}
      createResourceForm={NetworkPoliciesCreate}
      {...props}
    />
  );
}

export default NetworkPoliciesDetails;
