import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { isEmpty } from 'lodash';
import { useTranslation } from 'react-i18next';

import { createStore } from '@ui-schema/ui-schema';
import { createOrderedMap } from '@ui-schema/ui-schema/Utils/createMap';
import { UIMetaProvider } from '@ui-schema/ui-schema/UIMeta';
import { UIStoreProvider, storeUpdater } from '@ui-schema/ui-schema';
import { injectPluginStack } from '@ui-schema/ui-schema/applyPluginStack';

import widgets from './components-form';
import { prepareSchemaRules } from './SchemaRulesInjector';

function FormContainer({ children }) {
  return (
    <div className="form-container" container="true">
      {children}
    </div>
  );
}

const FormStack = injectPluginStack(FormContainer);

export function ResourceSchema({
  advanced,
  resource,
  schema,
  schemaRules = [],
  path,
  // store,
  // setStore,
  ...extraParams
}) {
  const [store, setStore] = useState(() =>
    createStore(createOrderedMap(resource)),
  );
  // console.log('ResourceSchema', { advanced });
  // useEffect(() => console.log('store changed'), [store]);
  // useEffect(() => console.log('resource changed'), [resource]);
  // useEffect(() => console.log('schema changed'), [schema]);
  // useEffect(() => console.log('schema rules changed'), [schemaRules]);
  // useEffect(() => console.log('path changed'), [path]);
  const onChange = useCallback(
    actions => {
      console.log('onChange', actions);
      setStore(prevStore => storeUpdater(actions)(prevStore));
    },
    [setStore],
  );

  const uiWidgets = React.useMemo(() => widgets, [widgets]);
  const uiStore = React.useMemo(() => store, [store]);

  const translationBundle = path || 'extensibility';
  const { t } = useTranslation([translationBundle]); //doesn't always work, add `translationBundle.` at the beggining of a path

  const fullSchemaRules = [
    { path: 'metadata.name', simple: true },
    { path: 'metadata.labels' },
    { path: 'metadata.annotations' },
    ...(Array.isArray(schemaRules) ? schemaRules : []),
  ];
  const simpleRules = fullSchemaRules.filter(item => item.simple ?? false);
  const advancedRules = fullSchemaRules.filter(item => item.advanced ?? true);

  const myRules = advanced ? advancedRules : simpleRules;
  // const preparedRules = prepareSchemaRules(myRules);
  // const preparedRules = React.useMemo(() => prepareSchemaRules(myRules), [
  // myRules,
  // ]);

  let newSchema = schema;
  delete newSchema.properties.metadata;
  const schemaMap = React.useMemo(() => createOrderedMap(schema), [newSchema]);

  if (isEmpty(schema)) return null;

  // newSchema = {
  //   ...newSchema,
  //   properties: { ...newSchema.properties },
  // };

  // const schemaMap = createOrderedMap(newSchema);
  return (
    <UIMetaProvider
      widgets={uiWidgets}
      // t={(path, ...props) => t(`${translationBundle}::${path}`, ...props)}
    >
      <UIStoreProvider
        store={uiStore}
        showValidity={true}
        onChange={onChange}
        // schemaRules={preparedRules}
      >
        {/* <FormStack isRoot schema={schemaMap} resource={resource} /> */}
        <FormStack isRoot schema={schemaMap} />
      </UIStoreProvider>
    </UIMetaProvider>
  );
}
