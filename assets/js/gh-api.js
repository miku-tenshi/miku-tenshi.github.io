// miku-tenshi.github.io — GitHub Contents API 공용 헬퍼
//
// private/ 아래 도구들(write, notes/memo 등)이 저장소에 파일을 읽고 쓸 때
// 공통으로 쓰는 함수 모음입니다. window.GhApi 로 노출됩니다.
//
// 인증 토큰은 /private/ 에서 한 번 인증할 때 sessionStorage(mt-private-access)에
// 저장되고, GhApi.buildCfgFromSession()이 그 값을 그대로 재사용합니다 — 도구마다
// 따로 로그인 화면을 만들 필요가 없습니다.

window.GhApi = (function () {
  'use strict';

  var SESSION_KEY = 'mt-private-access';

  function authHeaders(token) {
    return {
      'Authorization': 'Bearer ' + token,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    };
  }

  function b64EncodeUnicode(str) {
    var bytes = new TextEncoder().encode(str);
    var binary = '';
    bytes.forEach(function (b) { binary += String.fromCharCode(b); });
    return btoa(binary);
  }

  function b64DecodeUnicode(b64) {
    var binary = atob(b64.replace(/\n/g, ''));
    var bytes = Uint8Array.from(binary, function (c) { return c.charCodeAt(0); });
    return new TextDecoder('utf-8').decode(bytes);
  }

  function encodePath(path) {
    return path.split('/').map(encodeURIComponent).join('/');
  }

  async function ghGetFile(cfg, path) {
    var url = 'https://api.github.com/repos/' + cfg.owner + '/' + cfg.repo + '/contents/' + encodePath(path) + '?ref=' + encodeURIComponent(cfg.branch);
    var res = await fetch(url, { headers: authHeaders(cfg.token) });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error('GET ' + path + ' 실패 (' + res.status + '): ' + (await res.text()));
    var json = await res.json();
    return { sha: json.sha, content: b64DecodeUnicode(json.content) };
  }

  async function ghPutFile(cfg, path, content, message, sha) {
    var url = 'https://api.github.com/repos/' + cfg.owner + '/' + cfg.repo + '/contents/' + encodePath(path);
    var body = { message: message, content: b64EncodeUnicode(content), branch: cfg.branch };
    if (sha) body.sha = sha;
    var res = await fetch(url, { method: 'PUT', headers: Object.assign({ 'Content-Type': 'application/json' }, authHeaders(cfg.token)), body: JSON.stringify(body) });
    if (!res.ok) throw new Error('PUT ' + path + ' 실패 (' + res.status + '): ' + (await res.text()));
    return res.json();
  }

  async function ghDeleteFile(cfg, path, sha, message) {
    var url = 'https://api.github.com/repos/' + cfg.owner + '/' + cfg.repo + '/contents/' + encodePath(path);
    var res = await fetch(url, {
      method: 'DELETE',
      headers: Object.assign({ 'Content-Type': 'application/json' }, authHeaders(cfg.token)),
      body: JSON.stringify({ message: message, sha: sha, branch: cfg.branch })
    });
    if (!res.ok) throw new Error('DELETE ' + path + ' 실패 (' + res.status + '): ' + (await res.text()));
    return res.json();
  }

  // /private/ 에서 이미 인증된 세션을 그대로 읽어옵니다 (별도 로그인 불필요).
  function getPrivateSession() {
    try {
      var data = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null');
      if (!data || !data.token) return null;
      return data;
    } catch (error) {
      return null;
    }
  }

  function buildCfgFromSession(owner, repo, branch) {
    var session = getPrivateSession();
    if (!session) return null;
    return { owner: owner, repo: repo, branch: branch || 'main', token: session.token };
  }

  return {
    authHeaders: authHeaders,
    b64EncodeUnicode: b64EncodeUnicode,
    b64DecodeUnicode: b64DecodeUnicode,
    encodePath: encodePath,
    ghGetFile: ghGetFile,
    ghPutFile: ghPutFile,
    ghDeleteFile: ghDeleteFile,
    getPrivateSession: getPrivateSession,
    buildCfgFromSession: buildCfgFromSession
  };
})();
