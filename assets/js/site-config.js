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

  // 브라우저 탭에 뜨는 제목(<title>). 예전엔 19개 HTML 파일 전부에
  // <title>miku-tenshi</title>를 똑같이 박아뒀었는데, 그러면 제목을 하나
  // 바꾸고 싶어도 파일 19개를 전부 고쳐야 했다. 이제는 이 값 하나만 바꾸면
  // 아래 코드가 모든 페이지(글쓰기 도구가 새로 만드는 글 포함, PAGE_SKELETON도
  // 이 스크립트를 그대로 불러쓰므로 자동 반영됨)의 탭 제목을 한 번에 바꾼다.
  siteTitle: 'リミ\'s page',

  profileName: 'リミ\'s page',
  profileRole: '2026.08.26~',
  // 프로필 사진 여러 장 — 순서대로 나열하면 사이드바에서 옆으로 스크롤(스와이프)
  // 해서 넘겨볼 수 있는 캐러셀이 됩니다(assets/js/sidebar.js가 그림). 사진을
  // 하나만 쓰고 싶으면 배열에 경로 하나만 남기면 예전처럼 동작합니다.
  avatarSrcs: ['/assets/img/yunyun.gif', '/assets/img/qzzang.gif'],
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

// 2026-09-01: 각 HTML 파일의 <title>miku-tenshi</title>는 이제 이 스크립트가
// 로드되는 즉시(<script src="/assets/js/site-config.js">가 <head>가 아니라
// <body> 위쪽, 사이트의 다른 어떤 내용보다도 먼저 실행되는 자리에 있으므로
// 체감되는 깜빡임 없이) 여기서 덮어써서 항상 이 값과 같게 유지한다. HTML
// 파일에 남아있는 정적 <title> 태그는 JS가 실행되기 전(또는 실행이 막혔을
// 때)의 안전한 대체값일 뿐이니, 굳이 지우지 않아도 된다 — 앞으로 탭 제목을
// 바꾸고 싶으면 위 siteTitle 값만 고치면 된다.
try {
  if (window.SITE_CONFIG.siteTitle) {
    document.title = window.SITE_CONFIG.siteTitle;
  }
} catch (e) { /* 조용히 무시 — 탭 제목 갱신은 부가 기능이라 실패해도 나머지 기능엔 영향 없음 */ }
