import * as React from 'react';

// eslint-disable-next-line react/prop-types
const ErrorBoundary: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return React.createElement('div', { 'data-testid': 'error-boundary' }, children);
};

const withFallback = <P extends object>(Component: React.ComponentType<P>) => {
  return (props: P) => {
    return React.createElement(ErrorBoundary, null, React.createElement(Component, props));
  };
};

export { ErrorBoundary as default };
export { withFallback };
