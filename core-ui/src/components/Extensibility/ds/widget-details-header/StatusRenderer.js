import React from 'react';
import { useUIStore } from '@ui-schema/ui-schema';

import { StatusBadge } from 'shared/components/StatusBadge/StatusBadge';

export function StatusRenderer({ storeKeys, schema, schemaKeys, ...props }) {
  const { store } = useUIStore();
  const { value } = store?.extractValues(storeKeys) || {};

  if (!value) return null;

  const obj = Object.fromEntries([...value.get('APIRuleStatus')]);

  const resolveStatus = statusCode => {
    switch (statusCode) {
      case 'OK':
        return 'success';
      case 'SKIPPED':
        return 'warning';
      case 'ERROR':
        return 'error';
      default:
        return undefined;
    }
  };

  return (
    <StatusBadge type={resolveStatus(obj?.code)} additionalContent={obj?.desc}>
      {obj?.code}
    </StatusBadge>
  );
}
