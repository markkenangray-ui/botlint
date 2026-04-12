'use strict';

/**
 * Validates an image block.
 * @param {object} block
 * @param {number} index
 * @returns {string[]}
 */
function validate(block, index) {
  const errors = [];
  const prefix = `block[${index}]`;

  if (block.type !== 'image') {
    errors.push(`${prefix}.type must be 'image' (got: '${block.type}')`);
  }

  if (!block.image_url) {
    errors.push(`image ${prefix}.image_url is required`);
  } else if (typeof block.image_url !== 'string') {
    errors.push(`${prefix}.image_url must be a string`);
  }

  if (!block.alt_text && block.alt_text !== '') {
    errors.push(`image ${prefix}.alt_text is required`);
  } else if (typeof block.alt_text === 'string' && block.alt_text.length > 2000) {
    errors.push(`${prefix}.alt_text exceeds 2000 character limit (current: ${block.alt_text.length} chars)`);
  }

  if (block.title != null) {
    if (!block.title.type) {
      errors.push(`${prefix}.title.type is required`);
    } else if (block.title.type !== 'plain_text') {
      errors.push(`${prefix}.title.type must be 'plain_text' (got: '${block.title.type}')`);
    }
    if (typeof block.title.text === 'string' && block.title.text.length > 2000) {
      errors.push(`${prefix}.title.text exceeds 2000 character limit (current: ${block.title.text.length} chars)`);
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
