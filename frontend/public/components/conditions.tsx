import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Timestamp } from './utils';
import { CamelCaseWrap } from './utils/camel-case-wrap';
import { K8sResourceCondition } from '../module/k8s';

export const Conditions: React.FC<ConditionsProps> = ({ conditions }) => {
  const { t } = useTranslation();

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'True':
        return t('public~True');
      case 'False':
        return t('public~False');
      default:
        return status;
    }
  };

  const rows = conditions?.map?.((condition: K8sResourceCondition, i: number) => (
    <tr data-test={condition.type} key={i}>
      <td data-test={`condition[${i}].type`}>
        <CamelCaseWrap value={condition.type} />
      </td>
      <td data-test={`condition[${i}].status`}>
        {getStatusLabel(condition.status)}
      </td>
      <td
        className="pf-m-hidden pf-m-visible-on-md"
        data-test={`condition[${i}].lastTransitionTime`}
      >
        <Timestamp timestamp={condition.lastTransitionTime} />
      </td>
      <td data-test={`condition[${i}].reason`}>
        <CamelCaseWrap value={condition.reason} />
      </td>
      {/* remove initial newline which appears in route messages */}
      <td
        className="pf-m-hidden pf-m-visible-on-sm co-break-word co-pre-line co-conditions__message"
        data-test={`condition[${i}].message`}
      >
        {condition.message?.trim() || '-'}
      </td>
    </tr>
  ));

  return (
    <>
      {conditions?.length ? (
        <table className="pf-c-table pf-m-compact pf-m-border-rows">
          <thead>
            <tr>
              <th>{t('public~Type')}</th>
              <th>{t('public~Status')}</th>
              <th className="pf-m-hidden pf-m-visible-on-md">{t('public~Updated')}</th>
              <th>{t('public~Reason')}</th>
              <th className="pf-m-hidden pf-m-visible-on-sm">{t('public~Message')}</th>
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </table>
      ) : (
        <div className="cos-status-box">
          <div className="pf-u-text-align-center">{t('public~No conditions found')}</div>
        </div>
      )}
    </>
  );
};
Conditions.displayName = 'Conditions';

export type ConditionsProps = {
  conditions: K8sResourceCondition[];
  title?: string;
  subTitle?: string;
};
