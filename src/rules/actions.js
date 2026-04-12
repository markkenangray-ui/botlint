'use strict';

/**
 * Validates an actions block.
 * @param {object} block
 * @param {number} index
 * @returns {string[]}
 */
function validate(block, index) {
  const errors = [];
  const prefix = `block[${index}]`;

  if (block.type !== 'actions') {
    errors.push(`${prefix}.type must be 'actions' (got: '${block.type}')`);
  }

  if (!Array.isArray(block.elements)) {
    errors.push(`actions ${prefix}.elements is required and must be an array`);
  } else {
    if (block.elements.length < 1) {
      errors.push(`actions ${prefix} has 0 elements — minimum is 1`);
    }
    if (block.elements.length > 5) {
      errors.push(`actions ${prefix} has ${block.elements.length} elements — maximum is 5`);
    }
    block.elements.forEach((el, i) => {
      if (!el.type) {
        errors.push(`${prefix}.elements[${i}] must have a type field`);
        return;
      }
      if (el.type === 'button') {
        if (!el.text) {
          errors.push(`${prefix}.elements[${i}].text is required for button elements`);
        } else {
          if (el.text.type !== 'plain_text') {
            errors.push(`${prefix}.elements[${i}].text.type must be 'plain_text' for button (got: '${el.text.type}')`);
          }
          if (typeof el.text.text === 'string' && el.text.text.length > 75) {
            errors.push(`${prefix}.elements[${i}].text exceeds 75 character limit (current: ${el.text.text.length} chars)`);
          }
        }
        if (!el.action_id) {
          errors.push(`${prefix}.elements[${i}].action_id is required for button elements`);
        } else if (typeof el.action_id === 'string' && el.action_id.length > 255) {
          errors.push(`${prefix}.elements[${i}].action_id exceeds 255 character limit (current: ${el.action_id.length} chars)`);
        }
        if (el.value != null && typeof el.value === 'string' && el.value.length > 2000) {
          errors.push(`${prefix}.elements[${i}].value exceeds 2000 character limit (current: ${el.value.length} chars)`);
        }
        if (el.style != null && el.style !== 'primary' && el.style !== 'danger') {
          errors.push(`${prefix}.elements[${i}].style must be 'primary' or 'danger' (got: '${el.style}')`);
        }
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
