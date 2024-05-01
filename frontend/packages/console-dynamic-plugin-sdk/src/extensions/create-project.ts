import { ExtensionHook } from '../api/common-types';
import { Extension, ExtensionDeclaration, CodeRef } from '../types';

// A function that handles create project actions
type CreateProjectCallback = () => void;

/** This extension can be used to pass a callback to override the create project form behavior . */
export type CreateProject = ExtensionDeclaration<
  'console.create-project',
  {
    /** A hook that provides a callback, which will be executed when any create project button is
     * clicked in the UI */
    provider: CodeRef<ExtensionHook<CreateProjectCallback>>;
  }
>;

export const isCreateProject = (e: Extension): e is CreateProject =>
  e.type === 'console.create-project';
