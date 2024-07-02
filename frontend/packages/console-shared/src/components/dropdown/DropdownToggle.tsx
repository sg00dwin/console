import * as React from 'react';
import { MenuToggle, MenuToggleElement } from '@patternfly/react-core';

const DropdownToggle = React.forwardRef(
  (props: DropdownToggleProps, ref: React.RefObject<MenuToggleElement>) => (
    <MenuToggle innerRef={ref} {...props} />
  ),
);

type DropdownToggleProps = {
  id: string;
  onToggle: () => void;
  'data-test-id': string;
  children?: React.ReactNode;
};

export default DropdownToggle;
