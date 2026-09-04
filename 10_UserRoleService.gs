var UserRoleService = {
  current: function () {
    var a = AuthService.identify();
    var email = String((a && a.email) || '').trim().toLowerCase();

    var users = DatabaseService.rows('USERS') || [];
    var u = users.filter(function (x) {
      return String(x.email || '').trim().toLowerCase() === email &&
             String(x.status || 'ACTIVE').trim().toUpperCase() === 'ACTIVE';
    })[0];

    if (!u) return { id: '', email: email, name: '', roles: [], status: 'INACTIVE' };

    var roles = String(u.roles || '')
      .split(/[,\|;]+|\s+/)
      .map(function (r) { return String(r || '').trim().toUpperCase(); })
      .filter(Boolean);

    return {
      id: String(u.id || ''),
      email: String(u.email || '').trim().toLowerCase(),
      name: String(u.name || ''),
      roles: roles,
      status: String(u.status || 'ACTIVE')
    };
  },

  hasRole: function (roleCode) {
    var wanted = String(roleCode || '').trim().toUpperCase();
    if (!wanted) return false;
    return (this.current().roles || []).indexOf(wanted) >= 0;
  }
};
