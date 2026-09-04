const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');

function read(name) { return fs.readFileSync(path.join(root, name), 'utf8'); }

test('핵심 교육 파일이 모두 존재한다', () => {
  for (const file of ['index.html','styles.css','app.js','worksheet.html','worksheet.js','lab.html','lab-samples/README.md','facilitator-guide.html','materials.css','research/sources.md','README.md','start.sh']) {
    assert.ok(fs.statSync(path.join(root, file)).size > 0, file);
  }
});

test('슬라이드는 28개이고 번호가 연속이다', () => {
  const html = read('index.html');
  const slides = [...html.matchAll(/<section class="slide(?: [^"]*)?"[^>]*data-title=/g)];
  assert.equal(slides.length, 28);
  for (let i = 1; i <= 28; i++) assert.ok(html.includes(`<div class="slide-number">${String(i).padStart(2,'0')}</div>`), `slide ${i}`);
});

test('필수 개념과 공식 출처가 포함된다', () => {
  const content = read('index.html') + read('research/sources.md');
  for (const marker of ['샌드박스','프롬프트 인젝션','Human-in-the-loop','MCP','최소 권한','OWASP','NIST','Anthropic','OpenAI']) assert.ok(content.includes(marker), marker);
});

test('슬라이드와 워크시트 링크 대상이 유효하다', () => {
  const html = read('index.html') + read('worksheet.html') + read('facilitator-guide.html');
  for (const target of ['styles.css','app.js','worksheet.html','lab.html','facilitator-guide.html','materials.css','worksheet.js','research/sources.md']) {
    assert.ok(html.includes(target), target);
    assert.ok(fs.existsSync(path.join(root, target)), target);
  }
});

test('안전 고지와 외부 행동 승인 원칙이 있다', () => {
  const worksheet = read('worksheet.html');
  const guide = read('facilitator-guide.html');
  assert.match(worksheet, /API 키/);
  assert.match(worksheet, /메일·메시지 발송/);
  assert.match(guide, /발송, 삭제, 결제는 하지 않음/);
});
