import { describe, it, expect } from 'vitest';
import { euToCents } from './euToCents';

describe('euToCents', () => {
  it('wandelt Komma richtig um', () => {
    expect(euToCents('1,50')).toBe(150);
    expect(euToCents(' 0,5 ')).toBe(50);
  });
  it('wandelt Punkt richtig um', () => {
    expect(euToCents('2.00')).toBe(200);
  });
  it('akzeptiert ganze Euro', () => {
    expect(euToCents('1')).toBe(100);
    expect(euToCents('12')).toBe(1200);
  });
  it('rundet 3 Nachkommastellen korrekt', () => {
    expect(euToCents('1,234')).toBe(123);
  });
  it('ignoriert Whitespaces überall', () => {
    expect(euToCents('  2 , 5  ')).toBe(250);
  });
  it('lehnt ungültige/negative/0 ab', () => {
    expect(euToCents('abc')).toBeNull();
    expect(euToCents('-2')).toBeNull();
    expect(euToCents('0')).toBeNull();
  });
});