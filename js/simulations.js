/* Interactive portfolio labs: sample scenarios inspired by actual implementation work.
   All people, requests and outcomes are illustrative, not client records or measured metrics. */
(() => {
  'use strict';

  const supply = document.querySelector('[data-sim="supply"]');
  if (supply) {
    const nodes = [...supply.querySelectorAll('[data-route-node]')];
    const run = supply.querySelector('[data-order-run]');
    const checkbox = supply.querySelector('[data-carrier-confirmed]');
    const choices = [...supply.querySelectorAll('[name="sim-workflow"]')];
    const route = supply.querySelector('[data-route]');
    const card = supply.querySelector('[data-order-status]');
    const title = supply.querySelector('[data-order-title]');
    const description = supply.querySelector('[data-order-description]');
    const events = supply.querySelector('[data-order-events]');
    const timer = supply.querySelector('[data-order-timer]');
    const symbols = ['📨', '📦', '🚚', '✓'];
    const stages = ['Request received', 'Inventory reviewed', 'Carrier handoff', 'Delivery coordinated'];
    const delay = ms => new Promise(resolve => window.setTimeout(resolve, ms));
    // Five complete seconds per step, regardless of OS reduced-motion settings.
    // Reduced motion disables decorative motion, never time needed to read.
    async function holdReadableStep(stepIndex) {
      for (let seconds = 5; seconds > 0; seconds--) {
        if (timer) timer.textContent = 'Step ' + (stepIndex + 1) + ' of ' + nodes.length + ' · ' + seconds + 's remaining';
        await delay(1000);
      }
    }

    function paintStep(index, state) {
      nodes[index].dataset.state = state;
      nodes[index].querySelector('small').textContent = state === 'active' ? 'Processing…' :
        state === 'done' ? 'Complete' : state === 'blocked' ? 'Follow-up needed' : 'Waiting';
      if (state === 'active' || state === 'done' || state === 'blocked')
        route.style.setProperty('--route-progress', Math.round(index / (nodes.length - 1) * 100) + '%');
    }
    function show(t, d, tone = 'neutral') {
      title.textContent = t;
      description.textContent = d;
      card.dataset.tone = tone;
      card.classList.remove('sim-soft-flash');
      void card.offsetWidth;
      card.classList.add('sim-soft-flash');
    }
    function addEvent(label) {
      const li = document.createElement('li'); li.textContent = label; events.append(li);
    }
    function reset() {
      nodes.forEach((node, i) => { node.dataset.state = 'waiting'; node.querySelector('small').textContent = 'Waiting'; node.querySelector('strong').textContent = stages[i]; node.dataset.icon = symbols[i]; });
      route.style.setProperty('--route-progress', '0%');
      events.replaceChildren();
      if (timer) timer.textContent = '5 seconds per step';
      show('Ready to trace a sample order', 'Change the workflow and carrier confirmation, then run the scenario.');
    }
    choices.forEach(input => input.addEventListener('change', reset));
    checkbox.addEventListener('change', reset);
    run.addEventListener('click', async () => {
      run.disabled = true; choices.forEach(el => el.disabled = true); checkbox.disabled = true;
      reset();
      const documented = supply.querySelector('[name="sim-workflow"]:checked').value === 'documented';
      const carrierConfirmed = checkbox.checked;
      const stopAt = !carrierConfirmed ? (documented ? 2 : 3) : -1;
      try {
        for (let i = 0; i < stages.length; i++) {
          paintStep(i, 'active');
          show(stages[i], 'Following sample request R-104 through the handoff.');
          await holdReadableStep(i);
          if (i === stopAt) {
            paintStep(i, 'blocked');
            addEvent('Missing carrier confirmation');
            if (documented) {
              show('Gap spotted at the carrier checkpoint', 'The documented handoff makes the missing confirmation visible before dispatch. A teammate still needs to follow up.', 'warning');
              addEvent('Owner assigned to follow-up');
            } else {
              show('Dispatch is delayed by an unclear handoff', 'Without a shared checkpoint, the missing confirmation becomes clear only when dispatch is attempted.', 'warning');
              addEvent('Team traces the missing update');
            }
            break;
          }
          paintStep(i, 'done');
          addEvent(stages[i]);
          if (i === stages.length - 1) {
            show('Order handoff complete', documented ?
              'With the confirmation present, shared tracking and SOPs make each step and its owner visible.' :
              'With all information supplied, the order moves through. Separate notes still require extra checking to trace the handoffs.', 'success');
          }
        }
      } finally {
        if (timer) timer.textContent = 'Run complete · 5 seconds per step';
        run.disabled = false; choices.forEach(el => el.disabled = false); checkbox.disabled = false;
      }
    });
    reset();
  }

  const schedule = document.querySelector('[data-sim="schedule"]');
  if (schedule) {
    const people = [...schedule.querySelectorAll('[data-person]')];
    const slots = [...schedule.querySelectorAll('[data-slot]')];
    const modes = [...schedule.querySelectorAll('[name="sim-schedule-mode"]')];
    const book = schedule.querySelector('[data-book]');
    const restart = schedule.querySelector('[data-restart-schedule]');
    const list = schedule.querySelector('[data-bookings]');
    const feedback = schedule.querySelector('[data-schedule-feedback]');
    const progress = schedule.querySelector('[data-schedule-count]');
    const statusTitle = schedule.querySelector('[data-sched-title]');
    const busy = new Set(['tue4', 'wed4']);
    const names = {avery:'Avery', rowan:'Rowan', parker:'Parker'};
    const labels = {tue4:'Tue · 4:00 PM',tue5:'Tue · 5:00 PM',wed4:'Wed · 4:00 PM',wed5:'Wed · 5:00 PM',thu4:'Thu · 4:00 PM'};
    let booked = {};
    let selectedPerson = 'avery', selectedSlot = null;
    let detected = 0;

    function shared() { return schedule.querySelector('[name="sim-schedule-mode"]:checked').value === 'shared'; }
    function tell(head, note, tone = 'neutral') {
      statusTitle.textContent = head;
      feedback.textContent = note;
      const wrap = schedule.querySelector('[data-schedule-status]');
      wrap.dataset.tone = tone;
      wrap.classList.remove('sim-soft-flash'); void wrap.offsetWidth; wrap.classList.add('sim-soft-flash');
    }
    function refresh() {
      const isShared = shared();
      people.forEach(b => {
        const done = Object.hasOwn(booked, b.dataset.person);
        b.dataset.booked = String(done);
        b.disabled = done;
        b.setAttribute('aria-pressed', String(selectedPerson === b.dataset.person && !done));
        const tag = b.querySelector('small');
        tag.textContent = done ? 'Scheduled' : '30-minute introduction';
      });
      slots.forEach(b => {
        const k = b.dataset.slot;
        const existing = busy.has(k);
        const taken = existing || Object.values(booked).includes(k);
        b.dataset.busy = String(isShared && taken);
        b.disabled = isShared && taken;
        b.setAttribute('aria-pressed', String(selectedSlot === k));
        b.querySelector('small').textContent = isShared ? (taken ? 'Not available' : 'Open for booking') :
          (Object.values(booked).includes(k) ? 'Added to my notes' : 'Availability unverified');
      });
      progress.textContent = Object.keys(booked).length + ' of 3 requests scheduled';
      book.disabled = !selectedPerson || !selectedSlot || Object.keys(booked).length === 3;
      list.replaceChildren();
      Object.entries(booked).forEach(([person, slot]) => {
        const li = document.createElement('li');
        const label = document.createElement('span');
        label.textContent = names[person] + ' · ' + labels[slot];
        const pill = document.createElement('span'); pill.className = 'sim-pill'; pill.textContent = 'Confirmed';
        li.append(label,pill); list.append(li);
      });
    }
    people.forEach(b => b.addEventListener('click', () => {
      selectedPerson = b.dataset.person;
      refresh();
      tell('Request selected: ' + names[selectedPerson], 'Choose an appointment time, then book it.');
    }));
    slots.forEach(b => b.addEventListener('click', () => {
      selectedSlot = b.dataset.slot;
      refresh();
      tell('Selected: ' + labels[selectedSlot], shared() ?
        'The shared view shows reserved times before you book.' :
        'Separate notes cannot confirm the instructor’s availability until you check.');
    }));
    modes.forEach(b => b.addEventListener('change', () => {
      selectedSlot = null; refresh();
      tell(shared() ? 'Shared schedule enabled' : 'Separate notes enabled',
        shared() ? 'Unavailable times are now visible at a glance.' :
        'Some booked times appear unverified. Try selecting one and booking it.');
    }));
    book.addEventListener('click', () => {
      if (!selectedPerson || !selectedSlot) return;
      const reserved = busy.has(selectedSlot) || Object.values(booked).includes(selectedSlot);
      if (reserved) {
        detected++;
        tell('Schedule conflict caught', labels[selectedSlot] + ' is already occupied. This would need a call or double-check before you could confirm it. Conflict checks in this demo: ' + detected + '.', 'warning');
        selectedSlot = null;
        refresh();
        return;
      }
      const justBooked = names[selectedPerson] + ' · ' + labels[selectedSlot];
      booked[selectedPerson] = selectedSlot;
      selectedPerson = Object.keys(names).find(p => !Object.hasOwn(booked,p)) || null;
      selectedSlot = null;
      refresh();
      tell(Object.keys(booked).length === 3 ? 'All three requests scheduled!' : 'Appointment confirmed',
        justBooked + '. ' + (Object.keys(booked).length === 3 ? 'You have finished the sample scheduling exercise.' : 'Select the next open time.'), 'success');
    });
    restart.addEventListener('click', () => {
      booked = {}; selectedPerson = 'avery'; selectedSlot = null; detected = 0; refresh();
      tell('Ready for the first request', 'Choose a time for Avery, or switch views to see what separate notes can miss.');
    });
    refresh();
    tell('Ready for the first request', 'Choose a time for Avery, or switch views to see what separate notes can miss.');
  }
})();
