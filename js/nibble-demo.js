/* Nibble Fish — a tiny, original portfolio sketch (not production game code). */
(() => {
  'use strict';
  const root = document.querySelector('[data-nibble-game]');
  if (!root) return;

  const canvas = root.querySelector('[data-nibble-canvas]');
  const ctx = canvas && canvas.getContext('2d');
  const castButton = root.querySelector('[data-nibble-cast]');
  const resetButton = root.querySelector('[data-nibble-reset]');
  const leftButton = root.querySelector('[data-nibble-left]');
  const rightButton = root.querySelector('[data-nibble-right]');
  const scoreLabel = root.querySelector('[data-nibble-count]');
  const statusLabel = root.querySelector('[data-nibble-status]');
  if (!ctx || !castButton || !resetButton || !leftButton || !rightButton) return;

  const W = 800, H = 390;
  const surface = 85, floor = 345, goal = 3;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const fishSeeds = [
    { x:176, y:170, direction:1, speed:24, size:1, color:'#E6A8BB', fin:'#C8799B', name:'pink fish' },
    { x:546, y:242, direction:-1, speed:28, size:.92, color:'#B7A8D9', fin:'#8C83B5', name:'lavender fish' },
    { x:307, y:303, direction:1, speed:20, size:1.06, color:'#E3BF83', fin:'#C49962', name:'golden fish' }
  ];
  let fishes, count, phase, hookedFish;
  let hookX = W / 2, hookY = surface;
  let time = 0, previous = 0;
  let pointerActive = false;
  const holding = { left:false, right:false };
  const keys = { left:false, right:false };

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const ambient = () => !reduced.matches && !document.documentElement.classList.contains('motion-off');

  function setStatus(message) { statusLabel.textContent = message; }
  function syncUI() {
    scoreLabel.textContent = count + ' / ' + goal;
    castButton.disabled = phase !== 'ready';
    castButton.textContent = phase === 'won' ? 'All caught!' :
      (phase === 'ready' ? 'Drop hook ↓' : 'Reeling…');
  }
  function reset() {
    fishes = fishSeeds.map(f => ({...f}));
    count = 0;
    phase = 'ready';
    hookedFish = null;
    hookX = W / 2;
    hookY = surface;
    holding.left = holding.right = false;
    keys.left = keys.right = false;
    setStatus('Aim for a swimming fish, then drop the hook!');
    syncUI();
  }
  function cast() {
    if (phase !== 'ready') return;
    hookY = surface;
    hookedFish = null;
    phase = 'dropping';
    setStatus('Hook is dropping…');
    syncUI();
  }
  function finishCast() {
    if (hookedFish) {
      const prize = hookedFish;
      count += 1;
      if (count === goal) {
        phase = 'won';
        setStatus('Three fish caught! You completed this little fishing break. ✨');
      } else {
        prize.x = 100 + Math.random() * 600;
        prize.direction = Math.random() > .5 ? 1 : -1;
        phase = 'ready';
        setStatus('Nice catch! A ' + prize.name + ' joined your collection. Catch another!');
      }
    } else {
      phase = 'ready';
      setStatus('No bite that time. Move toward a fish and try again!');
    }
    hookedFish = null;
    hookY = surface;
    syncUI();
  }

  function update(dt) {
    time += dt;
    const move = Number(holding.right || keys.right) - Number(holding.left || keys.left);
    if (phase !== 'won' && move) hookX = clamp(hookX + move * 260 * dt, 38, W - 38);

    if (ambient()) {
      fishes.forEach(f => {
        if (f === hookedFish) return;
        f.x += f.direction * f.speed * dt;
        if (f.x > W - 48) { f.x = W - 48; f.direction = -1; }
        if (f.x < 48) { f.x = 48; f.direction = 1; }
      });
    }

    if (phase === 'dropping') {
      hookY = Math.min(floor, hookY + 205 * dt);
      for (const f of fishes) {
        const sway = ambient() ? Math.sin(time * 2 + f.y) * 3 : 0;
        if (Math.abs(hookX - f.x) < 30 * f.size + 15 &&
            Math.abs((hookY + 13) - (f.y + sway)) < 18 * f.size + 11) {
          hookedFish = f;
          phase = 'reeling';
          setStatus('A bite! Reeling in the ' + f.name + '…');
          break;
        }
      }
      if (hookY >= floor && phase === 'dropping') {
        phase = 'reeling';
        setStatus('Reeling the hook back up…');
      }
    } else if (phase === 'reeling') {
      hookY = Math.max(surface, hookY - 280 * dt);
      if (hookY <= surface) finishCast();
    }
  }

  function roundedRect(x,y,w,h,r,fill) {
    ctx.beginPath(); ctx.roundRect(x,y,w,h,r);
    ctx.fillStyle = fill; ctx.fill();
  }
  function drawPond() {
    ctx.clearRect(0,0,W,H);
    const sky = ctx.createLinearGradient(0,0,0,H);
    sky.addColorStop(0,'#FAF5E9'); sky.addColorStop(.21,'#E6F0ED');
    sky.addColorStop(.22,'#C6E9E9'); sky.addColorStop(1,'#82C0CB');
    ctx.fillStyle=sky; ctx.fillRect(0,0,W,H);

    ctx.fillStyle='rgba(255,255,255,.68)';
    ctx.beginPath(); ctx.arc(665,27,56,0,Math.PI*2);ctx.fill();

    // Water surface, kept airy and visually consistent with the coastal header.
    ctx.beginPath();ctx.moveTo(0,78);
    for(let x=0;x<=W;x+=10)ctx.lineTo(x,78+3*Math.sin(x/35+(ambient()?time*.8:0)));
    ctx.lineTo(W,91);ctx.lineTo(0,91);ctx.closePath();
    ctx.fillStyle='rgba(255,255,255,.63)';ctx.fill();

    for (let j=0;j<6;j++){
      ctx.beginPath();
      const y=122+j*39;
      const move=ambient()?time*6*(j%2?1:-1):0;
      ctx.moveTo(-50,y);
      for(let x=-50;x<=W+50;x+=8)
        ctx.lineTo(x,y+4*Math.sin((x+move)/65+j*2));
      ctx.strokeStyle=j%2?'rgba(255,255,255,.15)':'rgba(239,251,249,.20)';
      ctx.lineWidth=j%2?2:3;ctx.stroke();
    }
    // Sandy riverbed and gentle plants.
    const sand=ctx.createLinearGradient(0,342,0,H);
    sand.addColorStop(0,'#EADBC5');sand.addColorStop(1,'#D9C4AE');
    ctx.beginPath();ctx.moveTo(0,349);
    for(let x=0;x<=W;x+=16)ctx.lineTo(x,350+4*Math.sin(x/51));
    ctx.lineTo(W,H);ctx.lineTo(0,H);ctx.closePath();
    ctx.fillStyle=sand;ctx.fill();
    for(let group=0;group<9;group++){
      const base=24+group*95;
      ctx.strokeStyle=group%2?'rgba(104,154,135,.55)':'rgba(106,163,157,.53)';
      ctx.lineCap='round';ctx.lineWidth=5;
      for(let leaf=0;leaf<3;leaf++){
        const dx=(leaf-1)*11, tip=18+(leaf*9+group*3)%36;
        ctx.beginPath();ctx.moveTo(base+dx,H);
        ctx.quadraticCurveTo(base+dx+(leaf-1)*12,H-18,base+dx+(leaf-1)*13,H-tip);
        ctx.stroke();
      }
    }
    // Decorative bubbles are deliberately faint and do not affect gameplay.
    for(let i=0;i<12;i++){
      const bx=36+(i*137)%735;
      const by=130+(i*63)%190-(ambient()?((time*8+i*13)%56):0);
      ctx.beginPath();ctx.arc(bx,by,2+(i%3),0,Math.PI*2);
      ctx.strokeStyle='rgba(248,255,253,.40)';ctx.lineWidth=1.5;ctx.stroke();
    }
  }

  function drawFish(f, x=f.x, y=f.y, attached=false) {
    const bob=attached || !ambient() ? 0 : Math.sin(time*2+f.y)*3;
    ctx.save();ctx.translate(x,y+bob);
    ctx.scale(f.direction*f.size,f.size);
    ctx.fillStyle=f.fin;
    ctx.beginPath();ctx.moveTo(-20,0);ctx.lineTo(-44,-17);ctx.lineTo(-43,18);ctx.closePath();ctx.fill();
    ctx.beginPath();ctx.moveTo(-9,-15);ctx.lineTo(-20,-29);ctx.lineTo(8,-18);ctx.closePath();ctx.fill();
    ctx.beginPath();ctx.moveTo(-7,15);ctx.lineTo(-17,25);ctx.lineTo(10,17);ctx.closePath();ctx.fill();

    const shade=ctx.createLinearGradient(0,-20,0,22);
    shade.addColorStop(0,'#FFF9EE');shade.addColorStop(.38,f.color);shade.addColorStop(1,f.fin);
    ctx.fillStyle=shade;ctx.beginPath();ctx.ellipse(0,0,32,20,0,0,Math.PI*2);ctx.fill();

    ctx.beginPath();ctx.ellipse(-2,10,17,5,-.12,0,Math.PI*2);
    ctx.fillStyle='rgba(255,249,242,.26)';ctx.fill();
    ctx.beginPath();ctx.arc(17,-6,3.2,0,Math.PI*2);ctx.fillStyle='#355C61';ctx.fill();
    ctx.beginPath();ctx.arc(18,-7,1,0,Math.PI*2);ctx.fillStyle='#FFFFFF';ctx.fill();
    ctx.strokeStyle='rgba(68,103,103,.45)';ctx.lineWidth=1.4;
    ctx.beginPath();ctx.arc(17,4,7,.15,1.18);ctx.stroke();
    ctx.beginPath();ctx.moveTo(7,-10);ctx.quadraticCurveTo(2,0,7,11);ctx.stroke();
    ctx.restore();
  }

  function drawHook() {
    ctx.save();
    ctx.strokeStyle='#456E76';ctx.lineWidth=2.5;ctx.lineCap='round';
    ctx.beginPath();ctx.moveTo(hookX,0);ctx.lineTo(hookX,hookY+2);ctx.stroke();
    ctx.strokeStyle='#456D75';ctx.lineWidth=3.8;
    ctx.beginPath();ctx.moveTo(hookX,hookY+2);ctx.lineTo(hookX,hookY+16);
    ctx.arc(hookX+8,hookY+16,8,Math.PI,0,true);
    ctx.lineTo(hookX+16,hookY+12);ctx.stroke();
    ctx.beginPath();ctx.arc(hookX,hookY+2,3.5,0,Math.PI*2);
    ctx.fillStyle='#F7EEE5';ctx.fill();ctx.stroke();
    ctx.restore();
  }

  function draw() {
    drawPond();
    fishes.forEach(f=>{if(f!==hookedFish)drawFish(f);});
    drawHook();
    if(hookedFish)drawFish(hookedFish,hookX+24,hookY+29,true);
    if(phase==='won') {
      roundedRect(217,139,365,107,18,'rgba(255,253,247,.93)');
      ctx.textAlign='center';ctx.fillStyle='#355E63';
      ctx.font='500 29px Georgia, serif';ctx.fillText('Lovely catch! ✦',400,182);
      ctx.font='600 17px system-ui, sans-serif';ctx.fillText('Three fish collected!',400,214);
    }
  }

  function resize() {
    const rect=canvas.getBoundingClientRect();
    const dpr=Math.min(window.devicePixelRatio||1,2);
    if(rect.width < 1) return;
    canvas.width=Math.round(rect.width*dpr);
    canvas.height=Math.round(rect.height*dpr);
    ctx.setTransform(canvas.width/W,0,0,canvas.height/H,0,0);
    draw();
  }
  function loop(now) {
    const dt=Math.min(.05,(now-(previous||now))/1000);
    previous=now;
    update(dt);
    draw();
    window.requestAnimationFrame(loop);
  }
  function moveToPointer(e) {
    if(phase==='won') return;
    const bounds=canvas.getBoundingClientRect();
    hookX=clamp((e.clientX-bounds.left)*W/bounds.width,38,W-38);
  }
  canvas.addEventListener('pointerdown',e=>{
    if(e.button!==0 && e.pointerType==='mouse')return;
    pointerActive=true;
    canvas.focus({preventScroll:true});
    moveToPointer(e);
    if(canvas.setPointerCapture)canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove',e=>{if(pointerActive)moveToPointer(e);});
  for(const name of ['pointerup','pointercancel','lostpointercapture'])
    canvas.addEventListener(name,()=>{pointerActive=false;});

  function bindHold(button,key) {
    button.addEventListener('pointerdown',e=>{
      if(e.button!==0 && e.pointerType==='mouse')return;
      holding[key]=true;
      if(button.setPointerCapture)button.setPointerCapture(e.pointerId);
    });
    for(const name of ['pointerup','pointercancel','lostpointercapture'])
      button.addEventListener(name,()=>{holding[key]=false;});
    // Short taps must also nudge the hook on mobile.
    button.addEventListener('click',()=>{if(phase!=='won')hookX=clamp(hookX+(key==='left'?-32:32),38,W-38);});
  }
  bindHold(leftButton,'left');
  bindHold(rightButton,'right');
  castButton.addEventListener('click',cast);
  resetButton.addEventListener('click',reset);

  window.addEventListener('keydown',e=>{
    if(!root.contains(document.activeElement))return;
    // Leave Space and Enter free to activate focused buttons naturally.
    if(document.activeElement.tagName==='BUTTON' && (e.code==='Space'||e.code==='Enter'))return;
    const key=e.code;
    if(key==='ArrowLeft'||key==='KeyA') {keys.left=true;e.preventDefault();}
    if(key==='ArrowRight'||key==='KeyD'){keys.right=true;e.preventDefault();}
    if(key==='Space'||key==='ArrowDown'){e.preventDefault();if(!e.repeat)cast();}
    if(key==='KeyR'){e.preventDefault();reset();}
  });
  window.addEventListener('keyup',e=>{
    if(e.code==='ArrowLeft'||e.code==='KeyA')keys.left=false;
    if(e.code==='ArrowRight'||e.code==='KeyD')keys.right=false;
  });
  window.addEventListener('blur',()=>{keys.left=keys.right=false;holding.left=holding.right=false;});

  reset();
  resize();
  if('ResizeObserver' in window)new ResizeObserver(resize).observe(canvas);
  else window.addEventListener('resize',resize);
  window.requestAnimationFrame(loop);
})();
