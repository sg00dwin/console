import * as React from 'react';
import { useTranslation } from 'react-i18next';
import {
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  TextInput,
} from '@patternfly/react-core';

export const IDPNameInput: React.FC<IDPNameInputProps> = ({ value, onChange }) => {
  const { t } = useTranslation();
  return (
    <FormGroup fieldId="idp-name" isRequired label={t('public~Name')}>
      <TextInput
        type="text"
        id="idp-name"
        name="idp-name"
        value={value}
        onChange={onChange}
        isRequired
      />
      <FormHelperText>
        <HelperText>
          <HelperTextItem>
            {t('public~Unique name of the new identity provider. This cannot be changed later.')}
          </HelperTextItem>
        </HelperText>
      </FormHelperText>
    </FormGroup>
  );
};

type IDPNameInputProps = {
  value: string;
  onChange: (_event: React.FormEvent<HTMLInputElement>, value: string) => void;
};
