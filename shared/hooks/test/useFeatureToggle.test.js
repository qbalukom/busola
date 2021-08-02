import React from 'react';
import { render } from '@testing-library/react';
import { getFeatureToggle, useFeatureToggle } from '../useFeatureToggle.js';

let mockToggles = [];
jest.mock('@luigi-project/client', () => ({
  getActiveFeatureToggles: () => mockToggles,
}));

function TestComponent() {
  const value = useFeatureToggle('firstFeature');
  return <p data-testid="value">{value.toString()}</p>;
}

describe('useShowHiddenNamespaces', () => {
  it('Changes returned value during re-renders', () => {
    const { queryByTestId, rerender } = render(<TestComponent />);
    expect(queryByTestId('value')).toHaveTextContent('false');

    mockToggles = ['firstFeature'];

    rerender(<TestComponent />);
    expect(queryByTestId('value')).toHaveTextContent('true');

    mockToggles = ['anotherFeature'];

    rerender(<TestComponent />);
    expect(queryByTestId('value')).toHaveTextContent('false');
  });
});
