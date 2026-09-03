
var DriveService={root:function(){var name=CONFIG.DEFAULT_SCHOOL_NAME, it=DriveApp.getFoldersByName(name);return it.hasNext()?it.next():DriveApp.createFolder(name);},folders:function(){var root=this.root(),out={};DRIVE_FOLDERS.forEach(function(n){var i=root.getFoldersByName(n);out[n]=i.hasNext()?i.next():root.createFolder(n);});return out;}};
