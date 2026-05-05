/* ============================================================
   blog interactions: clamp, slideshow, translate, Firebase counter
   ============================================================ */
(function () {

  /* ---------- 1. 6줄 클램프 ---------- */
  document.querySelectorAll('.clampable').forEach(function (el) {
    var limit = parseInt(el.dataset.clamp || '6', 10);
    var lineHeight = parseFloat(getComputedStyle(el).lineHeight);
    if (!lineHeight) return;
    var limitPx = lineHeight * limit;
    if (el.scrollHeight <= limitPx + 4) return;

    el.classList.add('collapsed');
    el.style.maxHeight = limitPx + 'px';

    var btn = document.createElement('button');
    btn.className = 'toggle';
    btn.type = 'button';
    btn.textContent = '… more';
    btn.addEventListener('click', function () {
      if (el.classList.contains('collapsed')) {
        el.classList.remove('collapsed');
        el.style.maxHeight = '';
        btn.textContent = 'collapse';
      } else {
        el.classList.add('collapsed');
        el.style.maxHeight = limitPx + 'px';
        btn.textContent = '… more';
        var post = el.closest('.post');
        if (post) post.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
    el.parentNode.insertBefore(btn, el.nextSibling);
  });

  /* ---------- 2. Translate 토글 ---------- */
  document.querySelectorAll('.translate-toggle').forEach(function (btn) {
    var body = btn.nextElementSibling;
    if (!body || !body.classList.contains('translation-body')) return;
    body.style.display = 'none';
    btn.addEventListener('click', function () {
      var open = body.style.display === 'block';
      body.style.display = open ? 'none' : 'block';
      btn.textContent = open ? 'Translate' : 'Original';
    });
  });

  /* ---------- 3. 슬라이드쇼 ---------- */
  document.querySelectorAll('.post-slides').forEach(function (root) {
    var track = root.querySelector('.slides-track');
    var slides = track.children;
    var total = slides.length;
    if (total <= 1) return;

    var counter = root.querySelector('.slide-counter');
    var dotsWrap = root.querySelector('.slide-dots');
    var prev = root.querySelector('.slide-arrow.prev');
    var next = root.querySelector('.slide-arrow.next');

    // 점 동적 생성
    if (dotsWrap) {
      for (var i = 0; i < total; i++) {
        var d = document.createElement('span');
        d.className = 'slide-dot' + (i === 0 ? ' active' : '');
        dotsWrap.appendChild(d);
      }
    }

    var cur = 0;
    function update() {
      track.style.transform = 'translateX(-' + (cur * 100) + '%)';
      if (counter) counter.textContent = (cur + 1) + ' / ' + total;
      if (dotsWrap) {
        var dots = dotsWrap.children;
        for (var j = 0; j < dots.length; j++) {
          dots[j].classList.toggle('active', j === cur);
        }
      }
      if (prev) prev.disabled = cur === 0;
      if (next) next.disabled = cur === total - 1;
    }
    if (prev) prev.addEventListener('click', function () { if (cur > 0) { cur--; update(); } });
    if (next) next.addEventListener('click', function () { if (cur < total - 1) { cur++; update(); } });
    update();
  });

  /* ---------- 4. Loved it 글로벌 카운터 (Firebase) ---------- */
  // Firebase가 아직 로드 안 됐으면 기다림
  function initCounters() {
    if (!window.__fbReady) return;
    var fb = window.__fb;
    var dbRoot = fb.ref(fb.db, 'loved');

    document.querySelectorAll('.react-btn').forEach(function (btn) {
      var slug = btn.dataset.slug;
      if (!slug) return;
      var key = slugToKey(slug);
      var nodeRef = fb.ref(fb.db, 'loved/' + key);
      var countEl = btn.querySelector('.count');

      // 실시간 구독 — 다른 사람이 누르면 즉시 갱신
      fb.onValue(nodeRef, function (snap) {
        var v = snap.val();
        countEl.textContent = (typeof v === 'number') ? v : 0;
      });

      btn.addEventListener('click', function () {
        if (btn.disabled) return;
        btn.disabled = true;
        // 시각 피드백
        btn.style.transform = 'scale(1.08)';
        setTimeout(function () { btn.style.transform = ''; }, 120);

        // 트랜잭션 — race condition 안전. 항상 +1.
        fb.runTransaction(nodeRef, function (current) {
          return (current || 0) + 1;
        }).then(function () {
          btn.disabled = false;
          btn.classList.add('active');
        }).catch(function () {
          btn.disabled = false;
        });
      });
    });
  }

  function slugToKey(slug) {
    // /da/risk-score-credit/ → da_risk-score-credit
    // Firebase key 금지 문자: . # $ [ ] /
    return slug.replace(/^\/+|\/+$/g, '').replace(/\//g, '_').replace(/[.#$\[\]]/g, '-') || 'home';
  }

  if (window.__fbReady) initCounters();
  else document.addEventListener('fb-ready', initCounters);

})();
