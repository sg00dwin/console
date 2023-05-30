/* eslint-disable */
import { UseActivePerspective, UseActiveNamespace } from '../extensions/console-types';
/**
 * Hook that provides the currently active perspective and a callback for setting the active perspective
 * @returns A tuple containing the current active perspective and setter callback.
 * @example
 * ```tsx
 * const Component: React.FC = (props) => {
 *    const [activePerspective, setActivePerspective] = useActivePerspective();
 *    return <select
 *      value={activePerspective}
 *      onChange={(e) => setActivePerspective(e.target.value)}
 *    >
 *      {
 *        // ...perspective options
 *      }
 *    </select>
 * }
 * ```
 */
export const useActivePerspective: UseActivePerspective = require('@console/dynamic-plugin-sdk/src/perspective/useActivePerspective')
  .default;

export * from '../perspective/perspective-context';

/**
 * Hook that provides the currently active namespace and a callback for setting the active namespace
 * @returns A tuple containing the current active namespace and setter callback.
 * @example
 * ```tsx
 * const Component: React.FC = (props) => {
 *    const [activeNamespace, setActiveNamespace] = useActiveNamespace();
 *    return <select
 *      value={activeNamespace}
 *      onChange={(e) => setActiveNamespace(e.target.value)}
 *    >
 *      {
 *        // ...namespace options
 *      }
 *    </select>
 * }
 * ```
 */
export const useActiveNamespace: UseActiveNamespace = require('@console/dynamic-plugin-sdk/src/namespace/useActiveNamespace')
  .default;

export * from '../api/internal-api';

// Dynamic plugin SDK core APIs
export * from './dynamic-core-api';
