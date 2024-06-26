import * as React from 'react';
import {
  Select as PFSelect,
  SelectProps as PFSelectProps,
  SelectList as PFSelectList,
  Button,
} from '@patternfly/react-core';

const Select: React.FC<SelectProps> = ({ children, isOpen, onSelect, selections, onToggle }) => {
  const toggle = (ref) => (
    <Button onToggle={onToggle} ref={ref}>
      {selections}
    </Button>
  );
  return (
    <PFSelect isOpen={isOpen} toggle={toggle} onSelect={onSelect} selected={selections}>
      <PFSelectList>{children}</PFSelectList>
    </PFSelect>
  );
};

export default Select;

type SelectProps = Partial<PFSelectProps> & {
  onToggle: (_event: React.SyntheticEvent, isOpen: boolean) => void;
  selections: string;
  isDisabled: boolean;
};
