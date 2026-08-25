// miku-tenshi.github.io — 사이트 공용 설정
//
// 사이드바(프로필 이름/소개, 메뉴 목록, 저작권 표시)와 GitHub 저장소 정보를
// 이 파일 한 곳에서만 관리합니다. 이름/소개 문구나 메뉴를 바꾸고 싶으면
// 이 파일만 고치면 모든 페이지(글쓰기 도구가 새로 만드는 글 포함)에 바로 반영돼요.
// 실제 화면에 그리는 쪽은 /assets/js/sidebar.js 입니다.

window.SITE_CONFIG = {
  owner: 'miku-tenshi',
  repo: 'miku-tenshi.github.io',
  branch: 'main',

  profileName: 'リミ\'s page',
  profileRole: '2026.08.26~',
  avatarSrc: '/assets/img/rem.jpg',
  avatarAlt: 'リミ 프로필 사진',

  copyright: '© miku-tenshi.github.io',

  // href는 그 폴더로 시작하는 모든 하위 경로에서 active로 표시됩니다
  // (예: /study/db/index.html 에서도 Study가 active).
  // key는 아이콘도 함께 고릅니다 — assets/css/style.css의
  // .nav-item .nav-icon[data-icon="..."] 규칙과 이름이 맞아야 합니다
  // (아이콘은 플랫폼마다 다르게 보이는 이모티콘 대신 단색 SVG 아이콘을 씁니다).
  nav: [
    { key: 'home',    href: '/',         label: 'Home' },
    { key: 'study',   href: '/study/',   label: 'Study' },
    { key: 'project', href: '/project/', label: 'Project' },
    { key: 'contact', href: '/contact/', label: 'Contact' },
    { key: 'private', href: '/private/', label: 'Private' }
  ]
};
