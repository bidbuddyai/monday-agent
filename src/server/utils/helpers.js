/**
 * Safely parse JSON strings
 * @param {string} value
 * @param {object} fallback
 * @returns {object}
 */
function safeJsonParse(value, fallback = {}) {
  try {
    return JSON.parse(value);
  } catch (error) {
    return fallback;
  }
}

/**
 * Normalize board column metadata
 * @param {Array} columns
 * @returns {Array}
 */
function normalizeColumns(columns = []) {
  return columns.map(column => {
    if (column.settings_str && !column.settings) {
      column.settings = safeJsonParse(column.settings_str, {});
      delete column.settings_str;
    }
    return column;
  });
}

module.exports = {
  safeJsonParse,
  normalizeColumns
};
