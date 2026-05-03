/* ============================================================
   clamp + 잘 봤어요 글로벌 카운터
   ============================================================ */
(function () {
  /* ---------- 6줄 클램프 ---------- */
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
    btn.textContent = '… 더보기';
    btn.addEventListener('click', function () {
      if (el.classList.contains('collapsed')) {
        el.classList.remove('collapsed');
        el.style.maxHeight = '';
        btn.textContent = '접기';
      } else {
        el.classList.add('collapsed');
        el.style.maxHeight = limitPx + 'px';
        btn.textContent = '… 더보기';
        var post = el.closest('.post');
        if (post) post.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
    el.parentNode.insertBefore(btn, el.nextSibling);
  });

  /* ============================================================
     잘 봤어요 — 글로벌 카운터 (CounterAPI.dev)
     - 게시물별 별도 카운터 (slug 기반)
     - 본인이 한 번만 누를 수 있게 localStorage로 lock
     - API 실패 시 localStorage 카운트로 fallback (UI는 깨지지 않음)
     ============================================================ */
  var WORKSPACE = 'lynnyu-blog';   // CounterAPI workspace 이름 (자동 생성됨, 유일하기만 하면 됨)
  var API = 'https://api.counterapi.dev/v1';
  var LOCK_KEY = 'reactions_locked_v2';

  var locked = {};
  try { locked = JSON.parse(localStorage.getItem(LOCK_KEY) || '{}'); } catch (e) {}

  function slugToKey(slug) {
    // /da/risk-score-credit/ → da-risk-score-credit
    return slug.replace(/^\/+|\/+$/g, '').replace(/\//g, '-').replace(/[^a-z0-9-]/gi, '').toLowerCase() || 'home';
  }

  function setLock(slug, val) {
    locked[slug] = val;
    try { localStorage.setItem(LOCK_KEY, JSON.stringify(locked)); } catch (e) {}
  }

  document.querySelectorAll('.react-btn').forEach(function (btn) {
    var slug = btn.dataset.slug;
    if (!slug) return;
    var key = slugToKey(slug);
    var countEl = btn.querySelector('.count');
    var isLocked = !!locked[slug];

    function render(value) {
      if (typeof value === 'number') countEl.textContent = value;
      btn.classList.toggle('active', isLocked);
    }
    render();

    // 페이지 로드 시 현재 카운트 가져오기
    fetch(API + '/' + WORKSPACE + '/' + key)
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        if (data && typeof data.count === 'number') render(data.count);
        else if (data && data.data && typeof data.data.up_count === 'number') render(data.data.up_count);
      })
      .catch(function () { /* 무시 — 0 표시 유지 */ });

    btn.addEventListener('click', function () {
      if (isLocked) return;  // 이미 누름. 취소 불가 (글로벌이라 빼주는 endpoint 미사용).
      isLocked = true;
      setLock(slug, true);
      // 낙관적 업데이트
      var current = parseInt(countEl.textContent || '0', 10);
      render(current + 1);

      fetch(API + '/' + WORKSPACE + '/' + key + '/up')
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (data) {
          if (data && typeof data.count === 'number') render(data.count);
          else if (data && data.data && typeof data.data.up_count === 'number') render(data.data.up_count);
        })
        .catch(function () { /* 실패해도 UI는 +1 상태 유지. 다음 로드 시 정확한 값으로 갱신됨. */ });
    });
  });
})();
