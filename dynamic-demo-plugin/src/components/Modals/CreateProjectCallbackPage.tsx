import * as React from 'react';
import { Button, Flex, } from '@patternfly/react-core';

import './modal.scss';



export const TestCreateProjectCallbackPage: React.FC<{  }> = () => {

  return (
    <Flex
      alignItems={{ default: 'alignItemsCenter' }}
      justifyContent={{ default: 'justifyContentCenter' }}
      grow={{ default: 'grow' }}
      direction={{ default: 'column' }}
      className="demo-modal__page"
    >
      <Button >Create project callback button</Button>
    </Flex>
  );
};
