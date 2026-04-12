'use strict';

const { validate } = require('./src/validate');

module.exports = function setupMatchers() {
  expect.extend({
    toBeValidSlackBlocks(received) {
      const result = validate(received);
      if (result.valid) {
        return {
          pass: true,
          message: () => 'Expected blocks to be invalid, but they were valid',
        };
      }
      return {
        pass: false,
        message: () =>
          `Expected valid Slack blocks, but found ${result.errors.length} error(s):\n` +
          result.errors.map(e => `  - ${e}`).join('\n'),
      };
    },

    toBeValidSlackModal(received) {
      const result = validate(received);
      if (result.valid) {
        return {
          pass: true,
          message: () => 'Expected modal to be invalid, but it was valid',
        };
      }
      return {
        pass: false,
        message: () =>
          `Expected valid Slack modal, but found ${result.errors.length} error(s):\n` +
          result.errors.map(e => `  - ${e}`).join('\n'),
      };
    },

    toHavePostedTo(received, channel) {
      if (!received || typeof received !== 'object') {
        return {
          pass: false,
          message: () => `Expected a call record object, but received ${typeof received}`,
        };
      }
      const pass = received.channel === channel;
      return {
        pass,
        message: () =>
          pass
            ? `Expected call NOT to have posted to '${channel}', but it did`
            : `Expected call to have posted to '${channel}', but got '${received.channel}'`,
      };
    },

    toHaveText(received, text) {
      if (!received || typeof received !== 'object') {
        return {
          pass: false,
          message: () => `Expected a call record object, but received ${typeof received}`,
        };
      }
      const receivedText = received.text;
      const pass =
        receivedText === text ||
        (typeof receivedText === 'string' && receivedText.includes(text));
      return {
        pass,
        message: () =>
          pass
            ? `Expected text NOT to contain '${text}', but it did`
            : `Expected text to equal or contain '${text}', but got '${receivedText}'`,
      };
    },

    toHaveBlocks(received) {
      if (!received || typeof received !== 'object') {
        return {
          pass: false,
          message: () => `Expected a call record object, but received ${typeof received}`,
        };
      }
      const pass = Array.isArray(received.blocks) && received.blocks.length > 0;
      return {
        pass,
        message: () =>
          pass
            ? 'Expected call NOT to have blocks, but it did'
            : `Expected call to have a non-empty blocks array, but got: ${JSON.stringify(received.blocks)}`,
      };
    },
  });
};
