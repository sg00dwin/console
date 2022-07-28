import * as React from 'react';
import { Title, FormHelperText } from '@patternfly/react-core';

type SpacerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';

type FormHeaderProps = {
  title: React.ReactNode;
  helpText?: React.ReactNode;
  marginTop?: SpacerSize;
  className?: string;
};

const FormHeader: React.FC<FormHeaderProps> = ({ title, helpText, marginTop, className }) => {
  const marginStyles = {
    ...(marginTop ? { marginTop: `var(--pf-global--spacer--${marginTop})` } : {}),
  };

  return (
    <div className={className} style={marginStyles}>
      <Title headingLevel="h1" size="2xl" className="co-m-pane__heading" data-test="form-title">
        {title}
      </Title>
      <FormHelperText isHidden={false} style={{ marginTop: 'var(--pf-global--spacer--xs)' }}>
        {helpText}
      </FormHelperText>
    </div>
  );
};

export default FormHeader;
