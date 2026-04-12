'use strict';

const RULE_MAP = {
  section: require('./rules/section'),
  actions: require('./rules/actions'),
  context: require('./rules/context'),
  header: require('./rules/header'),
  image: require('./rules/image'),
  input: require('./rules/input'),
  divider: require('./rules/divider'),
  video: require('./rules/video'),
  rich_text: require('./rules/rich_text'),
};

const modalRule = require('./rules/modal');

function validateBlock(block, index) {
  // index is the position in the parent array (for error messages)
  if (!block || typeof block !== 'object') {
    return [`block[${index}] is not an object`];
  }
  const { type } = block;
  if (!type) {
    return [`block[${index}] missing required field: type`];
  }
  const rule = RULE_MAP[type];
  if (!rule) {
    // Unknown/unsupported type — pass through
    return [];
  }
  return rule.validate(block, index);
}

function checkDuplicateBlockIds(blocks, prefix) {
  // prefix is like 'block' or 'modal.blocks'
  const errors = [];
  const seen = {};
  blocks.forEach((block, i) => {
    if (block.block_id) {
      if (seen[block.block_id] !== undefined) {
        errors.push(`${prefix}[${i}].block_id must be unique — '${block.block_id}' appears at index ${seen[block.block_id]} and ${i}`);
      } else {
        seen[block.block_id] = i;
      }
    }
  });
  return errors;
}

function validate(input) {
  try {
    if (Array.isArray(input)) {
      // Array of blocks
      const errors = [];
      input.forEach((block, i) => {
        const blockErrors = validateBlock(block, i);
        errors.push(...blockErrors);
      });
      errors.push(...checkDuplicateBlockIds(input, 'block'));
      return { valid: errors.length === 0, errors };
    }

    if (input && typeof input === 'object') {
      if (input.type === 'modal') {
        const errors = modalRule.validate(input);
        return { valid: errors.length === 0, errors };
      }
      if (input.type === 'home') {
        // Home tab: validate blocks array
        const errors = [];
        if (!Array.isArray(input.blocks)) {
          errors.push('home tab missing required field: blocks (must be array)');
        } else {
          input.blocks.forEach((block, i) => {
            errors.push(...validateBlock(block, i));
          });
          errors.push(...checkDuplicateBlockIds(input.blocks, 'block'));
        }
        return { valid: errors.length === 0, errors };
      }
      // Single block object
      const errors = validateBlock(input, 0);
      return { valid: errors.length === 0, errors };
    }

    return { valid: false, errors: ['input must be an array of blocks, a block object, or a modal/home view object'] };
  } catch (err) {
    return { valid: false, errors: [`unexpected error: ${err.message}`] };
  }
}

module.exports = { validate, validateBlock, checkDuplicateBlockIds };
