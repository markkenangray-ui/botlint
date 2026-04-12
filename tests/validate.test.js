'use strict';

const { validate } = require('../src/validate');

describe('validate()', () => {
  test('empty array returns valid', () => {
    const result = validate([]);
    expect(result).toEqual({ valid: true, errors: [] });
  });

  test('valid section block returns valid', () => {
    const result = validate([{
      type: 'section',
      text: { type: 'mrkdwn', text: 'Hello world' }
    }]);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('section text > 3000 chars returns error', () => {
    const result = validate([{
      type: 'section',
      text: { type: 'mrkdwn', text: 'a'.repeat(3001) }
    }]);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toMatch(/3000/);
    expect(result.errors[0]).toMatch(/3001/);
  });

  test('actions block with > 5 elements returns error', () => {
    const elements = Array.from({ length: 6 }, (_, i) => ({
      type: 'button',
      text: { type: 'plain_text', text: `Btn ${i}` },
      action_id: `action_${i}`
    }));
    const result = validate([{ type: 'actions', elements }]);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('5') || e.includes('maximum'))).toBe(true);
  });

  test('button label > 75 chars returns error', () => {
    const result = validate([{
      type: 'actions',
      elements: [{
        type: 'button',
        text: { type: 'plain_text', text: 'a'.repeat(76) },
        action_id: 'my_action'
      }]
    }]);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('75'))).toBe(true);
  });

  test('header text > 150 chars returns error', () => {
    const result = validate([{
      type: 'header',
      text: { type: 'plain_text', text: 'a'.repeat(151) }
    }]);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('150'))).toBe(true);
  });

  test('duplicate block_ids returns error', () => {
    const result = validate([
      { type: 'section', block_id: 'my_block', text: { type: 'mrkdwn', text: 'Hello' } },
      { type: 'section', block_id: 'my_block', text: { type: 'mrkdwn', text: 'World' } }
    ]);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('my_block') && e.includes('unique'))).toBe(true);
  });

  test('unknown block type passes through as valid', () => {
    const result = validate([{ type: 'future_block_type', some_field: 'value' }]);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('modal with no title returns error', () => {
    const result = validate({
      type: 'modal',
      callback_id: 'my_modal',
      blocks: []
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('title'))).toBe(true);
  });

  test('modal with title > 24 chars returns error', () => {
    const result = validate({
      type: 'modal',
      title: { type: 'plain_text', text: 'a'.repeat(25) },
      callback_id: 'my_modal',
      blocks: []
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('24'))).toBe(true);
  });

  test('modal with no callback_id returns error', () => {
    const result = validate({
      type: 'modal',
      title: { type: 'plain_text', text: 'My Modal' },
      blocks: []
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('callback_id'))).toBe(true);
  });

  test('valid modal returns valid', () => {
    const result = validate({
      type: 'modal',
      title: { type: 'plain_text', text: 'My Modal' },
      callback_id: 'my_modal',
      blocks: [
        { type: 'section', text: { type: 'mrkdwn', text: 'Hello' } }
      ]
    });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('validates single block (not array)', () => {
    const result = validate({ type: 'header', text: { type: 'plain_text', text: 'Hello' } });
    expect(result.valid).toBe(true);
  });

  test('single invalid block returns specific error', () => {
    const result = validate({ type: 'header', text: { type: 'plain_text', text: 'a'.repeat(200) } });
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/150/);
  });

  test('error messages include violation details', () => {
    const result = validate([{
      type: 'section',
      text: { type: 'mrkdwn', text: 'a'.repeat(3001) }
    }]);
    expect(result.errors[0]).toMatch(/3001/);
  });

  test('never throws — always returns object', () => {
    expect(() => validate(null)).not.toThrow();
    expect(() => validate(undefined)).not.toThrow();
    expect(() => validate(42)).not.toThrow();
    expect(() => validate('string')).not.toThrow();
    const r1 = validate(null);
    expect(r1).toHaveProperty('valid');
    expect(r1).toHaveProperty('errors');
  });
});
