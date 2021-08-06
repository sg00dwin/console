import * as React from 'react';
import * as _ from 'lodash-es';
import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { ContainerSpec } from '../../module/k8s';
import { Table, TableHeader, TableBody, TableData, TableRow } from '@patternfly/react-table';

const ContainerRow: React.FC<ContainerRowProps> = ({ container }) => {
  const resourceLimits = _.get(container, 'resources.limits');
  const ports = _.get(container, 'ports');
  return (
    <tr>
      <td className="co-break-word">{container.name}</td>
      <td className="co-break-all co-select-to-copy">
        {container.image || '-'}
      </td>
      <td className="pf-m-hidden pf-m-visible-on-sm">
        {_.map(resourceLimits, (v, k) => `${k}: ${v}`).join(', ') || '-'}
      </td>
      <td className="pf-m-hidden pf-m-visible-on-md co-break-word">
        {_.map(ports, (port) => `${port.containerPort}/${port.protocol}`).join(', ') || '-'}
      </td>
    </tr>
  );
};

export const ContainerTable: React.FC<ContainerTableProps> = ({ containers }, props, ) => {
  const { t } = useTranslation();
  const tableColumnClasses = ['', '', 'pf-m-hidden pf-m-visible-on-sm', 'pf-m-hidden pf-m-visible-on-md'];
  const ContainerTableHeader = () => [
    {
      title: t('public~Name'),
      props: { className: tableColumnClasses[0]},
    },
    {
      title: t('public~Image'),
      props: { className: tableColumnClasses[1]},
    },
    {
      title: t('public~Resource limits'),
      props: { className: tableColumnClasses[2]},
    },
    {
      title: t('public~Ports'),
      props: { className: tableColumnClasses[3]},
    },
  ];

  return (
    <Table
      aria-label={t('public~Containers List')}
      // cells={ContainerTableHeader}
      columns={ContainerTableHeader}
    >
      <TableHeader />
      {_.map(containers, (c, i) => (
        <ContainerRow key={i} container={c} />
      ))}
    </Table>
  );
};

export type ContainerRowProps = {
  container: ContainerSpec;
};

export type ContainerTableProps = {
  containers: ContainerSpec[];
};
