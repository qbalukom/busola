import React from 'react';
import { useUIStore } from '@ui-schema/ui-schema';
import { prettifyNamePlural } from 'shared/utils/helpers';
import { LayoutPanel } from 'fundamental-react';
import { TransTitle } from '@ui-schema/ui-schema/Translate/TransTitle';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';

export function PanelRenderer({ schema, storeKeys, ownKey }) {
  const { store } = useUIStore();

  const { value } = store?.extractValues(storeKeys) || {};
  if (!value) return null;
  const obj = Object.fromEntries([...value]);
  const entries = Object.entries(obj);

  return (
    <LayoutPanel className="fd-margin--md">
      <LayoutPanel.Header>
        <LayoutPanel.Head
          title={
            <TransTitle schema={schema} storeKeys={storeKeys} ownKey={ownKey} />
          }
        />
      </LayoutPanel.Header>
      <LayoutPanel.Body>
        {entries.map(([key, value]) => (
          <LayoutPanelRow
            key={key}
            name={prettifyNamePlural(key)} //using TransTitle throws error
            value={value}
          />
        ))}
      </LayoutPanel.Body>
    </LayoutPanel>
  );
}
