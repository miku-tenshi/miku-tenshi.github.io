// miku-tenshi.github.io — private/ 하위 페이지 접근 가드
//
// private/ 아래 모든 페이지(<html class="private-pending">로 시작하고
// <style>.private-pending body{visibility:hidden}</style>가 있는 페이지)의
// <head>에서 가장 먼저 불러옵니다. 브라우저가 나머지 <body>를 그리기 전에
// (동기 스크립트라 <head> 파싱을 막고 실행됩니다) sessionStorage에 저장된
// /private/ 인증 세션(mt-private-access)이 아직 유효한지만 확인합니다.
//
//   - 유효하면: <html>에서 private-pending 클래스를 즉시 제거해서 화면이
//     보이게 합니다. 별도 API 호출 없이 로컬 확인만 하므로 깜빡임이 없어요.
//   - 유효하지 않으면: /private/ 로 돌려보내면서 원래 가려던 주소를
//     ?next= 로 함께 넘깁니다 — /private/ 에서 한 번만 인증하면
//     자동으로 원래 페이지로 다시 이동합니다.
//
// 즉, private/ 아래 어떤 하위 페이지든 이 스크립트 하나만 <head>에 넣으면
// "한 번 인증 → 나머지 전부 접근 가능"이 자동으로 적용됩니다. 페이지마다
// 따로 로그인 폼을 만들 필요가 없습니다.

(function () {
  'use strict';

  var SESSION_KEY = 'mt-private-access';
  var MAX_SESSION_AGE = 8 * 60 * 60 * 1000;

  var cfg = window.SITE_CONFIG;
  var OWNER = (cfg && cfg.owner) || 'miku-tenshi';
  var REPOSITORY = (cfg && cfg.repo) || 'miku-tenshi.github.io';

  function hasValidSession() {
    try {
      var data = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null');
      if (!data || data.repo !== OWNER + '/' + REPOSITORY || !data.token) return false;
      if (Date.now() - Number(data.unlockedAt || 0) > MAX_SESSION_AGE) {
        sessionStorage.removeItem(SESSION_KEY);
        return false;
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  if (hasValidSession()) {
    document.documentElement.classList.remove('private-pending');
  } else {
    var next = encodeURIComponent(location.pathname + location.search);
    location.replace('/private/?next=' + next);
  }
})();
