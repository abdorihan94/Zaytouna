function getDatabaseSpreadsheet_() {
  var spreadsheetId = null;

  // Try ConfigService first (if implemented in your repo), then fallback to CONFIG constant.
  try {
    if (typeof ConfigService !== 'undefined' && ConfigService.get) {
      spreadsheetId =
        ConfigService.get('DATABASE_SPREADSHEET_ID') ||
        ConfigService.get('SPREADSHEET_ID');
    }
  } catch (e) {}

  // Your current repo stores the actual ID in CONFIG.SPREADSHEET_ID_KEY
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
    'Database spreadsheet is not available. Configure spreadsheet ID or run from bound sheet context.'
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

/**
 * Service facade for compatibility with code that expects DatabaseService.*
 */
var DatabaseService = DatabaseService || {};
DatabaseService.getDatabaseSpreadsheet_ = getDatabaseSpreadsheet_;
DatabaseService.ensureSheet = ensureSheet;
