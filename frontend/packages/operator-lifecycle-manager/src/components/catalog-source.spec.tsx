import * as React from 'react';
import { screen } from '@testing-library/react';
import * as _ from 'lodash';
import * as Router from 'react-router-dom-v5-compat';
import { referenceForModel } from '@console/internal/module/k8s';
import { renderWithProviders } from '@console/shared/src/test-utils/unit-test-utils';
import { testCatalogSource, testPackageManifest, dummyPackageManifest } from '../../mocks';
import { CatalogSourceModel, PackageManifestModel } from '../models';
// eslint-disable-next-line import/order, prettier/prettier
import { CatalogSourceDetails, CatalogSourceDetailsPage, CatalogSourceOperatorsPage, CreateSubscriptionYAML } from './catalog-source';

jest.mock('@console/internal/components/utils/k8s-watch-hook', () => ({
  useK8sWatchResource: jest.fn(),
}));

jest.mock('react-router-dom-v5-compat', () => ({
  ...jest.requireActual('react-router-dom-v5-compat'),
  useParams: jest.fn(),
  useLocation: jest.fn(),
}));

jest.mock('@console/internal/components/utils', () => ({
  ...jest.requireActual('@console/internal/components/utils'),
  Firehose: jest.fn((props) => props.children),
  LoadingBox: jest.fn(() => 'Loading...'),
  ResourceSummary: jest.fn(() => null),
  SectionHeading: jest.fn(() => null),
}));

jest.mock('@console/internal/components/factory', () => ({
  ...jest.requireActual('@console/internal/components/factory'),
  DetailsPage: jest.fn(() => null),
}));

jest.mock('@console/internal/components/create-yaml', () => ({
  CreateYAML: jest.fn(({ template }) => template),
}));

jest.mock('@console/shared/src/components/error', () => ({
  ErrorBoundary: jest.fn((props) => props.children),
  withFallback: jest.fn((component) => component),
}));

jest.mock('../utils/useOperatorHubConfig', () => ({
  __esModule: true,
  default: jest.fn(() => [null, true, null]),
}));

jest.mock('./operator-group', () => ({
  requireOperatorGroup: jest.fn((component) => component),
}));

jest.mock('./package-manifest', () => ({
  PackageManifestsPage: jest.fn(() => null),
}));

jest.mock('@console/shared/src/components/layout/PaneBody', () => ({
  __esModule: true,
  default: jest.fn((props) => props.children),
}));

jest.mock('@patternfly/react-core', () => ({
  ...jest.requireActual('@patternfly/react-core'),
  Grid: jest.fn((props) => props.children),
  GridItem: jest.fn((props) => props.children),
  DescriptionList: jest.fn((props) => props.children),
}));

// Import mocked components after jest.mock declarations
/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires */
const { DetailsPage } = require('@console/internal/components/factory');
const { Firehose } = require('@console/internal/components/utils');
const { useK8sWatchResource } = require('@console/internal/components/utils/k8s-watch-hook');
/* eslint-enable @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires */

const mockDetailsPage = DetailsPage as jest.Mock;
const mockFirehose = Firehose as jest.Mock;
const mockUseK8sWatchResource = useK8sWatchResource as jest.Mock;

describe(CatalogSourceDetails.displayName, () => {
  let obj;

  beforeEach(() => {
    jest.clearAllMocks();
    obj = _.cloneDeep(testCatalogSource);
  });

  it('displays catalog source name and publisher', () => {
    const { getByText } = renderWithProviders(
      <CatalogSourceDetails obj={obj} packageManifests={[testPackageManifest]} />,
    );

    expect(getByText(obj.spec.displayName)).toBeVisible();
    expect(getByText(obj.spec.publisher)).toBeVisible();
  });
});

describe(CatalogSourceDetailsPage.displayName, () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseK8sWatchResource.mockReturnValue([dummyPackageManifest, true, null]);
    jest.spyOn(Router, 'useParams').mockReturnValue({ ns: 'default', name: 'some-catalog' });
  });

  it('renders catalog source details page without errors', () => {
    // Verifies the page renders successfully
    expect(() => {
      renderWithProviders(<CatalogSourceDetailsPage />);
    }).not.toThrow();
  });

  it('configures DetailsPage with correct navigation and resources', () => {
    renderWithProviders(<CatalogSourceDetailsPage />);

    expect(mockDetailsPage).toHaveBeenCalledTimes(1);
    const [detailsPageProps] = mockDetailsPage.mock.calls[0];

    expect(detailsPageProps.kind).toEqual(referenceForModel(CatalogSourceModel));

    expect(detailsPageProps.pages).toHaveLength(3);
    expect(detailsPageProps.pages[0]).toMatchObject({
      nameKey: 'public~Details',
      component: CatalogSourceDetails,
    });
    expect(detailsPageProps.pages[1]).toMatchObject({
      nameKey: 'public~YAML',
    });
    expect(detailsPageProps.pages[2]).toMatchObject({
      nameKey: 'olm~Operators',
      component: CatalogSourceOperatorsPage,
    });

    expect(detailsPageProps.resources).toEqual([
      {
        kind: referenceForModel(PackageManifestModel),
        isList: true,
        prop: 'packageManifests',
        namespace: 'default',
      },
    ]);
  });
});

describe(CreateSubscriptionYAML.displayName, () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest
      .spyOn(Router, 'useParams')
      .mockReturnValue({ ns: 'default', pkgName: testPackageManifest.metadata.name });
    jest.spyOn(Router, 'useLocation').mockReturnValue({
      ...window.location,
      search: `?pkg=${testPackageManifest.metadata.name}&catalog=ocs&catalogNamespace=default`,
    });
  });

  it('displays package name in the subscription YAML when loaded', () => {
    mockFirehose.mockImplementationOnce((firehoseProps) => {
      const childElement = firehoseProps.children;
      return React.cloneElement(childElement, {
        packageManifest: { loaded: true, data: testPackageManifest },
        operatorGroup: { loaded: true, data: [] },
      });
    });

    renderWithProviders(<CreateSubscriptionYAML />);

    expect(screen.getByText(new RegExp(testPackageManifest.metadata.name))).toBeInTheDocument();
  });

  it('displays loading indicator when package manifest is not yet loaded', () => {
    // Mock Firehose to pass unloaded data
    mockFirehose.mockImplementationOnce((firehoseProps) => {
      const childElement = firehoseProps.children;
      return React.cloneElement(childElement, {
        packageManifest: { loaded: false },
        operatorGroup: { loaded: false },
      });
    });

    renderWithProviders(<CreateSubscriptionYAML />);

    expect(screen.getByText('Loading...')).toBeVisible();
  });

  it('displays subscription YAML with default channel information', () => {
    mockFirehose.mockImplementationOnce((firehoseProps) => {
      const childElement = firehoseProps.children;
      return React.cloneElement(childElement, {
        packageManifest: { loaded: true, data: testPackageManifest },
        operatorGroup: { loaded: true, data: [] },
      });
    });

    renderWithProviders(<CreateSubscriptionYAML />);

    expect(screen.getByText(/channel:\s*alpha/)).toBeInTheDocument();
    expect(screen.getByText(/source:\s*ocs/)).toBeInTheDocument();
    expect(screen.getByText(/startingCSV:\s*testapp/)).toBeInTheDocument();
  });
});
