import { CatalogItem } from '@console/dynamic-plugin-sdk/src/extensions';

// Red Hat priority constants for testing display
const REDHAT_PRIORITY = {
  EXACT_MATCH: 2,
  CONTAINS_REDHAT: 1,
  NON_REDHAT: 0,
} as const;

/**
 * Test logging for enhanced keywordCompare function
 */
export const logKeywordCompareCall = (
  filterString: string,
  itemCount: number,
  catalogType: string,
): void => {
  // eslint-disable-next-line no-console
  console.log('🔍 Enhanced keywordCompare called:', {
    filterString,
    itemCount,
    catalogType,
  });
};

/**
 * Displays a console.table with catalog search results and relevance scoring
 */
export const displayCatalogResultsTable = (
  items: CatalogItem[],
  searchTerm: string,
  filterDescription: string,
): void => {
  if (items.length === 0) {
    return;
  }

  const tableData = items.map((item) => {
    // Get relevance score (already calculated and attached to item during filtering)
    const relevanceScore = searchTerm
      ? (item as any).relevanceScore ?? 'Not calculated'
      : 'N/A (No search)';

    // Get Red Hat priority (already calculated and attached to item during filtering)
    const redHatPriority = (item as any).redHatPriority ?? 0;

    // Format Red Hat priority display
    const isRedHatProvider =
      redHatPriority === REDHAT_PRIORITY.EXACT_MATCH
        ? `Exact Match (${REDHAT_PRIORITY.EXACT_MATCH})`
        : redHatPriority === REDHAT_PRIORITY.CONTAINS_REDHAT
        ? `Contains Red Hat (${REDHAT_PRIORITY.CONTAINS_REDHAT})`
        : `Non-Red Hat (${REDHAT_PRIORITY.NON_REDHAT})`;

    return {
      Title: item.name || 'N/A',
      'Search Relevance Score': relevanceScore,
      'Is Red Hat Provider (Priority)': isRedHatProvider,
      Provider: item.attributes?.provider || item.provider || 'N/A',
      Type: item.type || 'N/A',
    };
  });

  // eslint-disable-next-line no-console
  console.log(`\n🎯 CATALOG Results: ${filterDescription} (${items.length} matches)`);
  // eslint-disable-next-line no-console
  console.table(tableData);
};

/**
 * Builds a filter description string from active filters
 */
export const buildFilterDescription = (
  searchTerm: string,
  activeCategoryId: string,
  activeFilters: any,
): string => {
  const activeFilterDescriptions = [];

  if (searchTerm) {
    activeFilterDescriptions.push(`Search: "${searchTerm}"`);
  }

  if (activeCategoryId !== 'all') {
    activeFilterDescriptions.push(`Category: ${activeCategoryId}`);
  }

  Object.entries(activeFilters).forEach(([filterType, filterGroup]) => {
    const activeFilterValues = Object.entries(filterGroup as any)
      .filter(([, filter]: [string, any]) => filter.active)
      .map(([, filter]: [string, any]) => filter.label || filter.value);
    if (activeFilterValues.length > 0) {
      activeFilterDescriptions.push(`${filterType}: [${activeFilterValues.join(', ')}]`);
    }
  });

  return activeFilterDescriptions.length > 0 ? activeFilterDescriptions.join(' + ') : 'No filters';
};
