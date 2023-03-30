import { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { last, mapValues } from 'lodash';

import { jsonataWrapper } from '../helpers/jsonataWrapper';
import { DebugContext } from '../debugger/useDebugger';
import {
  Resource,
  DataSourcesContextType,
  DataSourcesContext,
} from '../contexts/DataSources';

type JsonataValue = [string, Error | null];

type JsonataFunction = {
  (
    query: string,
    extras: { [key: string]: any },
    defaultValue: any,
  ): JsonataValue;
  async: (
    query: string,
    extras: { [key: string]: any },
    defaultValue: any,
  ) => Promise<JsonataValue>;
};

function getDataSourceFetchers(
  resource: Resource,
  { dataSources, store, requestRelatedResource }: DataSourcesContextType,
) {
  return mapValues(dataSources, (_, id) => ({
    fetcher: () => requestRelatedResource(resource, id),
    value: () => {
      requestRelatedResource(resource, id);
      return store?.[id]?.data;
    },
  }));
}

export function useJsonata({
  resource,
  scope,
  arrayItems,
}: {
  resource: Resource;
  scope: any;
  arrayItems: any[];
}): JsonataFunction {
  const { t } = useTranslation();
  const dataSourcesContext = useContext(DataSourcesContext);
  const debug = useContext(DebugContext);

  const [debugId] = useState(() => crypto.randomUUID());
  debug.init(debugId, { resource, scope, arrayItems });

  const [dataSourceFetchers, setDataSourceFetchers] = useState(
    getDataSourceFetchers(resource, dataSourcesContext),
  );

  useEffect(() => {
    const dataSourceFetchers = getDataSourceFetchers(
      resource,
      dataSourcesContext,
    );
    setDataSourceFetchers(dataSourceFetchers);
  }, [dataSourcesContext.store]); // eslint-disable-line react-hooks/exhaustive-deps

  const jsonata: JsonataFunction = (
    query,
    extras = {},
    defaultValue = null,
  ) => {
    debug.setQuery(debugId, extras.datapoint, {
      query,
      defaultValue,
      extras,
    });

    if (!query) {
      debug.updateQuery(debugId, extras.datapoint, {
        value: defaultValue,
        error: null,
      });
      return [defaultValue, null];
    }
    const localScope = extras.scope || scope || extras.resource || resource;
    const vars = {
      root: extras.resource || resource,
      items: extras?.arrayItems || arrayItems,
      item:
        last(extras?.arrayItems) ||
        last(arrayItems) ||
        extras.resource ||
        resource,
      ...extras,
    };
    debug.updateQuery(debugId, extras.datapoint, {
      scope: localScope,
      dataSources: dataSourceFetchers,
      vars,
    });

    try {
      const value = jsonataWrapper(query).evaluate(localScope, {
        ...mapValues(dataSourceFetchers, dsf => dsf.value),
        ...vars,
      });
      debug.updateQuery(debugId, extras.datapoint, {
        value,
        error: null,
      });
      return [value, null];
    } catch (e) {
      debug.updateQuery(debugId, extras.datapoint, {
        value: null,
        error: e,
      });
      return [
        t('extensibility.configuration-error', { error: (e as Error).message }),
        e as Error,
      ];
    }
  };

  jsonata.async = (query, extras = {}, defaultValue = null) => {
    if (!query) {
      return Promise.resolve([defaultValue, null]);
    }

    const localScope = extras.scope || scope || extras.resource || resource;
    const vars = {
      root: extras.resource || resource,
      items: extras?.arrayItems || arrayItems,
      item:
        last(extras?.arrayItems) ||
        last(arrayItems) ||
        extras.resource ||
        resource,
      ...extras,
    };
    debug.updateQuery(debugId, extras.datapoint, {
      scope: localScope,
      dataSources: dataSourceFetchers,
      vars,
    });

    return new Promise(resolve =>
      jsonataWrapper(query).evaluate(
        localScope,
        {
          ...mapValues(dataSourceFetchers, dsf => dsf.fetcher),
          ...vars,
        },
        (err, val) => {
          if (err) {
            debug.updateQuery(debugId, extras.datapoint, {
              value: null,
              error: err,
            });
            resolve([
              t('extensibility.configuration-error', { error: err.message }),
              err,
            ]);
          } else {
            debug.updateQuery(debugId, extras.datapoint, {
              value: val,
              error: null,
            });
            resolve([val, null]);
          }
        },
      ),
    );
  };

  return jsonata;
}
