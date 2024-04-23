import { Extension, ExtensionDeclaration, CodeRef } from '../types';

/** This extension can be used to pass a callback to override the create project form behavior . */
export type CreateProject = ExtensionDeclaration<
  'console.create-project',
  {
    /** A callback that performs an action on click */
    callback: CodeRef<() => void>;
  }
>;

export const isCreateProject = (e: Extension): e is CreateProject =>
  e.type === 'console.create-project';
