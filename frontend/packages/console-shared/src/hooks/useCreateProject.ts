import { useResolvedExtensions, isCreateProject, CreateProject } from '@console/dynamic-plugin-sdk';

export const useCreateProject = (defaultCallback: () => void, options?: any) => {
  const [createProjectExtensions, resolved] = useResolvedExtensions<CreateProject>(isCreateProject);
  const [createProjectExtensionCallback, setCreateProjectExtensionCallback] = useState(() => {});
  return createProjectExtensionCallback ?? defaultCallback;
};
