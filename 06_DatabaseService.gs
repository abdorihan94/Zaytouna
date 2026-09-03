
var DatabaseService = {
  spreadsheet:function(){var id=PropertiesService.getScriptProperties().getProperty(CONFIG.SPREADSHEET_ID_KEY);return id?SpreadsheetApp.openById(id):SpreadsheetApp.getActiveSpreadsheet();},
  ensureSheet:function(name,headers){var ss=this.spreadsheet(), sh=ss.getSheetByName(name)||ss.insertSheet(name);if(sh.getLastRow()===0&&headers&&headers.length)sh.getRange(1,1,1,headers.length).setValues([headers]);return sh;},
  headers:function(name){var sh=this.spreadsheet().getSheetByName(name);return sh&&sh.getLastColumn()?sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0]:[];},
  rows:function(name){var sh=this.spreadsheet().getSheetByName(name);if(!sh||sh.getLastRow()<2)return [];var h=this.headers(name);return sh.getRange(2,1,sh.getLastRow()-1,h.length).getValues().map(function(r){var o={};h.forEach(function(k,i){o[k]=r[i];});return o;});},
  append:function(name,record){var h=this.headers(name);if(!h.length){h=Object.keys(record);this.ensureSheet(name,h);}this.spreadsheet().getSheetByName(name).appendRow(h.map(function(k){return record[k]===undefined?'':record[k];}));},
  upsert:function(name,record){var sh=this.spreadsheet().getSheetByName(name),h=this.headers(name),key=record.id;if(!sh||!h.length)throw Error('Sheet not initialized');var idCol=h.indexOf('id')+1, values=sh.getLastRow()>1?sh.getRange(2,idCol,sh.getLastRow()-1,1).getValues():[], row=-1;values.some(function(v,i){if(String(v[0])===String(key)){row=i+2;return true;}return false;});var data=h.map(function(k){return record[k]===undefined?'':record[k];});if(row<0)sh.appendRow(data);else sh.getRange(row,1,1,h.length).setValues([data]);return record;},
  find:function(name,id){return this.rows(name).filter(function(r){return String(r.id)===String(id);})[0]||null;}
};
