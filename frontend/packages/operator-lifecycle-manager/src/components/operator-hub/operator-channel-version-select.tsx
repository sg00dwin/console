import * as React from 'react';
import { Select, SelectOption } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { PackageManifestKind } from '../../types';
import { setQueryArgument } from '@console/internal/components/utils';
import { alphanumericCompare } from '@console/shared';

export const OperatorChannelSelect: React.FC<OperatorChannelSelectProps> = ({
  packageManifest,
  selectedUpdateChannel,
  setUpdateChannel,
  setUpdateVersion,
}) => {
  const { t } = useTranslation();
  const { channels = [] } = packageManifest.status;
  const [isChannelSelectOpen, setIsChannelSelectOpen] = React.useState(false);
  const onToggleChannel = () => setIsChannelSelectOpen(!isChannelSelectOpen);

  channels.sort((a, b) => -alphanumericCompare(a.name, b.name));

  const channelSelectOptions = channels.map((ch) => (
    <SelectOption key={ch.name} id={ch.name} value={ch.name}>
      {ch.name}
    </SelectOption>
  ));

  React.useEffect(() => {
    setQueryArgument('channel', selectedUpdateChannel);
  }, [selectedUpdateChannel]);

  const handleChannelSelection = (channels, newSelected: string) => {
    setUpdateChannel(newSelected);
    setIsChannelSelectOpen(false);
    setUpdateVersion('');
  };

  return (
    <>
      <Select
        aria-label={t('olm~Select a channel')}
        onToggle={onToggleChannel}
        isOpen={isChannelSelectOpen}
        selections={selectedUpdateChannel}
        onSelect={handleChannelSelection}
      >
        {channelSelectOptions}
      </Select>
    </>
  );
};

type OperatorChannelSelectProps = {
  packageManifest: PackageManifestKind;
  selectedUpdateChannel: string;
  setUpdateChannel: (updateChannel: string) => void;
  setUpdateVersion: (updateVersion: string) => void;
};

export const OperatorVersionSelect: React.FC<OperatorVersionSelectProps> = ({
  packageManifest,
  selectedUpdateChannel,
  updateVersion,
  setUpdateVersion,
}) => {
  const { t } = useTranslation();
  const [isVersionSelectOpen, setIsVersionSelectOpen] = React.useState(false);
  const [defaultVersionForChannel, setDefaultVersionForChannel] = React.useState('');
  const { channels = [] } = packageManifest.status;

  React.useEffect(() => {
    // if selectedUpdateChannel changes then change version selection to defaultVersionForChannel
    setDefaultVersionForChannel(
      channels.find((ch) => ch.name === selectedUpdateChannel).currentCSVDesc.version,
    );
  }, [selectedUpdateChannel]);

  const onToggleVersion = () => setIsVersionSelectOpen(!isVersionSelectOpen);

  // SelectedUpdateVersion should default to the defaultVersionForChannel or the updateVersion (when the user selects a different version).
  const selectedUpdateVersion = updateVersion || defaultVersionForChannel;

  console.log(defaultVersionForChannel, '<=== defaultVersionForChannel in select');

  // Take selectedUpdateChannel and return all versions associated with it
  const selectedChannelVersions = channels.find((ch) => ch.name === selectedUpdateChannel).entries;

  const handleVersionSelection = (versions, newSelection) => {
    setUpdateVersion(newSelection);
    setIsVersionSelectOpen(false);
  };
  const versionSelectOptions = selectedChannelVersions.map((v) => (
    <SelectOption key={v.version} id={v.version} value={v.version}>
      {v.version}
    </SelectOption>
  ));

  React.useEffect(() => {
    setQueryArgument('version', selectedUpdateVersion);
  }, [selectedUpdateVersion]);

  console.log(selectedUpdateVersion, '<=== selectedUpdateVersion in select');
  console.log(updateVersion, '<=== updateVersion in select');

  return (
    <>
      <Select
        aria-label={t('olm~Select a version')}
        onToggle={onToggleVersion}
        isOpen={isVersionSelectOpen}
        selections={selectedUpdateVersion}
        onSelect={handleVersionSelection}
      >
        {versionSelectOptions}
      </Select>
    </>
  );
};

type OperatorVersionSelectProps = {
  packageManifest: PackageManifestKind;
  selectedUpdateChannel: string;
  updateVersion: string;
  setUpdateVersion: (updateVersion: string) => void;
};
