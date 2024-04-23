import { useResolvedExtensions, isCreateProject, CreateProject } from '@console/dynamic-plugin-sdk';

export const useCreateProject = (defaultCallback) => {
  const [createProjectExtensions, resolved, errors] = useResolvedExtensions<CreateProject>(
    isCreateProject,
  );

  console.dir(createProjectExtensions);

  if (!resolved) {
    return null;
  }

  if (errors.length > 0) {
    // eslint-disable-next-line no-console
    console.error('Error resolving extensions: ', errors.join(','));
    return defaultCallback;
  }

  const createProjectExtensionCallback = createProjectExtensions?.[0]?.properties?.callback;
  return createProjectExtensionCallback ?? defaultCallback;
};
