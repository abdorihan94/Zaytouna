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

var AuthService = {
  identify: function () {
    var email = currentEmail_();
    return { email: email, authenticated: !!email };
  }
};
