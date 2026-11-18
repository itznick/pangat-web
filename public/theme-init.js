// Applies the saved (or system) theme before first paint so there is no dark/light flash.
// Kept as a file (not inline) so the Content-Security-Policy can forbid inline scripts.
(function () {
  var t = 'system';
  try { t = localStorage.getItem('pangat_theme') || 'system'; } catch (e) {}
  var dark = t === 'dark' || (t !== 'light' && !(window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches));
  var r = document.documentElement;
  r.classList.toggle('dark', dark);
  r.style.colorScheme = dark ? 'dark' : 'light';
  r.setAttribute('data-theme', dark ? 'dark' : 'light');
})();
