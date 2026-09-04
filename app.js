(() => {
  'use strict';
  const slides = [...document.querySelectorAll('.slide')];
  const moduleChip = document.getElementById('moduleChip');
  const currentNumber = document.getElementById('currentNumber');
  const totalNumber = document.getElementById('totalNumber');
  const progressBar = document.getElementById('progressBar');
  const progressTrack = document.getElementById('progressTrack');
  const overviewDialog = document.getElementById('overviewDialog');
  const overviewGrid = document.getElementById('overviewGrid');
  const key = 'agent-class-slide-v1';
  let current = Math.max(0, Math.min(slides.length - 1, Number(location.hash.slice(1) || sessionStorage.getItem(key) || 1) - 1));

  totalNumber.textContent = String(slides.length).padStart(2, '0');
  progressTrack.setAttribute('aria-valuemax', String(slides.length));

  function show(index, updateHash = true) {
    current = Math.max(0, Math.min(slides.length - 1, index));
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === current);
      slide.setAttribute('aria-hidden', i === current ? 'false' : 'true');
    });
    const slide = slides[current];
    moduleChip.textContent = slide.dataset.module || 'CLASS';
    currentNumber.textContent = String(current + 1).padStart(2, '0');
    progressBar.style.width = `${((current + 1) / slides.length) * 100}%`;
    progressTrack.setAttribute('aria-valuenow', String(current + 1));
    document.title = `${String(current + 1).padStart(2, '0')} · ${slide.dataset.title}`;
    sessionStorage.setItem(key, String(current + 1));
    if (updateHash) history.replaceState(null, '', `#${current + 1}`);
  }
  function next() { show(current + 1); }
  function prev() { show(current - 1); }

  document.getElementById('nextButton').addEventListener('click', next);
  document.getElementById('prevButton').addEventListener('click', prev);
  document.getElementById('fullscreenButton').addEventListener('click', () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
    else document.exitFullscreen?.();
  });

  progressTrack.addEventListener('click', event => {
    const ratio = (event.clientX - progressTrack.getBoundingClientRect().left) / progressTrack.clientWidth;
    show(Math.floor(ratio * slides.length));
  });

  function buildOverview() {
    overviewGrid.innerHTML = slides.map((slide, i) => `<button type="button" data-slide="${i}"><span>${String(i + 1).padStart(2, '0')}</span><b>${slide.dataset.title}</b><small>${slide.dataset.module}</small></button>`).join('');
  }
  function openOverview() { buildOverview(); overviewDialog.showModal(); }
  document.getElementById('overviewButton').addEventListener('click', openOverview);
  document.getElementById('closeOverview').addEventListener('click', () => overviewDialog.close());
  overviewGrid.addEventListener('click', event => {
    const button = event.target.closest('[data-slide]');
    if (!button) return;
    overviewDialog.close(); show(Number(button.dataset.slide));
  });

  document.addEventListener('keydown', event => {
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;
    if (event.key === 'ArrowRight' || event.key === 'PageDown' || event.key === ' ') { event.preventDefault(); next(); }
    if (event.key === 'ArrowLeft' || event.key === 'PageUp') { event.preventDefault(); prev(); }
    if (event.key === 'Home') { event.preventDefault(); show(0); }
    if (event.key === 'End') { event.preventDefault(); show(slides.length - 1); }
    if (event.key.toLowerCase() === 'o') openOverview();
    if (event.key.toLowerCase() === 'f') document.getElementById('fullscreenButton').click();
  });
  window.addEventListener('hashchange', () => {
    const index = Number(location.hash.slice(1));
    if (Number.isInteger(index) && index > 0) show(index - 1, false);
  });

  const delegationInput = document.getElementById('delegationInput');
  const savedDelegation = localStorage.getItem('agent-class-delegation');
  if (savedDelegation) delegationInput.value = savedDelegation;
  document.getElementById('saveDelegation').addEventListener('click', () => {
    const value = delegationInput.value.trim();
    localStorage.setItem('agent-class-delegation', value);
    document.getElementById('delegationSaved').textContent = value ? '저장했습니다. 워크시트를 열면 이 내용이 자동으로 들어갑니다.' : '먼저 맡겨보고 싶은 일을 적어 주세요.';
  });

  const autonomyCopy = [
    ['답변만', 'AI가 정보를 설명하거나 초안을 만들지만 아무 행동도 하지 않습니다.'],
    ['제안', 'AI가 계획과 초안을 만들고, 사용자가 직접 실행합니다.'],
    ['승인 후 실행', 'AI가 도구 실행을 준비하고, 중요한 단계마다 사용자의 승인을 받습니다.'],
    ['제한적 자동 실행', '정한 폴더, 사이트, 시간 안에서 위험이 낮은 작업을 자동으로 실행합니다.'],
    ['고자율', '여러 단계를 장시간 자동으로 실행합니다. 별도 작업 환경과 계속 확인할 수 있는 기록이 필요합니다.']
  ];
  const autonomyRange = document.getElementById('autonomyRange');
  function renderAutonomy() {
    const [title, description] = autonomyCopy[Number(autonomyRange.value)];
    document.getElementById('autonomyResult').innerHTML = `<b>${title}</b><p>${description}</p>`;
    autonomyRange.style.setProperty('--range', `${Number(autonomyRange.value) * 25}%`);
  }
  autonomyRange.addEventListener('input', renderAutonomy);
  renderAutonomy();

  const sandboxInputs = ['readScope', 'writeScope', 'networkScope', 'approvalScope'].map(id => document.getElementById(id));
  function renderDeclaration() {
    const [read, write, network, approval] = sandboxInputs.map(input => input.value.trim() || '미정');
    document.getElementById('sandboxDeclaration').innerHTML = `이 에이전트는 <b>${escapeHtml(read)}</b>를 읽고 <b>${escapeHtml(write)}</b>만 수정할 수 있습니다. 접속할 수 있는 사이트는 <b>${escapeHtml(network)}</b>로 제한합니다. <b>${escapeHtml(approval)}</b> 전에는 사용자에게 확인합니다.`;
  }
  sandboxInputs.forEach(input => input.addEventListener('input', renderDeclaration));

  document.querySelectorAll('.quiz').forEach(quiz => {
    quiz.addEventListener('click', event => {
      const button = event.target.closest('[data-answer]');
      if (!button) return;
      quiz.querySelectorAll('button').forEach(item => item.classList.remove('correct', 'wrong'));
      const correct = button.dataset.answer === quiz.dataset.correct;
      button.classList.add(correct ? 'correct' : 'wrong');
      quiz.querySelector('.quiz-feedback').textContent = correct
        ? '맞습니다. 실제로 초대장을 보내기 전에 수신자, 내용, 발송 시간을 확인해야 합니다.'
        : '초대장을 보내면 거래처에 바로 영향을 줍니다. 발송 전에 확인하는 항목을 골라보세요.';
    });
  });

  document.querySelectorAll('.checklist-grid input').forEach((input, index) => {
    input.checked = localStorage.getItem(`agent-check-${index}`) === '1';
    input.addEventListener('change', () => localStorage.setItem(`agent-check-${index}`, input.checked ? '1' : '0'));
  });

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  }

  show(current, false);
})();
