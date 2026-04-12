> "I had to patch urllib.request.urlopen calls, since the Slack SDK uses that under the hood. It's a little nasty."

# botlint-slack

Testing utilities for Slack bots. Block Kit validation and SDK mocking — works with @slack/bolt, @slack/web-api, and any Slack bot framework.

## The problem

Slack's API returns 200 OK even when your Block Kit is completely invalid. The metadata gets silently dropped. Your message appears as plain text. No error. The only way to find out is to deploy and check a real Slack channel. Every iteration requires a real API call.

botlint validates your blocks before they reach Slack — and lets you test your handlers without a real Slack workspace.

## Install

```
npm install botlint-slack --save-dev
```

## Block Kit validation

```js
const { validate } = require('botlint-slack');

// Header text has a 150 character limit. This one is 160 characters.
const blocks = [
  {
    type: 'header',
    text: {
      type: 'plain_text',
      text: 'This is a very long header that exceeds the Slack limit because someone copy-pasted a full sentence into it',
    },
  },
];

const result = validate(blocks);

console.log(result);
// {
//   valid: false,
//   errors: [
//     'block[0].text exceeds 150 character limit (current: 103 chars)'
//   ]
// }
```

Pass an array of blocks, a single block object, or a full modal/home view object. `validate` always returns `{ valid: boolean, errors: string[] }`.

```js
// Single block
validate({ type: 'section', text: { type: 'mrkdwn', text: 'Hello' } });
// { valid: true, errors: [] }

// Modal view
validate({
  type: 'modal',
  title: { type: 'plain_text', text: 'My Modal' },
  blocks: [
    { type: 'section', text: { type: 'mrkdwn', text: 'Pick something' } },
  ],
});
// { valid: true, errors: [] }
```

## SDK mocking

```js
const { createMockClient } = require('botlint-slack');

// --- The handler you want to test ---
async function notifyUser(client, channel, username) {
  const userInfo = await client.users.info({ user: username });
  await client.chat.postMessage({
    channel,
    text: `Welcome, ${userInfo.user.name}!`,
    blocks: [
      {
        type: 'section',
        text: { type: 'mrkdwn', text: `*Welcome, ${userInfo.user.name}!*` },
      },
    ],
  });
}

// --- The test ---
test('notifyUser posts a welcome message to the correct channel', async () => {
  const mock = createMockClient();

  await notifyUser(mock.client, 'C123ABC', 'U456DEF');

  const post = mock.lastCall('chat.postMessage');

  expect(post.channel).toBe('C123ABC');
  expect(post.text).toContain('testuser');
  expect(post.blocks).toHaveLength(1);

  // Full call history is available too
  expect(mock.calls['chat.postMessage']).toHaveLength(1);
  expect(mock.calls['users.info']).toHaveLength(1);
});
```

`createMockClient` returns:

- `client` — drop-in replacement for the @slack/web-api `WebClient`
- `calls` — full call log, accessible as `calls['chat.postMessage']` or `calls.chat.postMessage`
- `lastCall(method)` — returns the args from the most recent call to that method, or `null`
- `reset()` — clears all recorded calls (useful in `beforeEach`)

## Jest matchers

### Setup

**jest.config.js**

```js
module.exports = {
  setupFilesAfterEnv: ['./jest.setup.js'],
};
```

**jest.setup.js**

```js
const setupMatchers = require('botlint/jest');
setupMatchers();
```

### Usage

**`toBeValidSlackBlocks()`**

Asserts that an array of blocks passes botlint validation.

```js
test('blocks are valid', () => {
  const blocks = [
    { type: 'section', text: { type: 'mrkdwn', text: 'Hello world' } },
  ];
  expect(blocks).toBeValidSlackBlocks();
});

test('catches invalid header', () => {
  const blocks = [
    {
      type: 'header',
      text: { type: 'plain_text', text: 'x'.repeat(151) },
    },
  ];
  // Fails with: Expected valid Slack blocks, but found 1 error(s):
  //   - block[0].text exceeds 150 character limit (current: 151 chars)
  expect(blocks).toBeValidSlackBlocks();
});
```

**`toBeValidSlackModal()`**

Asserts that a modal view object passes validation.

```js
test('modal is valid', () => {
  const modal = {
    type: 'modal',
    title: { type: 'plain_text', text: 'Settings' },
    blocks: [
      { type: 'section', text: { type: 'mrkdwn', text: 'Choose an option' } },
    ],
  };
  expect(modal).toBeValidSlackModal();
});
```

**`toHavePostedTo(channel)`**

Asserts that a recorded call targeted a specific channel.

```js
test('posts to the right channel', async () => {
  const mock = createMockClient();
  await mock.client.chat.postMessage({ channel: 'C123', text: 'hi' });
  expect(mock.lastCall('chat.postMessage')).toHavePostedTo('C123');
});
```

**`toHaveText(text)`**

Asserts that the `text` field of a recorded call equals or contains the given string.

```js
test('message contains expected text', async () => {
  const mock = createMockClient();
  await mock.client.chat.postMessage({ channel: 'C123', text: 'Deployment succeeded' });
  expect(mock.lastCall('chat.postMessage')).toHaveText('succeeded');
});
```

**`toHaveBlocks()`**

Asserts that a recorded call included a non-empty `blocks` array.

```js
test('message includes blocks', async () => {
  const mock = createMockClient();
  await mock.client.chat.postMessage({
    channel: 'C123',
    text: 'fallback',
    blocks: [{ type: 'section', text: { type: 'mrkdwn', text: 'Rich content' } }],
  });
  expect(mock.lastCall('chat.postMessage')).toHaveBlocks();
});
```

## What gets validated

| Block Type | Rules Checked | Key Limits |
|------------|---------------|------------|
| `section` | text or fields required, text type, fields count | text ≤ 3000 chars, fields ≤ 10 items, field text ≤ 2000 chars |
| `actions` | elements required, button text/action_id/style, element count | 1–5 elements, button text ≤ 75 chars, action_id ≤ 255 chars, value ≤ 2000 chars |
| `context` | elements required, image url/alt_text, text type | 1–10 elements, text ≤ 2000 chars, alt_text ≤ 2000 chars |
| `header` | text required, text type must be plain_text | text ≤ 150 chars |
| `image` | image_url and alt_text required, title type | alt_text ≤ 2000 chars, title ≤ 2000 chars |
| `input` | label required, element required, dispatch_action type | label ≤ 2000 chars, hint ≤ 2000 chars |
| `divider` | type check only | — |
| `video` | title, video_url, alt_text, thumbnail_url required | title ≤ 200 chars, alt_text ≤ 2000 chars |
| `rich_text` | elements array required | elements must be array |
| `modal` | type, title, blocks required; title type; block count | title ≤ 24 chars, submit/close ≤ 24 chars, ≤ 100 blocks |

All block types also check that `block_id`, when present, does not exceed 255 characters and is unique across the blocks array.

## What gets mocked

All methods return resolved promises. No network calls are made.

- `client.chat.postMessage` → `{ ok: true, ts: '123.456' }`
- `client.chat.update` → `{ ok: true }`
- `client.chat.delete` → `{ ok: true }`
- `client.views.open` → `{ ok: true, view: { id: 'V123' } }`
- `client.views.update` → `{ ok: true }`
- `client.views.push` → `{ ok: true }`
- `client.users.info` → `{ ok: true, user: { id: <requested user id>, name: 'testuser' } }`

## Why not just use TypeScript types?

Types validate structure at compile time but not runtime data, conditional constraints, schema semantics, or string length limits. botlint catches invalid or dynamically built blocks that type-check but still fail Slack's API.

For example, a header block with a 200-character title satisfies the TypeScript type `{ type: 'header', text: { type: 'plain_text', text: string } }` but will be rejected by Slack. If that text comes from a database or user input, no type checker will catch it.

## Contributing

This is a small side project. Issues are triaged but PRs may not be reviewed promptly. Feel free to fork.

## Roadmap

- V2: E2E testing — send real messages, assert real responses, click buttons
- V3: Cloud runner for CI/CD

## License

MIT
