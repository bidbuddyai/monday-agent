// Intelligent Document Term Search Service

// Search term definitions for bid documents
const BID_SEARCH_TERMS = {
  project_name: [
    'project name', 'project title', 'work', 'name of project',
    'project:', 'title:', 'for the'
  ],
  client: [
    'owner', 'client', 'agency', 'awarding authority',
    'for:', 'prepared for', 'owner:'
  ],
  solicitation: [
    'solicitation', 'project number', 'project no', 'rfp', 'ifb',
    'solicitation number', 'project #', 'rfp #'
  ],
  bid_due: [
    'bid due', 'due date', 'submission deadline', 'proposals due by',
    'bids must be received', 'closing date', 'due:'
  ],
  job_walk: [
    'pre-bid', 'job walk', 'site visit', 'pre-bid meeting',
    'mandatory meeting', 'walk-through', 'site inspection'
  ],
  rfi_deadline: [
    'rfi', 'questions due', 'rfi deadline', 'clarifications',
    'questions must be submitted', 'inquiry deadline'
  ],
  scope: [
    'scope of work', 'work to be performed', 'project description',
    'description of work', 'scope:'
  ],
  subs_needed: [
    'subcontractors', 'specialty', 'trade contractors', 'subs',
    'trades required', 'specialty contractors'
  ],
  role: [
    'prime', 'sub', 'subcontractor', 'general contractor',
    'gc', 'prime contractor'
  ],
  submission_method: [
    'electronic', 'hard copy', 'submit via', 'email',
    'online submission', 'physical submission'
  ],
  engineers_estimate: [
    "engineer's estimate", 'budget', 'estimated cost',
    'project budget', 'estimated value'
  ],
  bid_bond: [
    'bid bond', 'bond required', 'bid security',
    'bid guarantee', 'surety bond'
  ],
  contract_time: [
    'contract time', 'duration', 'days', 'completion',
    'time for completion', 'contract period'
  ],
  insurance: [
    'insurance', 'liability', 'coverage',
    'insurance requirements', 'certificates of insurance'
  ],
  wages: [
    'prevailing wage', 'davis-bacon', 'wage rates',
    'certified payroll', 'prevailing rates'
  ],
  franchise_hauler: [
    'franchise', 'hauler', 'disposal', 'waste',
    'designated hauler', 'waste disposal'
  ]
};

/**
 * Search document text for relevant terms
 * @param {string} documentText - Full document text
 * @param {object} searchTerms - Search term definitions
 * @returns {object} - Found terms with context
 */
function searchDocument(documentText, searchTerms = BID_SEARCH_TERMS) {
  const results = {};
  const lines = documentText.split('\n');

  for (const [fieldName, terms] of Object.entries(searchTerms)) {
    results[fieldName] = {
      found: false,
      matches: [],
      context: []
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      
      for (const term of terms) {
        if (line.includes(term.toLowerCase())) {
          results[fieldName].found = true;
          results[fieldName].matches.push({
            term,
            line: lines[i],
            lineNumber: i
          });

          // Extract context (±3 lines)
          const contextStart = Math.max(0, i - 3);
          const contextEnd = Math.min(lines.length, i + 4);
          const context = lines.slice(contextStart, contextEnd).join('\n');
          
          results[fieldName].context.push({
            text: context,
            lineNumber: i
          });

          break; // Found match, move to next field
        }
      }

      if (results[fieldName].found) break; // Found, move to next field
    }
  }

  return results;
}

/**
 * Extract value from context using AI or patterns
 * @param {string} context - Context text around found term
 * @param {string} fieldType - Type of field (date, text, list, etc.)
 * @returns {any} - Extracted value
 */
function extractValueFromContext(context, fieldType) {
  // This is simplified - AI will do the actual extraction
  // This function provides hints to the AI
  
  const patterns = {
    date: /(\d{1,2}\/\d{1,2}\/\d{2,4})|(\w+\s+\d{1,2},?\s+\d{4})/gi,
    time: /(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm))/gi,
    money: /\$[\d,]+(?:\.\d{2})?/g,
    number: /\d+/g
  };

  if (patterns[fieldType]) {
    const matches = context.match(patterns[fieldType]);
    return matches ? matches[0] : null;
  }

  return null;
}

module.exports = {
  BID_SEARCH_TERMS,
  searchDocument,
  extractValueFromContext
};
