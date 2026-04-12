'use strict';

/**
 * Validates a video block.
 * @param {object} block
 * @param {number} index
 * @returns {string[]}
 */
function validate(block, index) {
  const errors = [];
  const prefix = `block[${index}]`;

  if (block.type !== 'video') {
    errors.push(`${prefix}.type must be 'video' (got: '${block.type}')`);
  }

  if (!block.title) {
    errors.push(`video ${prefix}.title is required`);
  } else {
    if (!block.title.type) {
      errors.push(`${prefix}.title.type is required`);
    } else if (block.title.type !== 'plain_text') {
      errors.push(`${prefix}.title.type must be 'plain_text' (got: '${block.title.type}')`);
    }
    if (typeof block.title.text === 'string' && block.title.text.length > 2000) {
      errors.push(`${prefix}.title.text exceeds 2000 character limit (current: ${block.title.text.length} chars)`);
    }
  }

  if (block.title_url != null && typeof block.title_url !== 'string') {
    errors.push(`${prefix}.title_url must be a string`);
  }

  if (block.description != null) {
    if (!block.description.type) {
      errors.push(`${prefix}.description.type is required`);
    } else if (block.description.type !== 'plain_text') {
      errors.push(`${prefix}.description.type must be 'plain_text' (got: '${block.description.type}')`);
    }
    if (typeof block.description.text === 'string' && block.description.text.length > 2000) {
      errors.push(`${prefix}.description.text exceeds 2000 character limit (current: ${block.description.text.length} chars)`);
    }
  }

  if (!block.video_url) {
    errors.push(`video ${prefix}.video_url is required`);
  } else if (typeof block.video_url !== 'string') {
    errors.push(`${prefix}.video_url must be a string`);
  }

  if (!block.thumbnail_url) {
    errors.push(`video ${prefix}.thumbnail_url is required`);
  } else if (typeof block.thumbnail_url !== 'string') {
    errors.push(`${prefix}.thumbnail_url must be a string`);
  }

  if (!block.alt_text && block.alt_text !== '') {
    errors.push(`video ${prefix}.alt_text is required`);
  }

  if (block.block_id != null) {
    if (typeof block.block_id !== 'string' || block.block_id.length > 255) {
      errors.push(`${prefix}.block_id exceeds 255 character limit (current: ${String(block.block_id).length} chars)`);
    }
  }

  return errors;
}

module.exports = { validate };
