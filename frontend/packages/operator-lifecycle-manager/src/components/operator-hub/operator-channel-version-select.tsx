import * as React from 'react';
import { Select, SelectOption } from '@patternfly/react-core';
import { PackageManifestModel } from '../../models';
import { PackageManifestKind } from '../../types';
import { OperatorHubSubscribeForm } from './operator-hub-subscribe';
import { OperatorHubSubscribeFormProps } from './operator-hub-subscribe';

const OperatorChannelVersionSelect: React.FC<OperatorChannelVersionSelectProps> = ({
  packageManifest,
  selectedUpateChannel,
}) => {
  // const [updateChannel, setUpdateChannel] = React.useState(null);
  // const [updateVersion, setUpdateVersion] = React.useState(null);
  // const [isVersionSelectOpen, setIsVersionSelectOpen] = React.useState(false);
  // const onToggleVersion = () => setIsVersionSelectOpen(!isVersionSelectOpen);

  const { channels = [] } = packageManifest.data[0].status;
  console.log(channels, '<=== channels Yeet');
  return <h1>hello world</h1>;
};

type OperatorChannelVersionSelectProps = {
  packageManifest: { data: PackageManifestKind[] };
  selectedUpateChannel: string;
};

export default OperatorChannelVersionSelect;
