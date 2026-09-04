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

function rows(sheetName) {
  var sheet = ensureSheet(sheetName);
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();

  if (lastRow < 2 || lastCol < 1) return [];
  return sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
}

function appendRow(sheetName, rowValues) {
  var sheet = ensureSheet(sheetName);

  var row;
  if (Array.isArray(rowValues)) {
    row = Array.isArray(rowValues[0]) ? rowValues[0] : rowValues;
  } else if (rowValues && typeof rowValues === 'object') {
    var lastCol = sheet.getLastColumn();
    if (lastCol > 0) {
      var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
      row = headers.map(function(h) {
        return Object.prototype.hasOwnProperty.call(rowValues, h) ? rowValues[h] : '';
      });
    } else {
      row = Object.keys(rowValues).map(function(k) { return rowValues[k]; });
    }
  } else {
    row = [rowValues];
  }

  sheet.appendRow(row);
  return true;
}

function append(sheetName, rowValues) {
  return appendRow(sheetName, rowValues);
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
DatabaseService.appendRow = appendRow;
DatabaseService.append = append;
DatabaseService.setRows = setRows;
DatabaseService.spreadsheet = spreadsheet;
