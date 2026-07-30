gsap.registerPlugin(ScrollTrigger);

/* ============================================================
   NAV DOTS — click to scroll + active state via IntersectionObserver
   ============================================================ */
const dots = document.querySelectorAll('.dot');
const sections = document.querySelectorAll('.page');

dots.forEach(dot => {
  dot.addEventListener('click', () => {
    const target = document.getElementById(dot.dataset.target);
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
});

const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      dots.forEach(d => d.classList.remove('active'));
      const match = document.querySelector(`.dot[data-target="${entry.target.id}"]`);
      if (match) match.classList.add('active');
    }
  });
}, { threshold: 0.5 });

sections.forEach(s => io.observe(s));

document.getElementById('scrollCue').addEventListener('click', () => {
  document.getElementById('page1').scrollIntoView({ behavior: 'smooth' });
});

/* ============================================================
   PAGE 0 — landing gentle entrance
   ============================================================ */
gsap.from('#landingEyebrow', { opacity: 0, y: 14, duration: .8, delay: .2 });
gsap.from('#landingTitle', { opacity: 0, y: 24, duration: .9, delay: .35, ease: 'back.out(1.5)' });
gsap.from('#landingSub', { opacity: 0, y: 14, duration: .8, delay: .55 });

/* ============================================================
   PAGE 1 — ENVELOPE: click -> open -> tear -> scatter -> letter
   ============================================================ */
const envelope = document.getElementById('envelope');
const envFlapTop = document.getElementById('envFlapTop');
const envSeal = document.getElementById('envSeal');
const scatterField = document.getElementById('scatterField');
const scatterPieces = scatterField.querySelectorAll('div');
const letter = document.getElementById('letter');
const envelopeHint = document.getElementById('envelopeHint');
const stage = document.getElementById('envelopeStage');

let envelopeOpened = false;

function openEnvelope() {
  if (envelopeOpened) return;
  envelopeOpened = true;
  envelopeHint.style.opacity = '0';

  const stageRect = stage.getBoundingClientRect();
  const spread = Math.min(stageRect.width, 420);

  const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

  // 1. seal pops off
  tl.to(envSeal, { scale: 0, rotate: 40, opacity: 0, duration: .3 });

  // 2. flap opens like a real envelope, then disappears completely
  tl.to(envFlapTop, {
    rotateX: -155,
    duration: .55,
    transformOrigin: 'top center',
    ease: 'power2.inOut'
  }, '-=0.05');
  tl.to(envFlapTop, { opacity: 0, duration: .25 }, '-=0.1');

  // 3. the "tear" — sides rip apart and the back gives way
  tl.to('.env-flap-left', { x: -70, y: 20, rotate: -30, opacity: 0, duration: .55, ease: 'power1.in' }, '-=0.1');
  tl.to('.env-flap-right', { x: 70, y: 20, rotate: 30, opacity: 0, duration: .55, ease: 'power1.in' }, '<');
  tl.to('.env-back', { scale: .4, opacity: 0, duration: .5, ease: 'power1.in' }, '<0.05');

  // 4. contents settle beside the letter — ducks to the left, tulips to the right
  //    (positions are fractions of the stage width/height, so this stays balanced at any screen size)
  const layout = {
    d1: { xFrac: -0.40, yFrac: -0.30, rotate: -10 },
    d2: { xFrac: -0.36, yFrac:  0.32, rotate:   8 },
    t1: { xFrac:  0.40, yFrac: -0.34, rotate:  10 },
    t2: { xFrac:  0.44, yFrac:  0.06, rotate:  -8 },
    t3: { xFrac:  0.38, yFrac:  0.36, rotate:  14 },
    t4: { xFrac:  0.30, yFrac: -0.58, rotate: -12 },
    s1: { xFrac: -0.14, yFrac: -0.58, rotate:   0 },
    s2: { xFrac:  0.16, yFrac: -0.60, rotate:   0 },
    s3: { xFrac:  0.00, yFrac: -0.66, rotate:   0 }
  };

  scatterPieces.forEach((piece) => {
    const key = Array.from(piece.classList).find(c => layout[c]);
    const spot = layout[key];
    if (!spot) return;

    tl.to(piece, {
      x: spot.xFrac * stageRect.width,
      y: spot.yFrac * stageRect.height,
      rotate: spot.rotate,
      opacity: 1,
      scale: 1,
      duration: gsap.utils.random(.7, 1.0),
      ease: 'back.out(1.6)'
    }, '-=0.55');
  });

  // 5. wait for the baby ducks, stars and tulips to fully settle first
  tl.to({}, { duration: .35 });

  // 6. only then does the letter fade in, front and center — the note becomes visible
  tl.to(letter, {
    opacity: 1,
    scale: 1,
    rotate: 0,
    duration: .8,
    ease: 'back.out(1.4)'
  });
}

envelope.addEventListener('click', openEnvelope);
envelope.addEventListener('keypress', (e) => { if (e.key === 'Enter') openEnvelope(); });

/* ============================================================
   PAGE 2 — memory photo: friendly empty state until "us.jpg" is added
   ============================================================ */
const memoryPhoto = document.getElementById('memoryPhoto');
const memoryPhotoWrap = document.getElementById('memoryPhotoWrap');
memoryPhoto.addEventListener('error', () => {
  memoryPhotoWrap.classList.add('no-image');
});

/* ============================================================
   PAGE 2 — MEMORY BOX -> Formspree
   ============================================================ */
const memoryForm = document.getElementById('memoryForm');
const memoryStatus = document.getElementById('memoryStatus');
const memorySubmit = document.getElementById('memorySubmit');

memoryForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const message = document.getElementById('memoryText').value.trim();
  if (!message) return;

  memorySubmit.disabled = true;
  memorySubmit.textContent = 'sending...';
  memoryStatus.textContent = '';

  try {
    const res = await fetch('https://formspree.io/f/mlgqzajq', {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        _subject: 'a new memory from Usha 🤍'
      })
    });

    if (res.ok) {
      memoryStatus.style.color = 'var(--sage)';
      memoryStatus.textContent = 'tucked safely into the memory box 💌';
      memoryForm.reset();
      memorySubmit.textContent = 'sent!';
    } else {
      throw new Error('Form error');
    }
  } catch (err) {
    memoryStatus.style.color = 'var(--tulip)';
    memoryStatus.textContent = "hmm, that didn't send — check your connection and try again.";
    memorySubmit.textContent = 'put it in the box';
  } finally {
    setTimeout(() => {
      memorySubmit.disabled = false;
      if (memorySubmit.textContent === 'sent!') memorySubmit.textContent = 'put it in the box';
    }, 2200);
  }
});

/* ============================================================
   PAGE 4 — DUCK BANNER FINALE
   walk in from the left -> pause & reveal caption -> turn & walk back
   ============================================================ */
const bannerTeam = document.getElementById('bannerTeam');
const finaleCaption = document.getElementById('finaleCaption');
const scrollMoreNote = document.getElementById('scrollMoreNote');
const ducks = document.querySelectorAll('.duck-page .duck');
const tulipRow = document.querySelectorAll('.tulip-row span');

// gentle continuous "waddle" bob, independent of scroll position
ducks.forEach((duck, i) => {
  gsap.to(duck, {
    y: -8,
    duration: 0.28,
    yoyo: true,
    repeat: -1,
    ease: 'sine.inOut',
    delay: i * 0.12
  });
});

tulipRow.forEach((t, i) => {
  gsap.to(t, {
    rotate: gsap.utils.random(-6, 6),
    duration: 1.4,
    yoyo: true,
    repeat: -1,
    ease: 'sine.inOut',
    delay: i * 0.1
  });
});

gsap.set(bannerTeam, { xPercent: -50, x: '-150vw' });

const duckTimeline = gsap.timeline({
  scrollTrigger: {
    trigger: '#page4',
    start: 'top top',
    end: '+=280%',
    scrub: 0.6,
    pin: false
  }
});

duckTimeline
  .to(bannerTeam, { x: '0vw', duration: 0.35, ease: 'power1.out' })      // walk in from the left, to center
  .to(scrollMoreNote, { opacity: 1, duration: 0.1 }, '-=0.15')            // "there's more" hint appears as they arrive
  .to(finaleCaption, { opacity: 1, duration: 0.15 }, '-=0.1')             // they arrive, looking at the screen
  .to({}, { duration: 0.2 })                                              // wait here — this is the moment
  .to(scrollMoreNote, { opacity: 0, duration: 0.1 })                      // hint fades before they leave
  .to(bannerTeam, { x: '150vw', duration: 0.35, ease: 'power1.in' });     // continue on and walk off to the right
  // the caption is never faded out — it stays as the last thing on screen