import * as React from "react";
import { useTranslation } from "react-i18next";
import {
  Page,
  PageSection,
  Title,
} from "@patternfly/react-core";

import {
  TableComposable,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  InnerScrollContainer,
  // OuterScrollContainer,
  ThProps
} from '@patternfly/react-table';

interface Fact {
  name: string;
  state: string;
  detail1: string;
  detail2: string;
  detail3: string;
  detail4: string;
  detail5: string;
  detail6: string;
  detail7: string;
  detail8: string;
  detail9: string;
  detail10: string;
  detail11: string;
  detail12: string;
  detail13: string;
}

export const UtilityConsumer: React.FunctionComponent = () => {
  const facts: Fact[] = Array.from({ length: 15 }, (_, index) => ({
    name: `Sticky cell ${index + 1}`,
    state: `Feb 4, 2022, 6:34 AM ${index + 1}`,
    detail1: `https://console-openshift-console.apps.jephilli-4-10-02-04-0620.devcluster.openshift.com ${index + 1}-3`,
    detail2: `Test cell ${index + 1}-4`,
    detail3: `Test cell ${index + 1}-5`,
    detail4: `Test cell ${index + 1}-6`,
    detail5: `Test cell ${index + 1}-7`,
    detail6: `Success ${index + 1}-8`,
    detail7: `Test cell ${index + 1}-9`,
    detail8: `Test cell ${index + 1}-10`,
    detail9: `Test cell ${index + 1}-11`,
    detail10: `Test cell ${index + 1}-12`,
    detail11: `Test cell ${index + 1}-13`,
    detail12: `Test cell ${index + 1}-14`,
    detail13: `Last table column ${index + 1}-15`
  }));

  const columnNames = {
    name: 'Sticky column',
    header2: 'Timestamp',
    header3: 'Header 3',
    header4: 'Header 4',
    header5: 'Header 5',
    header6: 'Header 6',
    header7: 'Header 7',
    header8: 'Status',
    header9: 'Header 9',
    header10: 'Header 10',
    header11: 'Header 11',
    header12: 'Header 12',
    header13: 'Header 13',
    header14: 'Header 14',
    header15: 'Last table column'
  };

  // Index of the currently sorted column
  // Note: if you intend to make columns reorderable, you may instead want to use a non-numeric key
  // as the identifier of the sorted column. See the "Compound expandable" example.
  const [activeSortIndex, setActiveSortIndex] = React.useState<number | null>(null);

  // Sort direction of the currently sorted column
  const [activeSortDirection, setActiveSortDirection] = React.useState<'asc' | 'desc' | null>(null);

  // Since OnSort specifies sorted columns by index, we need sortable values for our object by column index.
  // This example is trivial since our data objects just contain strings, but if the data was more complex
  // this would be a place to return simplified string or number versions of each column to sort by.
  const getSortableRowValues = (fact: Fact): (string | number)[] => {
    const { name, state, detail1, detail2, detail3, detail4, detail5, detail6, detail7 } = fact;
    return [name, state, detail1, detail2, detail3, detail4, detail5, detail6, detail7];
  };

  // Note that we perform the sort as part of the component's render logic and not in onSort.
  // We shouldn't store the list of data in state because we don't want to have to sync that with props.
  let sortedFacts = facts;
  if (activeSortIndex !== null) {
    sortedFacts = facts.sort((a, b) => {
      const aValue = getSortableRowValues(a)[activeSortIndex];
      const bValue = getSortableRowValues(b)[activeSortIndex];
      if (aValue === bValue) {
        return 0;
      }
      if (activeSortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return bValue > aValue ? 1 : -1;
      }
    });
  }

  const getSortParams = (columnIndex: number): ThProps['sort'] => ({
    sortBy: {
      index: activeSortIndex,
      direction: activeSortDirection
    },
    onSort: (_event, index, direction) => {
      setActiveSortIndex(index);
      setActiveSortDirection(direction);
    },
    columnIndex
  });

  const { t } = useTranslation("plugin__console-demo-plugin");

  return (
    <Page
      groupProps={{ sticky: "top" }}
      additionalGroupedContent={
        <PageSection variant="light">
          <Title headingLevel="h1">
            {t("TableComposable")}
          </Title>
          <p>Wide table with sticky column and header. Requires a parent div with a set pixel height to trigger vertical scroll</p>
        </PageSection>
      }
    >
      <PageSection variant="light">

          <InnerScrollContainer>
            <TableComposable aria-label="TableComposable" gridBreakPoint="" isStickyHeader>
              <Thead>
                <Tr>
                  <Th isStickyColumn modifier="truncate" hasRightBorder sort={getSortParams(0)}>
                    {columnNames.name}
                  </Th>
                  <Th>{columnNames.header2}</Th>
                  <Th modifier="truncate">{columnNames.header3}</Th>
                  <Th modifier="truncate">{columnNames.header4}</Th>
                  <Th modifier="truncate">{columnNames.header5}</Th>
                  <Th modifier="truncate">{columnNames.header6}</Th>
                  <Th modifier="truncate">{columnNames.header7}</Th>
                  <Th modifier="truncate">{columnNames.header8}</Th>
                  <Th modifier="truncate">{columnNames.header9}</Th>
                  <Th modifier="truncate">{columnNames.header10}</Th>
                  <Th modifier="truncate">{columnNames.header11}</Th>
                  <Th modifier="truncate">{columnNames.header12}</Th>
                  <Th modifier="truncate">{columnNames.header13}</Th>
                  <Th modifier="truncate">{columnNames.header14}</Th>
                  <Th modifier="truncate">{columnNames.header15}</Th>
                </Tr>
              </Thead>
              <Tbody>
                {sortedFacts.map(fact => (
                  <Tr key={fact.name}>
                    <Th isStickyColumn stickyMinWidth="150px" modifier="truncate" hasRightBorder>
                      {fact.name}
                    </Th>
                    <Th modifier="nowrap" dataLabel={columnNames.header2}>
                      {fact.state}
                    </Th>
                    <Td modifier="nowrap" dataLabel={columnNames.header3}>
                      {fact.detail1}
                    </Td>
                    <Td modifier="nowrap" dataLabel={columnNames.header4}>
                      {fact.detail2}
                    </Td>
                    <Td modifier="nowrap" dataLabel={columnNames.header5}>
                      {fact.detail3}
                    </Td>
                    <Td modifier="nowrap" dataLabel={columnNames.header6}>
                      {fact.detail4}
                    </Td>
                    <Td modifier="nowrap" dataLabel={columnNames.header7}>
                      {fact.detail5}
                    </Td>
                    <Td modifier="nowrap" dataLabel={columnNames.header8}>
                      {fact.detail6}
                    </Td>
                    <Td modifier="nowrap" dataLabel={columnNames.header9}>
                      {fact.detail7}
                    </Td>
                    <Td modifier="nowrap" dataLabel={columnNames.header10}>
                      {fact.detail8}
                    </Td>
                    <Td modifier="nowrap" dataLabel={columnNames.header11}>
                      {fact.detail9}
                    </Td>
                    <Td modifier="nowrap" dataLabel={columnNames.header12}>
                      {fact.detail10}
                    </Td>
                    <Td modifier="nowrap" dataLabel={columnNames.header13}>
                      {fact.detail11}
                    </Td>
                    <Td modifier="nowrap" dataLabel={columnNames.header14}>
                      {fact.detail12}
                    </Td>
                    <Td modifier="nowrap" dataLabel={columnNames.header15}>
                      {fact.detail13}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </TableComposable>
          </InnerScrollContainer>

      </PageSection>
    </Page>
  );
};

export default UtilityConsumer;
