
function logSystem_(level,message,context){try{DatabaseService.append('SYSTEM_LOG',{id:uuid_(),timestamp:now_(),level:level,message:safeText_(message),context:json_(context||{})});}catch(e){console.error(e);}}
