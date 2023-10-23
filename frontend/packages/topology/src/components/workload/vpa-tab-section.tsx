import * as React from 'react';
import { GraphElement } from '@patternfly/react-topology';
// import { filterVerticalPodAutoscaler } from '@console/app/src/components/vpa/VerticalPodAutoscalerRecommendations';
import { DetailsTabSectionExtensionHook } from '@console/dynamic-plugin-sdk';
import { ResourceLink } from '@console/internal/components/utils';
import { useK8sWatchResource } from '@console/internal/components/utils/k8s-watch-hook';
import { K8sResourceCommon } from '@console/internal/module/k8s';
import { TYPE_WORKLOAD } from '@console/topology/src/const';
import TopologySideBarTabSection from '../side-bar/TopologySideBarTabSection';

type VPATabSectionProps = {
  vpas: K8sResourceCommon[];
};

const VPATabSection: React.FC<VPATabSectionProps> = ({ vpas }) => {
  console.log('vpas ===>+', vpas);
  return (
    <>
      <h2>HERE</h2>
      <ul className="list-group">
        {vpas.map((vpa: K8sResourceCommon) => (
          <li key={vpa.metadata.name} className="list-group-item">
            <ResourceLink
              kind="autoscaling.k8s.io~v1~VerticalPodAutoscaler"
              name={vpa.metadata.name}
              namespace={vpa.metadata.namespace}
            />
          </li>
        ))}
      </ul>
    </>
  );
};

export const useVpaSideBarTabSection: DetailsTabSectionExtensionHook = (element: GraphElement) => {
  if (element.getType() !== TYPE_WORKLOAD) {
    return [undefined, true, undefined];
  }

  const [vpas] = useK8sWatchResource<K8sResourceCommon[]>({
    groupVersionKind: {
      group: 'autoscaling.k8s.io',
      version: 'v1',
      kind: 'VerticalPodAutoscaler',
    },
    isList: true,
    namespaced: true,
  });

  // const filteredVPAs = filterVerticalPodAutoscaler(vpas, obj);

  console.log('vpas1 ===>', vpas);

  const section = (
    <TopologySideBarTabSection>
      <VPATabSection vpas={vpas} />
      <h1>console-extensions</h1>
    </TopologySideBarTabSection>
  );
  return [section, true, undefined];
};
