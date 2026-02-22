import { describe, expect, it } from 'vitest';
import { platformTagline } from './index';

describe('shared exports', () => {
  it('exports a non-empty platform tagline', () => {
    expect(platformTagline.length).toBeGreaterThan(0);
  });
});
