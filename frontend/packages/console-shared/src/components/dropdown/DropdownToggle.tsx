import * as React from 'react';
import { MenuToggle, MenuToggleProps } from '@patternfly/react-core';

const DropdownToggle: React.FC<DropdownToggleProps> = (props) => <MenuToggle {...props} />;

type DropdownToggleProps = Partial<MenuToggleProps> & {
  id: string;
  'data-test-id': string;
  children?: React.ReactNode;
};

export default DropdownToggle;
