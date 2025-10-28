import { describe, expect, it } from 'vitest';

import { propertyFormSchema } from './validators';

describe('propertyFormSchema', () => {
  it('requires name and address', () => {
    const result = propertyFormSchema.safeParse({ name: '', address: '', status: 'active' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toContain('Name is required');
    }
  });
});
