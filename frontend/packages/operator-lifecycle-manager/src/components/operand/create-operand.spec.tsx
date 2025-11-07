import { CreateYAML } from '@console/internal/components/create-yaml';
import { renderWithProviders } from '@console/shared/src/test-utils/unit-test-utils';
import { OperandYAML } from './operand-yaml';

jest.mock('@console/internal/components/create-yaml', () => ({
  CreateYAML: jest.fn(() => null),
}));

const mockCreateYAML = (CreateYAML as unknown) as jest.Mock;

describe('OperandYAML', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders CreateYAML with hideHeader prop set to true', () => {
    renderWithProviders(<OperandYAML />);

    expect(mockCreateYAML).toHaveBeenCalledTimes(1);
    const [createYAMLProps] = mockCreateYAML.mock.calls[0];
    expect(createYAMLProps.hideHeader).toBe(true);
  });

  it('passes initialYAML as template prop to CreateYAML', () => {
    const initialYAML = 'apiVersion: v1\nkind: Pod';

    renderWithProviders(<OperandYAML initialYAML={initialYAML} />);

    expect(mockCreateYAML).toHaveBeenCalledTimes(1);
    const [createYAMLProps] = mockCreateYAML.mock.calls[0];
    expect(createYAMLProps.template).toEqual(initialYAML);
  });

  it('defaults initialYAML to empty string when not provided', () => {
    renderWithProviders(<OperandYAML />);

    expect(mockCreateYAML).toHaveBeenCalledTimes(1);
    const [createYAMLProps] = mockCreateYAML.mock.calls[0];
    expect(createYAMLProps.template).toEqual('');
  });

  it('passes onChange callback to CreateYAML', () => {
    const onChange = jest.fn();

    renderWithProviders(<OperandYAML onChange={onChange} />);

    expect(mockCreateYAML).toHaveBeenCalledTimes(1);
    const [createYAMLProps] = mockCreateYAML.mock.calls[0];
    expect(createYAMLProps.onChange).toEqual(onChange);
  });

  it('passes resourceObjPath function when next prop is provided', () => {
    const next = '/next-path';

    renderWithProviders(<OperandYAML next={next} />);

    expect(mockCreateYAML).toHaveBeenCalledTimes(1);
    const [createYAMLProps] = mockCreateYAML.mock.calls[0];
    expect(createYAMLProps.resourceObjPath).toBeDefined();
    expect(typeof createYAMLProps.resourceObjPath).toBe('function');
    expect(createYAMLProps.resourceObjPath()).toEqual(next);
  });

  it('does not pass resourceObjPath when next prop is not provided', () => {
    renderWithProviders(<OperandYAML />);

    expect(mockCreateYAML).toHaveBeenCalledTimes(1);
    const [createYAMLProps] = mockCreateYAML.mock.calls[0];
    expect(createYAMLProps.resourceObjPath).toBeUndefined();
  });
});
