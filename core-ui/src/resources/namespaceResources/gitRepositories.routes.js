import React from 'react';
import { createResourceRoutes } from '../createResourceRoutes';

const List = React.lazy(() =>
  import('../../components/Predefined/List/GitRepository/GitRepositories.list'),
);
const Details = React.lazy(() =>
  import('../../components/Predefined/Details/GitRepositories.details'),
);

export default createResourceRoutes({
  List,
  Details,
  resourceType: 'GitRepositories',
  namespaced: true,
});
