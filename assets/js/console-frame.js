/* 게임기 콘솔 프레임 — 사이트 전체 적용
   시안: https://claude.ai/code/artifact/e9df0cae-0c50-40e9-8ace-e6f8a7d9ec0b
   (자세한 배경/제약 설명은 assets/css/style.css 맨 끝 "게임기 콘솔 프레임"
   섹션 주석 참고.)

   하는 일: 페이지가 그려진 뒤 <div class="app">...</div> 하나를 그대로
   콘솔 껍데기(#console-shell)로 감싼다. .app 안의 내용/기능은 단 하나도
   바꾸지 않고 그 자리에서 콘솔 화면(.console-screen) 안으로 옮기기만 한다.
   /private/ 관리자 페이지에는 이 스크립트 자체를 넣지 않았으므로 여기서
   따로 예외처리할 필요는 없음. */
(function () {
  'use strict';

  var app = document.querySelector('.app');
  if (!app || document.getElementById('console-shell')) return;

  var cfg = window.SITE_CONFIG || {};

  function el(tag, className, html) {
    var e = document.createElement(tag);
    if (className) e.className = className;
    if (html != null) e.innerHTML = html;
    return e;
  }

  // ── 콘솔 껍데기 뼈대 조립 ──
  var shell = el('div', 'console-shell');
  shell.id = 'console-shell';

  var marquee = el('div', 'console-marquee',
    '<span class="dot"></span><span id="console-title"></span><span class="dot"></span>');

  var hud = el('div', 'console-hud');
  var chipPosts = el('div', 'chip',
    '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-8-4.7-8-11a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6.3-8 11-8 11z"/></svg> POSTS <b id="console-posts">×0</b>');
  var chipDate = el('div', 'chip',
    '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M8 3v4M16 3v4"/></svg> DATE <b id="console-date">--.--</b>');
  var chipSkin = el('div', 'chip',
    '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="3"/></svg> SKIN <b id="console-skin">WHITE</b>');
  hud.appendChild(chipPosts);
  hud.appendChild(chipDate);
  hud.appendChild(chipSkin);

  var bezel = el('div', 'console-screen-bezel');
  var screen = el('div', 'console-screen');
  bezel.appendChild(screen);

  var deck = el('div', 'console-deck');
  var dpad = el('div', 'console-dpad', '<div class="cross"></div><div class="hub"></div>');
  var grille = el('div', 'console-grille', '<i></i><i></i><i></i>');
  var quickskins = el('div', 'console-quickskins');

  // 시안과 같은 4개(십자/다이아몬드 배치) — 기본(화이트)/블루/핑크/다크.
  // 민트는 사이드바 위 진짜 테마 스위처(점 5개)에서 고르면 됨.
  var QUICK_SKINS = [
    { pos: 't', theme: 'default', ring: '#8382e6', title: '기본(화이트)' },
    { pos: 'r', theme: 'blue', ring: '#4f9ce3', title: '블루' },
    { pos: 'b', theme: 'pink', ring: '#d94f8f', title: '핑크' },
    { pos: 'l', theme: 'dark', ring: '#7a56c9', title: '다크' }
  ];
  var quickButtons = [];
  QUICK_SKINS.forEach(function (s) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'console-quick-btn';
    btn.dataset.pos = s.pos;
    btn.dataset.consoleTheme = s.theme;
    btn.style.setProperty('--btn-ring', s.ring);
    btn.title = s.title;
    btn.setAttribute('aria-label', s.title + ' 스킨');
    btn.addEventListener('click', function () {
      var realBtn = document.querySelector('[data-theme-btn="' + s.theme + '"]');
      if (realBtn) realBtn.click();
    });
    quickskins.appendChild(btn);
    quickButtons.push(btn);
  });

  deck.appendChild(dpad);
  deck.appendChild(grille);
  deck.appendChild(quickskins);

  var deckFoot = el('div', 'console-deck-foot',
    '<span>' + escapeHtml(cfg.copyright || '© miku-tenshi.github.io') + '</span><span>SCORE 000420</span>');

  shell.appendChild(marquee);
  shell.appendChild(hud);
  shell.appendChild(bezel);
  shell.appendChild(deck);
  shell.appendChild(deckFoot);

  // 콘솔을 화면 한가운데 띄우는 바깥 레이어(assets/css/style.css의
  // .console-viewport 참고) — body 자체는 안 건드리고 이 래퍼 하나만 새로
  // 끼워 넣는다.
  var viewport = el('div', 'console-viewport');
  viewport.id = 'console-viewport';
  viewport.appendChild(shell);

  // ── .app을 콘솔 화면 안으로 이동 ──
  app.parentNode.insertBefore(viewport, app);
  screen.appendChild(app);

  // ── 사이드바 접기 버튼을 화면(.console-screen) 밖, 마퀴 왼쪽으로 옮김 ──
  // sidebar.js가 .app 안(.app의 flex 자식으로) 만들어 붙인 뒤라 이 시점엔
  // 이미 DOM에 있음 — 화면 안에 그대로 두면 스크롤할 때 같이 밀려 올라가
  // 버리므로 스크롤 안 되는 곳으로 옮겨야 하는데, 베젤(화면 바깥 여백,
  // v3~v7)에 두면 얇은 여백(13px)에 20px대 버튼이 다 안 들어가서 화면의
  // 둥근 모서리 위에 걸쳐 보이는 문제가 있었다("여전히 이상해, 콘솔 창이랑
  // 겹친다" 피드백) — 화면과 아예 안 겹치는 마퀴 바(제목 표시줄, 그 자체가
  // 이미 흰색 알약 모양 UI라 화면 위쪽에 별도로 떠 있고 스크롤도 안 됨) 왼쪽
  // 끝으로 옮겨서 "제목표시줄 + 메뉴 버튼"이라는 흔한 조합으로 붙인다
  // (스타일은 style.css의 "#console-shell .sidebar-toggle-btn" 참고).
  var toggleBtn = app.querySelector('.sidebar-toggle-btn');
  if (toggleBtn) marquee.insertBefore(toggleBtn, marquee.firstChild);

  // ── "글 쓰는 창"(.window) 높이를 화면 안에 딱 맞춤 ──
  // 사용자 요청: "글 쓰는 창은 가로 길이만 늘리고, 세로 길이는 콘솔 창
  // 안에 들어가도록 해 줘" — 가로는 CSS(style.css의 관련 섹션 참고)만으로
  // 풀 수 있지만, 세로로 "화면 안에 남은 공간만큼"은 카드 위치·화면 크기에
  // 따라 매번 달라져서 CSS만으로는 정확히 못 구한다. 여기서 카드의 실제
  // 화면상 위치(getBoundingClientRect)와 화면(.console-screen) 바닥까지
  // 남은 거리를 재서 그만큼만 max-height로 준다 — 카드 자체는 그 안에
  // 딱 맞고, 내용이 더 길면 카드 안(.window-body, style.css에서
  // overflow-y:auto)에서만 스크롤된다(화면 전체를 또 스크롤할 필요 없음).
  function fitWindowCards() {
    var screenRect = screen.getBoundingClientRect();
    var wins = screen.querySelectorAll('.window:not(.is-fullscreen)');
    for (var i = 0; i < wins.length; i++) {
      var w = wins[i];
      var top = w.getBoundingClientRect().top;
      var avail = screenRect.bottom - top - 16;
      if (avail > 200) w.style.maxHeight = avail + 'px';
    }
  }
  fitWindowCards();
  // 폰트/이미지가 늦게 로드되면서 위쪽 레이아웃이 살짝 밀릴 수 있어 한 번 더.
  window.addEventListener('load', fitWindowCards);
  window.addEventListener('resize', fitWindowCards);

  // 카드를 클릭해서 "전체화면"으로 펼치면(assets/js/window.js가
  // .is-fullscreen 클래스를 붙임) 그 카드는 화면 전체 크기로 커져야 하는데,
  // 방금 위에서 인라인으로 걸어둔 style.maxHeight가 남아있으면 인라인
  // 스타일이 우선순위가 더 높아서 style.css의 ".window.is-fullscreen{
  // max-height:none }"보다 세져 버려 전체화면이 작게 눌려 보이는 문제가
  // 생긴다. class 변화를 감시하다가 전체화면이 되는 순간 인라인 스타일을
  // 지우고, 다시 카드로 돌아오면 그때 다시 맞춰준다.
  var fitTargets = screen.querySelectorAll('.window:not([data-no-autofocus])');
  for (var fi = 0; fi < fitTargets.length; fi++) {
    (function (winEl) {
      new MutationObserver(function () {
        if (winEl.classList.contains('is-fullscreen')) {
          winEl.style.maxHeight = '';
        } else {
          fitWindowCards();
        }
      }).observe(winEl, { attributes: true, attributeFilter: ['class'] });
    })(fitTargets[fi]);
  }

  // ── 마퀴 제목: 실제 프로필 이름(site-config.js) ──
  var titleEl = document.getElementById('console-title');
  if (titleEl) titleEl.textContent = (cfg.profileName || 'MIKU-TENSHI').toUpperCase();

  // ── SKIN HUD 칩 + 퀵버튼 활성 표시를 실제 테마(data-theme)와 항상 맞춤 ──
  var SKIN_LABELS = { default: 'WHITE', dark: 'DARK', blue: 'BLUE', mint: 'MINT', pink: 'PINK' };
  var skinLabelEl = document.getElementById('console-skin');
  function syncWithTheme() {
    var theme = document.documentElement.getAttribute('data-theme') || 'default';
    if (skinLabelEl) skinLabelEl.textContent = SKIN_LABELS[theme] || theme.toUpperCase();
    quickButtons.forEach(function (b) {
      b.classList.toggle('is-active', b.dataset.consoleTheme === theme);
    });
  }
  syncWithTheme();
  new MutationObserver(syncWithTheme).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  });

  // ── POSTS 칩: 실제 글 개수 ──
  var postsEl = document.getElementById('console-posts');
  fetch('/posts.json')
    .then(function (r) { return r.ok ? r.json() : []; })
    .then(function (posts) {
      if (postsEl) postsEl.textContent = '×' + (Array.isArray(posts) ? posts.length : 0);
    })
    .catch(function () { /* 오프라인/로컬 file:// 등 — 조용히 무시 */ });

  // ── DATE 칩: 오늘 날짜(MM.DD) ── 사용자 요청: "UPTIME 부분은 실제 현재
  // 날짜를 적고 싶어. (ex. DATE 08.29)" — 예전엔 profileRole 시작일부터
  // 지난 날수(UPTIME)를 보여줬는데, 그 대신 오늘 날짜를 그대로 보여준다.
  // 접속한 브라우저(사용자 로컬 시각) 기준 — 자정 무렵엔 방문자 시간대에
  // 따라 하루 차이 날 수 있지만, 개인 홈페이지 장식용 표시라 문제 없음.
  var dateEl = document.getElementById('console-date');
  if (dateEl) {
    var today = new Date();
    var mm = String(today.getMonth() + 1).padStart(2, '0');
    var dd = String(today.getDate()).padStart(2, '0');
    dateEl.textContent = mm + '.' + dd;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
})();
