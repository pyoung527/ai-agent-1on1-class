(() => {
  'use strict';
  const key = 'agent-class-worksheet-v1';
  const fields = [...document.querySelectorAll('[data-field]')];
  let saveTimer;

  function collect() {
    return Object.fromEntries(fields.map(field => [field.dataset.field, field.type === 'checkbox' ? field.checked : field.value]));
  }
  function restore() {
    try {
      const saved = JSON.parse(localStorage.getItem(key) || '{}');
      fields.forEach(field => {
        if (!(field.dataset.field in saved)) return;
        if (field.type === 'checkbox') field.checked = Boolean(saved[field.dataset.field]);
        else field.value = saved[field.dataset.field];
      });
      const delegated = localStorage.getItem('agent-class-delegation');
      const task = document.querySelector('[data-field="task"]');
      if (!task.value && delegated) task.value = delegated;
    } catch (_) { /* invalid local data: leave blank */ }
  }
  function save() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => localStorage.setItem(key, JSON.stringify(collect())), 150);
  }
  function text(value, fallback) { return String(value || '').trim() || fallback; }
  function renderContract() {
    const d = collect();
    const task = text(d.task, '[목표 업무]');
    const what = text(d.what, '[완료 기준]');
    const how = text(d.how, '[사용할 자료·도구·순서]');
    const when = text(d.when, '[시간·반복 한도]');
    const where = text(d.where, '[작업 공간]');
    const approval = [
      `기존 파일 변경: ${d.policyEdit || '승인 필요'}`,
      `외부 발송: ${d.policySend || '승인 필요'}`,
      `삭제·결제·공개: ${d.policyImpact || '차단'}`
    ].join(', ');
    const verification = text(d.verification, '[검증 방법]');
    const recovery = text(d.recovery, '[복구 방법]');
    const contract = `다음 작업을 해 주세요: ${task}\n\n완료 기준: ${what}\n작업 방법: ${how}\n작업 범위: ${where}\n시간과 반복 한도: ${when}\n권한 설정: ${approval}\n결과 확인: ${verification}\n문제가 생겼을 때: ${recovery}`;
    document.getElementById('generatedContract').textContent = contract;
  }
  function update() { renderContract(); save(); }

  fields.forEach(field => {
    field.addEventListener('input', update);
    field.addEventListener('change', update);
  });
  document.getElementById('printWorksheet').addEventListener('click', () => window.print());
  document.getElementById('copyContract').addEventListener('click', async () => {
    const value = document.getElementById('generatedContract').textContent;
    try { await navigator.clipboard.writeText(value); document.getElementById('copyStatus').textContent = '복사했습니다.'; }
    catch (_) { document.getElementById('copyStatus').textContent = '브라우저에서 텍스트를 직접 선택해 복사해 주세요.'; }
  });
  document.getElementById('exportWorksheet').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(collect(), null, 2)], { type: 'application/json' });
    const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = 'ai-agent-task-plan.json'; link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  });
  document.getElementById('resetWorksheet').addEventListener('click', () => {
    if (!confirm('작성한 워크시트를 모두 초기화할까요?')) return;
    localStorage.removeItem(key); fields.forEach(field => { if (field.type === 'checkbox') field.checked = false; else field.value = ''; }); renderContract();
  });

  restore(); renderContract();
})();
