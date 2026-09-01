// miku-tenshi.github.io — shared behaviour
// 창(window) 카드를 클릭하면 전체화면으로 포커스되는 인터랙션.
// 모든 페이지가 이 스크립트 하나를 공유합니다. 페이지 하나에 window 카드가
// 여러 개 있어도(예: 홈의 "최근 글" 카드) 각자 독립적으로 동작합니다.
// data-no-autofocus 속성이 붙은 .window는 이 스크립트가 건드리지 않습니다
// (write/ 페이지의 게이트/글쓰기 창처럼 자체 전체화면 로직을 쓰는 경우).

(function () {
  const backdrop = document.getElementById('backdrop');
  const windows = Array.prototype.filter.call(
    document.querySelectorAll('.window'),
    (w) => !w.hasAttribute('data-no-autofocus')
  );
  if (!windows.length || !backdrop) return;

  // 전체화면 크기는 현재 뷰포트의 실제 픽셀 값으로 계산합니다.
  // vw/vh/% 대신 이렇게 하면 스크롤바 유무에 따른 오차 없이
  // 여백이 항상 정확하게 유지됩니다.
  function applyFullscreenSize(win) {
    const margin = Math.max(28, Math.round(Math.min(window.innerWidth, window.innerHeight) * 0.06));
    win.style.top = margin + 'px';
    win.style.left = margin + 'px';
    win.style.width = (window.innerWidth - margin * 2) + 'px';
    win.style.height = (window.innerHeight - margin * 2) + 'px';
  }

  function makeResizeHandler(win) {
    return () => applyFullscreenSize(win);
  }

  function enterFocus(win) {
    const onResize = makeResizeHandler(win);
    win.__mtOnResize = onResize;
    win.classList.add('is-fullscreen');
    applyFullscreenSize(win);
    backdrop.classList.add('show');
    document.body.style.overflow = 'hidden';
    window.addEventListener('resize', onResize);
    window.focus();
    document.body.setAttribute('tabindex', '-1');
    document.body.focus({ preventScroll: true });
  }

  function exitFocus(win) {
    win.classList.remove('is-fullscreen');
    win.style.top = '';
    win.style.left = '';
    win.style.width = '';
    win.style.height = '';
    backdrop.classList.remove('show');
    document.body.style.overflow = '';
    if (win.__mtOnResize) window.removeEventListener('resize', win.__mtOnResize);
  }

  function exitAll() {
    windows.forEach((win) => { if (win.classList.contains('is-fullscreen')) exitFocus(win); });
  }

  windows.forEach((win) => {
    win.addEventListener('click', (e) => {
      if (win.classList.contains('is-fullscreen')) return;
      // 링크(폴더/파일 이동)나 버튼(페이지 번호 등)을 눌렀을 때는
      // 전체화면으로 들어가지 않고 그대로 동작하게 둡니다.
      if (e.target.closest('a, button')) return;
      enterFocus(win);
    });

    // 점 세 개가 전체화면 상태에서는 닫기 버튼 역할을 합니다.
    win.querySelectorAll('.chrome-dots').forEach((dots) => {
      dots.addEventListener('click', (e) => {
        if (win.classList.contains('is-fullscreen')) {
          e.stopPropagation();
          exitFocus(win);
        }
      });
    });
  });

  backdrop.addEventListener('click', exitAll);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') exitAll();
  });
})();


// 마우스 효과 — 기본 마우스 포인터는 숨기고(style.css의 cursor:none),
// 그 대신 마우스를 따라다니는 반짝이는 커서 점 + 반짝이(sparkle) 잔상으로 대체합니다.
(function () {
  // 같은 코드가 중복 실행되는 것을 방지
  if (window.cursorSparkleInitialized) return;
  window.cursorSparkleInitialized = true;

  // 터치 기기(마우스 없음)에서는 커스텀 커서를 만들지 않음 — style.css에서도
  // 같은 조건(모바일 화면 폭)일 때 기본 커서를 되살려둠.
  // 2026-09-01: 원래는 prefers-reduced-motion(OS/브라우저의 "동작 줄이기"
  // 설정)이 켜져 있으면 이 커서 반짝임 효과 자체를 통째로 껐었는데,
  // 사용자가 "커서 효과가 사라졌다"고 신고해서 조사해보니 실제 원인이
  // 바로 이 분기였음(Playwright로 재현: reduced-motion 컨텍스트에서 커서
  // 엘리먼트 자체가 생성 안 됨). 사용자에게 "동작 줄이기 설정과 무관하게
  // 항상 켜지게 해달라"는 요청을 받아 이 조건에서 prefersReducedMotion을
  // 뺌 — 이 커서 반짝임은 큰 화면 전체를 흔드는 모션이 아니라 작은 점
  // 하나가 부드럽게 따라다니는 장식 정도라 판단. 성운/별/콘솔 테두리 발광
  // 같은 더 큰 배경 애니메이션들은 여전히 prefers-reduced-motion을 존중함
  // (assets/css/style.css의 다른 @media (prefers-reduced-motion: reduce)
  // 블록들 — 이번에 손댄 건 커서(아래)와 사이드바 궤도 링(orbit ring,
  // style.css) 딱 2곳뿐).
  const isCoarsePointer = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
  if (isCoarsePointer) return;

  // ---- 마우스를 따라다니는 커서 점 ----
  const dot = document.createElement("div");
  dot.className = "custom-cursor";
  // 위치는 반드시 개별 CSS 속성인 translate로 지정한다(transform 축약 속성이 아님) —
  // 이유: 클릭 시 .click 클래스가 별도의 개별 속성인 scale을 건다(style.css 참고). CSS는
  // translate/rotate/scale(개별 속성)와 transform(축약 속성)을 "translate → rotate → scale →
  // transform" 순서로 합성하는데, 이 순서에서 transform 축약 속성은 제일 먼저(안쪽에서)
  // 적용되고 scale은 그 다음(바깥쪽)에 적용된다. 그래서 위치를 transform으로 잡아두면, 클릭할
  // 때 scale(0.65)이 그 위치 값 자체를 0.65배로 줄여버려서(원점=뷰포트 좌상단 기준) 커서가
  // 화면 왼쪽 위 방향으로 확 튀어 보이는 버그가 있었다(클릭할 때마다 "먼 곳으로 튀는" 원인).
  // translate를 개별 속성으로 쓰면 순서상 가장 바깥(마지막)에 적용되어 scale의 영향을 받지
  // 않으므로, 클릭해도 위치가 절대 흔들리지 않는다.
  // 첫 mousemove가 오기 전까지는 화면 밖에 둔다(opacity:0이라 어차피 안 보이지만,
  // 혹시 모를 깜빡임까지 방지하는 안전장치).
  dot.style.translate = "-9999px -9999px";
  document.body.appendChild(dot);

  // 2026-08-31 (커서 버벅임 대응): "마우스는 잘 따라다니는데 노트북에서
  // 손가락(트랙패드)으로 움직이면 커서가 느리고 버벅인다"는 리포트 조사—
  // 원래는 mousemove가 올 때마다 그 좌표로 즉시 스냅(순간 이동)시켰는데,
  // 이 방식은 매 프레임 화면이 원활하게 그려질 때는 문제없지만, 화면 배경
  // 애니메이션(우주 배경 등, 위 console-frame.js 쪽 최적화 참고)이 메인
  // 스레드를 많이 잡아먹는 순간엔 mousemove 이벤트와 실제 화면 반영(paint)
  // 사이 간격이 벌어져서 "뚝뚝 끊기며 순간이동"하는 것처럼 보였다(트랙패드는
  // 마우스보다 이동이 느리고 연속적이라 이런 끊김이 더 잘 눈에 띔). 이제는
  // mousemove에서 "목표 좌표"만 기록해두고, requestAnimationFrame 루프가
  // 매 프레임 그 목표를 향해 부드럽게 보간(lerp)하며 따라가게 해서, 실제로
  // 그릴 수 있는 프레임이 듬성듬성해도(=이벤트 간격이 넓어도) 그 사이를
  // 매끄럽게 이어 붙여 "쫓아가는" 느낌을 내고 뚝뚝 끊기는 느낌을 줄인다.
  // lerp 계수는 1에 가까울수록 원래처럼 즉각 반응하고, 0에 가까울수록
  // 부드럽지만 느려진다. 처음엔 0.45로 잡았는데, 사용자 피드백("오로라
  // 테마가 아니어도 느려. 커서 속도를 조금만 더 빠르게 해야될 것 같아")을
  // 받고 0.7로 올림 — 잔떨림을 완전히 못 죽이는 대신 목표 좌표를 훨씬
  // 빨리 따라잡아 "느리다"는 느낌을 줄인다.
  var targetX = null, targetY = null, curX = null, curY = null;
  var cursorRaf = null;

  function tickCursor() {
    cursorRaf = null;
    if (targetX === null) return;
    if (curX === null) {
      // 첫 위치는 보간 없이 바로 스냅(화면 구석에서 날아오는 것처럼
      // 보이는 걸 방지 — 기존 "먼 곳에서 튀는" 버그 방지 원칙과 동일).
      curX = targetX;
      curY = targetY;
    } else {
      curX += (targetX - curX) * 0.7;
      curY += (targetY - curY) * 0.7;
    }
    dot.style.translate = curX + "px " + curY + "px";
    // 목표에 충분히 가까워지면(0.05px 미만 차이) 루프를 멈춰 불필요한
    // requestAnimationFrame 예약을 없앤다 — 마우스가 멈추면 이 루프도 같이
    // 멈춘다.
    if (Math.abs(targetX - curX) > 0.05 || Math.abs(targetY - curY) > 0.05) {
      cursorRaf = window.requestAnimationFrame(tickCursor);
    }
  }

  document.addEventListener("mousemove", function (event) {
    dot.classList.add("show");
    targetX = event.clientX;
    targetY = event.clientY;
    if (cursorRaf === null) cursorRaf = window.requestAnimationFrame(tickCursor);
  });
  document.addEventListener("mousedown", function () { dot.classList.add("click"); });
  document.addEventListener("mouseup", function () { dot.classList.remove("click"); });
  document.addEventListener("mouseleave", function () { dot.classList.remove("show"); });
  document.addEventListener("mouseenter", function () { dot.classList.add("show"); });

  // ---- 반짝이 잔상 ----
  const sparkles = ["✦", "✧", "⋆", "·"];

  // 반짝이 색은 더 이상 고정된 민트 계열 배열이 아니라, 지금 활성화된 색상
  // 테마(assets/css/style.css의 --accent-start/--accent-end/--accent-solid,
  // assets/js/sidebar.js가 <html data-theme="...">로 전환)를 그때그때 읽어서
  // 정함 — 테마를 바꾸면 이미 화면에 있는 커서 점(.custom-cursor, CSS의
  // var(--accent-grad))뿐 아니라 새로 생기는 반짝이도 즉시 그 테마의 포인트
  // 색으로 나옴(페이지 새로고침 필요 없음). 흰색은 어느 테마에서나 잘 보이는
  // 중립색이라 그대로 유지.
  function currentAccentColors() {
    const cs = getComputedStyle(document.documentElement);
    const a = cs.getPropertyValue("--accent-start").trim() || "#39c5bb";
    const b = cs.getPropertyValue("--accent-end").trim() || "#55a9e8";
    const c = cs.getPropertyValue("--accent-solid").trim() || "#269fa0";
    return [a, b, c, "#ffffff"];
  }

  let lastTime = 0;

  document.addEventListener("mousemove", function (event) {
    const now = Date.now();

    if (now - lastTime < 45) return;
    lastTime = now;

    const sparkle = document.createElement("span");

    sparkle.className = "cursor-sparkle";

    sparkle.textContent =
      sparkles[Math.floor(Math.random() * sparkles.length)];

    const colors = currentAccentColors();
    sparkle.style.color =
      colors[Math.floor(Math.random() * colors.length)];

    sparkle.style.left = event.clientX + "px";
    sparkle.style.top = event.clientY + "px";

    document.body.appendChild(sparkle);

    setTimeout(function () {
      sparkle.remove();
    }, 700);
  });
})();
