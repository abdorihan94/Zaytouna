
function audit_(action,entity,entityId,before,after){DatabaseService.append('AUDIT_LOG',{id:uuid_(),timestamp:now_(),userEmail:currentEmail_(),action:action,entity:entity,entityId:entityId,before:json_(before||null),after:json_(after||null)});}
