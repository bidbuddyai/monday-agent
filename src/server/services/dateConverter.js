/**
 * Convert Pacific Time to UTC
 * Accounts for PST (UTC-8) and PDT (UTC-7) based on date
 */
function convertPTtoUTC(dateString) {
  // Parse various date formats
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    // Try parsing common formats manually
    const formats = [
      /(\d{1,2})\/(\d{1,2})\/(\d{2,4})\s+(\d{1,2}):(\d{2})\s*(AM|PM)/i,
      /(\w+)\s+(\d{1,2}),?\s+(\d{4})\s+(\d{1,2}):(\d{2})\s*(AM|PM)/i,
      /(\d{1,2})\/(\d{1,2})\/(\d{2,4})/
    ];

    for (const regex of formats) {
      const match = dateString.match(regex);
      if (match) {
        // Parse and create date object
        // (implementation would handle each format)
        break;
      }
    }
  }

  // Determine if DST is in effect for the date
  const isDST = isDaylightSavingTime(date);
  const offset = isDST ? 7 : 8; // PDT = UTC-7, PST = UTC-8

  // Add offset hours to convert to UTC
  const utcDate = new Date(date.getTime() + (offset * 60 * 60 * 1000));

  return utcDate.toISOString();
}

/**
 * Check if date is during Daylight Saving Time
 * DST in US: Second Sunday in March to First Sunday in November
 */
function isDaylightSavingTime(date) {
  const year = date.getFullYear();
  
  // Find second Sunday of March
  const march = new Date(year, 2, 1); // March 1
  const marchSecondSunday = new Date(year, 2, (14 - march.getDay()));
  
  // Find first Sunday of November
  const november = new Date(year, 10, 1); // November 1
  const novemberFirstSunday = new Date(year, 10, (7 - november.getDay() + 1));
  
  return date >= marchSecondSunday && date < novemberFirstSunday;
}

/**
 * Format date for Monday.com date column
 */
function formatForMondayDate(dateString) {
  const utcDate = convertPTtoUTC(dateString);
  return new Date(utcDate).toISOString().split('T')[0]; // YYYY-MM-DD
}

/**
 * Format datetime for Monday.com
 */
function formatForMondayDateTime(dateString) {
  return convertPTtoUTC(dateString); // ISO 8601 UTC
}

module.exports = {
  convertPTtoUTC,
  isDaylightSavingTime,
  formatForMondayDate,
  formatForMondayDateTime
};
