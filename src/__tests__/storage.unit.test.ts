import { describe, it, expect, afterEach, vi } from 'vitest';
import { loadTasks, saveTasks } from '../storage';
import type { Task } from '../types';

const STORAGE_KEY = 'todolist-app-tasks';

const sampleTasks: Task[] = [
  { id: '1', title: 'Buy milk', completed: false, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: '2', title: 'Walk the dog', completed: true, createdAt: '2024-01-02T00:00:00.000Z' },
];

function makeLocalStorageMock(initial: Record<string, string> = {}) {
  const store: Record<string, string> = { ...initial };
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { Object.keys(store).forEach(k => delete store[k]); }),
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
    get length() { return Object.keys(store).length; },
    _store: store,
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('saveTasks', () => {
  it('writes serialised tasks to localStorage under the fixed key', () => {
    const mock = makeLocalStorageMock();
    vi.stubGlobal('localStorage', mock);

    const result = saveTasks(sampleTasks);

    expect(result).toBeNull();
    expect(mock.setItem).toHaveBeenCalledOnce();
    expect(mock.setItem).toHaveBeenCalledWith(STORAGE_KEY, JSON.stringify(sampleTasks));
  });

  it('returns an Error (does not throw) when setItem throws a quota-exceeded error', () => {
    const mock = makeLocalStorageMock();
    mock.setItem.mockImplementation(() => {
      throw new DOMException('QuotaExceededError', 'QuotaExceededError');
    });
    vi.stubGlobal('localStorage', mock);

    let result: Error | null;
    expect(() => {
      result = saveTasks(sampleTasks);
    }).not.toThrow();

    expect(result!).toBeInstanceOf(Error);
  });

  it('returns an Error (does not throw) when setItem throws a generic security error', () => {
    const mock = makeLocalStorageMock();
    mock.setItem.mockImplementation(() => {
      throw new Error('SecurityError');
    });
    vi.stubGlobal('localStorage', mock);

    const result = saveTasks(sampleTasks);

    expect(result).toBeInstanceOf(Error);
  });
});

describe('loadTasks', () => {
  it('returns an empty array and null error when localStorage has no entry (null)', () => {
    const mock = makeLocalStorageMock(); // no pre-seeded data → getItem returns null
    vi.stubGlobal('localStorage', mock);

    const { tasks, error } = loadTasks();

    expect(tasks).toEqual([]);
    expect(error).toBeNull();
  });

  it('returns the deserialised task list and null error on a valid read', () => {
    const mock = makeLocalStorageMock({
      [STORAGE_KEY]: JSON.stringify(sampleTasks),
    });
    vi.stubGlobal('localStorage', mock);

    const { tasks, error } = loadTasks();

    expect(error).toBeNull();
    expect(tasks).toEqual(sampleTasks);
  });

  it('returns an empty array and an error string when the stored JSON is malformed', () => {
    const mock = makeLocalStorageMock({
      [STORAGE_KEY]: 'not valid json {{{{',
    });
    vi.stubGlobal('localStorage', mock);

    const { tasks, error } = loadTasks();

    expect(tasks).toEqual([]);
    expect(typeof error).toBe('string');
    expect(error!.length).toBeGreaterThan(0);
  });
});
