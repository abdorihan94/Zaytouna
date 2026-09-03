
function diagnostics_(){var ss=DatabaseService.spreadsheet();return {spreadsheet:ss.getId(),sheets:SHEETS.filter(function(n){return !!ss.getSheetByName(n);}),milestone:CONFIG.MILESTONE};}
function runDiagnostics(){return envelope_(true,diagnostics_(),'تم تشغيل الفحص');}
