/* Smart Buffer Scheduling Studio — original portfolio demonstration.
   Fictional salon and mobile bookings; estimates are illustrative, not live routing. */
(() => {
  'use strict';
  const root = document.querySelector('[data-sim="smart-buffer"]');
  if (!root) return;
  const $ = selector => root.querySelector(selector);
  const $$ = selector => [...root.querySelectorAll(selector)];

  const requests = {
    ava: {name:'Ava', service:'Cut & style', where:'salon', duration:45, prep:10, reset:15},
    jules: {name:'Jules', service:'Mobile blowout', where:'north', duration:45, prep:10, reset:10},
    robin: {name:'Robin', service:'Root touch-up', where:'salon', duration:75, prep:15, reset:20}
  };
  const locations = {salon:'the salon', north:'Northside client home'};
  // Intentionally fixed sample travel estimates; real routing would need a map API.
  const sampleTravel = {salon:{salon:0,north:20},north:{salon:20,north:0}};
  const dayStart = 8*60+30, dayEnd = 17*60;
  const smartInput = $('[data-sb-smart]'), timeInput = $('[data-sb-time]');
  const trafficInput = $('[data-sb-traffic]'), cushionInput = $('[data-sb-cushion]');
  const clientBtns = $$('[data-sb-person]'), bookBtn = $('[data-sb-book]');
  const suggestionBtn = $('[data-sb-suggest]'), resetBtn = $('[data-sb-reset-demo]');
  const agenda = $('[data-sb-agenda]');
  const state = {bookings:[{id:'ava',start:9*60}],selected:'jules',notice:null};

  function fmt(minutes) {
    const h = Math.floor(minutes / 60);
    const m = Math.round(minutes % 60);
    return String((h+11)%12+1) + ':' + String(m).padStart(2,'0') + (h>=12?' PM':' AM');
  }
  function trip(a,b) {
    if (a===b) return 0;
    const base = sampleTravel[a]?.[b] ?? 20;
    return Math.ceil(base*(trafficInput.value==='busy'?1.4:1)/5)*5;
  }
  function cushion(a,b) { return a===b ? 0 : (cushionInput.checked?10:0); }
  function ordered(list) { return [...list].sort((a,b)=>a.start-b.start); }
  function scenario(candidate) { return ordered([...state.bookings,candidate]); }

  function validate(list, protect) {
    const order=ordered(list);
    for(let i=0;i<order.length;i++) {
      const current=order[i], req=requests[current.id];
      if(current.start < dayStart || current.start+req.duration+(protect?req.reset:0)>dayEnd)
        return {ok:false, culprit:current.id, reason:'This appointment runs beyond the sample workday.'};
      if(i===0 && protect) {
        const before=trip('salon',req.where)+cushion('salon',req.where)+req.prep;
        if(dayStart+before>current.start)
          return {ok:false,culprit:current.id,reason:'Not enough time to travel from the salon and set up before the first appointment.'};
      }
      if(i>0) {
        const prev=order[i-1], prevReq=requests[prev.id];
        const extra=protect?
          prevReq.reset+trip(prevReq.where,req.where)+cushion(prevReq.where,req.where)+req.prep:0;
        const available=current.start-(prev.start+prevReq.duration);
        if(available<extra) {
          const missing=extra-available;
          const note=protect?
            'Need '+extra+' minutes between '+prevReq.name+' and '+req.name+' for reset, travel, cushion and setup; only '+Math.max(0,available)+' available.' :
            'The requested services overlap.';
          return {ok:false,culprit:current.id,reason:note,missing};
        }
      }
    }
    return {ok:true};
  }
  function earliest(id,after) {
    for(let start=Math.max(9*60,Math.ceil(after/15)*15);start<=16*60;start+=15){
      if(validate(scenario({id,start}),true).ok) return start;
    }
    return null;
  }
  function selectedStart() { return Number(timeInput.value); }
  function smart() {return smartInput.checked;}
  function timelineSummary() {
    const list=ordered(state.bookings);
    let service=0, hidden=0;
    const records=[];
    list.forEach((item,i)=>{
      const req=requests[item.id],previous=i?requests[list[i-1].id]:{where:'salon'};
      const travel=trip(previous.where,req.where), pad=cushion(previous.where,req.where);
      service+=req.duration;
      hidden+=travel+pad+req.prep+req.reset;
      if(travel) records.push({kind:'travel',start:item.start-req.prep-travel-pad,
        end:item.start-req.prep-pad,name:'Travel to '+locations[req.where],
        subtitle:(trafficInput.value==='busy'?'Busy traffic estimate':'Sample travel estimate')});
      if(pad) records.push({kind:'cushion',start:item.start-req.prep-pad,end:item.start-req.prep,
        name:'Transition cushion',subtitle:'Optional breathing room'});
      records.push({kind:'prep',start:item.start-req.prep,end:item.start,name:req.name+' · Setup',subtitle:req.prep+' min to get ready'});
      records.push({kind:'service',start:item.start,end:item.start+req.duration,name:req.name+' · '+req.service,subtitle:locations[req.where]});
      records.push({kind:'reset',start:item.start+req.duration,end:item.start+req.duration+req.reset,
        name:req.name+' · Clean & reset',subtitle:'Built-in turnaround'});
    });
    return {records,service,hidden,valid:validate(list,true)};
  }
  function paintAgenda() {
    const {records,service,hidden,valid}=timelineSummary();
    agenda.replaceChildren();
    const top=document.createElement('div');
    top.className='sb-day-start';top.textContent='8:30 AM · Begin at the salon';agenda.append(top);
    if(!valid.ok){
      const warning=document.createElement('div');
      warning.className='sb-agenda-warning';
      warning.textContent='⚠ Hidden overlap in this plan: '+valid.reason;
      agenda.append(warning);
    }
    records.forEach((item,i)=>{
      const row=document.createElement('div');
      row.className='sb-event sb-event-'+item.kind;
      row.style.setProperty('--sb-i',String(i));
      const time=document.createElement('span');
      time.className='sb-event-time';time.textContent=fmt(item.start)+' – '+fmt(item.end);
      const marker=document.createElement('span');marker.className='sb-event-marker';marker.setAttribute('aria-hidden','true');
      const info=document.createElement('span');info.className='sb-event-text';
      const head=document.createElement('strong');head.textContent=item.name;
      const detail=document.createElement('small');detail.textContent=item.subtitle;
      info.append(head,detail);row.append(time,marker,info);agenda.append(row);
    });
    const end=document.createElement('div');end.className='sb-day-end';
    end.textContent='End of planned appointments';agenda.append(end);
    $('[data-sb-count]').textContent=state.bookings.length+' of 3 booked';
    $('[data-sb-service-total]').textContent=service+' min';
    $('[data-sb-hidden-total]').textContent=hidden+' min';
  }
  function showNotice(head,detail,tone='neutral') {state.notice={head,detail,tone};}
  function paintNotice() {
    const target=$('[data-sb-feedback-wrap]');
    const note=state.notice;
    target.dataset.tone=note.tone;
    $('[data-sb-feedback-title]').textContent=note.head;
    $('[data-sb-feedback]').textContent=note.detail;
  }
  function paintPreview() {
    clientBtns.forEach(btn=>{
      const booked=state.bookings.some(b=>b.id===btn.dataset.sbPerson);
      btn.disabled=booked;
      btn.setAttribute('aria-pressed',String(state.selected===btn.dataset.sbPerson&&!booked));
      btn.dataset.booked=String(booked);
    });
    $('[data-sb-smart-label]').textContent=smart()?'On':'Off';
    $('[data-sb-mode-note]').textContent=smart()?
      'Travel, preparation and cleanup must fit before confirming.' :
      'Showing service-only availability. Hidden time is not protected.';
    const req=state.selected?requests[state.selected]:null;
    if(!req) {
      ['travel','prep','service','reset'].forEach(k=>$('[data-sb-'+k+']').textContent='—');
      $('[data-sb-departure]').textContent='All booked';
      $('[data-sb-depart-note]').textContent='Restart the exercise to try another plan.';
      bookBtn.disabled=true;suggestionBtn.disabled=true;
      return;
    }
    const start=selectedStart();
    const prior=ordered(state.bookings).filter(b=>b.start<=start).at(-1);
    const previous=prior?requests[prior.id]:{where:'salon'};
    const travel=trip(previous.where,req.where);
    const pad=cushion(previous.where,req.where);
    const departure=start-req.prep-travel-pad;
    $('[data-sb-travel]').textContent=travel+(pad?' + '+pad+' cushion':'')+' min';
    $('[data-sb-prep]').textContent=req.prep+' min';
    $('[data-sb-service]').textContent=req.duration+' min';
    $('[data-sb-reset]').textContent=req.reset+' min';
    $('[data-sb-departure]').textContent=fmt(departure);
    $('[data-sb-depart-note]').textContent=travel?
      'Leave '+locations[previous.where]+' for '+locations[req.where]+'; arrive in time to set up.' :
      'No drive required; start preparation at this time.';
    const candidate={id:state.selected,start};
    const allowed=validate(scenario(candidate),smart());
    const suggestion=earliest(state.selected,start);
    bookBtn.disabled=!allowed.ok;
    suggestionBtn.disabled=suggestion===null||suggestion===start;
    suggestionBtn.textContent=suggestion!==null&&suggestion!==start?
      'Try '+fmt(suggestion)+' instead ↗':'No later suggestion needed';
    if(!state.notice) {
      if(allowed.ok) {
        const hidden=validate(scenario(candidate),true);
        showNotice(!smart()&&!hidden.ok?'Looks open—but not really':'This time fits',
          !smart()&&!hidden.ok?'Service times do not overlap, but travel/setup/reset would: '+hidden.reason:
            'The selected time fits the '+(smart()?'full schedule, including buffers.':'service-only view.'),!smart()&&!hidden.ok?'warning':'success');
      } else {
        showNotice('Not enough room between appointments',
          allowed.reason+(suggestion!==null?' Try '+fmt(suggestion)+' instead.':''),'warning');
      }
    }
  }
  function render(){paintAgenda();paintPreview();paintNotice();state.notice=null;}
  function update() {state.notice=null;render();}
  for(let min=9*60;min<=16*60;min+=15) {
    const option=document.createElement('option');
    option.value=String(min);option.textContent=fmt(min);
    timeInput.append(option);
  }
  timeInput.value=String(10*60);
  clientBtns.forEach(btn=>btn.addEventListener('click',()=>{
    const id=btn.dataset.sbPerson;
    if(state.bookings.some(b=>b.id===id))return;
    state.selected=id;
    timeInput.value=String(id==='robin'?11*60+30:10*60);
    showNotice('Planning '+requests[id].name+'’s appointment','Watch the buffer totals change when you select a start time.');
    render();
  }));
  [timeInput,trafficInput,cushionInput].forEach(control=>control.addEventListener('change',update));
  smartInput.addEventListener('change',()=>{
    const valid=validate(state.bookings,true);
    showNotice(smart()?'Smart buffers enabled':'Appointment-only view',
      smart()?
        (valid.ok?'Travel, prep and cleanup are now protected when booking.':'The existing calendar has a hidden conflict: '+valid.reason):
        'Try booking a time that looks free without transition buffers, then turn protection back on.',
      smart()&&!valid.ok?'warning':'neutral');
    render();
  });
  suggestionBtn.addEventListener('click',()=>{
    if(!state.selected)return;
    const when=earliest(state.selected,selectedStart());
    if(when===null)return;
    timeInput.value=String(when);
    showNotice('Suggested opening: '+fmt(when),'This start time gives enough space for the full journey, service preparation and reset.', 'success');
    render();
  });
  bookBtn.addEventListener('click',()=>{
    if(!state.selected)return;
    const candidate={id:state.selected,start:selectedStart()};
    const checked=validate(scenario(candidate),smart());
    if(!checked.ok){
      showNotice('That time cannot be booked',checked.reason,'warning');render();return;
    }
    state.bookings.push(candidate);
    const req=requests[candidate.id];
    const hidden=validate(state.bookings,true);
    state.selected=['jules','robin'].find(id=>!state.bookings.some(b=>b.id===id))||null;
    timeInput.value=String(state.selected==='robin'?11*60+30:10*60);
    if(!hidden.ok){
      showNotice('Booked—there is a hidden time conflict',req.name+' is on the calendar, but: '+hidden.reason+' Turn Smart buffers on to prevent this.', 'warning');
    }else {
      showNotice(state.selected?'Appointment booked · '+req.name:'All three appointments scheduled',
        'The agenda now includes the service, setup and cleanup—not just the client-facing time.', 'success');
    }
    render();
  });
  resetBtn.addEventListener('click',()=>{
    state.bookings=[{id:'ava',start:9*60}];
    state.selected='jules';
    timeInput.value=String(10*60);trafficInput.value='normal';
    cushionInput.checked=true;smartInput.checked=true;
    showNotice('Fresh day, one appointment already booked','Try Jules at 10:00 AM, then see the earliest time the scheduler can safely fit.', 'neutral');
    render();
  });
  showNotice('Try Jules at 10:00 AM','Ava’s 9:00 AM service is already booked. See why transition time changes the next available opening.');
  render();
})();
