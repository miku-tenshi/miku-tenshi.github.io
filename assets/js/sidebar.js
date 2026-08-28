// miku-tenshi.github.io — 사이드바 렌더러
//
// <aside class="sidebar" id="sidebar-mount"></aside> 하나만 페이지에 있으면
// window.SITE_CONFIG(/assets/js/site-config.js)를 읽어서 프로필/메뉴를 그 자리에
// 채워 넣습니다. 모든 페이지가 똑같은 사이드바 HTML을 반복해서 담고 있을
// 필요가 없어지고, 이름/메뉴를 한 번만 바꾸면 사이트 전체에 반영됩니다.
//
// FOUC(깜빡임) 방지: 이 스크립트는 <aside id="sidebar-mount"> 바로 다음에
// <script> 태그로 동기적으로 실행되도록 배치합니다 — 브라우저가 이 페이지의
// 나머지 부분을 그리기 전에 사이드바부터 채워 넣기 때문에 빈 사이드바가
// 잠깐 보이는 현상이 없습니다.

(function () {
  'use strict';

  var cfg = window.SITE_CONFIG;
  var mount = document.currentScript && document.currentScript.previousElementSibling;

  // previousElementSibling이 아닐 수도 있으니(예: 스크립트 순서가 바뀐 경우) 안전하게 재조회
  if (!mount || mount.id !== 'sidebar-mount') {
    mount = document.getElementById('sidebar-mount');
  }
  if (!cfg || !mount) return;

  function escapeHtml(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  var path = location.pathname;

  function isActive(href) {
    if (href === '/') return path === '/' || path === '/index.html';
    return path.indexOf(href) === 0;
  }

  var navHtml = cfg.nav.map(function (item) {
    var activeClass = isActive(item.href) ? ' active' : '';
    return (
      '<a class="nav-item' + activeClass + '" href="' + item.href + '">' +
      '<span class="nav-icon" data-icon="' + item.key + '" aria-hidden="true"></span>' +
      '<span class="nav-label">' + escapeHtml(item.label) + '</span>' +
      '</a>'
    );
  }).join('');

  // 프로필 사진 여러 장 지원 — cfg.avatarSrcs(배열)가 있으면 그걸 쓰고, 예전
  // 방식으로 cfg.avatarSrc(문자열) 하나만 있는 경우도 그대로 동작하게 함(하위
  // 호환). 사진이 1장이면 점(.avatar-dots)은 만들지 않음.
  var avatarSrcs = (cfg.avatarSrcs && cfg.avatarSrcs.length)
    ? cfg.avatarSrcs
    : [cfg.avatarSrc || '/assets/img/avatar.jpg'];

  var avatarSlidesHtml = avatarSrcs.map(function (src, i) {
    var alt = escapeHtml(cfg.avatarAlt) + (avatarSrcs.length > 1 ? ' (' + (i + 1) + '/' + avatarSrcs.length + ')' : '');
    return '<div class="avatar-slide"><img src="' + src + '" alt="' + alt + '" draggable="false"></div>';
  }).join('');

  var avatarDotsHtml = avatarSrcs.length > 1
    ? ('<div class="avatar-dots" data-role="avatar-dots">' +
        avatarSrcs.map(function (_, i) {
          return '<button type="button" class="avatar-dot' + (i === 0 ? ' active' : '') + '" data-dot="' + i + '" aria-label="' + (i + 1) + '번째 사진"></button>';
        }).join('') +
      '</div>')
    : '';

  mount.innerHTML =
    '<div class="theme-switcher" data-role="theme-switcher">' +
      '<button type="button" class="theme-swatch" data-theme-btn="default" title="기본(화이트·블랙·블루)" aria-label="기본 테마"></button>' +
      '<button type="button" class="theme-swatch" data-theme-btn="dark" title="기본 다크" aria-label="다크 테마"></button>' +
      '<button type="button" class="theme-swatch" data-theme-btn="blue" title="블루" aria-label="블루 테마"></button>' +
      '<button type="button" class="theme-swatch" data-theme-btn="mint" title="민트" aria-label="민트 테마"></button>' +
      '<button type="button" class="theme-swatch" data-theme-btn="pink" title="핑크" aria-label="핑크 테마"></button>' +
    '</div>' +
    '<div class="profile">' +
      '<div class="avatar" data-role="avatar">' +
        '<a class="avatar-track" href="/" title="홈으로 돌아가기" data-role="avatar-track">' + avatarSlidesHtml + '</a>' +
      '</div>' +
      avatarDotsHtml +
      '<div class="profile-text">' +
        '<div class="profile-name">' + escapeHtml(cfg.profileName) + '</div>' +
        '<div class="profile-role">' + escapeHtml(cfg.profileRole) + '</div>' +
      '</div>' +
    '</div>' +
    '<nav class="nav-group">' + navHtml + '</nav>' +
    '<div class="sidebar-sea">' +
      '<div class="sea-sky">' +
        '<div class="sea-stars"></div>' +
        '<div class="sea-sun"></div>' +
        '<div class="sea-cloud c1"></div>' +
        '<div class="sea-cloud c2"></div>' +
        '<div class="sea-cloud c3"></div>' +
        '<div class="sea-island i1"></div>' +
        '<div class="sea-island i2"></div>' +
      '</div>' +
      '<div class="sea-water">' +
        '<div class="sea-reflection"></div>' +
        '<div class="sea-waves w1"></div>' +
        '<div class="sea-waves w2"></div>' +
      '</div>' +
      '<div class="sea-sand"></div>' +
      '<div class="sea-hud">' +
        '<div class="sea-clock" data-role="sea-clock">--:--</div>' +
        '<div class="sea-date" data-role="sea-date">----.--.--</div>' +
      '</div>' +
      '<div class="sidebar-footer">' + escapeHtml(cfg.copyright) + '</div>' +
    '</div>';

  // ── 프로필 사진 캐러셀 — 사진이 2장 이상일 때만 의미가 있음 ──
  // 스크롤(스와이프)로 사진을 넘기면 지금 몇 번째 사진인지 아래 점으로 보여주고,
  // 점을 직접 눌러도 그 사진으로 이동함. 정확한 픽셀 단위 추적이 필요한 기능이
  // 아니라서 스크롤이 멈출 때마다 대략적인 위치(스크롤 위치 ÷ 칸 너비)로 가장
  // 가까운 사진을 계산하는 정도로 충분히 자연스럽게 동작함.
  (function initAvatarCarousel() {
    var track = mount.querySelector('[data-role="avatar-track"]');
    var dotsWrap = mount.querySelector('[data-role="avatar-dots"]');
    if (!track || !dotsWrap) return;
    var dots = dotsWrap.querySelectorAll('.avatar-dot');
    if (!dots.length) return;

    function setActiveDot(idx) {
      for (var i = 0; i < dots.length; i++) {
        dots[i].classList.toggle('active', i === idx);
      }
    }

    // 사진을 넘긴 뒤 다른 폴더로 이동해도 그 사진이 계속 유지되도록(사용자 요청:
    // "프로필 사진을 변경 후, 다른 폴더에 들어가게 되면 자꾸 바뀜 — 다시 바꾸지
    // 않는 이상 고정하는 형식으로") localStorage에 마지막으로 본 사진 인덱스를
    // 저장해둔다 — 테마 저장(THEME_KEY)과 같은 방식. 사이드바는 페이지마다 이
    // 스크립트가 새로 그리므로, 아래에서 그 저장된 인덱스로 초기 스크롤 위치를
    // 맞춰서 "새로고침/이동할 때마다 첫 사진으로 돌아가는" 문제를 없앤다.
    var AVATAR_KEY = 'mt-avatar-idx';
    function setActiveIdx(idx) {
      setActiveDot(idx);
      try { localStorage.setItem(AVATAR_KEY, String(idx)); } catch (e) { /* 개인정보 보호 모드 등 — 무시 */ }
    }

    var storedIdx = 0;
    try {
      var raw = localStorage.getItem(AVATAR_KEY);
      var parsed = raw !== null ? parseInt(raw, 10) : 0;
      if (parsed >= 0 && parsed < dots.length) storedIdx = parsed;
    } catch (e) { /* 무시 */ }
    if (storedIdx > 0) {
      // 스무스 스크롤 없이 즉시 이동 — 다른 사진이 잠깐 보였다가 바뀌는 깜빡임을
      // 없애기 위해(이 스크립트는 <main>보다 먼저 동기 실행되므로 첫 페인트 전에
      // 이미 자리를 잡음).
      track.scrollLeft = storedIdx * (track.clientWidth || 0);
    }
    setActiveDot(storedIdx);

    var scrollTimer = null;
    track.addEventListener('scroll', function () {
      if (scrollTimer) clearTimeout(scrollTimer);
      scrollTimer = setTimeout(function () {
        // 사이드바 자동 숨김(auto-hide) 기능이 방금 이 트랙을 display:none으로
        // 감춘 경우, 트랙의 scrollLeft/clientWidth가 0으로 리셋되면서(브라우저가
        // 숨겨진 스크롤 컨테이너의 스크롤 위치를 버림) 이 debounce 타이머가 그
        // "0"을 진짜 스크롤 위치로 착각해서 저장해둔 사진 선택을 엉뚱하게 1번
        // 사진으로 덮어써버리는 문제가 있었음. 트랙이 지금 안 보이는 상태(폭 0)면
        // 실제 사용자 스크롤이 아니므로 무시.
        if (!track.clientWidth) return;
        var w = track.clientWidth || 1;
        setActiveIdx(Math.round(track.scrollLeft / w));
      }, 80);
    });

    for (var di = 0; di < dots.length; di++) {
      dots[di].addEventListener('click', function (e) {
        e.preventDefault();
        var idx = Number(this.getAttribute('data-dot')) || 0;
        track.scrollTo({ left: idx * track.clientWidth, behavior: 'smooth' });
        setActiveIdx(idx);
      });
    }

    // 마우스로 눌러서 좌우로 끌면(드래그) 사진이 넘어가도록. 터치스크린이나
    // 트랙패드의 좌우 스와이프는 브라우저가 overflow-x:auto만으로도 알아서
    // 스크롤해주지만, 마우스 클릭 후 드래그는 브라우저가 기본으로 스크롤을
    // 시켜주지 않아서(스크롤바도 숨겨둠) 데스크톱에서는 "스크롤이 안 된다"고
    // 느껴졌던 부분 — 여기서 직접 pointer 이벤트로 굴려줌(마우스에서만
    // 동작하도록 제한해서 터치의 원래 자연스러운 스크롤은 그대로 둠).
    track.addEventListener('dragstart', function (e) { e.preventDefault(); });

    var dragging = false;
    var movedFar = false;
    var startX = 0;
    var startScroll = 0;

    track.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      dragging = true;
      movedFar = false;
      startX = e.clientX;
      startScroll = track.scrollLeft;
      track.classList.add('dragging');
      if (track.setPointerCapture) {
        try { track.setPointerCapture(e.pointerId); } catch (err) { /* noop */ }
      }
    });

    track.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 4) movedFar = true;
      track.scrollLeft = startScroll - dx;
    });

    function endDrag() {
      if (!dragging) return;
      dragging = false;
      track.classList.remove('dragging');
      var w = track.clientWidth || 1;
      var idx = Math.max(0, Math.min(dots.length - 1, Math.round(track.scrollLeft / w)));
      track.scrollTo({ left: idx * w, behavior: 'smooth' });
      setActiveIdx(idx);
    }
    track.addEventListener('pointerup', endDrag);
    track.addEventListener('pointercancel', endDrag);
    track.addEventListener('pointerleave', endDrag);

    // 드래그로 사진을 넘긴 뒤 손을 뗐을 때는(움직인 거리가 일정 이상이면)
    // <a href="/">인 avatar-track이 홈으로 이동해버리지 않도록 막음 — 제자리
    // 클릭(드래그 없이)일 때만 원래대로 홈 링크가 동작함.
    track.addEventListener('click', function (e) {
      if (movedFar) e.preventDefault();
    });
  })();

  // ── 사이드바 바다의 시간대(밤/새벽/낮/해질녘) + 픽셀 시계·날짜 ──
  // 사용자 요청: "밤/새벽/낮/해질녘을 설정해서 시간에 맞게 바다 색과 하늘 색이
  // 변하는 느낌으로... 아래에는 픽셀로 11:28 / 2026.xx.xx 이런 식으로 날짜랑
  // 시간을 추가." 실제 색상 값은 style.css의 .sidebar-sea[data-time="..."]가
  // 담당하고, 여기서는 (1) 지금이 몇 시인지 보고 4구간 중 하나로 판정해서
  // data-time 속성만 붙이고, (2) 시계/날짜 텍스트를 채워 넣는다.
  // 경계 시각(임의로 정한 값, 필요하면 아래 숫자만 조정하면 됨):
  //   새벽(dawn) 05:00–07:59 / 낮(day) 08:00–16:59 /
  //   해질녘(dusk) 17:00–19:59 / 밤(night) 20:00–04:59
  var seaEl = mount.querySelector('.sidebar-sea');
  var clockEl = mount.querySelector('[data-role="sea-clock"]');
  var dateEl = mount.querySelector('[data-role="sea-date"]');

  function timeSegmentFor(hour) {
    if (hour >= 5 && hour < 8) return 'dawn';
    if (hour >= 8 && hour < 17) return 'day';
    if (hour >= 17 && hour < 20) return 'dusk';
    return 'night';
  }

  function pad2(n) { return n < 10 ? '0' + n : String(n); }

  function updateSeaClock() {
    if (!seaEl) return;
    var now = new Date();
    seaEl.setAttribute('data-time', timeSegmentFor(now.getHours()));
    if (clockEl) {
      clockEl.textContent = pad2(now.getHours()) + ':' + pad2(now.getMinutes());
    }
    if (dateEl) {
      dateEl.textContent =
        now.getFullYear() + '.' + pad2(now.getMonth() + 1) + '.' + pad2(now.getDate());
    }
  }

  updateSeaClock();
  // 1분마다 다시 확인 — 분이 바뀌거나(시계), 시간대 경계(05/08/17/20시)를
  // 넘어가면(하늘/바다 색) 페이지를 새로고침하지 않아도 자동으로 갱신됨.
  setInterval(updateSeaClock, 60 * 1000);

  // ── 색상 테마 스위처(사이드바 맨 위 점 5개) ──
  // 실제 "지금 페이지가 어떤 테마로 보일지"는 각 페이지 <head> 맨 위의 인라인
  // 스크립트가 이미 처음 방문 시(무작위) 또는 저장된 값으로 <html data-theme="...">를
  // 붙여둔 상태 — 여기서는 (1) 그 값에 맞춰 점 중 하나를 "활성"으로 표시하고,
  // (2) 점을 클릭하면 테마를 바꾸고 localStorage에 저장하는 역할만 담당함(같은
  // THEME_KEY를 써야 함 — 인라인 스크립트/style.css 주석과 반드시 일치시킬 것).
  var THEME_KEY = 'mt-theme';

  // 모바일 브라우저의 주소창 색을 지금 테마에 맞춤(사용자 요청: "url창이
  // 회색이라 통일감이 없어. url창의 색도 웹사이트 색으로"). <meta name=
  // "theme-color">를 지원하는 브라우저(대부분의 모바일 크롬/사파리 등)는 이
  // 값을 주소창·상단 상태바 배경으로 씀. 여기 색은 모바일에서 사이드바가
  // 보이는 상단 바의 배경(--sidebar-bg)과 맞춰서, 페이지 맨 위와 주소창이
  // 하나로 이어지는 느낌이 나게 함 — 각 값은 style.css의 테마별
  // --sidebar-bg와 반드시 맞춰서 관리할 것(새 테마를 추가하면 여기도 추가).
  var THEME_COLORS = {
    default: '#f5f6f8',
    dark: '#191c24',
    blue: '#e1f0fb',
    mint: '#e8f5f4',
    pink: '#fbe9f1'
  };

  function updateThemeColorMeta(theme) {
    var m = document.querySelector('meta[name="theme-color"]');
    if (!m) {
      m = document.createElement('meta');
      m.setAttribute('name', 'theme-color');
      document.head.appendChild(m);
    }
    m.setAttribute('content', THEME_COLORS[theme] || THEME_COLORS.default);
  }

  function highlightThemeBtn(theme) {
    var btns = mount.querySelectorAll('[data-theme-btn]');
    for (var i = 0; i < btns.length; i++) {
      var isActive = btns[i].getAttribute('data-theme-btn') === theme;
      btns[i].classList.toggle('active', isActive);
    }
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) { /* 개인정보 보호 모드 등 — 무시 */ }
    highlightThemeBtn(theme);
    updateThemeColorMeta(theme);
  }

  var initialTheme = document.documentElement.getAttribute('data-theme') || 'default';
  highlightThemeBtn(initialTheme);
  updateThemeColorMeta(initialTheme);

  var themeBtns = mount.querySelectorAll('[data-theme-btn]');
  for (var ti = 0; ti < themeBtns.length; ti++) {
    themeBtns[ti].addEventListener('click', function () {
      applyTheme(this.getAttribute('data-theme-btn'));
    });
  }

  // ── 모바일에서 테마 스위처를 "웹사이트 맨 아래"로 이동 ──
  // 사용자 요청: "모바일의 경우, 테마를 변경하는 창이 화면 밑에 떠서 불편해.
  // 아예 웹사이트 맨 밑에 배치해 줘." 예전에는 CSS position:fixed로 화면
  // 하단에 항상 떠 있게 했는데, 그게 스크롤 중에도 계속 겹쳐 보여서 불편하다는
  // 피드백. 테마 스위처는 원래 .sidebar 안, 프로필 사진 위쪽에 있는 DOM
  // 요소라서(데스크탑 레이아웃에 맞음) CSS만으로는 "페이지 진짜 맨 아래"로
  // 옮길 수 없음(다른 flex 컨테이너에 속해 있어서 order 같은 걸로는 안 됨) —
  // 그래서 모바일 폭(.sidebar가 상단 아이콘 바로 바뀌는 지점, style.css의
  // @media (max-width: 900px)와 반드시 같은 값)일 때만 실제 DOM 노드를
  // .app의 마지막 자식으로 옮기고(→ .main 본문 다음, 문서 진짜 맨 아래),
  // 데스크탑 폭으로 돌아오면 원래 있던 자리(사이드바 맨 위)로 되돌려 놓는다.
  (function initMobileThemeSwitcherPlacement() {
    var switcherEl = mount.querySelector('[data-role="theme-switcher"]');
    var appEl = document.querySelector('.app');
    if (!switcherEl || !appEl) return;
    var mq = window.matchMedia('(max-width: 900px)');

    function reposition() {
      if (mq.matches) {
        if (switcherEl.parentNode !== appEl) {
          appEl.appendChild(switcherEl);
        }
      } else if (switcherEl.parentNode !== mount) {
        mount.insertBefore(switcherEl, mount.firstChild);
      }
    }

    // 주의: 이 스크립트(assets/js/sidebar.js)는 FOUC 방지를 위해 <main>보다
    // 앞쪽(<aside id="sidebar-mount"> 바로 다음)에서 동기적으로 실행되므로,
    // 지금 당장 reposition()을 부르면 <main>이 아직 파싱되기 전이라 .app의
    // "마지막 자식"이 아니라 그 시점까지 존재하는 자식들(사이드바 등) 뒤에만
    // 붙게 되어 결과적으로 <main>보다 앞에 와 버림(페이지 진짜 맨 아래가
    // 아니게 됨). 문서 파싱이 끝난 뒤(DOMContentLoaded)에 처음 한 번
    // 배치하도록 미룸 — 이미 로딩이 끝난 뒤라면(예: 드물게 이 스크립트가
    // 늦게 실행되는 경우) 바로 실행.
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', reposition);
    } else {
      reposition();
    }
    // 구형 사파리 등 addEventListener를 지원하지 않는 MediaQueryList 대비
    if (mq.addEventListener) mq.addEventListener('change', reposition);
    else if (mq.addListener) mq.addListener(reposition);
  })();

  // ── 메뉴(사이드바) 언제든 직접 숨기기/보이기 버튼(데스크탑 전용) ──
  // 사용자 요청: "글을 볼 때 메뉴창이 자꾸 떠 있는 건 불편할 것 같은데. 차라리
  // 메뉴창을 언제든지 숨길 수 있도록 바꾸는 건 어떨까?" — 콘텐츠 길이를 재서
  // 자동으로 숨기던 이전 버전은 사이드바가 사라지면 내비게이션 전체가 함께
  // 사라지는 문제가 있어 전체 되돌렸음(위 커밋/프로젝트 문서 참고). 이번엔
  // 자동 판단 없이, 화면 왼쪽 위에 항상 떠 있는 작은 버튼으로 사용자가 직접
  // 켜고 끄는 방식으로 다시 구현 — 버튼 자체는 사이드바 밖(document.body 바로
  // 아래)에 둬서 사이드바를 숨겨도 다시 켜는 방법이 항상 남아있음. 테마
  // 설정과 같은 방식으로 localStorage에 저장해서(mt-sidebar-collapsed) 다른
  // 페이지로 이동해도 상태가 유지됨. 모바일(900px 이하)은 이미 별도의 축소된
  // 상단 아이콘 바 레이아웃이라 대상에서 제외(버튼 자체도 CSS로 숨김,
  // style.css의 @media (max-width: 900px)와 맞춰서 관리할 것).
  (function initSidebarToggle() {
    var appEl = document.querySelector('.app');
    if (!appEl || !mount) return;

    var STORAGE_KEY = 'mt-sidebar-collapsed';
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'sidebar-toggle-btn';
    btn.setAttribute('data-role', 'sidebar-toggle');
    // 아이콘 자체(막대 3개짜리 햄버거)는 열림/닫힘 상태와 무관하게 항상 동일 —
    // 사용자가 준 참고 이미지대로 위치만 바뀜(사이드바가 보일 땐 사이드바
    // 오른쪽 위, 숨겨지면 화면 왼쪽 위). 포인트색(accent)으로 칠해서 튀지
    // 않으면서도 눈에 띄게.
    btn.innerHTML = '<span></span><span></span><span></span>';

    function isCollapsed() {
      return appEl.classList.contains('sidebar-collapsed');
    }

    function applyLabel() {
      var collapsed = isCollapsed();
      btn.setAttribute('aria-pressed', collapsed ? 'true' : 'false');
      btn.setAttribute('aria-label', collapsed ? '메뉴 보이기' : '메뉴 숨기기');
      btn.title = collapsed ? '메뉴 보이기' : '메뉴 숨기기';
    }

    function setCollapsed(collapsed) {
      appEl.classList.toggle('sidebar-collapsed', collapsed);
      try { localStorage.setItem(STORAGE_KEY, collapsed ? '1' : '0'); } catch (e) { /* 개인정보 보호 모드 등 — 무시 */ }
      applyLabel();
    }

    var stored = null;
    try { stored = localStorage.getItem(STORAGE_KEY); } catch (e) { /* 무시 */ }
    // 이 스크립트는 <main>보다 앞에서 동기 실행되지만(FOUC 방지, 파일 맨 위
    // 주석 참고), 이 기능은 .main 자체를 읽거나 재지 않고 그냥 .app에 클래스만
    // 붙이는 것뿐이라 .main이 아직 없어도 안전함(자동 숨김 버전이 겪었던
    // "타이밍 때문에 기능이 통째로 꺼지는" 문제와 무관).
    appEl.classList.toggle('sidebar-collapsed', stored === '1');
    applyLabel();

    btn.addEventListener('click', function () {
      setCollapsed(!isCollapsed());
    });

    // .app 안에 붙임(document.body 바로 아래가 아니라) — CSS가
    // ".app.sidebar-collapsed .sidebar-toggle-btn"처럼 상태에 따라 버튼 위치를
    // 바꾸려면 버튼이 .app의 자손이어야 셀렉터가 걸림. position:fixed라 어차피
    // 문서 흐름/flex 레이아웃에는 안 끼고(사이드바를 숨겨도 .app 자체는 안
    // 사라지니 버튼도 계속 남아있음), 화면 기준 위치만 CSS로 그대로 잡힘.
    appEl.appendChild(btn);
  })();

  // ── 로그인한 소유자에게만 보이는 "글쓰기"/"수정·삭제" 바로가기 ──
  // 사용자 요청: "글 수정/삭제: 글마다 밑에 적혀져 있어서 누르면 자동으로
  // 가능하게(메모처럼) 수정 가능해? 글 추가도, 폴더마다 옆에 적혀져 있어서,
  // 누르면 자동으로 글 쓰기가 가능하게... private 폴더는 건드리지 말고."
  //
  // /private/ 아래는 이미 자체 도구(notes, write)가 있으므로 이 스크립트는
  // 그 바깥(공개 페이지들)에서만 동작하고, /private/에서 인증된 세션
  // (mt-private-access, private-guard.js와 같은 검사)이 있을 때만 — 즉 사이트
  // 주인 본인이 보고 있을 때만 — 버튼을 만든다. 세션이 없으면 아예 DOM에
  // 아무것도 추가하지 않으므로(CSS로 숨기는 게 아님) 일반 방문자에게는 절대
  // 보이지 않는다.
  //
  // "메모처럼" 완전히 그 자리에서 고치는 것(private/notes/ 같은 단일 페이지
  // 앱)은 각 글이 posts.json 안의 데이터가 아니라 실제 개별 .html 파일이라
  // 구조가 달라서 그대로 옮기기 어려움 — 대신 이미 있는 private/write/의
  // "수정" 모드로 폴더/슬러그까지 채워서 바로 이동시켜(?mode=edit&folder=..
  // &slug=..), 폴더 경로를 다시 입력하고 "불러오기"를 따로 누르는 수고를
  // 없앴다. 그 페이지 쪽 변경은 private/write/index.html의
  // applyDeepLinkFromQuery() 참고.
  (function initInlineAdminControls() {
    var path = location.pathname;
    if (path.indexOf('/private/') === 0) return;

    // private-guard.js(assets/js/private-guard.js)와 완전히 같은 세션 검사 —
    // 다만 여긴 세션이 없다고 리다이렉트하지 않고 그냥 아무것도 안 만들고
    // 조용히 끝낸다(여긴 원래 누구나 볼 수 있는 공개 페이지라서).
    function hasValidOwnerSession() {
      try {
        var SESSION_KEY = 'mt-private-access';
        var MAX_SESSION_AGE = 8 * 60 * 60 * 1000;
        var owner = (cfg && cfg.owner) || 'miku-tenshi';
        var repo = (cfg && cfg.repo) || 'miku-tenshi.github.io';
        var data = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null');
        if (!data || data.repo !== owner + '/' + repo || !data.token) return false;
        if (Date.now() - Number(data.unlockedAt || 0) > MAX_SESSION_AGE) return false;
        return true;
      } catch (e) {
        return false;
      }
    }

    // 폴더 목록 페이지는 항상 '/'로 끝나는 URL로 서빙되고(예: /study/,
    // /study/db/), 개별 글은 항상 .html로 끝나는 파일명 URL이라(예:
    // /study/css-position-fixed.html) 이 둘을 구분하는 데 DOM 구조 대신
    // URL 경로만으로 충분함 — 홈("/")과 contact/index.html("links.md"로 표시)
    // 처럼 chrome-path 표기가 서로 다른 특수 페이지가 있어서 DOM 휴리스틱보다
    // 이쪽이 더 안전함.
    function isFolderListingPage() {
      return path.charAt(path.length - 1) === '/';
    }

    function folderFromPath() {
      return path.replace(/^\/+|\/+$/g, '');
    }

    // 폴더 목록 페이지(예: /study/, /study/db/, /contact/) — 제목 옆에
    // "+ 글쓰기" 버튼을 붙여서 private/write/로 그 폴더가 이미 채워진 채
    // 넘어가게 한다. 홈("/")은 특정 폴더를 가리키지 않는 "최근 글 모음"이라
    // 대상에서 제외(글쓰기 대상 폴더가 명확하지 않음).
    function injectWriteButton() {
      var heading = document.querySelector('.main-heading');
      var folder = folderFromPath();
      if (!heading || !folder) return;
      var a = document.createElement('a');
      a.className = 'admin-write-btn';
      a.href = '/private/write/?mode=post&folder=' + encodeURIComponent(folder);
      a.innerHTML = '<span class="admin-write-icon" aria-hidden="true">+</span>글쓰기';
      heading.appendChild(a);
    }

    // 개별 글 페이지(예: /study/css-position-fixed.html) — 본문 목록
    // (.entry-list, ".." 로 돌아가는 링크가 있는 자리) 바로 아래에 "수정"/
    // "삭제" 링크를 붙인다. 둘 다 private/write/로 폴더·슬러그까지 채워서
    // 넘어가고, "삭제"는 도착하자마자 불러오기까지 자동으로 끝낸 뒤 삭제
    // 확인 패널만 열어둔다(실제 삭제는 거기서 한 번 더 확인해야 함 — 되돌릴
    // 수 없는 동작이라 즉시 실행하지 않음).
    function injectEditControls() {
      var m = path.match(/^\/(.+)\/([^\/]+)\.html$/);
      if (!m) return;
      var folder = m[1];
      var slug = m[2];
      var list = document.querySelector('#window-body .entry-list') || document.querySelector('.window-body .entry-list');
      if (!list || !list.parentNode) return;
      var editHref = '/private/write/?mode=edit&folder=' + encodeURIComponent(folder) + '&slug=' + encodeURIComponent(slug);
      var wrap = document.createElement('div');
      wrap.className = 'admin-edit-controls';
      wrap.innerHTML =
        '<a class="admin-edit-link" href="' + editHref + '">수정</a>' +
        '<a class="admin-delete-link" href="' + editHref + '&action=delete">삭제</a>';
      list.parentNode.insertBefore(wrap, list.nextSibling);
    }

    function run() {
      if (!hasValidOwnerSession()) return;
      if (isFolderListingPage()) {
        injectWriteButton();
      } else if (/\.html$/.test(path)) {
        injectEditControls();
      }
    }

    // .main-heading / .window-body(.entry-list)는 이 스크립트보다 뒤에
    // 파싱되므로(파일 맨 위 FOUC 설명 참고) DOMContentLoaded 이후로 미룸.
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', run);
    } else {
      run();
    }
  })();
})();
