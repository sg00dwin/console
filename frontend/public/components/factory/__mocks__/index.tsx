export const DetailsPage = jest.fn(({ pages, kind, resources }) => (
  <div data-testid="details-page">
    <div data-testid="details-page-kind">{kind}</div>
    <div data-testid="details-page-pages">{JSON.stringify(pages?.map((p) => p.nameKey))}</div>
    <div data-testid="details-page-resources">{JSON.stringify(resources)}</div>
  </div>
));
