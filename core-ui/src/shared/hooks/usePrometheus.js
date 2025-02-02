import { useEffect, useState } from 'react';
import LuigiClient from '@luigi-project/client';

import { useGet, useMicrofrontendContext } from 'react-shared';

const getPrometheusSelector = data => {
  const selector = `cluster="", container!="", namespace="${data.namespace}"`;
  if (data.pod) {
    selector.concat(', ', `pod="${data.pod}"`);
  }
  return selector;
};

const getPrometheusCPUQuery = (type, data, step) => {
  if (type === 'cluster') {
    return `count(node_cpu_seconds_total{mode="idle"}) - sum(rate(node_cpu_seconds_total{mode="idle"}[${step}s]))`;
  } else if (type === 'pod') {
    return `sum(node_namespace_pod_container:container_cpu_usage_seconds_total:sum_rate{${getPrometheusSelector(
      data,
    )}})`;
  } else {
    return '';
  }
};

const getPrometheusMemoryQuery = (type, data) => {
  if (type === 'cluster') {
    return `sum(node_memory_MemTotal_bytes - node_memory_MemFree_bytes)`;
  } else if (type === 'pod') {
    return `sum(node_namespace_pod_container:container_cpu_usage_seconds_total:sum_rate{${getPrometheusSelector(
      data,
    )}})`;
  } else {
    return '';
  }
};

const getPrometheusNetworkReceivedQuery = (type, data, step) => {
  if (type === 'cluster') {
    return `sum(rate(node_network_receive_bytes_total{device!="lo"}[${step}s]))`;
  } else if (type === 'pod') {
    return `sum(irate(container_network_receive_bytes_total{${getPrometheusSelector(
      data,
    )}}[${step}s]))`;
  } else {
    return '';
  }
};

const getPrometheusNetworkTransmittedQuery = (type, data, step) => {
  if (type === 'cluster') {
    return `sum(rate(node_network_transmit_bytes_total{device!="lo"}[${step}s]))`;
  } else if (type === 'pod') {
    return `sum(irate(container_network_receive_bytes_total{${getPrometheusSelector(
      data,
    )}}[${step}s]))`;
  } else {
    return '';
  }
};

const getPrometheusNodesQuery = () => {
  return `sum(kubelet_node_name)`;
};

export function getMetric(type, metric, { step, ...data }) {
  const metrics = {
    cpu: {
      prometheusQuery: getPrometheusCPUQuery(type, data, step),
      unit: '',
    },
    memory: {
      prometheusQuery: getPrometheusMemoryQuery(type, data),
      binary: true,
      unit: 'B',
    },
    'network-down': {
      prometheusQuery: getPrometheusNetworkReceivedQuery(type, data, step),
      unit: 'B/s',
    },
    'network-up': {
      prometheusQuery: getPrometheusNetworkTransmittedQuery(type, data, step),
      unit: 'B/s',
    },
    nodes: {
      prometheusQuery: getPrometheusNodesQuery(),
      unit: '',
    },
  };
  return metrics[metric];
}

export function usePrometheus(type, metricId, { items, timeSpan, ...props }) {
  const { features } = useMicrofrontendContext();
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [step, setStep] = useState(timeSpan / items);

  let featurePath = features.PROMETHEUS?.config?.path;
  featurePath = featurePath?.startsWith('/')
    ? featurePath.substring(1)
    : featurePath;
  featurePath = featurePath?.endsWith('/')
    ? featurePath.substring(0, featurePath.length - 1)
    : featurePath;
  const kyma2_0path =
    'api/v1/namespaces/kyma-system/services/monitoring-prometheus:web/proxy/api/v1';
  const kyma2_1path =
    'api/v1/namespaces/kyma-system/services/monitoring-prometheus:http-web/proxy/api/v1';
  const [path, setPath] = useState(featurePath || kyma2_0path);

  const metric = getMetric(type, metricId, { step, ...props });

  const tick = () => {
    const newEndDate = new Date();
    const newStartDate = new Date();

    newEndDate.setTime(Date.now());
    newStartDate.setTime(newEndDate.getTime() - (timeSpan - 1) * 1000);
    setEndDate(newEndDate);
    setStartDate(newStartDate);

    setStep(timeSpan / items);
  };

  useEffect(() => {
    tick();
    const loop = setInterval(tick, step * 1000);
    return () => clearInterval(loop);
  }, [metricId, timeSpan]); // eslint-disable-line react-hooks/exhaustive-deps

  const query =
    `query_range?` +
    `start=${startDate.toISOString()}&` +
    `end=${endDate.toISOString()}&` +
    `step=${step}&` +
    `query=${metric.prometheusQuery}`;

  const onDataReceived = data => {
    if (data?.error) {
      if (path !== kyma2_0path && path !== kyma2_1path) {
        LuigiClient.sendCustomMessage({
          id: 'busola.setPrometheusPath',
          path: kyma2_0path,
        });
        setPath(kyma2_0path);
      } else if (path === kyma2_0path) {
        LuigiClient.sendCustomMessage({
          id: 'busola.setPrometheusPath',
          path: kyma2_1path,
        });
        setPath(kyma2_1path);
      }
    }
  };

  let { data, error, loading } = useGet(`/${path}/${query}`, {
    pollingInterval: 0,
    onDataReceived: data => onDataReceived(data),
  });

  if (data) {
    error = null;
  }

  let stepMultiplier = 0;
  let helpIndex = 0;
  const dataValues = data?.data.result[0]?.values;
  let prometheusData = [];

  if (dataValues?.length > 0) {
    for (let i = 0; i < items; i++) {
      const [timestamp, graphValue] = dataValues[helpIndex] || [];
      const timeDifference = Math.floor(timestamp - startDate.getTime() / 1000);
      if (stepMultiplier === timeDifference) {
        helpIndex++;
        prometheusData.push(graphValue);
      } else {
        prometheusData.push(null);
      }
      stepMultiplier += step;
    }
  }

  return {
    data: prometheusData,
    error,
    loading,
    step,
    binary: metric.binary,
    unit: metric.unit,
    startDate,
    endDate,
  };
}
