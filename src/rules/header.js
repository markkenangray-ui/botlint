'use strict';

/**
 * Validates a header block.
 * @param {object} block
 * @param {number} index
 * @returns {string[]}
 */
function validate(block, index) {
  const errors = [];
  const prefix = `block[${index}]`;

  if (block.type !== 'header') {
    errors.push(`${prefix}.type must be 'header' (got: '${block.type}')`);
  }

  if (!block.text) {
    errors.push(`header ${prefix}.text is required`);
  } else {
    if (!block.text.type) {
      errors.push(`${prefix}.text.type is required`);
    } else if (block.text.type !== 'plain_text') {
      errors.push(`header ${prefix}.text type must be 'plain_text' (got: '${block.text.type}')`);
    }
    if (typeof block.text.text === 'string' && block.text.text.length > 150) {
      errors.push(`${prefix}.text exceeds 150 character limit (current: ${block.text.text.length} chars)`);
    }
  }

  if (block.block_id != null) {
    if (typeof block.block_id !== 'string' || block.block_id.length > 255) {
      errors.push(`${prefix}.block_id exceeds 255 character limit (current: ${String(block.block_id).length} chars)`);
    }
  }

  return errors;
}

module.exports = { validate };
