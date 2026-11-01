(() => {
  'use strict';
  const navButton = document.querySelector('.menu-toggle');
  const nav = document.getElementById('primary-navigation');
  if (navButton && nav) {
    navButton.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      navButton.setAttribute('aria-expanded', String(open));
      navButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
      navButton.textContent = open ? '✕' : '☰';
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      nav.classList.remove('open');
      navButton.setAttribute('aria-expanded','false');
      navButton.setAttribute('aria-label','Open navigation');
      navButton.textContent = '☰';
    }));
  }

  // Deliberately decorative petals: they remain below all text panels and don't capture clicks.
  const layer = document.querySelector('.petals-layer');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const motionButton = document.querySelector('.motion-control');
  let saved = null;
  try { saved = localStorage.getItem('coastalGardenMotion'); } catch (_) {}
  let motionOn = saved === 'off' ? false : !reduce.matches;
  function updateMotion() {
    document.documentElement.classList.toggle('motion-off', !motionOn);
    if (motionButton) {
      motionButton.setAttribute('aria-pressed',String(!motionOn));
      motionButton.setAttribute('aria-label',motionOn ? 'Pause decorative petal animation' : 'Play decorative petal animation');
      motionButton.textContent = motionOn ? '❚❚  Pause petals' : '▶  Play petals';
    }
  }
  updateMotion();
  if (motionButton) motionButton.addEventListener('click', () => {
    motionOn = !motionOn; updateMotion();
    try { localStorage.setItem('coastalGardenMotion', motionOn ? 'on' : 'off'); } catch (_) {}
  });
  if (reduce.addEventListener) reduce.addEventListener('change', event => {
    if (saved === null) { motionOn = !event.matches; updateMotion(); }
  });
  if (layer && !reduce.matches) {
    // Repeatable numbers avoid surprising placement changes while visiting pages.
    let seed = 18429;
    const random = () => { seed = (1664525 * seed + 1013904223) >>> 0; return seed / 4294967296; };
    const count = window.matchMedia('(max-width:640px)').matches ? 14 : 25;
    for (let i = 0; i < count; i++) {
      const petal = document.createElement('span');
      petal.className = 'petal';
      petal.style.left = `${random()*98}%`;
      petal.style.top = `${-80 + random()*100}px`;
      petal.style.setProperty('--dur',`${10 + random()*13}s`);
      petal.style.setProperty('--delay',`${-random()*24}s`);
      petal.style.setProperty('--drift',`${-170 + random()*370}px`);
      petal.style.setProperty('--turn',`${200 + random()*920}deg`);
      petal.style.setProperty('--s',`${.52 + random()*.7}`);
      petal.style.setProperty('--o',`${.25 + random()*.4}`);
      layer.appendChild(petal);
    }
  }

  const steps = [
    {name:'Listen & map',desc:'Understand the people involved, the current workflow, and the problem the system actually needs to solve. Define what success would look like.'},
    {name:'Choose & configure',desc:'Evaluate a practical solution, clarify scope, and prepare the configurations that support real day-to-day operations.'},
    {name:'Document & coordinate',desc:'Create clear procedures, templates, and ownership so teams can work consistently instead of relying on memory.'},
    {name:'Train & support',desc:'Help users build confidence with the new process through approachable instruction, feedback, and follow-through.'},
    {name:'Refine & improve',desc:'Observe what works after rollout, resolve friction, and improve the process as actual usage reveals new needs.'},
  ];
  const stepButtons = [...document.querySelectorAll('[data-step]')];
  const stepTitle = document.getElementById('step-title');
  const stepDesc = document.getElementById('step-desc');
  function chooseStep(index, focus = false) {
    if (!stepTitle || !stepDesc || !steps[index]) return;
    stepTitle.textContent = steps[index].name;
    stepDesc.textContent = steps[index].desc;
    stepButtons.forEach((button, i) => {
      const active = i === index;
      button.setAttribute('aria-selected', String(active));
      button.tabIndex = active ? 0 : -1;
    });
    if (focus) stepButtons[index].focus();
  }
  stepButtons.forEach((button,i) => {
    button.addEventListener('click',()=>chooseStep(i));
    button.addEventListener('keydown',e=>{
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      e.preventDefault();chooseStep((i+(e.key==='ArrowDown'?1:-1)+steps.length)%steps.length,true);
    });
  });
  if(stepButtons.length) chooseStep(0);

  const practiceChecks=[...document.querySelectorAll('[data-practice-check]')];
  const practiceBar=document.querySelector('[data-practice-progress]');
  const practiceFeedback=document.querySelector('[data-practice-feedback]');
  function updatePractice(){
    const checked=practiceChecks.filter(el=>el.checked).length;
    const total=practiceChecks.length;
    if(practiceBar){practiceBar.style.width=`${total?100*checked/total:0}%`;practiceBar.parentElement.setAttribute('aria-valuenow',String(checked));}
    if(practiceFeedback){practiceFeedback.textContent=checked===total?'All four considerations are in place. This is a useful starting point for rollout readiness.':`${checked} of ${total} readiness considerations selected · illustrative checklist, not an assessment of a real project.`;}
  }
  practiceChecks.forEach(c=>c.addEventListener('change',updatePractice));
  if(practiceChecks.length)updatePractice();

  const copyButton=document.querySelector('[data-copy-email]');
  if(copyButton) copyButton.addEventListener('click',async()=>{
    const value='caitmccollom@gmail.com';
    try{await navigator.clipboard.writeText(value);copyButton.textContent='✓ Email copied';}
    catch(_){window.location.href=`mailto:${value}`;}
  });
})();
