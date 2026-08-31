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
  // 2026-08-31 1차: 5개 테마 콘솔 색을 전부 드림웨이브 톤으로 다시 칠하면서
  // (style.css의 --console-ring 값들 참고), 여기 미리보기 링 색도 각 테마의
  // 새 --console-ring과 맞춰 갱신함 — 안 그러면 버튼 링 색이 실제로 눌렀을 때
  // 바뀌는 콘솔 색과 달라 보이는 문제가 있었음.
  // 2026-08-31 2차: "사이버펑크 4테마" 시안 이식으로 기본/블루의 --console-
  // ring이 각각 #6fe3ff/#6fc4ff로 다시 바뀌어서 여기도 같이 맞춤(핑크/다크는
  // 그대로).
  var QUICK_SKINS = [
    { pos: 't', theme: 'default', ring: '#6fe3ff', title: '기본' },
    { pos: 'r', theme: 'blue', ring: '#6fc4ff', title: '블루' },
    { pos: 'b', theme: 'pink', ring: '#ff6fd8', title: '핑크' },
    { pos: 'l', theme: 'dark', ring: '#5ec8ff', title: '다크' }
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

  // ── 메뉴 밑 "행성" 장식(.console-sidebar-orbit) ── 2026-08-31 4차: "메뉴
  // 밑의 행성 사진" 요청 — 시안의 궤도 도는 행성 장식을 실제 사이드바 메뉴
  // 목록(.nav-group) 바로 뒤에 새로 만들어 끼워 넣는다. sidebar.js가 이미
  // 그려둔 .sidebar-sea(바다, display:none) 자리를 시각적으로 대신하는
  // 역할이라 sidebar.js 쪽 코드는 건드리지 않고 여기서만 추가함 — 스타일은
  // style.css의 ".console-sidebar-orbit" 섹션 참고.
  var navGroup = app.querySelector('.sidebar .nav-group');
  if (navGroup && navGroup.parentNode) {
    var orbit = el('div', 'console-sidebar-orbit',
      '<div class="ring r1"></div><div class="ring r2"></div><div class="core"></div>');
    orbit.setAttribute('aria-hidden', 'true');
    navGroup.parentNode.insertBefore(orbit, navGroup.nextSibling);
  }

  // ── "글 쓰는 창"(.window) 높이를 화면 안에 딱 맞춤 ──
  // 사용자 요청: "글 쓰는 창은 가로 길이만 늘리고, 세로 길이는 콘솔 창
  // 안에 들어가도록 해 줘" — 처음엔(2026-08-28 1차) 여기서 JS로 카드의
  // 실제 화면상 위치(getBoundingClientRect)를 재서 인라인 style.maxHeight를
  // 매번 계산해 넣는 방식으로 풀었는데, 그 인라인 스타일이 전체화면
  // (.is-fullscreen) 상태에서도 남아 style.css의 우선순위를 이겨버려
  // 전체화면이 작게 눌려 보이는 버그가 있었다(MutationObserver로 그때그때
  // 지워주는 식으로 임시 대응했었음).
  // 2026-08-28 재작업(사용자 보고: "콘솔 안에 글 쓰기 창 제외하고 스크롤
  // 바가 생겨" 조사 중 함께 정리): .app/.main을 순수 CSS(flex + height:100%
  // + min-height:0)로 화면에 정확히 맞춰지도록 고치면서, 이 카드 높이도
  // style.css의 ".console-screen .window:not(.is-fullscreen){ flex:1;
  // min-height:0; }"만으로 화면에 딱 맞게 계산되게 바꿨다 — 인라인
  // 스타일이 아예 안 생기므로 위 전체화면 충돌 버그도 원천적으로 없어짐.
  // 그래서 이 자리에 있던 fitWindowCards()/리사이즈-로드 리스너/
  // MutationObserver는 전부 제거함(더 이상 필요 없음).

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
    syncCosmicBg(theme);
  }
  syncWithTheme();
  new MutationObserver(syncWithTheme).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  });

  // ── 우주 배경(별+성운) — 2026-08-31, "다시 사이버펑크식 4가지 테마(블랙
  // 제외) 만들어 줘 ... 배경이 잘 보이도록(우주 같은 느낌) ... 3D 액션은
  // 빼자" 요청으로 만든 시안(dreamwave-console.html)을 그대로 이식.
  // 시안은 마우스를 따라 콘솔이 3D로 기울고 별도 같이 패럴랙스되는 연출이
  // 있었는데, 이번 라운드에서 사용자가 "3D 액션은 빼자"고 명시적으로
  // 요청해서 그 부분만 빼고 옮김 — 아래엔 마우스 반응 코드가 전혀 없고,
  // 별은 제자리에서 반짝이기만, 성운은 CSS 애니메이션(cosmic-drift-1~3,
  // assets/css/style.css)으로 천천히 떠다니기만 한다.
  // 다크 테마는 이번 요청에서 "블랙 제외"로 명시적으로 빠졌으므로, 다크
  // 테마에서는 이 레이어 자체를 만들지 않는다(다크는 기존 모습 그대로).
  //
  // 2026-08-31 4차 디버깅 메모: rAF/setTimeout으로 예약된 draw() 콜백이
  // 실행되는 시점에 resize()가 채워둔 cosmicStars(그리고 같은 스코프의
  // 다른 var들)가 초기값으로 되돌아가 있는(빈 배열) 현상이 재현됨 —
  // 동기 실행 구간에서는 값이 정상인데, 예약된(비동기) 콜백에서만 초기값을
  // 보임(원인 불명, Playwright/CDP로 여러 각도에서 확인했지만 명확한
  // 재현 경로를 찾지 못함). 원인과 무관하게 항상 그림이 그려지도록,
  // "필요할 때 알아서 다시 채우는" 방어적 구조로 바꿈: 전역(모듈 스코프)
  // var 대신 하나의 상태 객체(cosmicState)에 담고, draw()가 매 프레임
  // cosmicState.stars가 비어있으면 즉시 다시 채운 뒤 그린다 — resize()도
  // 같은 객체를 채우므로 이중 작업은 아니고, 그냥 "무슨 이유로든 비어
  // 있으면 그 자리에서 즉시 복구"하는 안전장치.
  var cosmicState = null; // { canvas, nebulaEl, raf, stars, ctx, dpr }
  var reducedMotionMq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var cosmicReduced = !!(reducedMotionMq && reducedMotionMq.matches);

  function makeStars(w, h) {
    var count = Math.min(180, Math.round((w * h) / 9000));
    var stars = [];
    for (var i = 0; i < count; i++) {
      var layer = Math.random() < 0.5 ? 0 : 1;
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: layer === 0 ? Math.random() * 0.9 + 0.3 : Math.random() * 1.6 + 0.6,
        p: Math.random() * Math.PI * 2,
        s: Math.random() * 0.02 + 0.008,
        // 2026-08-31 4차: "뒤에 돌아다니는 반짝이 효과" — 원래는 반짝임(투명도
        // sin파)만 있고 위치는 고정이라 "돌아다닌다"는 느낌이 약했음. 마우스
        // 반응(3D 액션, 이번 세션 초반에 뺀 것)과는 무관하게, 각 별마다 자기
        // 자리에서 아주 천천히 작은 원을 그리며 떠다니는 위치 오프셋을
        // 추가함(드리프트 반경/속도/위상을 별마다 랜덤하게 줘서 다 같이
        // 움직이지 않고 제각각 떠다니는 것처럼 보이게).
        driftR: layer === 0 ? Math.random() * 10 + 4 : Math.random() * 18 + 8,
        driftS: Math.random() * 0.00035 + 0.00012,
        driftP: Math.random() * Math.PI * 2
      });
    }
    return stars;
  }

  function buildCosmicBg() {
    if (cosmicState) return; // 이미 만들어져 있음

    var canvas = document.createElement('canvas');
    canvas.className = 'cosmic-stars';
    canvas.setAttribute('aria-hidden', 'true');

    var nebulaEl = el('div', 'cosmic-nebula', '<i class="n1"></i><i class="n2"></i><i class="n3"></i>');
    nebulaEl.setAttribute('aria-hidden', 'true');

    // body 맨 앞(.console-viewport보다도 앞)에 끼워 넣는다 — 위치는 CSS가
    // position:fixed + z-index:-1로 고정하므로 DOM 순서 자체는 안 중요하지만,
    // 그래도 "배경 레이어"라는 의도가 드러나도록 맨 앞에 둠.
    document.body.insertBefore(nebulaEl, document.body.firstChild);
    document.body.insertBefore(canvas, document.body.firstChild);

    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);

    var state = {
      canvas: canvas,
      nebulaEl: nebulaEl,
      ctx: ctx,
      dpr: dpr,
      stars: [],
      raf: null
    };
    cosmicState = state;

    function resize() {
      state.canvas.width = window.innerWidth * state.dpr;
      state.canvas.height = window.innerHeight * state.dpr;
      state.canvas.style.width = window.innerWidth + 'px';
      state.canvas.style.height = window.innerHeight + 'px';
      state.ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
      state.stars = makeStars(window.innerWidth, window.innerHeight);
    }

    function draw(t) {
      // 위 2026-08-31 4차 디버깅 메모 참고 — 무슨 이유로든 별 목록이 비어
      // 있으면(원래는 resize()가 채워둠) 그 자리에서 즉시 다시 채운다.
      if (!state.stars.length) state.stars = makeStars(window.innerWidth, window.innerHeight);
      state.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for (var i = 0; i < state.stars.length; i++) {
        var st = state.stars[i];
        var tw = cosmicReduced ? 0.7 : (0.5 + 0.5 * Math.sin(t * st.s + st.p));
        var dx = cosmicReduced ? 0 : Math.cos(t * st.driftS + st.driftP) * st.driftR;
        var dy = cosmicReduced ? 0 : Math.sin(t * st.driftS * 0.8 + st.driftP) * st.driftR;
        state.ctx.globalAlpha = 0.2 + tw * 0.55;
        state.ctx.fillStyle = (i % 6 === 0) ? '#ff8bee' : (i % 5 === 0) ? '#8bd8ff' : '#ffffff';
        state.ctx.beginPath();
        state.ctx.arc(st.x + dx, st.y + dy, st.r, 0, Math.PI * 2);
        state.ctx.fill();
      }
      state.ctx.globalAlpha = 1;
      if (!cosmicReduced) state.raf = window.requestAnimationFrame(draw);
    }

    state.onResize = resize;
    window.addEventListener('resize', state.onResize);
    resize();
    state.raf = window.requestAnimationFrame(draw);
  }

  function removeCosmicBg() {
    if (!cosmicState) return;
    if (cosmicState.raf) window.cancelAnimationFrame(cosmicState.raf);
    if (cosmicState.onResize) window.removeEventListener('resize', cosmicState.onResize);
    if (cosmicState.canvas && cosmicState.canvas.parentNode) cosmicState.canvas.parentNode.removeChild(cosmicState.canvas);
    if (cosmicState.nebulaEl && cosmicState.nebulaEl.parentNode) cosmicState.nebulaEl.parentNode.removeChild(cosmicState.nebulaEl);
    cosmicState = null;
  }

  function syncCosmicBg(theme) {
    if (theme === 'dark') {
      removeCosmicBg();
    } else {
      buildCosmicBg();
    }
  }

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
