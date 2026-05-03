/* ============================================================
   clamp.js — 6줄 넘는 게시글 자동 접힘 + 더보기
   ============================================================ */
(function () {
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
        // scroll back to card top so user doesn't get lost
        var post = el.closest('.post');
        if (post) post.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
    el.parentNode.insertBefore(btn, el.nextSibling);
  });

  /* ============================================================
     '잘 봤어요' — localStorage 기반 (정적 사이트라서 서버 없음).
     같은 브라우저에서 한 번만 카운트되는 lightweight 방식.
     진짜 글로벌 카운터가 필요하면 나중에 Firebase/Supabase 추가 가능.
     ============================================================ */
  var STORAGE_KEY = 'reactions_v1';
  var store = {};
  try { store = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch (e) {}

  document.querySelectorAll('.react-btn').forEach(function (btn) {
    var slug = btn.dataset.slug;
    if (!slug) return;
    var data = store[slug] || { count: 0, mine: false };
    var countEl = btn.querySelector('.count');

    function render() {
      countEl.textContent = data.count;
      btn.classList.toggle('active', data.mine);
    }
    render();

    btn.addEventListener('click', function () {
      if (data.mine) {
        data.count = Math.max(0, data.count - 1);
        data.mine = false;
      } else {
        data.count += 1;
        data.mine = true;
      }
      store[slug] = data;
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(store)); } catch (e) {}
      render();
    });
  });
})();
