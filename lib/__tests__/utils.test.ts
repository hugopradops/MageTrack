import { describe, it, expect } from 'vitest';
import { decodeHTMLEntities } from '@/lib/utils';

describe('decodeHTMLEntities', () => {
  it('decodes &amp; to &', () => {
    expect(decodeHTMLEntities('Tom &amp; Jerry')).toBe('Tom & Jerry');
  });

  it('decodes &lt; and &gt;', () => {
    expect(decodeHTMLEntities('&lt;div&gt;')).toBe('<div>');
  });

  it('decodes &quot; and &#39;', () => {
    expect(decodeHTMLEntities('&quot;hello&#39;')).toBe('"hello\'');
  });

  it('decodes &#x27;', () => {
    expect(decodeHTMLEntities('it&#x27;s')).toBe("it's");
  });

  it('decodes &trade; and &reg;', () => {
    expect(decodeHTMLEntities('Steam&trade; Deck&reg;')).toBe('Steam\u2122 Deck\u00AE');
  });

  it('returns plain strings unchanged', () => {
    expect(decodeHTMLEntities('Hello World')).toBe('Hello World');
  });

  it('handles multiple entities in one string', () => {
    expect(decodeHTMLEntities('&lt;a href=&quot;/&quot;&gt;')).toBe('<a href="/">');
  });
});
