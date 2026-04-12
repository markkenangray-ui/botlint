'use strict';

const { createMockClient } = require('../src/mockClient');
const setupMatchers = require('../jest');

setupMatchers();

describe('createMockClient()', () => {
  let mock;

  beforeEach(() => {
    mock = createMockClient();
  });

  test('returns object with client, calls, lastCall, reset', () => {
    expect(mock).toHaveProperty('client');
    expect(mock).toHaveProperty('calls');
    expect(mock).toHaveProperty('lastCall');
    expect(mock).toHaveProperty('reset');
    expect(typeof mock.lastCall).toBe('function');
    expect(typeof mock.reset).toBe('function');
  });

  test('client.chat.postMessage resolves with { ok: true }', async () => {
    const result = await mock.client.chat.postMessage({ channel: 'C123', text: 'hello' });
    expect(result.ok).toBe(true);
  });

  test('chat.postMessage call is recorded', async () => {
    await mock.client.chat.postMessage({ channel: 'C123', text: 'hello' });
    expect(mock.calls['chat.postMessage']).toHaveLength(1);
    expect(mock.calls['chat.postMessage'][0]).toMatchObject({ channel: 'C123', text: 'hello' });
  });

  test('lastCall returns correct args', async () => {
    await mock.client.chat.postMessage({ channel: 'C123', text: 'hello' });
    const last = mock.lastCall('chat.postMessage');
    expect(last).toMatchObject({ channel: 'C123', text: 'hello' });
  });

  test('multiple calls recorded in order', async () => {
    await mock.client.chat.postMessage({ channel: 'C1', text: 'first' });
    await mock.client.chat.postMessage({ channel: 'C2', text: 'second' });
    expect(mock.calls['chat.postMessage']).toHaveLength(2);
    expect(mock.calls['chat.postMessage'][0].channel).toBe('C1');
    expect(mock.calls['chat.postMessage'][1].channel).toBe('C2');
    expect(mock.lastCall('chat.postMessage').channel).toBe('C2');
  });

  test('reset() clears all calls', async () => {
    await mock.client.chat.postMessage({ channel: 'C123', text: 'hello' });
    mock.reset();
    expect(mock.calls['chat.postMessage']).toHaveLength(0);
    expect(mock.lastCall('chat.postMessage')).toBeNull();
  });

  test('calls.chat.postMessage and calls["chat.postMessage"] are equivalent', async () => {
    await mock.client.chat.postMessage({ channel: 'C123', text: 'hello' });
    expect(mock.calls.chat.postMessage).toBe(mock.calls['chat.postMessage']);
  });

  test('lastCall returns null when method never called', () => {
    expect(mock.lastCall('chat.postMessage')).toBeNull();
    expect(mock.lastCall('views.open')).toBeNull();
  });

  test('client.views.open resolves with { ok: true, view: { id: "V123" } }', async () => {
    const result = await mock.client.views.open({ trigger_id: 'T123', view: {} });
    expect(result.ok).toBe(true);
    expect(result.view).toEqual({ id: 'V123' });
  });

  test('toBeValidSlackBlocks passes for valid blocks', () => {
    const blocks = [{ type: 'section', text: { type: 'mrkdwn', text: 'Hello' } }];
    expect(blocks).toBeValidSlackBlocks();
  });

  test('toBeValidSlackBlocks fails for invalid blocks', () => {
    const blocks = [{ type: 'header', text: { type: 'plain_text', text: 'a'.repeat(151) } }];
    expect(() => expect(blocks).toBeValidSlackBlocks()).toThrow();
  });

  test('toHavePostedTo checks channel correctly', async () => {
    await mock.client.chat.postMessage({ channel: 'C123', text: 'hello' });
    expect(mock.lastCall('chat.postMessage')).toHavePostedTo('C123');
    expect(() => expect(mock.lastCall('chat.postMessage')).toHavePostedTo('C999')).toThrow();
  });

  test('toHaveText checks text correctly', async () => {
    await mock.client.chat.postMessage({ channel: 'C123', text: 'hello world' });
    expect(mock.lastCall('chat.postMessage')).toHaveText('hello world');
    expect(mock.lastCall('chat.postMessage')).toHaveText('hello');
    expect(() => expect(mock.lastCall('chat.postMessage')).toHaveText('goodbye')).toThrow();
  });
});
