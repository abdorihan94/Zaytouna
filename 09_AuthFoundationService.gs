var AuthService = {
  identify: function () {
    var email = currentEmail_();
    var normalized = String(email || '').trim().toLowerCase();

    // Optional but very useful for your current permission issue
    if (typeof SystemLogService !== 'undefined' && SystemLogService.warn) {
      var active = '';
      var effective = '';
      try { active = Session.getActiveUser().getEmail(); } catch (e1) {}
      try { effective = Session.getEffectiveUser().getEmail(); } catch (e2) {}

      SystemLogService.warn('AUTH_IDENTIFY', {
        activeEmail: String(active || '').trim().toLowerCase(),
        effectiveEmail: String(effective || '').trim().toLowerCase(),
        resolvedEmail: normalized
      });
    }

    return {
      email: normalized,
      authenticated: !!normalized
    };
  }
};

// Keep as private helper in same file
function currentEmail_() {
  var email = '';

  try { email = Session.getActiveUser().getEmail(); } catch (e1) {}
  email = String(email || '').trim().toLowerCase();
  if (email) return email;

  try { email = Session.getEffectiveUser().getEmail(); } catch (e2) {}
  email = String(email || '').trim().toLowerCase();
  if (email) return email;

  return '';
}
