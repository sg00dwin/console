import * as React from 'react';
// import {
//   Select,
//   SelectList,
//   SelectOption
// } from '@patternfly/react-core';

const Select: React.FC<DefaultSelectProps> = (children, id) => {

  return (
    <h1>DefaultSelect</h1>
  )
};

type DefaultSelectProps = {
  children: React.ReactNode;
  id: string;
};

export default Select;
