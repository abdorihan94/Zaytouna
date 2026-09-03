
function envelope_(success,data,message,errorCode){return {success:!!success,data:data||null,message:message||'',errorCode:errorCode||null};}
function now_(){return new Date();}
function json_(value){return JSON.stringify(value);}
function currentEmail_(){return (Session.getActiveUser().getEmail()||'').toLowerCase();}
function safeText_(value){return String(value==null?'':value).trim();}
function uuid_(){return Utilities.getUuid();}
