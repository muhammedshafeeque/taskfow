import { toAppPath } from './navigationUrl';

describe('toAppPath', () => {
  it('returns empty string for empty input', () => {
    expect(toAppPath()).toBe('');
    expect(toAppPath('   ')).toBe('');
  });

  it('converts full URL to path + query + hash', () => {
    expect(toAppPath('https://example.com/projects/1?tab=board#section')).toBe('/projects/1?tab=board#section');
  });

  it('returns non-url path unchanged', () => {
    expect(toAppPath('/issues/123')).toBe('/issues/123');
  });
});
