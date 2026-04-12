'use strict';

/**
 * Validates an input block.
 * @param {object} block
 * @param {number} index
 * @returns {string[]}
 */
function validate(block, index) {
  const errors = [];
  const prefix = `block[${index}]`;

  if (block.type !== 'input') {
    errors.push(`${prefix}.type must be 'input' (got: '${block.type}')`);
  }

  if (!block.label) {
    errors.push(`input ${prefix}.label is required`);
  } else {
    if (!block.label.type) {
      errors.push(`${prefix}.label.type is required`);
    } else if (block.label.type !== 'plain_text') {
      errors.push(`${prefix}.label.type must be 'plain_text' (got: '${block.label.type}')`);
    }
    if (typeof block.label.text === 'string' && block.label.text.length > 2000) {
      errors.push(`${prefix}.label.text exceeds 2000 character limit (current: ${block.label.text.length} chars)`);
    }
  }

  if (!block.element) {
    errors.push(`input ${prefix}.element is required`);
  } else if (!block.element.type) {
    errors.push(`${prefix}.element must have a type field`);
  }

  if (block.hint != null) {
    if (!block.hint.type) {
      errors.push(`${prefix}.hint.type is required`);
    } else if (block.hint.type !== 'plain_text') {
      errors.push(`${prefix}.hint.type must be 'plain_text' (got: '${block.hint.type}')`);
    }
    if (typeof block.hint.text === 'string' && block.hint.text.length > 2000) {
      errors.push(`${prefix}.hint.text exceeds 2000 character limit (current: ${block.hint.text.length} chars)`);
    }
  }

  if (block.optional != null && typeof block.optional !== 'boolean') {
    errors.push(`${prefix}.optional must be a boolean (got: ${typeof block.optional})`);
  }

  if (block.block_id != null) {
    if (typeof block.block_id !== 'string' || block.block_id.length > 255) {
      errors.push(`${prefix}.block_id exceeds 255 character limit (current: ${String(block.block_id).length} chars)`);
    }
  }

  return errors;
}

module.exports = { validate };
