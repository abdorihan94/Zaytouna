function getDatabaseSpreadsheet_() {
  var spreadsheetId = null;

  try {
    if (typeof ConfigService !== 'undefined' && ConfigService.get) {
      spreadsheetId =
        ConfigService.get('DATABASE_SPREADSHEET_ID') ||
        ConfigService.get('SPREADSHEET_ID');
    }
  } catch (e) {}

  // Repo-specific fallback: CONFIG contains the actual spreadsheet ID value
  if (!spreadsheetId && typeof CONFIG !== 'undefined' && CONFIG.SPREADSHEET_ID_KEY) {
    spreadsheetId = CONFIG.SPREADSHEET_ID_KEY;
  }

  if (spreadsheetId) {
    try {
      return SpreadsheetApp.openById(spreadsheetId);
    } catch (e) {
      throw new Error('Configured spreadsheet ID is inaccessible: ' + e.message);
    }
  }

  var active = SpreadsheetApp.getActiveSpreadsheet();
  if (active) return active;

  throw new Error(
    'Database spreadsheet is not available. Configure spreadsheet ID or run from bound spreadsheet context.'
  );
}

function ensureSheet(sheetName, headers) {
  var ss = getDatabaseSpreadsheet_();
  var sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  if (headers && headers.length && sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }

  return sheet;
}

function readHeaders_(sheet) {
  var lastCol = sheet.getLastColumn();
  if (lastCol < 1) return [];
  return sheet.getRange(1, 1, 1, lastCol).getValues()[0];
}

// Returns every data row as a plain object keyed by the header row, instead
// of raw arrays, since every consumer in this codebase (MasterDataService,
// LessonWorkflowService, UserRoleService, ...) reads named properties such
// as `row.id` / `row.email` / `row.status`.
function rows(sheetName) {
  var sheet = ensureSheet(sheetName);
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();

  if (lastRow < 2 || lastCol < 1) return [];

  var headers = readHeaders_(sheet);
  var values = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();

  return values.map(function(rowValues) {
    var record = {};
    headers.forEach(function(header, index) {
      if (header) record[header] = rowValues[index];
    });
    return record;
  });
}

function findRowNumberById_(sheet, headers, id) {
  var idColumn = headers.indexOf('id');
  if (idColumn < 0) return -1;

  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return -1;

  var ids = sheet.getRange(2, idColumn + 1, lastRow - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === String(id)) return i + 2; // 1-based sheet row
  }
  return -1;
}

// Finds a single record by its `id` column, returned as a header-keyed object.
function find(sheetName, id) {
  if (id === null || id === undefined || id === '') return null;

  var sheet = ensureSheet(sheetName);
  var headers = readHeaders_(sheet);
  var rowNumber = findRowNumberById_(sheet, headers, id);
  if (rowNumber < 0) return null;

  var values = sheet.getRange(rowNumber, 1, 1, headers.length).getValues()[0];
  var record = {};
  headers.forEach(function(header, index) {
    if (header) record[header] = values[index];
  });
  return record;
}

function objectToRow_(headers, data) {
  return headers.map(function(header) {
    return Object.prototype.hasOwnProperty.call(data, header) ? data[header] : '';
  });
}

function ensureHeadersCover_(sheet, headers, data) {
  var missing = Object.keys(data).filter(function(key) {
    return headers.indexOf(key) < 0;
  });
  if (!missing.length) return headers;

  var extended = headers.concat(missing);
  sheet.getRange(1, 1, 1, extended.length).setValues([extended]);
  return extended;
}

function appendRow(sheetName, rowValues) {
  var sheet = ensureSheet(sheetName);

  var row;
  if (Array.isArray(rowValues)) {
    row = Array.isArray(rowValues[0]) ? rowValues[0] : rowValues;
  } else if (rowValues && typeof rowValues === 'object') {
    var headers = ensureHeadersCover_(sheet, readHeaders_(sheet), rowValues);
    row = objectToRow_(headers, rowValues);
  } else {
    row = [rowValues];
  }

  sheet.appendRow(row);
  return true;
}

function append(sheetName, rowValues) {
  return appendRow(sheetName, rowValues);
}

// Inserts a new record, or updates the existing row matching `data.id` in
// place (no destructive clears), preserving history for append-only tables
// such as LESSON_WORKFLOW/AUDIT_LOG which should always use append() instead.
function upsert(sheetName, data) {
  data = data || {};
  var sheet = ensureSheet(sheetName);
  var headers = ensureHeadersCover_(sheet, readHeaders_(sheet), data);
  var rowNumber = data.id !== undefined && data.id !== null && data.id !== ''
    ? findRowNumberById_(sheet, headers, data.id)
    : -1;
  var rowValues = objectToRow_(headers, data);

  if (rowNumber > 0) {
    sheet.getRange(rowNumber, 1, 1, headers.length).setValues([rowValues]);
  } else {
    sheet.appendRow(rowValues);
  }

  return data;
}

function setRows(sheetName, values, headers) {
  var sheet = ensureSheet(sheetName, headers || null);
  sheet.clearContents();

  if (headers && headers.length) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }

  if (values && values.length) {
    sheet.getRange(2, 1, values.length, values[0].length).setValues(values);
  }

  return true;
}

function spreadsheet() {
  return getDatabaseSpreadsheet_();
}

// Compatibility facade for code that calls DatabaseService.*
var DatabaseService = DatabaseService || {};
DatabaseService.getDatabaseSpreadsheet_ = getDatabaseSpreadsheet_;
DatabaseService.ensureSheet = ensureSheet;
DatabaseService.rows = rows;
DatabaseService.find = find;
DatabaseService.upsert = upsert;
DatabaseService.appendRow = appendRow;
DatabaseService.append = append;
DatabaseService.setRows = setRows;
DatabaseService.spreadsheet = spreadsheet;
