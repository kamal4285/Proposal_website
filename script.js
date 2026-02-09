
/* Proposal page script
   - Inserts names into the message
   - Animates rose petals and heart
   - Simple confetti effect
*/

(function(){
  // Elements
  const revealBtn = document.getElementById('revealBtn');
  const resetBtn = document.getElementById('resetBtn');
  const yourNameInput = document.getElementById('yourName');
  const theirNameInput = document.getElementById('theirName');
  const proposal = document.getElementById('proposal');
  const namesLine = document.getElementById('namesLine');
  const askLine = document.getElementById('askLine');
  const roseWrap = document.getElementById('rose');
  const petalsTarget = document.body;
  const heart = document.getElementById('heart');

  // confetti canvas
  const canvas = document.getElementById('confettiCanvas');
  const ctx = canvas.getContext('2d');
  let confettiParticles = [];
  let confettiActive = false;
  resizeCanvas();

  window.addEventListener('resize', resizeCanvas);
  function resizeCanvas(){
    canvas.width = window.innerWidth * 1.1;
    canvas.height = window.innerHeight * 1.1;
  }

  // Create confetti particles
  function spawnConfetti(){
    confettiParticles = [];
    const count = Math.min(140, Math.floor(window.innerWidth / 8));
    for(let i=0;i<count;i++){
      confettiParticles.push({
        x: Math.random() * canvas.width,
        y: -Math.random() * canvas.height * 0.5,
        w: 6 + Math.random()*10,
        h: 8 + Math.random()*8,
        r: Math.random()*360,
        vY: 2 + Math.random()*4,
        vX: (Math.random()-0.5)*2,
        color: randomChoice(['#ff6aa6','#ffd166','#c21a3b','#fff07a','#ffb3d6']),
        rotSpeed: (Math.random()-0.5)*6
      });
    }
    confettiActive = true;
    requestAnimationFrame(confettiLoop);
    setTimeout(()=> confettiActive = false, 4200);
  }

  function confettiLoop(){
    if(!confettiActive) {
      // fade out quickly
      ctx.clearRect(0,0,canvas.width,canvas.height);
      return;
    }
    ctx.clearRect(0,0,canvas.width,canvas.height);
    for(let p of confettiParticles){
      p.x += p.vX;
      p.y += p.vY;
      p.r += p.rotSpeed;
      p.vY += 0.03; // gravity
      // draw
      ctx.save();
      ctx.translate(p.x,p.y);
      ctx.rotate(p.r * Math.PI/180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
      ctx.restore();
    }
    // remove off-canvas
    confettiParticles = confettiParticles.filter(p => p.y < canvas.height + 100);
    requestAnimationFrame(confettiLoop);
  }

  function randomChoice(arr){
    return arr[Math.floor(Math.random()*arr.length)];
  }

  // simple petal fly (decorative)
  function spawnPetals(n=8){
    for(let i=0;i<n;i++){
      const petal = document.createElement('div');
      petal.className = 'petal';
      document.body.appendChild(petal);
      const startX = window.innerWidth/2 + (Math.random()-0.5)*260;
      petal.style.left = startX + 'px';
      petal.style.top = (window.innerHeight/2 + 10 + Math.random()*40) + 'px';
      const dur = 3000 + Math.random()*2000;
      petal.animate([
        { transform: 'translateY(0) rotate(0deg) scale(1)', opacity:1 },
        { transform: `translateY(${180 + Math.random()*120}px) rotate(${180 + Math.random()*180}deg) scale(.6)`, opacity:0.05 }
      ], {duration:dur, easing:'cubic-bezier(.2,.8,.25,1)'});
      setTimeout(()=> petal.remove(), dur+100);
    }
  }

  // show proposal
  function revealProposal(){
    const a = (yourNameInput.value || 'Someone').trim();
    const b = (theirNameInput.value || 'Someone').trim();
    // sanitize basic HTML to avoid script injection in innerText (we use text content)
    namesLine.textContent = `${a} ❤️ ${b}`;
    askLine.textContent = 'Will you marry me? If yes. Take screenshot and sent me or block me.';
    // show panel
    proposal.classList.remove('hidden');

    // animate heart pulse quickly & then settle
    heart.animate([
      { transform: 'rotate(-45deg) scale(1)' },
      { transform: 'rotate(-45deg) scale(1.18)' },
      { transform: 'rotate(-45deg) scale(1)' }
    ], { duration: 640, easing: 'cubic-bezier(.2,.9,.3,1)' });

    // show rose petals and bloom
    roseWrap.classList.add('show');
    // animate SVG petals (scale and fade) by targeting the group
    const petalsGroup = roseWrap.querySelector('#petals');
    if(petalsGroup){
      petalsGroup.animate([
        { transform: 'translate(100px,90px) scale(0.08)', opacity:0 },
        { transform: 'translate(100px,90px) scale(1.04)', opacity:1 },
        { transform: 'translate(100px,90px) scale(1)', opacity:1 }
      ], { duration: 900, easing:'cubic-bezier(.2,.9,.3,1)'});
    }

    // confetti & petals
    spawnConfetti();
    spawnPetals(12);

    // accessibility focus on the message
    proposal.setAttribute('tabindex','-1');
    proposal.focus({preventScroll:true});
  }

  function resetAll(){
    proposal.classList.add('hidden');
    roseWrap.classList.remove('show');
    // small reset animation
    heart.animate([
      { transform: 'rotate(-45deg) scale(.96)', opacity:0.9},
      { transform: 'rotate(-45deg) scale(1)', opacity:1}
    ], { duration: 300, easing: 'ease-out' });
  }

  revealBtn.addEventListener('click', (e)=>{
    revealProposal();
  });

  resetBtn.addEventListener('click', (e)=>{
    resetAll();
  });

  // allow press Enter on inputs to reveal
  [yourNameInput, theirNameInput].forEach(inp => {
    inp.addEventListener('keydown', (ev) => {
      if(ev.key === 'Enter'){
        ev.preventDefault();
        revealProposal();
      }
    });
  });

  // initial tiny pulse to invite clicking
  setTimeout(()=> {
    heart.animate([
      { transform: 'rotate(-45deg) scale(1)' },
      { transform: 'rotate(-45deg) scale(1.05)' },
      { transform: 'rotate(-45deg) scale(1)' }
    ], { duration: 1600, iterations: 1, easing: 'ease-in-out' });
  }, 600);

  // keyboard accessibility: space on revealBtn
  revealBtn.addEventListener('keydown', e => {
    if(e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      revealProposal();
    }
  });

})();