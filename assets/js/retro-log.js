// miku-tenshi.github.io — 저장/삭제처럼 GitHub API를 부르는 동안 보여주는 공용 진행 표시.
//
// 예전에는 "posts.json 최신 상태 확인 중...", "study/db/... 저장 중..." 처럼 각 단계마다
// 링크/경로가 섞인 안내 문구를 줄줄이 쌓아서 보여줬는데, 사용자가 "그런 텍스트 나열 말고
// 레트로 글씨로 loading [|||||||] 느낌으로, 끝나면 complete 하나만 남기고 다 지워달라"고
// 요청해서 만든 공용 컴포넌트. write/notes 등 GitHub에 저장·삭제하는 모든 곳에서 재사용한다.
//
// 사용법:
//   const rl = RetroLog.start(logEl, '저장 중');
//   ... 실제 작업 ...
//   rl.done();              // -> "> complete_" 한 줄만 남기고 정리
//   rl.fail('에러 메시지');  // -> "> error: 에러 메시지" 한 줄만 남기고 정리
//
// logEl은 CSS로 .status-log 같은 빈 박스 역할만 하면 되고, 내부 내용은 이 스크립트가
// 전부 그린다(중간 진행 문구를 개별적으로 append하지 않는다 — 그래서 "링크가 계속 쌓이는"
// 느낌 대신 로딩 바 하나만 움직이다가 끝에는 complete 한 줄만 남는다).
(function () {
  'use strict';

  const BAR_WIDTH = 10;

  function start(logEl, label) {
    if (!logEl) return { done: function () {}, fail: function () {} };
    logEl.classList.add('retro-log');
    logEl.innerHTML = '';

    const line = document.createElement('div');
    line.className = 'retro-loading';
    line.innerHTML =
      '<span class="retro-caret">&gt;</span> ' +
      '<span class="retro-label">' + (label || 'loading') + '</span> ' +
      '<span class="retro-bar"></span>';
    logEl.appendChild(line);

    const barEl = line.querySelector('.retro-bar');
    let pos = 0;
    const timer = setInterval(function () {
      let cells = '';
      for (let i = 0; i < BAR_WIDTH; i++) {
        // 진행률을 알 수 없는(indeterminate) 작업이라, 채워진 칸 하나가 좌우로
        // 오가면서 "움직이고 있다"는 것만 보여준다 — 8비트 게임 로딩 화면 느낌.
        const bounce = Math.abs((pos % ((BAR_WIDTH - 1) * 2)) - (BAR_WIDTH - 1));
        cells += i === bounce ? '#' : '-';
      }
      barEl.textContent = '[' + cells + ']';
      pos++;
    }, 110);

    let finished = false;
    function finish(render) {
      if (finished) return;
      finished = true;
      clearInterval(timer);
      logEl.innerHTML = '';
      logEl.appendChild(render());
    }

    return {
      // detailHtml(선택): 완료 후 결과 링크처럼 남겨두고 싶은 정보가 있을 때만 쓴다.
      // 진행 중 쌓이던 "...확인 중 / ...저장 중" 같은 단계별 문구는 전부 지워지고,
      // 이 detail 한 줄만 complete 아래에 조용히 남는다.
      done: function (label2, detailHtml) {
        finish(function () {
          const wrap = document.createElement('div');
          const el = document.createElement('div');
          el.className = 'retro-complete';
          el.textContent = (label2 || 'complete') + '_';
          wrap.appendChild(el);
          if (detailHtml) {
            const detail = document.createElement('div');
            detail.className = 'retro-detail';
            detail.innerHTML = detailHtml;
            wrap.appendChild(detail);
          }
          return wrap;
        });
      },
      fail: function (message) {
        finish(function () {
          const el = document.createElement('div');
          el.className = 'retro-error';
          el.textContent = 'error: ' + (message || '실패했어요');
          return el;
        });
      }
    };
  }

  window.RetroLog = { start: start };
})();
