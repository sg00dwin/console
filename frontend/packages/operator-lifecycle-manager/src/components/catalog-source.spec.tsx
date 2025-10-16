import * as React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { safeLoad } from 'js-yaml';
import * as _ from 'lodash';
import * as Router from 'react-router-dom-v5-compat';
import { DetailsPage } from '@console/internal/components/factory';
import { useK8sWatchResource } from '@console/internal/components/utils/k8s-watch-hook';
import { referenceForModel } from '@console/internal/module/k8s';
import { testCatalogSource, testPackageManifest, dummyPackageManifest } from '../../mocks';
import {
  SubscriptionModel,
  CatalogSourceModel,
  PackageManifestModel,
  OperatorGroupModel,
} from '../models';
import {
  CatalogSourceDetails,
  CatalogSourceDetailsPage,
  CreateSubscriptionYAML,
  CatalogSourceOperatorsPage,
} from './catalog-source';

jest.mock('@console/internal/components/utils/k8s-watch-hook', () => ({
  useK8sWatchResource: jest.fn(),
}));

// Mock Redux hooks to avoid Provider errors
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn((selector) => selector({ k8s: { getIn: () => null } })),
  useDispatch: jest.fn(() => jest.fn()),
}));

// Mock requireOperatorGroup to pass through the component without wrapping
jest.mock('./operator-group', () => ({
  requireOperatorGroup: (Component) => Component,
}));

jest.mock('react-router-dom-v5-compat', () => ({
  ...jest.requireActual('react-router-dom-v5-compat'),
  useParams: jest.fn(),
  useLocation: jest.fn(),
}));

// Mock DetailsPage to simplify testing
jest.mock('@console/internal/components/factory');

// Mock Firehose and other utils components to simplify testing
// Note: We use inline mock here (not __mocks__) because the utils module is large
// and has many exports used throughout the codebase. Spreading ...actual preserves
// all real exports while allowing us to override specific components.
jest.mock('@console/internal/components/utils', () => {
  // eslint-disable-next-line @typescript-eslint/no-shadow, @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires, global-require
  const ReactRuntime = require('react');
  const actual = jest.requireActual('@console/internal/components/utils');
  return {
    ...actual,
    Firehose: jest.fn(({ resources, children }) => {
      // Create props object from resources - each resource becomes a prop
      const props = {};
      if (resources) {
        resources.forEach((resource) => {
          props[resource.prop] = { loaded: false, data: null };
        });
      }
      // Clone React element children and inject props, or call function children
      const childrenWithProps =
        typeof children === 'function'
          ? children(props)
          : ReactRuntime.isValidElement(children)
          ? ReactRuntime.cloneElement(children, props)
          : children;

      return ReactRuntime.createElement(
        'div',
        { 'data-testid': 'firehose' },
        ReactRuntime.createElement(
          'div',
          { 'data-testid': 'firehose-resources' },
          JSON.stringify(resources),
        ),
        childrenWithProps,
      );
    }),
    LoadingBox: () => {
      return ReactRuntime.createElement('div', { 'data-testid': 'loading-box' }, 'Loading...');
    },
    DetailsItem: ({ obj, label }) => {
      return ReactRuntime.createElement(
        'div',
        { 'data-testid': `details-item-${label}` },
        `${label}: ${JSON.stringify(obj)}`,
      );
    },
    ResourceSummary: ({ resource }) => {
      return ReactRuntime.createElement(
        'div',
        { 'data-testid': 'resource-summary' },
        ReactRuntime.createElement('div', null, resource?.spec?.displayName || ''),
        ReactRuntime.createElement('div', null, resource?.spec?.publisher || ''),
      );
    },
  };
});

// Mock ErrorBoundary and withFallback
jest.mock('@console/shared/src/components/error');

// Mock CreateYAML
jest.mock('@console/internal/components/create-yaml');

describe('CatalogSourceDetails', () => {
  let obj;

  beforeEach(() => {
    obj = _.cloneDeep(testCatalogSource);
  });

  it('renders name and publisher of the catalog', () => {
    render(<CatalogSourceDetails obj={obj} packageManifests={[testPackageManifest]} />);

    expect(screen.getByText(obj.spec.displayName)).toBeInTheDocument();
    expect(screen.getByText(obj.spec.publisher)).toBeInTheDocument();
  });
});

describe('CatalogSourceDetailsPage', () => {
  beforeEach(() => {
    (useK8sWatchResource as jest.Mock).mockReturnValue([dummyPackageManifest, true, null]);
    jest.spyOn(Router, 'useParams').mockReturnValue({ ns: 'default', name: 'some-catalog' });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders DetailsPage with correct props', async () => {
    render(<CatalogSourceDetailsPage />);

    await waitFor(() => {
      expect(screen.getByTestId('details-page')).toBeInTheDocument();
    });

    // Verify kind
    const kindElement = screen.getByTestId('details-page-kind');
    expect(kindElement).toHaveTextContent(referenceForModel(CatalogSourceModel));

    // Verify pages
    const pagesElement = screen.getByTestId('details-page-pages');
    const pages = JSON.parse(pagesElement.textContent);
    expect(pages).toHaveLength(3);
    expect(pages[0]).toEqual('public~Details');
    expect(pages[1]).toEqual('public~YAML');
    expect(pages[2]).toEqual('olm~Operators');

    // Verify resources
    const resourcesElement = screen.getByTestId('details-page-resources');
    const resources = JSON.parse(resourcesElement.textContent);
    expect(resources).toEqual([
      {
        kind: referenceForModel(PackageManifestModel),
        isList: true,
        prop: 'packageManifests',
        namespace: 'default',
      },
    ]);
  });

  it('passes correct page components', () => {
    const mockDetailsPage = DetailsPage as jest.Mock;
    render(<CatalogSourceDetailsPage />);

    expect(mockDetailsPage).toHaveBeenCalled();
    const callArgs = mockDetailsPage.mock.calls[0][0];

    expect(callArgs.pages[0].component).toEqual(CatalogSourceDetails);
    expect(callArgs.pages[2].component).toEqual(CatalogSourceOperatorsPage);
  });
});

describe('CreateSubscriptionYAML', () => {
  // Helper to mock Firehose with packageManifest data
  const mockFirehoseWithPackageManifest = (packageManifestData: any) => {
    /* eslint-disable @typescript-eslint/no-shadow, @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires, global-require */
    const utils = require('@console/internal/components/utils');
    const React = require('react');
    /* eslint-enable @typescript-eslint/no-shadow, @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires, global-require */
    const MockFirehose = utils.Firehose as jest.Mock;
    MockFirehose.mockImplementationOnce(({ children }: any) => {
      return React.isValidElement(children)
        ? React.cloneElement(children, { packageManifest: packageManifestData })
        : children({ packageManifest: packageManifestData });
    });
  };

  beforeEach(() => {
    jest
      .spyOn(Router, 'useParams')
      .mockReturnValue({ ns: 'default', pkgName: testPackageManifest.metadata.name });
    jest.spyOn(Router, 'useLocation').mockReturnValue({
      ...window.location,
      search: `?pkg=${testPackageManifest.metadata.name}&catalog=ocs&catalogNamespace=default`,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders a Firehose for the PackageManifest specified in the URL', () => {
    render(<CreateSubscriptionYAML />);

    const firehoseResources = screen.getByTestId('firehose-resources');
    const resources = JSON.parse(firehoseResources.textContent);

    expect(resources).toEqual([
      {
        kind: referenceForModel(PackageManifestModel),
        isList: false,
        name: testPackageManifest.metadata.name,
        namespace: 'default',
        prop: 'packageManifest',
      },
      {
        kind: referenceForModel(OperatorGroupModel),
        isList: true,
        namespace: 'default',
        prop: 'operatorGroup',
      },
    ]);
  });

  it('renders YAML editor component wrapped by an error boundary component', () => {
    mockFirehoseWithPackageManifest({ loaded: true, data: testPackageManifest });

    render(<CreateSubscriptionYAML />);

    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    expect(screen.getByTestId('create-yaml')).toBeInTheDocument();
  });

  it('passes example YAML templates using the package default channel', () => {
    mockFirehoseWithPackageManifest({ loaded: true, data: testPackageManifest });

    render(<CreateSubscriptionYAML />);

    const templateElement = screen.getByTestId('create-yaml-template');
    const subTemplate = safeLoad(templateElement.textContent);

    expect(subTemplate.kind).toContain(SubscriptionModel.kind);
    expect(subTemplate.spec.name).toEqual(testPackageManifest.metadata.name);
    expect(subTemplate.spec.channel).toEqual(testPackageManifest.status.channels[0].name);
    expect(subTemplate.spec.startingCSV).toEqual(testPackageManifest.status.channels[0].currentCSV);
    expect(subTemplate.spec.source).toEqual('ocs');
  });

  it('does not render YAML editor component if PackageManifest has not loaded yet', () => {
    mockFirehoseWithPackageManifest({ loaded: false });

    render(<CreateSubscriptionYAML />);

    expect(screen.queryByTestId('create-yaml')).not.toBeInTheDocument();
    expect(screen.getByTestId('loading-box')).toBeInTheDocument();
  });
});
