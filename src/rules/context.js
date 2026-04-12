'use strict';

/**
 * Validates a context block.
 * @param {object} block
 * @param {number} index
 * @returns {string[]}
 */
function validate(block, index) {
  const errors = [];
  const prefix = `block[${index}]`;

  if (block.type !== 'context') {
    errors.push(`${prefix}.type must be 'context' (got: '${block.type}')`);
  }

  if (!Array.isArray(block.elements)) {
    errors.push(`context ${prefix}.elements is required and must be an array`);
  } else {
    if (block.elements.length < 1) {
      errors.push(`context ${prefix} has 0 elements — minimum is 1`);
    }
    if (block.elements.length > 10) {
      errors.push(`context ${prefix} has ${block.elements.length} elements — maximum is 10`);
    }
    block.elements.forEach((el, i) => {
      if (!el.type) {
        errors.push(`${prefix}.elements[${i}] must have a type field`);
        return;
      }
      if (el.type === 'image') {
        if (!el.image_url) {
          errors.push(`${prefix}.elements[${i}].image_url is required for image elements`);
        }
        if (!el.alt_text) {
          errors.push(`${prefix}.elements[${i}].alt_text is required for image elements`);
        } else if (typeof el.alt_text === 'string' && el.alt_text.length > 2000) {
          errors.push(`${prefix}.elements[${i}].alt_text exceeds 2000 character limit (current: ${el.alt_text.length} chars)`);
        }
      } else if (el.type === 'plain_text' || el.type === 'mrkdwn') {
        if (!el.text && el.text !== '') {
          errors.push(`${prefix}.elements[${i}].text is required for text elements`);
        } else if (typeof el.text === 'string' && el.text.length > 2000) {
          errors.push(`${prefix}.elements[${i}].text exceeds 2000 character limit (current: ${el.text.length} chars)`);
        }
      } else {
        errors.push(`${prefix}.elements[${i}].type must be 'image', 'plain_text', or 'mrkdwn' (got: '${el.type}')`);
      }
    });
  }

  if (block.block_id != null) {
    if (typeof block.block_id !== 'string' || block.block_id.length > 255) {
      errors.push(`${prefix}.block_id exceeds 255 character limit (current: ${String(block.block_id).length} chars)`);
    }
  }

  return errors;
}

module.exports = { validate };
