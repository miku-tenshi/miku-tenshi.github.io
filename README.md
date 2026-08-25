# miku-tenshi.github.io

TIL(공부 기록)과 프로젝트를 정리하는 개인 홈페이지입니다. 사이드바 메뉴(Home / Study / Project / Contact)가 곧 실제 폴더이고, 그 폴더 안에 또 다른 폴더가 있을 수 있습니다(예: `study/db/`, `study/frontend/`).

이 파일은 GitHub 저장소 설명용이라 사이트 화면에는 나타나지 않습니다.

## 폴더 구조

```
/
├── index.html                 (Home)
├── assets/css/style.css       (공통 스타일 — 색상, 크기 전부 여기서 관리)
├── assets/js/window.js        (공통 스크립트 — 카드 클릭 시 전체화면 인터랙션)
├── assets/js/marked.umd.js    (마크다운 파서 — /write/ 페이지 전용)
├── assets/img/avatar.jpg      (프로필 사진 — 아래 참고)
├── study/
│   ├── index.html             (Study 폴더 목록)
│   ├── (직속 글).html
│   └── db/, frontend/ ...     (하위 폴더, 필요하면 계속 추가 가능)
├── project/
├── contact/
└── write/index.html           (글쓰기 도구, 아래 참고)
```

## 프로필 사진 바꾸기

`assets/img/avatar.jpg`를 원하는 사진으로 갈아끼우면 사이드바 전체(모든 페이지 공통)에 바로 반영됩니다.
지금 들어있는 파일은 예시로 만들어둔 그라데이션 실루엣 이미지예요. 정사각형에 가까운 사진일수록 잘리는
부분 없이 깔끔하게 나옵니다 (CSS에서 정사각형으로 크롭해서 보여줘요). 파일명을 꼭 `avatar.jpg`로 맞추거나,
다른 이름을 쓰려면 모든 페이지의 `<img src="/assets/img/avatar.jpg">` 부분도 함께 바꿔야 합니다.

## 글쓰기 도구 — `/write/` (추천)

사이드바 메뉴에 있는 **Write**를 누르면 들어갈 수 있는 관리자 전용 페이지예요. GitHub Personal Access
Token으로 저장소에 직접 파일을 커밋합니다.

- **접근 제한**: 페이지에 들어가면 먼저 토큰을 입력해야 해요. 토큰이 유효하고 이 저장소에 쓰기 권한이
  있는지 확인된 뒤에만 글쓰기 도구가 열립니다. 확인에 실패하면 도구 화면 자체가 보이지 않아요.
- **마크다운으로 작성**: 본문은 마크다운 문법(`#`, `**굵게**`, `` `코드` ``, `- 목록`, `> 인용` 등)을 그대로
  씁니다. 실제로 올라갈 때는 미리 변환된 HTML로 저장되기 때문에, 방문자가 보는 페이지 자체는 별도
  라이브러리 없이 가볍게 유지돼요.
- **글쓰기 창도 클릭하면 전체화면**: 본문 입력창을 클릭하면 다른 글 카드들처럼 전체화면으로 펼쳐져서
  집중해서 쓸 수 있어요. 안의 툴바(복사용 코드/미리보기/GitHub에 올리기)는 전체화면에서도 항상 아래에
  붙어있어서 스크롤 없이 바로 쓸 수 있습니다.
- **미리보기**: "미리보기" 버튼을 누르면 페이지 맨 아래에 실제로 게시됐을 때와 똑같은 모습이 나타나요.
- **복사용 코드**: 토큰이 없거나 API 호출이 안 될 때를 대비해서, "복사용 코드" 버튼을 누르면 완성된
  파일 내용과 목록에 추가할 한 줄을 복사할 수 있는 칸이 나타납니다. GitHub 웹 화면에 수동으로 붙여넣어도 돼요.
- 토큰은 이 브라우저에서 GitHub API로만 바로 전송되며 어디에도 저장되지 않습니다 ("이 브라우저에 기억하기"를
  체크한 경우만 localStorage에 저장). 이 저장소 하나에만 쓰기 권한이 있는 Fine-grained PAT를 권장하고,
  만드는 방법은 페이지 안의 "토큰은 어떻게 만드나요?"에 안내되어 있어요.

아래는 이 도구 없이 손으로 직접 파일을 추가하고 싶을 때의 절차입니다.

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

카드(닫힌 상태)에서는 본문이 일정 높이(`window-body`의 `max-height: 60vh`)를 넘으면 카드 안에서만 스크롤됩니다. 카드를 클릭해 전체화면으로 펼치면 화면 전체를 쓰면서 그 안에서 스크롤됩니다 — 사이드바나 배경은 움직이지 않습니다. `study/db/query-tuning-long-example.html`이 이 동작을 보여주는 예시 글입니다. 특별히 글자 수를 신경 쓸 필요 없이, 길게 써도 레이아웃이 깨지지 않습니다.

## 디자인(색상·크기) 바꾸기

`assets/css/style.css` 맨 위 `:root` 안의 변수만 바꾸면 전체 사이트에 반영됩니다.
- `--accent-start`, `--accent-end`: 포인트 그라데이션 색
- `--sidebar-w`: 왼쪽 사이드바 너비

## 배포

1. GitHub 저장소(`miku-tenshi/miku-tenshi.github.io`) 웹 페이지에서 이 폴더 안의 파일들을 그대로 업로드하거나,
2. 로컬에서 `git clone` 받은 뒤 파일을 얹고 `git push`합니다.

GitHub Pages는 이미 켜져 있어서 별도 설정 없이 몇 분 안에 `https://miku-tenshi.github.io/`에 반영됩니다.
