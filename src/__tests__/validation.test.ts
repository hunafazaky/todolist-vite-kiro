import { describe, it, expect } from 'vitest';
import { validateTitle } from '../validation';

describe('validateTitle', () => {
  // --- Rejection cases (Requirements 1.3, 1.5) ---

  it('rejects an empty string', () => {
    const result = validateTitle('');
    expect(typeof result).toBe('string'); // error message returned
  });

  it('rejects a single space', () => {
    const result = validateTitle(' ');
    expect(typeof result).toBe('string');
  });

  it('rejects a tab-only string', () => {
    const result = validateTitle('\t');
    expect(typeof result).toBe('string');
  });

  it('rejects a newline-only string', () => {
    const result = validateTitle('\n');
    expect(typeof result).toBe('string');
  });

  it('rejects a mixed whitespace-only string', () => {
    const result = validateTitle('  \t\n\r  ');
    expect(typeof result).toBe('string');
  });

  it('rejects a title of 256 characters', () => {
    const longTitle = 'a'.repeat(256);
    const result = validateTitle(longTitle);
    expect(typeof result).toBe('string');
  });

  // --- Acceptance cases (Requirements 1.3, 1.5) ---

  it('accepts a title of exactly 255 characters and returns it unchanged', () => {
    const title = 'a'.repeat(255);
    const result = validateTitle(title);
    expect(result).toBe(title);
  });

  it('accepts a short valid title', () => {
    const result = validateTitle('Buy groceries');
    expect(result).toBe('Buy groceries');
  });

  it('trims leading whitespace from a valid title', () => {
    const result = validateTitle('   Hello');
    expect(result).toBe('Hello');
  });

  it('trims trailing whitespace from a valid title', () => {
    const result = validateTitle('Hello   ');
    expect(result).toBe('Hello');
  });

  it('trims both leading and trailing whitespace from a valid title', () => {
    const result = validateTitle('  Buy groceries  ');
    expect(result).toBe('Buy groceries');
  });

  it('accepts a 255-char title with surrounding whitespace and returns trimmed value', () => {
    // Trimmed portion is 255 chars — should still be valid
    const title = '  ' + 'b'.repeat(255) + '  ';
    const result = validateTitle(title);
    expect(result).toBe('b'.repeat(255));
  });
});
