# Bid Management Assistant Setup

This guide explains how to configure the AI Assistant as a bid management copilot for Resource Environmental, Inc. (REI) or similar construction firms.

## 1. Prepare the Board

Create or reuse a Monday board with columns for critical bid information. Recommended columns:

| Column Title          | Type        | Purpose |
|-----------------------|-------------|---------|
| Item Name             | Item name   | Project or solicitation name |
| Client                | Text        | Owner/agency |
| Solicitation          | Text        | RFP/IFB number |
| Bid Due               | Date        | Due date (converted to UTC) |
| Job Walk              | Date/Time   | Pre-bid meeting |
| RFI Deadline          | Date        | Questions deadline |
| Scope                 | Long Text   | Summary of work |
| Subs Needed           | Tags/Text   | Required subcontractors |
| Role                  | Dropdown    | Prime or Sub |
| Submission Method     | Dropdown    | Electronic / Hard Copy / Email |
| Engineer's Estimate   | Numbers/Text| Cost estimate |
| Bid Bond              | Dropdown    | Yes/No |
| Contract Time         | Text        | Duration |
| Insurance             | Text        | Insurance requirements |
| Wages                 | Dropdown    | Prevailing wage flag |
| Franchise Hauler      | Text        | Waste hauler notes |
| Source Document       | File Column | Original RFP or addenda |

Ensure dropdown columns contain exact labels expected by the parser.

## 2. Configure Search Terms

The assistant uses predefined search terms for each field. You can customize them in `src/server/services/termSearch.js`. For REI, the defaults include:

```javascript
const BID_SEARCH_TERMS = {
  project_name: ['project name', 'project title', 'work', 'name of project'],
  client: ['owner', 'client', 'agency', 'awarding authority'],
  solicitation: ['solicitation', 'project number', 'rfp', 'ifb'],
  bid_due: ['bid due', 'due date', 'submission deadline'],
  job_walk: ['pre-bid', 'job walk', 'site visit'],
  rfi_deadline: ['rfi', 'questions due', 'clarifications'],
  scope: ['scope of work', 'project description'],
  subs_needed: ['subcontractors', 'trade contractors'],
  role: ['prime', 'sub', 'general contractor'],
  submission_method: ['electronic', 'submit via', 'email'],
  engineers_estimate: ["engineer's estimate", 'budget', 'estimated cost'],
  bid_bond: ['bid bond', 'bid security'],
  contract_time: ['contract time', 'completion'],
  insurance: ['insurance', 'liability'],
  wages: ['prevailing wage', 'davis-bacon'],
  franchise_hauler: ['franchise', 'hauler', 'waste']
};
```

## 3. Set Custom Instructions

In the settings panel, add instructions such as:

```
You are supporting the REI estimating team. Prioritize accuracy of due dates and subcontractor lists. Always convert dates from Pacific Time to UTC and flag uncertainties in the notes field.
```

These instructions refine AI behavior during chats and file parsing.

## 4. Upload Knowledge Files

Consider uploading the following reference files in the Settings view:

- `preferred_subcontractors.json` – mapping trade codes to preferred vendors
- `scope_classification.md` – guidelines for categorizing work (Demo, Abate, Demo + Abate)
- `rei_bid_policies.txt` – internal compliance rules

The AI can leverage these documents to improve extraction accuracy and compliance reminders.

## 5. Document Parsing Workflow

1. Open the AI Assistant chat view.
2. Click the paperclip icon to upload an RFP, addenda, or specification document (PDF, DOCX, Excel, etc.).
3. Optionally add a message describing the document.
4. The AI performs two-phase parsing: search for relevant terms, then extract structured data.
5. Review the JSON payload preview with confidence scores.
6. Confirm the action to create a new item populated with extracted values.
7. The original document can be uploaded to the board's file column using `/api/board/items/:itemId/files` if desired.

## 6. Handling Timezones

The assistant assumes all bid dates in documents are in Pacific Time. It converts them to UTC before populating Monday date columns. If a document uses another timezone, update `convertPTtoUTC` or add instructions clarifying the offset.

## 7. Quality Assurance Checklist

- Verify dropdown values match board options; adjust board schema or parser prompts if mismatches occur.
- Monitor the confidence section—low scores indicate fields that may require manual review.
- After confirming an action, double-check created items for completeness and attach the source document.

## 8. Continuous Improvement

- Update search terms as new terminology appears in bid documents.
- Maintain knowledge files with new subcontractors or policy changes.
- Log parsing issues and refine custom instructions to reduce manual corrections.

By following this setup, the AI Assistant becomes a powerful companion for managing construction bids, reducing manual data entry, and improving accuracy.
