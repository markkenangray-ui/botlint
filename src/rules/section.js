'use strict';

/**
 * Validates a section block.
 * @param {object} block
 * @param {number} index
 * @returns {string[]}
 */
function validate(block, index) {
  const errors = [];
  const prefix = `block[${index}]`;

  if (block.type !== 'section') {
    errors.push(`${prefix}.type must be 'section' (got: '${block.type}')`);
  }

  const hasText = block.text != null;
  const hasFields = Array.isArray(block.fields) && block.fields.length > 0;

  if (!hasText && !hasFields) {
    errors.push(`section ${prefix} must have at least one of 'text' or 'fields'`);
  }

  if (hasText) {
    const text = block.text;
    if (!text.type) {
      errors.push(`${prefix}.text.type is required`);
    } else if (text.type !== 'plain_text' && text.type !== 'mrkdwn') {
      errors.push(`${prefix}.text.type must be 'plain_text' or 'mrkdwn' (got: '${text.type}')`);
    }
    if (!text.text && text.text !== '') {
      errors.push(`${prefix}.text.text is required`);
    } else if (typeof text.text === 'string' && text.text.length > 3000) {
      errors.push(`${prefix}.text exceeds 3000 character limit (current: ${text.text.length} chars)`);
    }
  }

  if (Array.isArray(block.fields)) {
    if (block.fields.length > 10) {
      errors.push(`section ${prefix}.fields has ${block.fields.length} items — maximum is 10`);
    }
    block.fields.forEach((field, i) => {
      if (!field.type) {
        errors.push(`${prefix}.fields[${i}].type is required`);
      }
      if (typeof field.text === 'string' && field.text.length > 2000) {
        errors.push(`${prefix}.fields[${i}].text exceeds 2000 character limit (current: ${field.text.length} chars)`);
      }
    });
  }

  if (block.accessory != null) {
    if (!block.accessory.type) {
      errors.push(`${prefix}.accessory must have a type field`);
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
