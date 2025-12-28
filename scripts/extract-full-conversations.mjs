import fs from 'fs';
import path from 'path';

const dir = 'C:/Users/kdkim2000/.claude/projects/E--apps-trip-com';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsonl') && !f.startsWith('agent-'));

// 세션별로 대화 정리
const sessions = {};

files.forEach(file => {
  const content = fs.readFileSync(path.join(dir, file), 'utf8');
  const lines = content.split('\n').filter(l => l.trim());

  let sessionSummary = '';
  const sessionId = file.replace('.jsonl', '');

  lines.forEach(line => {
    try {
      const data = JSON.parse(line);

      // 요약 추출
      if (data.type === 'summary' && data.summary) {
        sessionSummary = data.summary;
      }

      // 사용자 메시지 추출
      if (data.type === 'user' && data.message?.content) {
        const content = typeof data.message.content === 'string'
          ? data.message.content
          : '';

        if (content && content.length > 10) {
          if (!sessions[sessionId]) {
            sessions[sessionId] = {
              summary: sessionSummary,
              messages: [],
              timestamp: data.timestamp
            };
          }
          sessions[sessionId].messages.push({
            role: 'user',
            content: content,
            time: data.timestamp
          });
        }
      }

      // 어시스턴트 텍스트 응답 추출
      if (data.type === 'assistant' && data.message?.content) {
        const textContent = data.message.content
          .filter(c => c.type === 'text')
          .map(c => c.text)
          .join('\n');

        if (textContent && textContent.length > 10 && sessions[sessionId]) {
          sessions[sessionId].messages.push({
            role: 'assistant',
            content: textContent,
            time: data.timestamp
          });
        }
      }
    } catch(e) {}
  });
});

// 결과 출력
let output = `# TripGuide 프로젝트 개발 대화 기록

이 문서는 TripGuide 프로젝트 개발 과정에서 이루어진 Claude와의 대화를 정리한 것입니다.

---

## 프로젝트 개요

- **프로젝트명**: TripGuide (여행 가이드 애플리케이션)
- **기술 스택**: Nuxt 3 + Vue 3 + TypeScript + Tailwind CSS + Pinia
- **목적**: 패키지 여행자를 위한 모바일 친화적 일정 관리 및 여행지 가이드 앱

---

## 대화 세션 요약

`;

// 세션별 요약
Object.entries(sessions).forEach(([id, session], idx) => {
  if (session.summary && session.messages.length > 0) {
    output += `### ${idx + 1}. ${session.summary}\n`;
    output += `- 세션 ID: \`${id.substring(0, 8)}...\`\n`;
    output += `- 메시지 수: ${session.messages.length}개\n\n`;
  }
});

output += `\n---\n\n## 주요 개발 작업 상세\n\n`;

// 상세 대화 내용
Object.entries(sessions).forEach(([id, session], idx) => {
  if (session.messages.length > 0) {
    output += `### 세션 ${idx + 1}: ${session.summary || '제목 없음'}\n\n`;

    session.messages.forEach((msg, msgIdx) => {
      if (msg.role === 'user') {
        // 사용자 메시지 (처음 500자만)
        const shortContent = msg.content.length > 500
          ? msg.content.substring(0, 500) + '...'
          : msg.content;
        output += `**사용자 요청 ${msgIdx + 1}:**\n\`\`\`\n${shortContent}\n\`\`\`\n\n`;
      } else {
        // 어시스턴트 응답 (처음 300자만)
        const shortContent = msg.content.length > 300
          ? msg.content.substring(0, 300) + '...'
          : msg.content;
        output += `**Claude 응답:**\n${shortContent}\n\n`;
      }
    });

    output += `---\n\n`;
  }
});

// 결론 섹션
output += `
## 주요 구현 기능 정리

### 1. 프로젝트 초기 설정
- Nuxt 3 프로젝트 생성 및 기본 구조 설정
- TypeScript, Tailwind CSS, Pinia 설정
- PWA 지원 설정 (@vite-pwa/nuxt)

### 2. 데이터 구조 설계
- trips.json: 여행 목록 메타데이터
- itinerary.json: 일정 및 스케줄 정보
- places.json: 관광지 상세 정보
- highlights.json: 하이라이트, 포토스팟, 로컬팁

### 3. UI/UX 개선
- Apple 스타일의 미니멀 디자인 적용
- 플랫 디자인으로 전환
- 모바일 최적화 (Safe Area, 터치 타겟)
- 다크모드 지원

### 4. 주요 페이지 구현
- 홈 화면: D-Day 카운터, 오늘의 일정, 하이라이트
- 일정 화면: 일자별 타임라인 뷰
- 가이드 화면: 관광지 목록 및 상세 정보
- 설정 화면: 다크모드, 알림, 데이터 관리

### 5. 배포 설정
- GitHub Pages 배포 설정
- Vercel 배포 설정

---

*이 문서는 Claude Code를 통해 자동 생성되었습니다.*
`;

console.log(output);

// 파일로 저장
fs.writeFileSync('E:/apps/trip.com/CLAUDE.md', output, 'utf8');
console.log('\n\n=== CLAUDE.md 파일이 생성되었습니다 ===');
