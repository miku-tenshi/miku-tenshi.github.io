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
      '<div class="sidebar-footer">' + escapeHtml(cfg.copyright) + '</div>' +
    '</div>';
})();
