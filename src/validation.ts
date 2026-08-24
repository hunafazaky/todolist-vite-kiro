const MAX_TITLE_LENGTH = 255;

/**
 * Validates a raw task title string.
 * Returns the trimmed title on success, or an error message string on failure.
 */
export function validateTitle(raw: string): string | null {
  const trimmed = raw.trim();

  if (trimmed.length === 0) {
    return 'Title cannot be empty.';
  }

  if (trimmed.length > MAX_TITLE_LENGTH) {
    return `Title must be ${MAX_TITLE_LENGTH} characters or fewer.`;
  }

  return trimmed;
}
