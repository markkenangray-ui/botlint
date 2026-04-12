'use strict';

/**
 * Validates a modal view.
 * @param {object} block  - the modal view object (not a standard block, but validated similarly)
 * @param {number} index
 * @returns {string[]}
 */
function validate(block, index) {
  const errors = [];
  const prefix = `block[${index}]`;

  if (block.type !== 'modal') {
    errors.push(`${prefix}.type must be 'modal' (got: '${block.type}')`);
  }

  if (!block.title) {
    errors.push(`modal ${prefix}.title is required`);
  } else {
    if (!block.title.type) {
      errors.push(`${prefix}.title.type is required`);
    } else if (block.title.type !== 'plain_text') {
      errors.push(`${prefix}.title.type must be 'plain_text' (got: '${block.title.type}')`);
    }
    if (typeof block.title.text === 'string' && block.title.text.length > 24) {
      errors.push(`${prefix}.title.text exceeds 24 character limit (current: ${block.title.text.length} chars)`);
    }
  }

  if (!Array.isArray(block.blocks)) {
    errors.push(`modal ${prefix}.blocks is required and must be an array`);
  }

  if (!block.callback_id) {
    errors.push(`modal ${prefix}.callback_id is required`);
  } else if (typeof block.callback_id === 'string' && block.callback_id.length > 255) {
    errors.push(`${prefix}.callback_id exceeds 255 character limit (current: ${block.callback_id.length} chars)`);
  }

  if (block.submit != null) {
    if (!block.submit.type) {
      errors.push(`${prefix}.submit.type is required`);
    } else if (block.submit.type !== 'plain_text') {
      errors.push(`${prefix}.submit.type must be 'plain_text' (got: '${block.submit.type}')`);
    }
    if (typeof block.submit.text === 'string' && block.submit.text.length > 24) {
      errors.push(`${prefix}.submit.text exceeds 24 character limit (current: ${block.submit.text.length} chars)`);
    }
  }

  if (block.close != null) {
    if (!block.close.type) {
      errors.push(`${prefix}.close.type is required`);
    } else if (block.close.type !== 'plain_text') {
      errors.push(`${prefix}.close.type must be 'plain_text' (got: '${block.close.type}')`);
    }
    if (typeof block.close.text === 'string' && block.close.text.length > 24) {
      errors.push(`${prefix}.close.text exceeds 24 character limit (current: ${block.close.text.length} chars)`);
    }
  }

  if (Array.isArray(block.blocks)) {
    const seenIds = new Map();
    block.blocks.forEach((b, i) => {
      if (b.block_id != null) {
        if (seenIds.has(b.block_id)) {
          errors.push(`modal ${prefix}.blocks has duplicate block_id '${b.block_id}' at blocks[${i}] and blocks[${seenIds.get(b.block_id)}]`);
        } else {
          seenIds.set(b.block_id, i);
        }
      }
    });
  }

  return errors;
}

module.exports = { validate };
