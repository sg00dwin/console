import * as React from 'react';
import {
  Dropdown as PFDropdown,
  DropdownList,
  DropdownProps as PFDropdownProps,
  MenuToggleElement,
} from '@patternfly/react-core';

const Dropdown: React.FC<DropdownProps> = ({ dropdownItems, children, toggle, ...props }) => {
  const pfToggle = React.useCallback(
    (innerRef: React.RefObject<MenuToggleElement>) => React.cloneElement(toggle, { innerRef }),
    [toggle],
  );
  return (
    <PFDropdown {...props} toggle={pfToggle}>
      {dropdownItems ? <DropdownList>{dropdownItems}</DropdownList> : children}
    </PFDropdown>
  );
};

type DropdownProps = {
  onSelect: (e: React.MouseEvent<Element, MouseEvent>) => void;
  dropdownItems?: React.ReactNode[];
  id?: string;
  toggle: React.ReactElement;
} & Omit<PFDropdownProps, 'toggle'>;

export default Dropdown;
