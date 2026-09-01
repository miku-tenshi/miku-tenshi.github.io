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
  // 2026-08-31 6차: "하단의 게임기적 요소(컨트롤러)를 다 삭제하고, 본문과
  // 메뉴창을 조금 더 넓히는 건 어때?" 요청으로 십자키/그릴/스킨버튼 4개로
  // 이뤄진 콘솔 데크(.console-deck)와 그 아래 저작권/SCORE 줄(.console-
  // deck-foot)을 통째로 없앤다. 데크가 차지하던 세로 공간은 아래
  // .console-screen-bezel이 flex:1이라 자동으로 화면(.console-screen) 몫으로
  // 흡수된다(따로 손볼 필요 없음). 대신 콘솔 데크에 있던 스킨 전환 버튼이
  // 없어진 만큼, 테마 전환은 아래 SKIN 칩을 눌러 여는 드롭다운으로 옮김 —
  // 사용자가 "상단의 SKIN 부분에서 고를 수 있도록 하자"고 직접 지정한 방식.
  // 2026-08-31 7차: "민트 없고, 다크 테마도 우주 배경 있어서 예뻤거든?
  // 그렇게 4가지 테마로 바꿔 줘. 이름은 SPACE/BLUE/PINK/DARK로." 요청으로
  // 민트를 완전히 빼고 4개 테마 체제로 전환 + 라벨을 영문(SPACE/BLUE/
  // PINK/DARK)으로 통일.
  var chipSkin = el('div', 'chip console-skin-chip');
  chipSkin.innerHTML =
    '<button type="button" class="console-skin-trigger" aria-haspopup="listbox" aria-expanded="false">' +
    '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="3"/></svg> SKIN <b id="console-skin">SPACE</b>' +
    '</button>';
  hud.appendChild(chipPosts);
  hud.appendChild(chipDate);
  hud.appendChild(chipSkin);

  var bezel = el('div', 'console-screen-bezel');
  var screen = el('div', 'console-screen');
  bezel.appendChild(screen);

  shell.appendChild(marquee);
  shell.appendChild(hud);
  shell.appendChild(bezel);

  // ── SKIN 칩 드롭다운 — 실제 테마 스위처(.theme-switcher [data-theme-btn])
  // 버튼을 그대로 찾아 클릭해줄 뿐이라 저장/동기화 로직은 하나로 유지된다.
  // 2026-08-31 7차: 민트 제외 4개 테마로, 라벨도 사용자가 지정한 순서·이름
  // 그대로(SPACE/BLUE/PINK/DARK) 영문 통일.
  // 2026-08-31 8차: "DARK 테마를 없애 줘. 그리고 Aurora 테마를 만들 거야"
  // 요청으로 DARK를 빼고 그 자리에 AURORA를 넣음(테마 키는 'aurora',
  // style.css의 :root[data-theme="aurora"] 참고).
  // 2026-08-31 (기본 테마 변경): "오로라 테마가 제일 처음 기본값이
  // 되도록" 요청으로 AURORA를 목록 맨 앞으로 옮김 — 각 항목은 key(theme)로
  // 매칭되므로(위 SKIN_LABELS도 마찬가지) 순서만 바뀌어도 동작에는 영향
  // 없음. 사이드바 실제 테마 스위처(assets/js/sidebar.js)의 스와치 순서도
  // 동일하게 맞춰둠.
  var SKIN_MENU_ITEMS = [
    { theme: 'aurora', label: 'AURORA' },
    { theme: 'default', label: 'SPACE' },
    { theme: 'blue', label: 'BLUE' },
    { theme: 'pink', label: 'PINK' }
  ];
  var skinTrigger = chipSkin.querySelector('.console-skin-trigger');
  var skinMenu = el('div', 'console-skin-menu');
  skinMenu.setAttribute('role', 'listbox');
  var skinOptionButtons = [];
  SKIN_MENU_ITEMS.forEach(function (item) {
    var opt = document.createElement('button');
    opt.type = 'button';
    opt.className = 'console-skin-option';
    opt.dataset.consoleTheme = item.theme;
    opt.setAttribute('role', 'option');
    opt.textContent = item.label;
    opt.addEventListener('click', function (e) {
      e.stopPropagation();
      var realBtn = document.querySelector('[data-theme-btn="' + item.theme + '"]');
      if (realBtn) realBtn.click();
      closeSkinMenu();
    });
    skinMenu.appendChild(opt);
    skinOptionButtons.push(opt);
  });
  // ⚠️ chipSkin이 아니라 document.body에 직접 붙인다 — chipSkin은
  // .console-hud .chip의 backdrop-filter를 물려받는데, filter/backdrop-
  // filter가 걸린 조상은 fixed 자손의 컨테이닝 블록이 되어버려서(위
  // style.css의 .console-skin-menu 주석 참고) chipSkin 밑에 두면
  // position:fixed 좌표 계산이 완전히 엉뚱해진다.
  document.body.appendChild(skinMenu);

  // position:fixed라 뷰포트 좌표로 직접 위치를 잡아줘야 한다(위 style.css
  // .console-skin-menu 주석 참고) — 트리거 버튼 바로 아래, 오른쪽 끝을
  // 맞추되 화면 밖으로 새지 않게 클램프.
  function positionSkinMenu() {
    var r = skinTrigger.getBoundingClientRect();
    var menuWidth = skinMenu.offsetWidth || 108;
    var left = r.right - menuWidth;
    if (left < 8) left = 8;
    if (left + menuWidth > window.innerWidth - 8) left = window.innerWidth - 8 - menuWidth;
    skinMenu.style.top = (r.bottom + 6) + 'px';
    skinMenu.style.left = left + 'px';
  }
  function openSkinMenu() {
    positionSkinMenu();
    chipSkin.classList.add('is-open');
    skinMenu.classList.add('is-open');
    skinTrigger.setAttribute('aria-expanded', 'true');
  }
  function closeSkinMenu() {
    chipSkin.classList.remove('is-open');
    skinMenu.classList.remove('is-open');
    skinTrigger.setAttribute('aria-expanded', 'false');
  }
  skinTrigger.addEventListener('click', function (e) {
    e.stopPropagation();
    if (skinMenu.classList.contains('is-open')) closeSkinMenu(); else openSkinMenu();
  });
  document.addEventListener('click', function (e) {
    if (!chipSkin.contains(e.target) && !skinMenu.contains(e.target)) closeSkinMenu();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeSkinMenu();
  });
  // 창 크기가 바뀌면(모바일 회전 등) 트리거 위치도 바뀌므로 열려 있던
  // 메뉴는 그냥 닫는다(다시 열면 새 위치로 다시 계산됨).
  window.addEventListener('resize', closeSkinMenu);

  // 콘솔을 화면 한가운데 띄우는 바깥 레이어(assets/css/style.css의
  // .console-viewport 참고) — body 자체는 안 건드리고 이 래퍼 하나만 새로
  // 끼워 넣는다.
  var viewport = el('div', 'console-viewport');
  viewport.id = 'console-viewport';
  viewport.appendChild(shell);

  // ── .app을 콘솔 화면 안으로 이동 ──
  app.parentNode.insertBefore(viewport, app);
  screen.appendChild(app);

  // ── 콘솔 내부 고정 해상도 + 비율 스케일 ── 2026-09-01: "컴퓨터 화면
  // 크기나 해상도가 달라져도 내부 크기를 일정한 해상도와 크기로 보여주고
  // 싶어. (비율로 계산해야 될 것 같아.)" 요청. 자세한 배경/이유는
  // assets/css/style.css의 ".console-shell" 규칙 안 "2026-09-01 (내부
  // 고정 해상도)" 주석 참고 — 요약하면: .console-shell은 이제 항상 고정된
  // "디자인 해상도"(1180×740px, 예전 최대 크기와 동일)로 그려지고, 여기서
  // 계산한 --console-scale 값만큼 CSS transform:scale()로 통째로
  // 축소/확대된다. 폭/높이 중 더 작게 나오는 쪽에 맞춰(Math.min) 하나의
  // 배율로 통일한다 — 그래야 가로세로 비율이 항상 디자인 그대로 유지된다
  // (예전 방식은 폭/높이를 각각 독립적으로 클램프해서 화면 모양에 따라
  // 콘솔 비율 자체가 미세하게 달라질 수 있었음).
  //
  // 2026-09-01 재조정: 처음엔 예전에 width/height 각각에 쓰던 비율
  // (75vw/78vh)을 그대로 재사용했는데, 배포 직후 "이렇게 큰 화면에서는
  // 내부 창이 너무 작게 보인다"는 신고를 받고 원인을 확인함 — 예전
  // 방식은 폭/높이가 각각 독립적으로 클램프돼서, 세로가 좁은(브라우저
  // 주소창/탭 높이 등으로 실제 뷰포트 높이가 생각보다 짧은) 화면에서도
  // 가로 폭은 자기 몫(75vw)까지 별도로 넉넉하게 커질 수 있었다. 그런데
  // 지금처럼 Math.min으로 "하나의" 배율만 쓰면, 세로가 조금만 좁아도
  // (78vh 기준) 그 배율이 가로에도 그대로 곱해져서 원래는 문제 없었을
  // 가로 폭까지 덩달아 줄어든다 — 특히 화면(모니터)은 물리적으로 커도
  // 브라우저 창 UI(탭/주소창)나 OS 디스플레이 배율(150%, 200%...) 때문에
  // 실제 뷰포트 세로 길이(window.innerHeight, CSS px 기준)는 생각보다
  // 짧은 경우가 흔해서, 큰 화면에서 오히려 더 작게 보이는 역설적인
  // 결과가 났었음.
  // 세로(높이) 쪽 비율을 78%→94%로 크게 올려서 세로가 콘솔 크기를 발목
  // 잡는 상황 자체를 훨씬 드물게 만듦(넘치는 부분은 style.css의
  // .console-viewport에 있는 overflow:hidden 안전장치가 여전히 잘라주므로
  // 위험하지 않음) — 결과적으로 대부분의 실제 화면에서는 가로(75vw) 쪽이
  // 계속 기준이 되어, 예전(폭/높이 독립 클램프 시절)과 비슷하게 가로 폭이
  // 인색하게 줄지 않는다. 가로 쪽 75%는 그대로 유지 — "콘솔 주변에 우주
  // 배경이 사방에 넉넉히 보이도록"이라는, 여러 라운드에 걸쳐 사용자가
  // 직접 확정한 여백 의도는 좌우 여백(가로)에서 나오는 인상이 커서 그대로
  // 존중함.
  // 900px 이하(모바일)에서는 style.css의 @media(max-width:900px)가 이
  // transform을 transform:none으로 다시 꺼두므로, 여기서 계산해 세팅하는
  // 값은 그 구간에서는 그냥 무시된다(모바일 전용 "화면 꽉 채우기" 레이아웃
  // 그대로 유지).
  var CONSOLE_DESIGN_W = 1180;
  var CONSOLE_DESIGN_H = 740;
  function applyConsoleScale() {
    var vw = window.innerWidth, vh = window.innerHeight;
    var scale = Math.min(
      (vw * 0.75) / CONSOLE_DESIGN_W,
      (vh * 0.94) / CONSOLE_DESIGN_H,
      1
    );
    document.documentElement.style.setProperty('--console-scale', scale);
  }
  applyConsoleScale();
  window.addEventListener('resize', applyConsoleScale);

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

  // ── SKIN HUD 칩 + 드롭다운 활성 표시를 실제 테마(data-theme)와 항상 맞춤 ──
  // 2026-08-31 7차: 민트 삭제 + 라벨 영문 통일(SPACE/BLUE/PINK/DARK).
  var SKIN_LABELS = { default: 'SPACE', aurora: 'AURORA', blue: 'BLUE', pink: 'PINK' };
  var skinLabelEl = document.getElementById('console-skin');
  function syncWithTheme() {
    var theme = document.documentElement.getAttribute('data-theme') || 'default';
    if (skinLabelEl) skinLabelEl.textContent = SKIN_LABELS[theme] || theme.toUpperCase();
    skinOptionButtons.forEach(function (b) {
      b.classList.toggle('is-active', b.dataset.consoleTheme === theme);
    });
    // 2026-08-31 7차: 다크 포함 4개 테마 전부 우주 배경을 쓰므로 테마 값과
    // 무관하게 항상 만든다(buildCosmicBg 안의 "이미 있으면 스킵" 가드가
    // 테마가 안 바뀌었을 때의 중복 생성을 막아줌).
    buildCosmicBg();
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
  // 2026-08-31 7차: 처음엔(위 문단) 다크 테마를 "블랙 제외"로 명시적으로
  // 빼서 이 레이어 자체를 안 만들었는데, 다크 테마의 별 제거가 이 세션의
  // MutationObserver 클로저 버그로 실패하는 걸 우연히 보고 "다크 테마도
  // 우주 배경 있어서 예뻤거든? 그렇게 4가지 테마로 바꿔 줘" 라는 요청을
  // 받아 그 조합(다크 + 우주 배경)을 정식으로 채택 — 이제 테마 구분 없이
  // 항상 배경을 만든다(removeCosmicBg()는 더 이상 쓰이지 않아 제거함).
  // 2026-08-31 8차: "DARK 테마를 없애 줘. 그리고 Aurora 테마를 만들 거야 —
  // 하얀색이고 반짝이들도 보라색/파란색 느낌, 하얀 부분이 많도록" 요청으로
  // 다크 대신 밝은 배경의 아우로라 테마를 추가함. 메커니즘(캔버스 별 +
  // CSS 성운)은 완전히 동일하게 재사용하되, 별 색상만 아래 STAR_PALETTES로
  // 테마별로 다르게 그림(흰 배경에서 흰 별은 안 보이므로) — 성운 쪽은
  // style.css의 :root[data-theme="aurora"] .cosmic-nebula 오버라이드
  // (mix-blend-mode: multiply) 참고.
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

  // 2026-08-31 8차: 별 색상을 테마별로 다르게 — 기존 3개 테마(SPACE/BLUE/
  // PINK)는 전부 짙은 배경이라 흰색 위주 별이 잘 보이지만, 새로 만든
  // AURORA는 반대로 거의 흰 배경이라 흰 별이 통째로 안 보인다. 그래서
  // AURORA일 때만 보라/파란 계열로 바꾸고, 그 외 테마는 기존 로직을 한 글자도
  // 안 바꾸고 그대로 재사용(회귀 방지).
  var AURORA_STAR_COLORS = ['#a78bfa', '#7dd3fc', '#c4b5fd'];
  function starFillColor(i, theme) {
    if (theme === 'aurora') return AURORA_STAR_COLORS[i % AURORA_STAR_COLORS.length];
    return (i % 6 === 0) ? '#ff8bee' : (i % 5 === 0) ? '#8bd8ff' : '#ffffff';
  }

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
    // 2026-08-31 6차 디버깅에서 발견: "이미 만들어져 있음"을 cosmicState
    // (클로저 변수) 만으로 판단하면 안 됨 — 위 4차 메모의 그 "이유를 알 수
    // 없는 클로저 변수 리셋" 버그가 MutationObserver 콜백(테마 전환 시
    // syncWithTheme을 다시 부르는 콜백)에서도 재현됨을 확인했었음(원인은
    // 여전히 불명). 이제(7차) 테마마다 매번 buildCosmicBg()가 호출되므로
    // (아래 syncWithTheme 참고), 이 "이미 있으면 다시 안 만든다" 가드가
    // 중복 캔버스 생성을 막는 유일한 안전장치 — cosmicState 대신 실제
    // DOM(진짜 상태)을 기준으로 판단한다.
    if (document.querySelector('canvas.cosmic-stars')) return;

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
      raf: null,
      // 2026-08-31 (커서 버벅임 대응): 아래 draw()의 프레임 제한(~30fps)에
      // 쓰는 "마지막으로 실제 그린 시각" 기록. -1은 "아직 한 번도 안
      // 그렸다"는 뜻으로, 첫 프레임은 반드시 그리게 함.
      lastDrawT: -1
    };
    cosmicState = state;

    function resize() {
      // draw()와 같은 이유(위 주석 참고) — 캔버스가 이미 DOM에서 빠졌으면
      // 아무것도 안 함(리사이즈 리스너 자체를 못 지운 경우의 안전장치).
      if (!document.body.contains(state.canvas)) return;
      state.canvas.width = window.innerWidth * state.dpr;
      state.canvas.height = window.innerHeight * state.dpr;
      state.canvas.style.width = window.innerWidth + 'px';
      state.canvas.style.height = window.innerHeight + 'px';
      state.ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
      state.stars = makeStars(window.innerWidth, window.innerHeight);
    }

    function draw(t) {
      // 2026-08-31 6차: removeCosmicBg()가 클로저 변수(cosmicState)를 못
      // 믿고 DOM을 직접 지우도록 고쳤지만(위 buildCosmicBg 주석 참고), 그
      // 경우에도 이 draw()/resize() 루프 자체(그 함수들이 캡처한 지역
      // `state`)는 여전히 살아서 requestAnimationFrame으로 계속 예약된다 —
      // 캔버스가 DOM에서 사라진 뒤에도 매 프레임 헛돌며 리소스만 쓰는 걸
      // 막기 위해, 자기 캔버스가 더 이상 문서에 붙어있지 않으면 그 자리에서
      // 루프를 스스로 멈춘다(다음 requestAnimationFrame을 예약하지 않음).
      if (!document.body.contains(state.canvas)) return;
      // 2026-08-31 (커서 버벅임 대응): "노트북에서 손가락(트랙패드)으로
      // 움직이면 커서가 느리고 버벅인다" 리포트를 조사해보니, 이 별
      // 캔버스가 매 프레임(60fps)마다 최대 180개 별을 다시 그리고 있었고
      // (특히 AURORA 테마는 별마다 shadowBlur까지 추가로 써서 더 비쌈),
      // Playwright로 CPU를 인위적으로 6배 느리게 흉내내 보니 실제로
      // 프레임 하나에 90ms 가까이 걸려(초당 11프레임 수준) 이 커서
      // 점(.custom-cursor, assets/js/window.js)이 mousemove를 받고도 화면에
      // 반영될 기회 자체가 크게 줄어드는 것으로 확인됨 — 즉 "손가락으로
      // 움직이면" 자체가 원인이 아니라, 노트북처럼 상대적으로 약한
      // 그래픽 성능에서 이 배경 애니메이션이 메인 스레드/렌더링 시간을
      // 많이 잡아먹어 커서 갱신이 밀리는 것. 아래 두 가지로 이 캔버스의
      // 비용을 줄임(별이 원래도 아주 천천히 반짝이고 떠다니는 용도라
      // 시각적으로 체감되는 차이는 없음):
      // 1) 30fps로 그리기 빈도를 절반으로 제한(브라우저 프레임마다
      //    requestAnimationFrame 자체는 계속 예약하되, 마지막으로 그린
      //    지 33ms가 안 됐으면 이번 프레임은 그냥 건너뜀).
      if (state.lastDrawT >= 0 && t - state.lastDrawT < 33) {
        if (!cosmicReduced) state.raf = window.requestAnimationFrame(draw);
        return;
      }
      state.lastDrawT = t;
      // 위 2026-08-31 4차 디버깅 메모 참고 — 무슨 이유로든 별 목록이 비어
      // 있으면(원래는 resize()가 채워둠) 그 자리에서 즉시 다시 채운다.
      if (!state.stars.length) state.stars = makeStars(window.innerWidth, window.innerHeight);
      state.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      // 2026-08-31 8차: 프레임당 한 번만 현재 테마를 읽어(별마다 매번
      // 읽지 않음 — 불필요한 DOM 조회 반복 방지) 색상/발광 여부를 정한다.
      var theme = document.documentElement.getAttribute('data-theme') || 'default';
      var glow = theme === 'aurora'; // 흰 배경 위에서 또렷이 반짝이도록 옅은 발광 추가
      for (var i = 0; i < state.stars.length; i++) {
        var st = state.stars[i];
        var tw = cosmicReduced ? 0.7 : (0.5 + 0.5 * Math.sin(t * st.s + st.p));
        var dx = cosmicReduced ? 0 : Math.cos(t * st.driftS + st.driftP) * st.driftR;
        var dy = cosmicReduced ? 0 : Math.sin(t * st.driftS * 0.8 + st.driftP) * st.driftR;
        var color = starFillColor(i, theme);
        state.ctx.globalAlpha = 0.2 + tw * 0.55;
        state.ctx.fillStyle = color;
        // 2) glow(AURORA) 효과를 캔버스 shadowBlur(별 하나하나마다 흐림
        //    효과를 다시 계산해야 해서 매우 비쌈) 대신, 반지름을 살짝
        //    키우고 최소 투명도를 높이는 값싼 방식으로 대체 — 흰 배경
        //    위에서 또렷해 보이는 목적은 그대로 유지하면서 렌더 비용만
        //    없앰.
        var radius = glow ? st.r * 1.35 : st.r;
        if (glow) state.ctx.globalAlpha = Math.min(1, state.ctx.globalAlpha + 0.12);
        state.ctx.beginPath();
        state.ctx.arc(st.x + dx, st.y + dy, radius, 0, Math.PI * 2);
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

  // 2026-08-31 7차: 이전엔 다크 테마에서 우주 배경을 지우는 removeCosmicBg()
  // 가 있었는데(그 시절 "다크 테마로 바꿔도 별이 안 사라짐" 버그는 이
  // 함수가 MutationObserver 콜백 안에서 cosmicState를 잘못 null로 읽어
  // 아무것도 안 지우는 게 원인이었음), 이제 4개 테마 전부 우주 배경을
  // 쓰기로 하면서 "지우는" 경로 자체가 필요 없어져 함수를 통째로 삭제함.

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
})();


/* ── URL창(브라우저 탭) 아이콘 — 움직이는 "행성" 파비콘 ── 2026-09-01
   "url 창의 아이콘을 교체하고 싶어. 지금은 그냥 간단하게 움직이는 행성으로
   교체해 줘" 요청. 기존엔 19개 페이지 전부에 <link rel="icon">이 아예 없었음
   (grep으로 확인) — 새로 추가한다. 실제 이미지 파일을 두는 대신, 사이드바
   밑 궤도 장식(.console-sidebar-orbit — 이 파일 위쪽 "메뉴 밑 행성 장식"
   섹션 참고: 중심에서 빛나는 core + 기울어진 타원 ring 2개가 서로 반대
   방향으로 도는 구도)과 같은 시각 언어를 작은 canvas에 그려 매번 새
   data URL로 파비콘을 갱신 — 그래서 탭 아이콘이 실제로 살짝씩 돈다.
   이 스크립트는 모든 페이지(private/write가 글쓰기 시 새로 만드는 페이지도
   PAGE_SKELETON에 같은 <script src="/assets/js/console-frame.js">가 들어있어
   포함)에서 로드되므로, 여기 한 곳에만 추가하면 사이트 전체에 자동 적용된다
   (HTML 파일들은 손댈 필요 없음). */
(function () {
  'use strict';

  var SIZE = 32; // 파비콘 표준 크기 중 하나. 32px 정사각형.
  var canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  var ctx = canvas.getContext('2d');
  if (!ctx) return;

  var link = document.querySelector('link[rel="icon"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.type = 'image/png';

  // 커서 반짝이(assets/js/window.js)와 동일한 패턴 — 지금 활성화된 색상
  // 테마(--accent-start/--accent-end)를 그때그때 읽어서 쓴다. 테마를
  // 바꾸면 다음 갱신 프레임(아래 130ms 간격)에 파비콘 색도 곧바로 따라감.
  function accentColors() {
    var cs = getComputedStyle(document.documentElement);
    var start = cs.getPropertyValue('--accent-start').trim() || '#39c5bb';
    var end = cs.getPropertyValue('--accent-end').trim() || '#55a9e8';
    return [start, end];
  }

  function ring(rx, ry, rotate, lineWidth, alpha, color) {
    ctx.save();
    ctx.translate(SIZE / 2, SIZE / 2);
    ctx.rotate(rotate);
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  var angle = 0;
  function drawFavicon() {
    var colors = accentColors();
    var cx = SIZE / 2, cy = SIZE / 2;
    ctx.clearRect(0, 0, SIZE, SIZE);

    // 타원 궤도 2개 — .console-sidebar-orbit .r1/.r2와 같이 서로 반대
    // 방향, 다른 속도로 돈다(r2가 더 크고 느리게, 반대 방향).
    ring(13, 5, angle, 1.4, 0.85, colors[1]);
    ring(10, 3.6, angle * -1.4 + 0.6, 1.1, 0.55, colors[1]);

    // 중심 코어 — 흰 하이라이트에서 accent-start로 퍼지는 방사형 그라디언트
    // (.console-sidebar-orbit .core와 같은 효과를 캔버스로 재현).
    ctx.globalAlpha = 1;
    var grad = ctx.createRadialGradient(cx - 2, cy - 2.5, 0.5, cx, cy, 7);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.55, colors[0]);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, 7, 0, Math.PI * 2);
    ctx.fill();

    link.href = canvas.toDataURL('image/png');
    angle += 0.12;
  }

  drawFavicon();
  // 2026-09-01: 커서 반짝임/사이드바 궤도 링(둘 다 assets/js/window.js·
  // style.css에서 이번에 prefers-reduced-motion과 무관하게 항상 켜지도록
  // 바꿈)과 같은 기준 적용 — 브라우저 탭 아이콘 안에서 살짝 도는 정도는
  // 화면 전체를 흔드는 큰 모션이 아니라 작은 장식으로 판단해 이 파비콘
  // 애니메이션도 동작 줄이기 설정과 무관하게 항상 돈다. 60fps로 매 프레임
  // 다시 그리는 건 탭 아이콘 갱신치고 과해서(체감 차이도 없음) 약 130ms
  // (~7.7fps) 간격으로만 갱신해 불필요한 CPU 사용을 줄인다.
  window.setInterval(drawFavicon, 130);
})();
