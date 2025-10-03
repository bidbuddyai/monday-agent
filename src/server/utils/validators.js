/**
 * Validate that dropdown values exist in schema
 * @param {object} column
 * @param {string|string[]} value
 * @returns {boolean}
 */
function validateDropdownValue(column, value) {
  if (!column?.settings?.labels) return true;
  const options = Object.values(column.settings.labels);
  if (Array.isArray(value)) {
    return value.every(item => options.includes(item));
  }
  return options.includes(value);
}

/**
 * Validate ISO date string
 * @param {string} value
 * @returns {boolean}
 */
function validateISODate(value) {
  return !value || !isNaN(Date.parse(value));
}

module.exports = {
  validateDropdownValue,
  validateISODate
};
