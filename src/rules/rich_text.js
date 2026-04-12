'use strict';

/**
 * Validates a rich_text block (basic validation).
 * @param {object} block
 * @param {number} index
 * @returns {string[]}
 */
function validate(block, index) {
  const errors = [];
  const prefix = `block[${index}]`;

  if (block.type !== 'rich_text') {
    errors.push(`${prefix}.type must be 'rich_text' (got: '${block.type}')`);
  }

  if (!Array.isArray(block.elements)) {
    errors.push(`rich_text ${prefix}.elements is required and must be an array`);
  }

  if (block.block_id != null) {
    if (typeof block.block_id !== 'string' || block.block_id.length > 255) {
      errors.push(`${prefix}.block_id exceeds 255 character limit (current: ${String(block.block_id).length} chars)`);
    }
  }

  return errors;
}

module.exports = { validate };
