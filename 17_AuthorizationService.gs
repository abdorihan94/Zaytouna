function authorize_(permission){
  var u = UserRoleService.current();

  SystemLogService.warn('PERM_DEBUG', {
    permission: permission,
    userEmail: (u && u.email) || '',
    roles: (u && u.roles) || []
  });

  if (UserRoleService.hasRole('ADMIN')) return true;

  var rows = DatabaseService.rows('ROLE_PERMISSIONS');
  var allowed = rows.some(function(r){
    return (u.roles || []).indexOf(r.role) >= 0 && r.permission === permission;
  });

  if (!allowed) {
    SystemLogService.warn('Permission denied', {
      permission: permission,
      userEmail: (u && u.email) || ''
    });
  }

  return allowed;
}
