// miku-tenshi.github.io — shared behaviour
// 창(window) 카드를 클릭하면 전체화면으로 포커스되는 인터랙션.
// 모든 페이지가 이 스크립트 하나를 공유합니다.

(function () {
  const win = document.getElementById('window');
  const backdrop = document.getElementById('backdrop');
  if (!win || !backdrop) return;

  // 전체화면 크기는 현재 뷰포트의 실제 픽셀 값으로 계산합니다.
  // vw/vh/% 대신 이렇게 하면 스크롤바 유무에 따른 오차 없이
  // 여백이 항상 정확하게 유지됩니다.
  function applyFullscreenSize() {
    const margin = Math.max(28, Math.round(Math.min(window.innerWidth, window.innerHeight) * 0.06));
    win.style.top = margin + 'px';
    win.style.left = margin + 'px';
    win.style.width = (window.innerWidth - margin * 2) + 'px';
    win.style.height = (window.innerHeight - margin * 2) + 'px';
  }

  function enterFocus() {
    win.classList.add('is-fullscreen');
    applyFullscreenSize();
    backdrop.classList.add('show');
    document.body.style.overflow = 'hidden';
    window.addEventListener('resize', applyFullscreenSize);
    window.focus();
    document.body.setAttribute('tabindex', '-1');
    document.body.focus({ preventScroll: true });
  }

  function exitFocus() {
    win.classList.remove('is-fullscreen');
    win.style.top = '';
    win.style.left = '';
    win.style.width = '';
    win.style.height = '';
    backdrop.classList.remove('show');
    document.body.style.overflow = '';
    window.removeEventListener('resize', applyFullscreenSize);
  }

  win.addEventListener('click', (e) => {
    if (win.classList.contains('is-fullscreen')) return;
    // 링크(폴더/파일 이동)를 눌렀을 때는 전체화면으로 들어가지 않고
    // 그대로 이동하게 둡니다.
    if (e.target.closest('a')) return;
    enterFocus();
  });

  // 점 세 개가 전체화면 상태에서는 닫기 버튼 역할을 합니다.
  document.querySelectorAll('.chrome-dots').forEach((dots) => {
    dots.addEventListener('click', (e) => {
      if (win.classList.contains('is-fullscreen')) {
        e.stopPropagation();
        exitFocus();
      }
    });
  });

  backdrop.addEventListener('click', exitFocus);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') exitFocus();
  });
})();
