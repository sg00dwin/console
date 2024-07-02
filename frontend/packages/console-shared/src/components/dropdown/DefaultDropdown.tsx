import * as React from 'react';
import { Dropdown as PFDropdown, DropdownList, MenuToggleElement } from '@patternfly/react-core';

const Dropdown: React.FC<DropdownProps> = ({ dropdownItems, children, ...props }) => {
  const toggle = React.useCallback(
    (ref: React.RefObject<MenuToggleElement>) => React.cloneElement(props.toggle, { ref }),
    [props.toggle],
  );
  return (
    <PFDropdown toggle={toggle} {...props}>
      {dropdownItems ? <DropdownList>{dropdownItems}</DropdownList> : children}
    </PFDropdown>
  );
};

type DropdownProps = {
  onSelect: (e: React.MouseEvent<Element, MouseEvent>) => void;
  isOpen: boolean;
  toggle: React.ReactElement;
  dropdownItems?: React.ReactNode[]; // Optional so that we can also use children as dropdown content
  id: string;
};

export default Dropdown;
