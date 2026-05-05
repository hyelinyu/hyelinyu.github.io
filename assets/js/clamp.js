/* ============================================================
   blog interactions: clamp, slideshow, translate, Firebase counter
   ============================================================ */
(function () {

  /* ---------- 1. 6줄 클램프 ---------- */
  function applyClamp(el) {
    // 이미 처리된 클램프 제거 (재적용 시)
    el.classList.remove('collapsed');
    el.style.maxHeight = '';
    var existingToggle = el.parentNode.querySelector(':scope > .toggle');
    if (existingToggle) existingToggle.remove();

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
  }

  function reapplyClamps(post) {
    // 보이는 .clampable에만 적용
    post.querySelectorAll('.clampable').forEach(function (el) {
      // 부모 lang-* 가 hidden이면 스킵
      var langWrap = el.closest('.lang-ko, .lang-en');
      if (langWrap && langWrap.hidden) {
        // hidden 상태인 클램프는 정리만
        el.classList.remove('collapsed');
        el.style.maxHeight = '';
        var t = el.parentNode.querySelector(':scope > .toggle');
        if (t) t.remove();
        return;
      }
      applyClamp(el);
    });
  }

  document.querySelectorAll('.clampable').forEach(function (el) {
    // hidden인 lang 블록은 처음엔 건너뜀
    var langWrap = el.closest('.lang-ko, .lang-en');
    if (langWrap && langWrap.hidden) return;
    applyClamp(el);
  });

  /* ---------- 2. Translate 토글 (swap + localStorage) ---------- */
  var LANG_KEY = 'post_lang_v1';
  var savedLang = {};
  try { savedLang = JSON.parse(localStorage.getItem(LANG_KEY) || '{}'); } catch (e) {}

  function applyLang(post, lang) {
    post.querySelectorAll('.lang-ko').forEach(function (el) {
      el.hidden = (lang === 'en');
    });
    post.querySelectorAll('.lang-en').forEach(function (el) {
      el.hidden = (lang !== 'en');
    });
    var btn = post.querySelector('.translate-toggle');
    if (btn) btn.textContent = (lang === 'en') ? 'Original' : 'Translate';
  }

  document.querySelectorAll('article[data-post-key]').forEach(function (post) {
    var btn = post.querySelector('.translate-toggle');
    if (!btn) return;  // 번역 없는 글은 토글도 없음

    var key = post.dataset.postKey;
    var initial = savedLang[key] === 'en' ? 'en' : 'ko';
    applyLang(post, initial);
    if (initial === 'en') reapplyClamps(post);  // 초기가 영어면 영어 본문에 클램프 적용

    btn.addEventListener('click', function () {
      var current = post.querySelector('.lang-en') && !post.querySelector('.lang-en').hidden ? 'en' : 'ko';
      var next = current === 'en' ? 'ko' : 'en';
      applyLang(post, next);
      savedLang[key] = next;
      try { localStorage.setItem(LANG_KEY, JSON.stringify(savedLang)); } catch (e) {}

      // clamp 재계산 — 영어 본문 길이가 다르므로
      reapplyClamps(post);
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
