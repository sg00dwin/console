import * as React from 'react';
import { Dropdown as PFDropdown, DropdownList as PFDropdownList } from '@patternfly/react-core';

const Dropdown: React.FC<DropdownProps> = ({ dropdownItems, isOpen, onSelect, toggle }) => {
  return (
    <PFDropdown
      isOpen={isOpen}
      toggle={(ref) => React.cloneElement(toggle, { ref })}
      onSelect={onSelect}
    >
      <PFDropdownList>{dropdownItems}</PFDropdownList>
    </PFDropdown>
  );
};

type DropdownProps = {
  dropdownItems: React.ReactElement[];
  isOpen: boolean;
  onSelect: (e: React.SyntheticEvent, value?: string | number) => void;
  toggle: React.ReactElement;
};

export default Dropdown;
