/* Keep deep links aligned below the sticky navigation on the Selected Work page. */
(() => {
  'use strict';
  function revealSection() {
    if (!location.hash) return;
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch (_) { return; }
    const target = document.getElementById(id);
    if (!target) return;
    const header = document.querySelector('.site-header');
    const offset = (header ? header.getBoundingClientRect().height : 78) + 22;
    const top = Math.max(0, window.scrollY + target.getBoundingClientRect().top - offset);
    const doc = document.documentElement;
    const prior = doc.style.scrollBehavior;
    doc.style.scrollBehavior = 'auto';
    window.scrollTo(0, top);
    doc.style.scrollBehavior = prior;
  }
  window.addEventListener('pageshow', () => {
    if (location.hash) requestAnimationFrame(() => requestAnimationFrame(revealSection));
  });
  window.addEventListener('hashchange', () => requestAnimationFrame(revealSection));
})();
