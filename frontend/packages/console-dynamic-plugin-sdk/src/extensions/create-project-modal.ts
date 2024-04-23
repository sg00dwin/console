import * as React from 'react';
import { Extension, ExtensionDeclaration, CodeRef } from '../types';

/** This extension can be used to pass a component that will be rendered in place of the standard create project modal. */
export type CreateProjectModal = ExtensionDeclaration<
  'console.create-project-modal',
  {
    /** A component to render in place of the create project modal */
    component: CodeRef<React.ComponentType>;
  }
>;

export const isCreateProjectModal = (e: Extension): e is CreateProjectModal =>
  e.type === 'console.create-project-modal';
