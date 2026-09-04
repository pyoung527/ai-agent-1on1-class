# AI 에이전트 1:1 교육 — 조사 노트

조사일: 2026-09-04 (KST)

## 수업에 반영한 핵심 근거

1. **워크플로와 에이전트의 구분**
   - Anthropic은 워크플로를 미리 정한 코드 경로로 LLM과 도구가 오케스트레이션되는 시스템, 에이전트를 LLM이 자신의 과정과 도구 사용을 동적으로 결정하는 시스템으로 구분한다.
   - 복잡한 프레임워크보다 단순하고 조합 가능한 패턴부터 시작하고, 복잡성이 실제 결과를 개선할 때만 추가하라고 권고한다.

2. **에이전트의 기본 구성**
   - OpenAI의 실무 가이드는 에이전트를 모델, 도구, 지침을 중심으로 설명하며, 가드레일과 사람의 검토를 실행 흐름에 결합한다.
   - 본 과정에서는 이를 `목표/지침 → 계획 → 도구 → 관찰 → 검증` 루프로 재구성했다.

3. **샌드박싱과 최소 권한**
   - OpenAI Codex 권한 문서는 로컬 명령에 최소 권한 경계를 적용하는 permission profile을 설명한다.
   - Anthropic Claude Code 보안 문서는 파일시스템과 네트워크 격리를 포함한 bash 샌드박싱을 설명한다.
   - Docker Sandboxes는 하이퍼바이저, 네트워크, 엔진, 작업공간, 자격증명 프록시 등 여러 격리 계층을 소개한다.
   - 교육에서는 구현 제품에 종속되지 않도록 `파일·네트워크·프로세스·자격증명·시간/비용`의 다섯 경계로 일반화했다.

4. **프롬프트 인젝션과 과도한 자율성**
   - OWASP LLM01은 사용자 또는 외부 콘텐츠가 모델의 행동을 의도치 않게 변경하는 직접/간접 프롬프트 인젝션을 주요 위험으로 다룬다.
   - OWASP LLM06은 에이전트에 과도한 기능·권한·자율성을 부여하는 문제를 다루며, 고영향 행동 전 사용자 승인을 포함한 Human-in-the-loop를 권고한다.

5. **MCP의 역할**
   - MCP는 AI 애플리케이션을 외부 시스템과 연결하는 개방형 표준이다. 호스트-클라이언트-서버 구조에서 서버가 도구, 리소스, 프롬프트 같은 기능을 제공한다.
   - MCP는 연결 표준이지 자동으로 신뢰를 보장하는 보안 인증서가 아니다. 연결된 도구에도 최소 권한·승인·로깅이 필요하다.

6. **위험관리와 검증**
   - NIST AI RMF와 GenAI Profile의 취지는 생성형 AI 위험을 조직의 목적과 맥락에 맞춰 식별·측정·관리하는 것이다.
   - 개인 활용에서도 실행 전 기준, 실행 중 기록, 실행 후 결과 검증을 하나의 운영 루프로 가르친다.

## 공식 출처

- OpenAI, *A practical guide to building AI agents*  
  https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/
- OpenAI, *Guardrails and human review*  
  https://developers.openai.com/api/docs/guides/agents/guardrails-approvals
- OpenAI, *Codex permissions*  
  https://developers.openai.com/codex/permissions
- Anthropic, *Building effective agents* (2024-12-19)  
  https://www.anthropic.com/engineering/building-effective-agents
- Anthropic, *Claude Code security*  
  https://docs.anthropic.com/en/docs/claude-code/security
- OWASP, *LLM01:2025 Prompt Injection*  
  https://genai.owasp.org/llmrisk/llm01-prompt-injection/
- OWASP, *LLM06:2025 Excessive Agency*  
  https://genai.owasp.org/llmrisk/llm062025-excessive-agency/
- NIST, *AI RMF Generative AI Profile (NIST AI 600-1)*  
  https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence
- Model Context Protocol, *Architecture*  
  https://modelcontextprotocol.io/docs/learn/architecture
- Model Context Protocol, *Security Best Practices (2025-11-25)*  
  https://modelcontextprotocol.io/docs/2025-11-25/tutorials/security/security_best_practices
- Docker Docs, *Sandbox isolation layers*  
  https://docs.docker.com/ai/sandboxes/security/isolation/

## 표현상 주의

- “실시간”, “완전 자율”, “안전 보장” 같은 절대 표현을 피한다.
- 에이전트의 결과는 초안 또는 실행 제안으로 취급하고, 영향이 큰 행동은 사람이 승인한다.
- 특정 제품의 샌드박스가 모든 위협을 제거한다고 설명하지 않는다.
