import * as fc from 'fast-check';
import type { Task } from '../types';

/**
 * Generates a non-empty, non-whitespace-only string of at most 255 characters.
 * Represents a valid task title.
 */
export const arbitraryTitle: fc.Arbitrary<string> = fc
  .string({ minLength: 1, maxLength: 255 })
  .filter(s => s.trim().length > 0);

/**
 * Generates a string composed entirely of whitespace characters (including the empty string).
 */
export const arbitraryWhitespaceTitle: fc.Arbitrary<string> = fc.stringOf(
  fc.constantFrom(' ', '\t', '\n', '\r')
);

/**
 * Generates a Task object with all required fields populated.
 */
export const arbitraryTask: fc.Arbitrary<Task> = fc.record({
  id: fc.uuid(),
  title: arbitraryTitle,
  completed: fc.boolean(),
  createdAt: fc.date().map(d => d.toISOString()),
});

/**
 * Generates an array of Task objects (possibly empty).
 */
export const arbitraryTaskList: fc.Arbitrary<Task[]> = fc.array(arbitraryTask);

/**
 * Generates one of the three valid filter options.
 */
export const arbitraryValidFilter = fc.constantFrom(
  'all' as const,
  'active' as const,
  'completed' as const
);
