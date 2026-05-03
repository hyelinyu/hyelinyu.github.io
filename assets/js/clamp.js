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

  /* ---------- Loved it 카운터 (localStorage, 무제한) ---------- */
  var STORAGE_KEY = 'loved_counts_v1';
  var counts = {};
  try { counts = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch (e) {}

  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(counts)); } catch (e) {}
  }

  document.querySelectorAll('.react-btn').forEach(function (btn) {
    var slug = btn.dataset.slug;
    if (!slug) return;
    var countEl = btn.querySelector('.count');
    var current = counts[slug] || 0;
    countEl.textContent = current;
    if (current > 0) btn.classList.add('active');

    btn.addEventListener('click', function () {
      current += 1;
      counts[slug] = current;
      save();
      countEl.textContent = current;
      btn.classList.add('active');

      // 시각적 피드백 — 살짝 튕기는 애니메이션
      btn.style.transform = 'scale(1.08)';
      setTimeout(function () { btn.style.transform = ''; }, 120);
    });
  });
})();
