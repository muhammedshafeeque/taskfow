import { contentToEditorHtml, isEditorHtmlEmpty, isHtmlStored } from './richTextStorage';

jest.mock('marked', () => ({
  marked: {
    parse: (value: string) => `<p>${value}</p>`,
  },
}));

describe('richTextStorage helpers', () => {
  it('detects html-based stored content', () => {
    expect(isHtmlStored('<p>Hello</p>')).toBe(true);
    expect(isHtmlStored('<img src="/a.png" />')).toBe(true);
    expect(isHtmlStored('## markdown')).toBe(false);
  });

  it('converts markdown to html when content is not stored html', () => {
    const output = contentToEditorHtml('## Heading');
    expect(output).toContain('<p>');
    expect(output).toContain('Heading');
  });

  it('treats rich media html as non-empty and blank paragraph as empty', () => {
    expect(isEditorHtmlEmpty('<p><br></p>')).toBe(true);
    expect(isEditorHtmlEmpty('<img src="/file.png" />')).toBe(false);
  });
});
