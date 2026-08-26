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

    var scrollTimer = null;
    track.addEventListener('scroll', function () {
      if (scrollTimer) clearTimeout(scrollTimer);
      scrollTimer = setTimeout(function () {
        var w = track.clientWidth || 1;
        setActiveDot(Math.round(track.scrollLeft / w));
      }, 80);
    });

    for (var di = 0; di < dots.length; di++) {
      dots[di].addEventListener('click', function (e) {
        e.preventDefault();
        var idx = Number(this.getAttribute('data-dot')) || 0;
        track.scrollTo({ left: idx * track.clientWidth, behavior: 'smooth' });
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
      setActiveDot(idx);
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
})();
