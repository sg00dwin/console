import { screen, waitFor, fireEvent } from '@testing-library/react';
import * as _ from 'lodash';
import { renderWithProviders } from '@console/shared/src/test-utils/unit-test-utils';
import { testSubscription, testPackageManifest } from '../../../mocks';
import { SubscriptionModel } from '../../models';
import { SubscriptionKind, PackageManifestKind } from '../../types';
import { SubscriptionChannelModal } from './subscription-channel-modal';

/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires, global-require */
jest.mock('@console/internal/components/factory/modal', () => {
  const React = require('react');
  return {
    ModalTitle: jest.fn(({ children }) =>
      React.createElement('div', { 'data-test': 'modal-title' }, children),
    ),
    ModalBody: jest.fn(({ children }) =>
      React.createElement('div', { 'data-test': 'modal-body' }, children),
    ),
    ModalSubmitFooter: jest.fn((props) =>
      React.createElement(
        'div',
        { 'data-test': 'modal-submit-footer' },
        React.createElement(
          'button',
          { type: 'submit', 'data-test': 'submit-button' },
          props.submitText,
        ),
      ),
    ),
    createModalLauncher: jest.fn((component) => component),
  };
});

jest.mock('@console/internal/components/utils', () => {
  const React = require('react');
  return {
    ResourceLink: jest.fn(({ children }) =>
      React.createElement('div', { 'data-test': 'resource-link' }, children),
    ),
  };
});
/* eslint-enable @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires, global-require */

jest.mock('../deprecated-operator-warnings/deprecated-operator-warnings', () => ({
  DeprecatedOperatorWarningIcon: jest.fn(() => null),
}));

describe('SubscriptionChannelModal', () => {
  let k8sUpdate: jest.Mock;
  let close: jest.Mock;
  let cancel: jest.Mock;
  let subscription: SubscriptionKind;
  let pkg: PackageManifestKind;

  beforeEach(() => {
    k8sUpdate = jest.fn().mockResolvedValue({});
    close = jest.fn();
    cancel = jest.fn();
    subscription = _.cloneDeep(testSubscription);
    pkg = _.cloneDeep(testPackageManifest);
    pkg.status.defaultChannel = 'stable';
    pkg.status.channels = [
      {
        name: 'stable',
        currentCSV: 'testapp',
        currentCSVDesc: {
          displayName: 'Test App',
          icon: [{ mediatype: 'image/png', base64data: '' }],
          version: '0.0.1',
          provider: {
            name: 'CoreOS, Inc',
          },
          installModes: [],
        },
      },
      {
        name: 'nightly',
        currentCSV: 'testapp-nightly',
        currentCSVDesc: {
          displayName: 'Test App',
          icon: [{ mediatype: 'image/png', base64data: '' }],
          version: '0.0.1',
          provider: {
            name: 'CoreOS, Inc',
          },
          installModes: [],
        },
      },
    ];
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders a modal form with title and submit footer', () => {
    renderWithProviders(
      <SubscriptionChannelModal
        subscription={subscription}
        pkg={pkg}
        k8sUpdate={k8sUpdate}
        close={close}
        cancel={cancel}
      />,
    );

    expect(screen.getByRole('form')).toBeVisible();
    expect(screen.getByTestId('modal-title')).toBeVisible();
    expect(screen.getByTestId('modal-submit-footer')).toBeVisible();
    expect(screen.getByTestId('submit-button')).toHaveTextContent('Save');
  });

  it('renders a radio button for each available channel in the package', () => {
    renderWithProviders(
      <SubscriptionChannelModal
        subscription={subscription}
        pkg={pkg}
        k8sUpdate={k8sUpdate}
        close={close}
        cancel={cancel}
      />,
    );

    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(pkg.status.channels.length);
    expect(screen.getByRole('radio', { name: /stable/i })).toBeVisible();
    expect(screen.getByRole('radio', { name: /nightly/i })).toBeVisible();
  });

  it('calls k8sUpdate to update the subscription when form is submitted with a different channel', async () => {
    renderWithProviders(
      <SubscriptionChannelModal
        subscription={subscription}
        pkg={pkg}
        k8sUpdate={k8sUpdate}
        close={close}
        cancel={cancel}
      />,
    );

    // Select the nightly channel
    fireEvent.click(screen.getByRole('radio', { name: /nightly/i }));

    // Submit the form
    fireEvent.submit(screen.getByRole('form'));

    await waitFor(() => {
      expect(k8sUpdate).toHaveBeenCalledTimes(1);
    });

    const [model, obj] = k8sUpdate.mock.calls[0];
    expect(model).toEqual(SubscriptionModel);
    expect(obj.spec.channel).toEqual('nightly');
  });

  it('calls close after successful form submission', async () => {
    renderWithProviders(
      <SubscriptionChannelModal
        subscription={subscription}
        pkg={pkg}
        k8sUpdate={k8sUpdate}
        close={close}
        cancel={cancel}
      />,
    );

    // Select a different channel first
    fireEvent.click(screen.getByRole('radio', { name: /nightly/i }));

    // Submit the form
    fireEvent.submit(screen.getByRole('form'));

    await waitFor(() => {
      expect(close).toHaveBeenCalledTimes(1);
    });
  });
});
