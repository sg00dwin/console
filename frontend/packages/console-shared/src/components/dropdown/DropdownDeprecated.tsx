import * as React from 'react';
import {
  Dropdown as PFDropdown,
  DropdownList,
  DropdownProps as PFDropdownProps,
  MenuToggleElement,
} from '@patternfly/react-core';

const DropdownDeprecated: React.FC<DropdownDeprecatedProps> = ({
  dropdownItems,
  children,
  toggle,
  position,
  ...props
}) => {
  const pfToggle = React.useCallback(
    (innerRef: React.RefObject<MenuToggleElement>) => React.cloneElement(toggle, { innerRef }),
    [toggle],
  );
  return (
    <PFDropdown {...props} popperProps={{ position }} toggle={pfToggle}>
      {dropdownItems ? <DropdownList>{dropdownItems}</DropdownList> : children}
    </PFDropdown>
  );
};

type DropdownDeprecatedProps = {
  onSelect?: (e: React.MouseEvent<Element, MouseEvent>) => void;
  dropdownItems?: React.ReactNode[];
  id?: string;
  toggle: React.ReactElement;
  position?: string;
} & Omit<PFDropdownProps, 'toggle'>;

export default DropdownDeprecated;
