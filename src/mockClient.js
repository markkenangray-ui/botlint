'use strict';

function createMockClient() {
  const callLog = {
    'chat.postMessage': [],
    'chat.update': [],
    'chat.delete': [],
    'views.open': [],
    'views.update': [],
    'views.push': [],
    'users.info': [],
  };

  function record(method, args) {
    callLog[method].push(args);
  }

  const client = {
    chat: {
      postMessage: (args) => { record('chat.postMessage', args); return Promise.resolve({ ok: true, ts: '123.456' }); },
      update: (args) => { record('chat.update', args); return Promise.resolve({ ok: true }); },
      delete: (args) => { record('chat.delete', args); return Promise.resolve({ ok: true }); },
    },
    views: {
      open: (args) => { record('views.open', args); return Promise.resolve({ ok: true, view: { id: 'V123' } }); },
      update: (args) => { record('views.update', args); return Promise.resolve({ ok: true }); },
      push: (args) => { record('views.push', args); return Promise.resolve({ ok: true }); },
    },
    users: {
      info: (args) => { record('users.info', args); return Promise.resolve({ ok: true, user: { id: args && args.user, name: 'testuser' } }); },
    },
  };

  // calls supports both calls['chat.postMessage'] and calls.chat.postMessage
  const calls = new Proxy(callLog, {
    get(target, prop) {
      // Direct string key access: calls['chat.postMessage']
      if (typeof prop === 'string' && prop in target) {
        return target[prop];
      }
      // Nested access: calls.chat or calls.views or calls.users
      // Return a sub-proxy that resolves calls.chat.postMessage -> callLog['chat.postMessage']
      if (typeof prop === 'string' && ['chat', 'views', 'users'].includes(prop)) {
        return new Proxy({}, {
          get(_, subProp) {
            const key = `${prop}.${String(subProp)}`;
            return target[key];
          }
        });
      }
      return target[prop];
    }
  });

  function lastCall(method) {
    const log = callLog[method];
    if (!log || log.length === 0) return null;
    return log[log.length - 1];
  }

  function reset() {
    Object.keys(callLog).forEach(k => { callLog[k] = []; });
  }

  return { client, calls, lastCall, reset };
}

module.exports = { createMockClient };
