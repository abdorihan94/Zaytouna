function getDatabaseSpreadsheet_() {
  var spreadsheetId = null;

  try {
    if (typeof ConfigService !== 'undefined' && ConfigService.get) {
      spreadsheetId =
        ConfigService.get('DATABASE_SPREADSHEET_ID') ||
        ConfigService.get('SPREADSHEET_ID') ||
        CONFIG.SPREADSHEET_ID_KEY; // current repo config value
    }
  } catch (e) {
    spreadsheetId = CONFIG && CONFIG.SPREADSHEET_ID_KEY ? CONFIG.SPREADSHEET_ID_KEY : null;
  }

  if (spreadsheetId) return SpreadsheetApp.openById(spreadsheetId);

  var active = SpreadsheetApp.getActiveSpreadsheet();
  if (active) return active;

  throw new Error('No spreadsheet ID configured and no active spreadsheet context found.');
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
