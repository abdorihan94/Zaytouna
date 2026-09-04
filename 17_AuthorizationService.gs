
function authorize_(permission){if(UserRoleService.hasRole('ADMIN'))return true;var u=UserRoleService.current(), rows=DatabaseService.rows('ROLE_PERMISSIONS');if(!rows.some(function(r){return u.roles.indexOf(r.role)>=0&&r.permission===permission;})){logSystem_('WARN','Permission denied',{permission:permission,userEmail:u.email});throw Error('لا تملك صلاحية تنفيذ هذه العملية');}return true;}
