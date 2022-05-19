import React from 'react';
import { LayoutPanel } from 'fundamental-react';
import { TransTitle } from '@ui-schema/ui-schema/Translate/TransTitle';

export function CardRenderer({ schema, storeKeys, widgets, ownKey, ...props }) {
  const { WidgetRenderer } = widgets;
  const ownSchema = schema.delete('widget');

  return (
    <LayoutPanel className="fd-margin--md">
      <LayoutPanel.Header>
        <LayoutPanel.Head
          title={
            <TransTitle schema={schema} storeKeys={storeKeys} ownKey={ownKey} />
          }
        />
      </LayoutPanel.Header>
      <WidgetRenderer
        {...props}
        storeKeys={storeKeys}
        schema={ownSchema}
        widgets={widgets}
      />
    </LayoutPanel>
  );
}
