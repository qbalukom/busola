import { NavNode } from '../../types';

export const hasCurrentScope = (
  scope: 'cluster' | 'namespace',
  navNode: NavNode,
): boolean => {
  const isNamespace = scope === 'namespace';
  const isCluster = scope === 'cluster';

  if (navNode.scope) {
    if (scope === 'cluster') {
      return navNode.scope !== 'namespace';
    }
    if (scope === 'namespace') {
      return navNode.scope !== 'cluster';
    }
  }

  if (isNamespace) {
    return navNode.namespaced;
  }
  if (isCluster) {
    return !navNode.namespaced;
  }
  return false;
};
