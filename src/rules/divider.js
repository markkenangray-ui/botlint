'use strict';

/**
 * Validates a divider block.
 * @param {object} block
 * @param {number} index
 * @returns {string[]}
 */
function validate(block, index) {
  const errors = [];
  const prefix = `block[${index}]`;

  if (block.type !== 'divider') {
    errors.push(`${prefix}.type must be 'divider' (got: '${block.type}')`);
  }

  if (block.block_id != null) {
    if (typeof block.block_id !== 'string' || block.block_id.length > 255) {
      errors.push(`${prefix}.block_id exceeds 255 character limit (current: ${String(block.block_id).length} chars)`);
    }
  }

  return errors;
}

module.exports = { validate };
