import { screen, fireEvent, waitFor } from '@testing-library/react';
import * as _ from 'lodash';
import { renderWithProviders } from '@console/shared/src/test-utils/unit-test-utils';
import { testSubscription, testPackageManifest } from '../../../mocks';
import { SubscriptionModel } from '../../models';
import { SubscriptionKind, PackageManifestKind } from '../../types';
import {
  SubscriptionChannelModal,
  SubscriptionChannelModalProps,
} from './subscription-channel-modal';

describe('SubscriptionChannelModal', () => {
  let subscriptionChannelModalProps: SubscriptionChannelModalProps;
  let k8sUpdate: jest.Mock;
  let close: jest.Mock;
  let cancel: jest.Mock;
  let subscription: SubscriptionKind;
  let pkg: PackageManifestKind;

  beforeEach(() => {
    jest.clearAllMocks();

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

    subscriptionChannelModalProps = {
      subscription,
      pkg,
      k8sUpdate,
      close,
      cancel,
    };
  });

  it('renders modal title and submit button', () => {
    renderWithProviders(<SubscriptionChannelModal {...subscriptionChannelModalProps} />);

    expect(screen.getByText('Change Subscription update channel')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Save' })).toBeVisible();
  });

  it('renders a radio button for each available channel in the package', () => {
    renderWithProviders(<SubscriptionChannelModal {...subscriptionChannelModalProps} />);

    const radioButtons = screen.getAllByRole('radio');
    expect(radioButtons).toHaveLength(pkg.status.channels.length);
    expect(screen.getByRole('radio', { name: /stable/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /nightly/i })).toBeInTheDocument();
  });

  it('calls k8sUpdate to update the subscription when form is submitted', async () => {
    renderWithProviders(<SubscriptionChannelModal {...subscriptionChannelModalProps} />);

    const nightlyRadio = screen.getByRole('radio', { name: /nightly/i });
    fireEvent.click(nightlyRadio);

    const form = screen.getByRole('button', { name: 'Save' }).closest('form');
    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(() => {
      expect(k8sUpdate).toHaveBeenCalledTimes(1);
    });

    expect(k8sUpdate).toHaveBeenCalledWith(
      SubscriptionModel,
      expect.objectContaining({
        spec: expect.objectContaining({
          channel: 'nightly',
        }),
      }),
    );
  });

  it('calls close after successful submit', async () => {
    renderWithProviders(<SubscriptionChannelModal {...subscriptionChannelModalProps} />);

    const nightlyRadio = screen.getByRole('radio', { name: /nightly/i });
    fireEvent.click(nightlyRadio);

    const form = screen.getByRole('button', { name: 'Save' }).closest('form');
    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(() => {
      expect(close).toHaveBeenCalledTimes(1);
    });
  });
});
