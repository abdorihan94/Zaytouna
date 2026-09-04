function getDatabaseSpreadsheet_() {
  // 1) Preferred: configured spreadsheet ID
  var spreadsheetId = null;
  try {
    if (typeof ConfigService !== 'undefined' && ConfigService.get) {
      spreadsheetId = ConfigService.get('DATABASE_SPREADSHEET_ID');
    }
  } catch (e) {}

  if (spreadsheetId) {
    try {
      return SpreadsheetApp.openById(spreadsheetId);
    } catch (e) {
      throw new Error('DATABASE_SPREADSHEET_ID is set but inaccessible: ' + e.message);
    }
  }

  // 2) Fallback: active spreadsheet (works if bound script or opened sheet context)
  var active = SpreadsheetApp.getActiveSpreadsheet();
  if (active) return active;

  // 3) Hard fail with actionable message
  throw new Error(
    'Database spreadsheet is not available. Set DATABASE_SPREADSHEET_ID in configuration ' +
    'or run this from a bound spreadsheet context.'
  );
}

function ensureSheet(sheetName, headers) {
  var ss = getDatabaseSpreadsheet_();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    if (headers && headers.length) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
  } else if (headers && headers.length && sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
  return sheet;
}
