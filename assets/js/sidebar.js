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

  mount.innerHTML =
    '<div class="profile">' +
      '<a class="avatar" href="/" title="홈으로 돌아가기">' +
        '<img src="' + cfg.avatarSrc + '" alt="' + escapeHtml(cfg.avatarAlt) + '">' +
      '</a>' +
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
})();
