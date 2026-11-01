/* Coastal Garden: the portrait's original cherry blossom rolls with page scroll.
   No duplicated flower. Scroll down rotates counterclockwise, up clockwise. */
(() => {
  'use strict';
  const flower = document.querySelector('[data-rolling-blossom]');
  if (!flower || !flower.parentElement) return;

  const origin = flower.parentElement;
  const anchor = document.createElement('span');
  anchor.className = 'flower-badge flower-badge-placeholder';
  anchor.setAttribute('aria-hidden', 'true');
  origin.insertBefore(anchor, flower);

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const toggle = document.querySelector('.motion-control');
  const clamp = n => Math.min(1, Math.max(0, n));
  const lerp = (a, b, t) => a + (b - a) * t;
  let scheduled = false;

  function enabled() {
    return !reduceMotion.matches && !document.documentElement.classList.contains('motion-off');
  }

  function restoreToPortrait() {
    if (flower.parentElement !== origin) {
      flower.classList.remove('flower-rolling');
      flower.style.removeProperty('--flower-width');
      flower.style.removeProperty('transform');
      anchor.after(flower);
    }
  }

  function render() {
    scheduled = false;
    if (!enabled()) {
      restoreToPortrait();
      return;
    }

    // The invisible anchor retains the original flower's precise responsive
    // position over the portrait, even when the real image travels down-page.
    const bounds = anchor.getBoundingClientRect();
    const size = parseFloat(window.getComputedStyle(anchor).width) || 118;
    const scroll = Math.max(0, window.scrollY || window.pageYOffset || 0);
    const travel = Math.max(400, Math.min(720, window.innerHeight * .88));
    const p = clamp(scroll / travel);
    const eased = p * p * (3 - 2 * p);

    // Begin exactly where the blossom is above Caitlin's head.
    // Then roll towards the right edge, never over the main text column.
    const destinationX = window.innerWidth - size * .76;
    const destinationY = window.innerHeight * (.46 + .09 * Math.sin(scroll / 390));
    const x = lerp(bounds.left, destinationX, eased);
    const y = lerp(bounds.top, destinationY, eased);

    // Rotation directly tracks the scroll distance, so reversing scroll
    // direction automatically and smoothly reverses the rolling direction.
    const degrees = 15 - scroll * .29;

    flower.style.setProperty('--flower-width', size + 'px');
    flower.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) rotate(' + degrees.toFixed(1) + 'deg)';
    if (flower.parentElement !== document.body) {
      flower.classList.add('flower-rolling');
      document.body.appendChild(flower);
    }
  }

  function schedule() {
    if (!scheduled) {
      scheduled = true;
      window.requestAnimationFrame(render);
    }
  }

  window.addEventListener('scroll', schedule, {passive:true});
  window.addEventListener('resize', schedule, {passive:true});
  window.addEventListener('pageshow', schedule);
  if (toggle) toggle.addEventListener('click', schedule);
  if (reduceMotion.addEventListener) reduceMotion.addEventListener('change', schedule);
  schedule();
})();
