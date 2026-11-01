/* Coastal Garden scroll blossom
   The bloom follows reading progress without intercepting navigation or clicks. */
(() => {
  'use strict';
  const bloom = document.querySelector('[data-scroll-blossom]');
  if (!bloom) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  let scheduled = false;

  const clamp = value => Math.max(0, Math.min(1, value));

  function render() {
    scheduled = false;
    if (reduce.matches || document.documentElement.classList.contains('motion-off')) {
      bloom.style.opacity = '0';
      return;
    }

    const scroll = window.scrollY || window.pageYOffset || 0;
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const progress = clamp(scroll / maxScroll);
    // Enter during the hero transition; depart smoothly before the footer.
    const fadeIn = clamp((scroll - 45) / 260);
    const fadeOut = clamp((maxScroll - scroll) / 320);
    const visibility = Math.min(fadeIn, fadeOut);

    // Let the flower travel up and down the right edge over the reader's journey.
    // Its rotation is linked to scroll progress, not an endless distracting spin.
    const v = .39 + .19 * Math.sin(progress * Math.PI * 4.2 - .4);
    const y = Math.round(window.innerHeight * v);
    const x = Math.round(12 * Math.sin(progress * Math.PI * 5.8));
    const degrees = -18 + progress * 425;
    bloom.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0) rotate(' + degrees.toFixed(1) + 'deg)';
    bloom.style.opacity = (visibility * .88).toFixed(3);
  }

  function queueUpdate() {
    if (!scheduled) {
      scheduled = true;
      window.requestAnimationFrame(render);
    }
  }

  window.addEventListener('scroll', queueUpdate, {passive:true});
  window.addEventListener('resize', queueUpdate, {passive:true});
  window.addEventListener('pageshow', queueUpdate);
  const motionToggle = document.querySelector('.motion-control');
  if (motionToggle) motionToggle.addEventListener('click', queueUpdate);
  if (reduce.addEventListener) reduce.addEventListener('change', queueUpdate);
  queueUpdate();
})();
