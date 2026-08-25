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
  // 같은 조건(모바일 화면 폭 / prefers-reduced-motion)일 때 기본 커서를 되살려둠.
  const isCoarsePointer = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
  const prefersReducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (isCoarsePointer || prefersReducedMotion) return;

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

  document.addEventListener("mousemove", function (event) {
    dot.classList.add("show");
    dot.style.translate = event.clientX + "px " + event.clientY + "px";
  });
  document.addEventListener("mousedown", function () { dot.classList.add("click"); });
  document.addEventListener("mouseup", function () { dot.classList.remove("click"); });
  document.addEventListener("mouseleave", function () { dot.classList.remove("show"); });
  document.addEventListener("mouseenter", function () { dot.classList.add("show"); });

  // ---- 반짝이 잔상 ----
  const sparkles = ["✦", "✧", "⋆", "·"];

  const colors = [
    "#39c5bb",
    "#67e8f9",
    "#60a5fa",
    "#ffffff"
  ];

  let lastTime = 0;

  document.addEventListener("mousemove", function (event) {
    const now = Date.now();

    if (now - lastTime < 45) return;
    lastTime = now;

    const sparkle = document.createElement("span");

    sparkle.className = "cursor-sparkle";

    sparkle.textContent =
      sparkles[Math.floor(Math.random() * sparkles.length)];

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
