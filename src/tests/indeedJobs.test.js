import test from 'node:test';
import assert from 'node:assert';
import { cleanLocation } from '../utils/normalize.js';

test('cleanLocation normalizes spacing', () => {
  assert.equal(cleanLocation(' Nairobi   ,  Kenya '), 'Nairobi , Kenya');
});
