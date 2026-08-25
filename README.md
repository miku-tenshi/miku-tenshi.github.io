# miku-tenshi.github.io

TIL(공부 기록)과 프로젝트를 정리하는 개인 홈페이지입니다. 사이드바 메뉴(Home / Study / Project / Contact / Private)가 곧 실제 폴더이고, 그 폴더 안에 또 다른 폴더가 있을 수 있습니다(예: `study/db/`, `study/frontend/`).

이 파일은 GitHub 저장소 설명용이라 사이트 화면에는 나타나지 않습니다.

## 폴더 구조

```
/
├── index.html                    (Home — 소개 카드 + "최근 글" 목록)
├── posts.json                    (모든 글의 목록/날짜 — 홈의 "최근 글"이 이 파일을 읽어서 보여줌)
├── assets/css/style.css          (공통 스타일 — 색상, 크기 전부 여기서 관리)
├── assets/js/site-config.js      (사이트 공용 설정 — 이름/소개/메뉴/저장소 정보를 여기 한 곳에서 관리)
├── assets/js/sidebar.js          (사이드바 렌더러 — site-config.js를 읽어 모든 페이지의 사이드바를 그림)
├── assets/js/private-guard.js    (private/ 하위 페이지 접근 가드 — 아래 "Private" 항목 참고)
├── assets/js/gh-api.js           (GitHub Contents API 공용 헬퍼 — private 도구들이 공유)
├── assets/js/retro-log.js        (저장/삭제 진행 표시 공용 헬퍼 — 레트로 로딩 바, write/notes가 공유)
├── assets/js/window.js           (공통 스크립트 — 카드 클릭 시 전체화면 인터랙션, 마우스 반짝이 효과)
├── assets/js/marked.umd.js       (마크다운 파서 — /private/write/ 페이지 전용)
├── assets/img/avatar.jpg         (프로필 사진 — 아래 참고)
├── study/
│   ├── index.html                (Study 폴더 목록)
│   ├── (직속 글).html
│   └── db/, frontend/ ...        (하위 폴더, 필요하면 계속 추가 가능)
├── project/
├── contact/
└── private/                      (인증이 필요한 개인 공간, 아래 참고)
    ├── index.html                 (접근 게이트 + 하위 폴더 목록)
    ├── write/index.html           (글쓰기 도구)
    └── notes/                     (메모 도구)
        ├── index.html
        └── notes.json             (메모 데이터)
```

## 사이드바/메뉴를 한 곳에서 관리하기 (`assets/js/site-config.js`)

예전에는 모든 페이지 HTML 안에 사이드바(프로필 이름, 소개, 메뉴 목록)가 각자 따로 들어있어서,
이름이나 메뉴를 바꾸려면 파일을 하나하나 고쳐야 했습니다. 지금은 그렇지 않습니다.

- 모든 페이지는 `<aside class="sidebar" id="sidebar-mount"></aside>` 빈 자리만 가지고 있고,
- `assets/js/site-config.js`에 있는 이름/소개/메뉴 정보를 `assets/js/sidebar.js`가 읽어서
  그 자리에 채워 넣습니다.

**이름, 소개, 메뉴(이모티콘 포함)를 바꾸고 싶으면 `assets/js/site-config.js` 파일 하나만 고치면
사이트 전체(이미 게시된 글 페이지들 포함)에 한 번에 반영됩니다.**

```js
window.SITE_CONFIG = {
  owner: 'miku-tenshi',
  repo: 'miku-tenshi.github.io',
  branch: 'main',
  profileName: 'リミ',       // 사이드바 상단 이름
  profileRole: 'my page',    // 이름 아래 소개 문구
  avatarSrc: '/assets/img/avatar.jpg',
  copyright: '© miku-tenshi.github.io',
  nav: [
    { key: 'home', href: '/', label: 'Home' },
    // ...
  ]
};
```

`/private/write/`에서 새 글이나 새 폴더를 올릴 때 만들어지는 페이지도 사이드바를 직접 담지 않고
이 공용 마운트 방식을 그대로 사용합니다 — 나중에 이름이나 메뉴를 바꾸면 예전에 올린 글들의
사이드바도 함께 바뀝니다.

## 메뉴 아이콘

메뉴 아이콘은 플랫폼마다 다르게 보이는 이모티콘 대신, 단색 선 아이콘(SVG를 CSS `mask-image`로
사용)으로 통일되어 있습니다 — 집(Home) / 폴더(Study) / 렌치(Project) / 편지봉투(Contact) /
자물쇠(Private). 어느 기기·브라우저에서 봐도 항상 같은 모양으로 보이고, 기본 색은
`--ink-faint`, 선택된 메뉴는 `--accent-grad`로 관리됩니다.

- `assets/js/site-config.js`의 `nav` 배열 각 항목의 `key` 값이 아이콘을 고릅니다.
- `assets/css/style.css`의 `.nav-item .nav-icon[data-icon="..."]` 규칙들이 각 `key`에 맞는
  SVG를 담고 있습니다. 새 메뉴를 추가할 때는 `key`에 맞춰 여기에 규칙을 하나 더 추가해주면 됩니다.
- 폴더/파일 목록의 아이콘(`folder-icon`/`file-icon`)도 이모티콘이 아니라 `style.css`에서
  그리는 작은 단색 도형(둥근 사각형/원)입니다.

## 커스텀 마우스 커서

PC(마우스가 있는 기기)에서는 기본 마우스 포인터 대신, 마우스를 따라다니는 그라데이션 점 +
반짝이는 잔상으로 대체됩니다(`assets/js/window.js`의 커서 IIFE, `assets/css/style.css`의
`.custom-cursor`/`.cursor-sparkle`). 터치 기기나 "동작 줄이기(prefers-reduced-motion)"
설정에서는 자동으로 꺼지고 기본 커서가 그대로 보입니다.

- 커서 점의 **위치는 반드시 `style.translate`(개별 CSS 속성)로 지정**합니다 — `style.transform`이
  아닙니다. 클릭 시 `.click` 클래스가 별도의 개별 속성인 `scale`을 거는데(`.custom-cursor.click{
  scale: 0.65; }`), CSS는 `translate`/`rotate`/`scale`(개별 속성)과 `transform`(축약 속성)을
  "translate → rotate → scale → transform" 순서로 합성합니다. 위치를 `transform`으로 잡아두면
  이 순서상 `transform`이 제일 먼저(안쪽에서) 적용되고 `scale`이 그 다음(바깥쪽)에 적용되어서,
  클릭할 때마다 위치 값 자체가 0.65배로 줄어들어(뷰포트 좌상단 방향으로) 커서가 "먼 곳으로
  튀는" 것처럼 보이는 버그가 있었습니다. `translate`를 개별 속성으로 쓰면 순서상 가장
  바깥(마지막)에 적용되어 `scale`의 영향을 받지 않으므로 클릭해도 위치가 흔들리지 않습니다.
  새로 커서에 다른 클릭/호버 효과(회전, 확대 등)를 추가할 때도 위치는 항상 개별 `translate`
  속성으로, 다른 효과는 `rotate`/`scale` 개별 속성이나 `.custom-cursor`가 아닌 다른 요소로
  분리해서 넣을 것 — `transform` 축약 속성과 섞어 쓰면 이 버그가 재발합니다.
- 위치 변경 자체에는(페이지 이동 직후에도 화면을 가로질러 날아가 보이지 않도록) 일부러 CSS
  transition을 걸지 않았습니다 — opacity/scale만 부드럽게 바뀌고 위치는 항상 즉시 이동합니다.
  처음 마우스가 움직이기 전까지는 화면 밖(`translate: -9999px -9999px`)에 숨겨둡니다.

## 픽셀 레트로 폰트

제목처럼 강조하고 싶은 부분(사이드바 프로필 이름, 각 글의 제목(`h1`~`h4`), 글 목록의 날짜 등)에는
[Galmuri](https://galmuri.quiple.dev/)라는 오픈소스 한글 픽셀 폰트를 씁니다
(`assets/css/style.css` 맨 위 `@import`로 CDN에서 불러오고, `--font-pixel` 변수로 관리).
본문 텍스트에는 적용하지 않아서 읽는 데는 지장이 없고, 제목/강조 요소만 도트(레트로 게임 느낌)
글씨로 보입니다.

- 새로 추가하는 요소에도 이 느낌을 주고 싶으면 `font-family: var(--font-pixel);`만 넣으면
  됩니다.
- CDN(`cdn.jsdelivr.net`)이 차단된 네트워크에서는 이 폰트만 기본 글꼴로 대체되고, 나머지
  기능에는 영향이 없습니다.

## 모바일 화면

900px 이하 화면에서는 사이드바가 PC와 다르게 상단의 작은 아이콘 바 형태로 바뀝니다 — 메뉴
이름 글자는 숨기고 이모티콘만 보여서 화면을 적게 차지해요. 이 동작은 `assets/css/style.css`의
`@media (max-width: 900px)` 블록에서 관리합니다.

## Private — `/private/` (인증이 필요한 개인 공간)

사이드바의 **Private**를 누르면 들어갈 수 있는 공간이에요. 예전 `/write/`는 이제
`/private/write/`로 옮겨졌고, 그 옆에 개인 메모를 위한 `/private/notes/`도 있습니다.

- **한 번만 인증**: `/private/`에서 GitHub Personal Access Token으로 한 번 인증하면
  (저장소 쓰기 권한 확인), 그 인증 정보가 현재 탭의 `sessionStorage`에 저장됩니다.
  `/private/write/`나 `/private/notes/` 같은 하위 페이지들은 이 저장된 인증을
  `assets/js/private-guard.js`로 확인만 하고 바로 열립니다 — 페이지마다 다시 로그인할
  필요가 없어요.
- **동작 원리**: `private/` 아래 보호가 필요한 페이지는 `<html class="private-pending">`과
  `<script src="/assets/js/private-guard.js">`를 `<head>`에 넣습니다. 이 스크립트가 유효한
  인증 세션을 확인하면 화면을 바로 보여주고, 없으면 `/private/?next=원래주소`로 돌려보내서
  거기서 인증한 뒤 자동으로 원래 페이지로 돌아오게 합니다.
- **세션 유지 시간**: 인증은 8시간 동안 유지되고(브라우저 탭을 닫으면 초기화), 이후에는
  다시 인증이 필요합니다.
- **새 보호 페이지 추가하기**: `private/` 아래 새 페이지를 추가하고 싶으면 위 두 줄
  (`private-pending` 클래스 + `private-guard.js`)만 그대로 넣으면 자동으로 같은 방식으로
  보호됩니다.

### 글쓰기 도구 — `/private/write/`

GitHub Personal Access Token으로 저장소에 직접 파일을 커밋하는 관리자 전용 페이지예요. 위쪽
탭으로 **새 글 추가 / 새 폴더 만들기 / 글 수정·삭제** 세 가지 모드를 오갈 수 있어요.

- **폴더/제목 같은 정보와 본문 분리**: 대상 폴더, 파일명, 날짜, 제목 같은 값은 글쓰기 창 위에 있는 별도
  카드에서 입력하고, 글쓰기 창 자체에는 본문만 있어서 집중해서 쓸 수 있어요.
- **입력하는 즉시 스타일이 적용되는 본문 작성**: 별도 미리보기 칸 없이, 본문 칸에 `# 제목`, `**굵게**`,
  `` `코드` ``, `- 목록`, `> 인용` 같은 마크다운 문법을 쓰면 타이핑하는 즉시 그 자리에서 스타일이
  적용돼요(문법 기호 자체는 옅게 표시되고 지워지지 않아요 — 실제로 저장되는 내용은 원래 마크다운 그대로).
- **글쓰기 창도 클릭하면 전체화면**: 본문 입력창을 클릭하면 다른 글 카드들처럼 전체화면으로 펼쳐져서
  더 넓은 화면으로 쓸 수 있어요.
- **최종 미리보기 / 복사용 코드**: "미리보기"로 실제 게시 모습을 확인하고, "복사용 코드"로 API 호출
  없이 GitHub 웹 화면에 수동으로 붙여넣을 수도 있어요.
- **글 수정·삭제**: 폴더 경로와 파일명(슬러그)을 입력하고 "불러오기"를 누르면 기존 글의 제목·날짜·본문이
  그대로 채워져요. **폴더는 수정/삭제 도구로 다루지 않아요** — 폴더를 옮기거나 지우고 싶으면 GitHub
  웹 화면에서 직접 해주세요.
- 새 글을 올리거나 수정·삭제할 때마다 `posts.json`도 함께 갱신돼서, 홈 화면의 "최근 글" 목록이
  항상 최신 상태를 보여줍니다.
- **이미지·PDF 첨부**: 글쓰기 창 위의 "이미지 · PDF 첨부" 버튼을 누르면 파일 선택 창이 열리고,
  고른 파일이 저장소의 `assets/uploads/`에 (파일명이 겹치지 않도록 시각을 붙여서) 그대로
  올라간 뒤, 커서가 있던 자리에 `![파일명](/assets/uploads/...)` (이미지) 또는
  `[파일명](/assets/uploads/...)` (PDF) 마크다운 링크가 자동으로 끼워집니다. 용량은 3MB로
  제한되어 있고(`ATTACH_MAX_BYTES`), 업로드 중에는 아래 "저장/삭제 진행 표시" 절에서 설명하는
  레트로 로딩 표시가 뜹니다.
- **폴더 시각화**: 대상 폴더를 입력하는 칸 아래에, 저장소에 이미 있는 폴더들이 알약 모양 버튼
  (칩)으로 나열됩니다(중첩 폴더는 `· `를 깊이만큼 반복해서 들여쓰기로 구분). 칩을 클릭하면 해당
  경로가 입력 칸에 바로 채워지고, 미리보기 경로도 함께 갱신됩니다. 직접 타이핑도 계속 가능하고
  (칩은 자동완성 힌트일 뿐), 이 폴더 목록은 GitHub API(Git Trees)로 한 번만 조회해오기 때문에
  로그인이 안 되어 있거나 네트워크 문제가 있으면 조용히 칩만 안 뜨고 나머지 기능은 그대로
  동작합니다.

**제목처럼 글자가 커지는 줄에서도 커서 위치가 정확한 이유**: 브라우저 기본 `<textarea>`는
글자 크기를 한 가지로만 렌더링할 수 있어서, `# 제목`처럼 위 스타일 레이어(오버레이)에서만
글자를 크게 보여주면 진짜 커서는 (작은 글자 기준 위치에 남아서) 눈에 보이는 큰 글자와 어긋나
보입니다. 그래서 진짜 커서는 투명하게 숨기고(`caret-color: transparent`), 화면 밖에 숨겨둔
복사본(`#editor-caret-mirror`)에 커서 앞 내용을 오버레이와 똑같은 방식으로 다시 그린 뒤 그
끝 위치를 측정해서, 그 자리에 정확히 맞춘 가짜 커서(`#editor-caret`, 깜빡이는 얇은 막대)를
따로 그려 넣습니다. 타이핑/한글 입력/되돌리기 같은 실제 입력 동작은 여전히 브라우저 기본
`<textarea>`가 그대로 처리하기 때문에 안전하고, 커서가 "보이는 위치"만 별도로 계산해서
맞추는 방식입니다.

### 메모 도구 — `/private/notes/`

혼자 보는 짧은 메모를 위한 간단한 도구예요. `/private/write/`처럼 마크다운 실시간 서식은 없고,
제목 + 자유 텍스트만 저장합니다. 화면은 목록(list) / 상세 보기(detail) / 작성·수정 폼(form)
세 가지 상태를 오가는 방식으로 되어 있어요(예전처럼 편집 칸이 항상 옆에 펼쳐져 있지 않고,
버튼을 눌러야만 그때그때 필요한 칸이 나타납니다).

- **목록**: 기본 화면이에요. 메모 제목·날짜가 리스트로 쭉 나열되고, 맨 아래 "+ 새 메모" 버튼을
  눌러야 제목·본문을 쓰는 칸(작성 폼)이 나타납니다.
- **상세 보기**: 목록에서 메모 하나를 클릭하면 제목·본문을 읽기 전용으로 보여줘요. 여기서
  "수정" 버튼을 눌러야 제목·본문을 고치는 칸과 "저장"/"삭제" 버튼이 나타납니다(목록에서 바로
  수정 칸이 열리지 않는 이유 — 실수로 내용을 건드리는 것을 막기 위해서예요).
- **투두(할 일) 동그라미**: 목록의 각 메모 앞에 동그라미 버튼이 있어서, 눌러서 완료 표시를 할 수
  있어요(체크 표시로 바뀝니다). 완료한 메모는 목록 맨 아래로 내려가서 아직 안 한 일이 위쪽에
  먼저 보여요. 이 동그라미는 행(제목) 클릭과는 별도 버튼이라, 동그라미를 눌러도 상세 보기로
  넘어가지 않고 바로 그 자리에서 완료 상태만 저장됩니다.
- 별도 로그인이 없는 이유: `/private/`에서 인증한 세션(`assets/js/gh-api.js`가 읽어옴)을
  그대로 사용하기 때문이에요.

## 저장/삭제 진행 표시 — 레트로 로딩 바 (`assets/js/retro-log.js`)

`/private/write/`나 `/private/notes/`에서 저장·삭제처럼 GitHub API를 호출하는 동안에는, 예전처럼
"posts.json 최신 상태 확인 중...", "study/db/... 저장 중..." 같은 문구가 줄줄이 쌓이는 대신,
`> saving [--#-------]` 처럼 픽셀 글씨로 된 레트로 로딩 바 한 줄만 움직입니다. 작업이 끝나면
그 줄이 지워지고 `complete_` 한 줄(실패하면 `error: ...` 한 줄)만 남습니다.

- 공용 컴포넌트라서 새로운 저장/삭제 기능을 추가할 때도 재사용할 수 있어요:
  ```js
  const rl = RetroLog.start(logEl, '저장 중');
  // ... 실제 GitHub API 호출 ...
  rl.done();                    // -> "complete_" 한 줄만 남김
  rl.fail('에러 메시지');        // -> "error: 에러 메시지" 한 줄만 남김
  ```
- `logEl`은 빈 상자 역할만 하면 되고, 내부 내용은 전부 이 스크립트가 그립니다. 결과 링크처럼
  완료 후에도 남기고 싶은 정보가 있으면 `rl.done('complete', '결과 안내 HTML')`처럼 두 번째
  값으로 넘기면 `complete_` 아래에 작게 함께 남습니다.
- 진행 중 로딩 바는 8비트 게임 로딩 화면처럼 칸 하나가 좌우로 오가는 모양이고, 진행률을 정확히
  알 수 없는 작업(indeterminate)이라 "움직이고 있다"는 것만 보여줍니다.

## 프로필 사진 바꾸기

`assets/img/avatar.jpg`를 원하는 사진으로 갈아끼우면 사이드바 전체(모든 페이지 공통)에 바로 반영됩니다.

- **화면에 보이는 크기**: 200×200px (정사각형). `assets/css/style.css`의 `.avatar{ max-width: 200px; }`
  값을 바꾸면 이 크기도 조절할 수 있어요.
- **준비할 원본 사진**: 정사각형(1:1)에 가까울수록 잘리는 부분 없이 깔끔하게 나옵니다(CSS가 가운데를
  기준으로 정사각형 크롭). 실제 파일 크기는 화면 크기(200px)보다 조금 넉넉한 400~800px 정도면 화질도
  충분하고 용량도 적당해요.
- 파일명을 꼭 `avatar.jpg`로 맞추거나, 다른 이름을 쓰려면 `assets/js/site-config.js`의
  `avatarSrc` 값도 함께 바꿔야 합니다.

## 홈 화면의 "최근 글" 목록

홈(`/`)에는 소개 카드 아래에 모든 섹션(study/project/contact)의 글을 날짜순으로 모아 보여주는
"최근 글" 카드가 있어요. `posts.json`을 브라우저가 직접 읽어서(fetch) 만드는 거라 별도 빌드 과정이
없고, 한 번에 5개씩만 보여주고 그보다 많으면 아래에 번호 페이지(1, 2, 3 ...)가 나타나요.

`/private/write/`로 글을 올리거나 고치거나 지우면 `posts.json`도 자동으로 같이 갱신되니 보통은 이
파일을 직접 건드릴 일이 없어요. 손으로 직접 글을 추가한 경우 최근 글 목록에 뜨게 하려면 `posts.json`
배열에 아래 형태로 한 칸 추가해주면 됩니다.
```json
{
  "folder": "study/db",
  "slug": "replication",
  "title": "글 제목",
  "meta": "08.30",
  "date": "2026-08-30",
  "href": "/study/db/replication.html"
}
```

## 새 글 하나 추가하기 (수동)

1. 글을 넣을 폴더로 갑니다 (예: `study/db/`).
2. 그 폴더에 있는 아무 글 파일(`.html`)을 하나 복사해서 이름을 바꿉니다. 예: `study/db/normalization.html` → `study/db/replication.html`
3. 새 파일을 열어 아래 3곳만 고칩니다.
   - `<title>` 태그 — 브라우저 탭에 뜨는 제목
   - `chrome-path` 안의 마지막 부분 — 예: `replication.md`
   - `window-body` 안의 `entry-date`, `<h2>`, `<p>` — 실제 날짜와 글 내용
4. 그 폴더의 `index.html`을 열어서 `entry-list` 안에 새 줄을 추가합니다. 기존 줄을 복사해서 `href`와 글 제목, 날짜만 바꾸면 됩니다.
   ```html
   <a class="entry-list-item clickable" href="/study/db/replication.html">
     <span class="t"><span class="file-icon"></span>글 제목</span>
     <span class="d">08.30</span>
   </a>
   ```

끝입니다. 별도 빌드 과정이 없어서, 파일을 저장하고 그대로 GitHub에 올리면 바로 반영됩니다.
(`file-icon`/`folder-icon`은 `style.css`에서 자동으로 작은 단색 도형으로 그려집니다.)

## 새 폴더(하위 폴더) 추가하기 (수동)

Study 아래에 새 주제 폴더를 하나 더 만들고 싶다면 (예: `study/algorithm/`):

1. `study/algorithm/` 폴더를 새로 만들고, 그 안에 `study/db/index.html`을 복사해서 `study/algorithm/index.html`로 저장합니다.
2. 새 `index.html`에서 다음을 고칩니다.
   - `chrome-path`: `<a href="/study/">study</a> / <a href="/study/algorithm/">algorithm</a> / index.md`
   - `<h2>`와 안내 문구, `entry-list`는 일단 비워두거나 첫 글 하나만 남겨둡니다.
   - 맨 위 `up` 링크(`..`)는 상위 폴더(`/study/`)를 그대로 가리키면 됩니다.
3. `study/index.html`의 `entry-list`에 새 폴더 항목을 추가합니다.
   ```html
   <a class="entry-list-item clickable is-folder" href="/study/algorithm/">
     <span class="t"><span class="folder-icon"></span>algorithm</span>
     <span class="d">0개 항목</span>
   </a>
   ```
4. 이제 `study/algorithm/` 안에 글을 추가하는 방법은 위 "새 글 하나 추가하기"와 똑같습니다.

폴더는 몇 단계든 더 깊게 만들 수 있습니다(`study/algorithm/graph/` 처럼). `chrome-path`에 그 단계만큼 링크를 이어 붙이면 됩니다.

## 글이 긴 경우

카드(닫힌 상태)에서는 본문이 일정 높이(`window-body`의 `max-height: 60vh`)를 넘으면 카드 안에서만 스크롤됩니다. 카드를 클릭해 전체화면으로 펼치면 화면 전체를 쓰면서 그 안에서 스크롤됩니다 — 사이드바나 배경은 움직이지 않습니다. `study/db/query-tuning-long-example.html`이 이 동작을 보여주는 예시 글입니다.

## 사이드바 아랫부분 — 실제로 물 속에 들어와 있는 듯한 배경 (v3)

메뉴 목록 아래 남는 공간(사이드바 아랫단)은 네모난 카드가 아니라, 사이드바의 왼쪽·오른쪽·아래
끝까지 실제로 물이 차 있는 것처럼 자연스럽게 이어집니다(`.sidebar-sea`,
`assets/css/style.css`). 저작권 문구(`.sidebar-footer`)도 이 물 위에 떠 있는 것처럼 그 안에
함께 들어있습니다. `sidebar.js`가 모든 페이지의 사이드바에 자동으로 넣어주므로 따로 손댈 필요는
없습니다.

이전 버전(v2)은 "파도 모양 SVG 두 장"을 흘려보내는 방식이었는데, 사각 박스 안에 파도 무늬가
갇혀 있는 것처럼 보인다는 피드백을 받아 통째로 다시 만들었습니다(v3). 지금은 수중 사진(빛줄기가
비스듬히 비치고, 표면 쪽은 밝은 청록·아래로 갈수록 짙은 남색, 잔거품이 위로 떠오르는 느낌)을
참고해서, "파도 모양"을 그리는 대신 아예 물 속에 들어와 있는 것 같은 느낌을 냅니다.

- **네모 박스가 아니라 사이드바 자체의 여백을 뚫고 나가는 방식(v2에서 그대로 유지)**:
  `.sidebar-sea`는 사이드바의 좌우/아래 padding만큼 음수 마진(`margin: 0 -56px -68px -56px`)을
  줘서, 카드처럼 떠 있지 않고 사이드바의 진짜 가장자리까지 색이 이어지게 만듭니다.
- **깊이감 있는 세로 그라데이션**: `.sidebar-sea`의 배경 자체가 위(밝은 청록, 빛이 들어오는
  수면 쪽)에서 아래(짙은 남색, 깊은 바다)로 이어지는 6단계 그라데이션입니다. 위쪽 가장자리에는
  흰색 inset 그림자를 살짝 얹어서 수면 근처가 빛을 받아 밝아 보이는 유리질/투명감을 더했습니다.
- **비스듬한 빛줄기(`::before`)**: `repeating-linear-gradient`로 대각선 줄무늬를 만들고
  `mix-blend-mode: screen`으로 그 위에 얹어서, 빛이 물을 투과해 비스듬히 내려오는 것처럼
  보이게 합니다. `background-position`을 대각선 방향으로 천천히 흘려서(17초 주기) 빛이
  흔들리는(찰랑거리는) 느낌을 줍니다.
- **떠오르는 잔거품(`::after`)**: 작은 원형 `radial-gradient` 여러 개를 한 타일에 흩뿌려 놓고
  세로 방향으로 반복(`repeat-y`)한 뒤, `background-position-y`를 위쪽으로 계속 흘려서(8초 주기
  loop) 기포가 끊임없이 수면 쪽으로 떠오르는 것처럼 보이게 합니다.
- 두 레이어 모두 `mix-blend-mode: screen`이라 짙은 배경 위에서만 밝게 겹쳐 보이고,
  `sidebar-footer`(저작권 문구)는 `z-index: 1`이라 항상 그 위에 또렷하게 남습니다.
- 모바일(900px 이하, 가로 아이콘 바 형태)에서는 공간이 없어서 숨겨지고(이때 저작권 문구도
  함께 안 보임 — 원래도 모바일에서는 숨기던 요소라 동작 차이 없음).
- "동작 줄이기(prefers-reduced-motion)" 설정에서는 빛줄기·기포 애니메이션이 멈추고 정지된
  그라데이션만 보입니다.
- 색이나 속도, 기포 개수를 바꾸고 싶으면 `.sidebar-sea`의 `background`(세로 그라데이션 색상
  단계)와 `::before`(빛줄기 각도·간격)/`::after`(기포 위치·크기)의 `background-image`·
  `animation` 값을 고치면 됩니다.

## 디자인(색상·크기) 바꾸기

`assets/css/style.css` 맨 위 `:root` 안의 변수만 바꾸면 전체 사이트에 반영됩니다.
- `--accent-start`, `--accent-end`: 포인트 그라데이션 색
- `--sidebar-w`: 왼쪽 사이드바 너비(PC 화면 기준)

## 배포

1. GitHub 저장소(`miku-tenshi/miku-tenshi.github.io`) 웹 페이지에서 이 폴더 안의 파일들을 그대로 업로드하거나,
2. 로컬에서 `git clone` 받은 뒤 파일을 얹고 `git push`합니다.

GitHub Pages는 이미 켜져 있어서 별도 설정 없이 몇 분 안에 `https://miku-tenshi.github.io/`에 반영됩니다.
