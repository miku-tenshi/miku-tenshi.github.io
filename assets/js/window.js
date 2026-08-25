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


// 마우스 효과
(function () {
  // 같은 코드가 중복 실행되는 것을 방지
  if (window.cursorSparkleInitialized) return;
  window.cursorSparkleInitialized = true;

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
