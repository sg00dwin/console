import * as React from 'react';
import { useTranslation } from 'react-i18next';
// import {
//   Dropdown as DropdownDeprecated,
//   DropdownToggle as DropdownToggleDeprecated,
//   DropdownItem as DropdownItemDeprecated,
// } from '@patternfly/react-core/deprecated';
// import { CaretDownIcon } from '@patternfly/react-icons/dist/esm/icons/caret-down-icon';

import { FilterIcon } from '@patternfly/react-icons/dist/esm/icons/filter-icon';
import { TextFilter } from './factory';

import {
  InputGroup,
  InputGroupItem,
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectOption,
  SelectList,
} from '@patternfly/react-core';

export enum searchFilterValues {
  // t('public~Label')
  Label = 'Label',
  // t('public~Name')
  Name = 'Name',
}

export const SearchFilterDropdown: React.SFC<SearchFilterDropdownProps> = (props) => {
  const [isOpen, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState(searchFilterValues.Label);

  const { onChange, nameFilterInput, labelFilterInput } = props;
  const { t } = useTranslation();
  const onToggle = () => setOpen(!isOpen);
  const onSelect = (event: React.SyntheticEvent, value: string) => {
    setSelected(value as searchFilterValues);
    setOpen(false);
  };
  const selectItems = [
    <SelectOption key="label-action" data-test="label-filter" value={searchFilterValues.Label}>
      {t(searchFilterValues.Label)}
    </SelectOption>,
    <SelectOption key="name-action" data-test="name-filter" value={searchFilterValues.Name}>
      {t(searchFilterValues.Name)}
    </SelectOption>,
  ];

  const menuToggle = (toggleRef: React.Ref<MenuToggleElement>) => {
    return (
      <MenuToggle ref={toggleRef} isExpanded={isOpen} onClick={onToggle} icon={<FilterIcon />}>
        {selected}
      </MenuToggle>
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const { value } = e.target as HTMLInputElement;
      onChange(selected, value, true);
    }
  };

  const handleInputValue = (_event, value: string) => {
    onChange(selected, value, false);
  };

  return (
    <>
      <InputGroup>
        <InputGroupItem>
          <Select
            isOpen={isOpen}
            selected={selected}
            onSelect={onSelect}
            onOpenChange={(lala) => setOpen(lala)}
            toggle={menuToggle}
            shouldFocusToggleOnSelect
          >
            <SelectList>{selectItems}</SelectList>
          </Select>
        </InputGroupItem>
        <InputGroupItem>
          <TextFilter
            parentClassName="co-search__filter-input"
            onChange={handleInputValue}
            placeholder={selected === searchFilterValues.Label ? 'app=frontend' : 'my-resource'}
            name="search-filter-input"
            id="search-filter-input"
            value={selected === searchFilterValues.Label ? labelFilterInput : nameFilterInput}
            onKeyDown={handleKeyDown}
            aria-labelledby="toggle-id"
          />
        </InputGroupItem>
      </InputGroup>
    </>
  );
};

// export type FooProps = Partial<MenuToggleProps> & {
//   toggleRef: React.Ref<MenuToggleElement>;
// };
export type SearchFilterDropdownProps = {
  onChange: (type: string, value: string, endOfString: boolean) => void;
  nameFilterInput: string;
  labelFilterInput: string;
};
