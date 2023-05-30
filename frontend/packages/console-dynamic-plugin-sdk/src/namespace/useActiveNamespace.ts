import { useContext } from 'react';
import { NamespaceContext } from '../api/internal-api';
import { UseActiveNamespace } from '../api/internal-types';

export const useActiveNamespace: UseActiveNamespace = () => {
  const { namespace, setNamespace } = useContext(NamespaceContext);
  return [namespace, setNamespace];
};

export default useActiveNamespace;
