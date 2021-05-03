import * as React from 'react';
import { RadioGroup } from '@console/internal/components/radio';
import { ToggleValue } from './types';

const ToggleView: React.FC<ToggleViewProps> = ({ value, onChange, title, optionLabels }) => {
  return (
    <RadioGroup
      label={title}
      currentValue={value}
      inline
      items={[
        {
          value: ToggleValue.LEFT_OPTION,
          title: optionLabels[0],
        },
        {
          value: ToggleValue.RIGHT_OPTION,
          title: optionLabels[1],
        },
      ]}
      onChange={({ currentTarget }) => onChange(currentTarget.value)}
    />
  );
};

export default ToggleView;

type ToggleViewProps = {
  value: ToggleValue;
  onChange: (newValue: ToggleValue) => void;
  title: string;
  optionLabels: string[];
};
