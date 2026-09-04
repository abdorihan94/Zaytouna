var UserRoleService = (function () {
  function normalizeEmail_(value) {
    return String(value || '').trim().toLowerCase();
  }

  function isActive_(status) {
    return String(status || 'ACTIVE').trim().toUpperCase() === 'ACTIVE';
  }

  function parseRoles_(rolesValue) {
    if (Array.isArray(rolesValue)) {
      return rolesValue
        .map(function (r) { return String(r || '').trim().toUpperCase(); })
        .filter(Boolean);
    }

    var raw = String(rolesValue || '').trim();
    if (!raw) return [];

    // Supports: ADMIN,TEACHER  | ADMIN;TEACHER | ADMIN|TEACHER | ADMIN TEACHER
    return raw
      .split(/[,\|;]+|\s+/)
      .map(function (r) { return String(r || '').trim().toUpperCase(); })
      .filter(Boolean);
  }

  function identifySafe_() {
    var identity = { email: '' };

    try {
      if (typeof AuthService !== 'undefined' && AuthService && typeof AuthService.identify === 'function') {
        identity = AuthService.identify() || { email: '' };
      }
    } catch (e) {
      SystemLogService.warn('AUTH_IDENTIFY_ERROR', { message: e.message });
      identity = { email: '' };
    }

    var identified = normalizeEmail_(identity.email);
    var active = '';
    var effective = '';

    try { active = normalizeEmail_(Session.getActiveUser().getEmail()); } catch (e1) {}
    try { effective = normalizeEmail_(Session.getEffectiveUser().getEmail()); } catch (e2) {}

    var finalEmail = identified || active || effective || '';

    SystemLogService.warn('AUTH_DEBUG', {
      identifiedEmail: identified,
      activeEmail: active,
      effectiveEmail: effective,
      finalEmail: finalEmail
    });

    return {
      email: finalEmail,
      source: identified ? 'AuthService.identify' : (active ? 'Session.getActiveUser' : (effective ? 'Session.getEffectiveUser' : 'none'))
    };
  }

  function current() {
    var auth = identifySafe_();
    var email = normalizeEmail_(auth.email);

    SystemLogService.warn('USER_CURRENT_DEBUG', {
      authEmail: email,
      source: auth.source
    });

    if (!email) {
      return {
        id: '',
        email: '',
        name: '',
        roles: [],
        status: 'INACTIVE',
        found: false
      };
    }

    var users = DatabaseService.rows('USERS') || [];
    var matched = null;

    for (var i = 0; i < users.length; i++) {
      var row = users[i] || {};
      if (normalizeEmail_(row.email) === email && isActive_(row.status)) {
        matched = row;
        break;
      }
    }

    SystemLogService.warn('USER_MATCH_DEBUG', {
      email: email,
      matched: !!matched
    });

    if (!matched) {
      return {
        id: '',
        email: email,
        name: '',
        roles: [],
        status: 'INACTIVE',
        found: false
      };
    }

    return {
      id: String(matched.id || ''),
      email: normalizeEmail_(matched.email),
      name: String(matched.name || ''),
      roles: parseRoles_(matched.roles),
      status: String(matched.status || 'ACTIVE'),
      found: true
    };
  }

  function hasRole(roleCode) {
    var wanted = String(roleCode || '').trim().toUpperCase();
    if (!wanted) return false;

    var user = current();
    return (user.roles || []).indexOf(wanted) >= 0;
  }

  function hasAnyRole(roleCodes) {
    var user = current();
    var roles = user.roles || [];
    if (!roleCodes || !roleCodes.length) return false;

    for (var i = 0; i < roleCodes.length; i++) {
      var wanted = String(roleCodes[i] || '').trim().toUpperCase();
      if (wanted && roles.indexOf(wanted) >= 0) return true;
    }
    return false;
  }

  function requireRole(roleCode, errorMessageAr) {
    if (!hasRole(roleCode)) {
      throw new Error(errorMessageAr || 'لا تملك الصلاحية المطلوبة لتنفيذ هذه العملية');
    }
    return true;
  }

  return {
    current: current,
    hasRole: hasRole,
    hasAnyRole: hasAnyRole,
    requireRole: requireRole
  };
})();
