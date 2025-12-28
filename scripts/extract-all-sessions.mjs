import fs from 'fs';
import path from 'path';

const dir = 'C:/Users/kdkim2000/.claude/projects/E--apps-trip-com';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsonl') && !f.startsWith('agent-'));

// 모든 세션의 요약과 주요 대화 추출
const allData = [];

files.forEach(file => {
  const content = fs.readFileSync(path.join(dir, file), 'utf8');
  const lines = content.split('\n').filter(l => l.trim());

  let summaries = [];
  let userRequests = [];

  lines.forEach(line => {
    try {
      const data = JSON.parse(line);

      if (data.type === 'summary' && data.summary) {
        summaries.push(data.summary);
      }

      if (data.type === 'user' && data.message?.content) {
        const content = typeof data.message.content === 'string'
          ? data.message.content
          : '';
        if (content && content.length > 20 && !content.includes('tool_result')) {
          userRequests.push({
            content: content.substring(0, 1000),
            time: data.timestamp
          });
        }
      }
    } catch(e) {}
  });

  if (summaries.length > 0 || userRequests.length > 0) {
    allData.push({
      file,
      summaries: [...new Set(summaries)],
      requests: userRequests
    });
  }
});

// CLAUDE.md 생성
let output = `# TripGuide 프로젝트 개발 대화 기록

> 이 문서는 TripGuide 여행 가이드 애플리케이션 개발 과정에서 Claude와 나눈 대화를 정리한 것입니다.

---

## 프로젝트 소개

안녕하세요! 저는 TripGuide 프로젝트의 개발을 도와드린 Claude입니다.
이 프로젝트는 패키지 여행자를 위한 모바일 친화적 일정 관리 및 여행지 가이드 애플리케이션이에요.

### 기술 스택
- **프레임워크**: Nuxt 3 + Vue 3
- **언어**: TypeScript
- **스타일링**: Tailwind CSS
- **상태관리**: Pinia
- **유틸리티**: VueUse
- **PWA**: @vite-pwa/nuxt

---

## 개발 여정

프로젝트는 여러 단계를 거쳐 발전했어요. 각 세션에서 어떤 작업을 했는지 살펴볼까요?

`;

// 세션별 요약 정리
allData.forEach((session, idx) => {
  if (session.summaries.length > 0) {
    output += `### 📌 ${session.summaries[0]}\n\n`;

    if (session.summaries.length > 1) {
      output += `**관련 주제들:**\n`;
      session.summaries.slice(1).forEach(s => {
        output += `- ${s}\n`;
      });
      output += `\n`;
    }

    if (session.requests.length > 0) {
      output += `**주요 요청사항:**\n\n`;
      session.requests.slice(0, 5).forEach((req, i) => {
        const shortContent = req.content
          .replace(/\n/g, ' ')
          .replace(/\s+/g, ' ')
          .substring(0, 200);
        output += `${i + 1}. "${shortContent}..."\n\n`;
      });
    }
    output += `---\n\n`;
  }
});

// 주요 구현 기능
output += `
## 주요 구현 기능

### 1. 프로젝트 초기 설정
처음에는 여행 계획 수립 및 가이드 애플리케이션의 PRD를 작성하는 것부터 시작했어요.
- Nuxt 3 프로젝트 구조 설계
- TypeScript, Tailwind CSS 설정
- PWA 지원 구성

### 2. 데이터 구조 설계
여행 데이터를 효율적으로 관리하기 위한 JSON 구조를 설계했어요:
- \`trips.json\`: 여행 목록 메타데이터
- \`itinerary.json\`: 상세 일정 정보
- \`places.json\`: 관광지 정보
- \`highlights.json\`: 하이라이트, 포토스팟, 꿀팁

### 3. UI/UX 디자인 개선
Apple 스타일의 미니멀하고 플랫한 디자인으로 전환했어요:
- 시스템 폰트 및 Apple Blue 컬러 팔레트
- Backdrop blur 효과의 탭바
- 부드러운 스프링 애니메이션
- 다크모드 지원

### 4. 모바일 최적화
모바일 사용자 경험을 개선했어요:
- Safe Area 대응 (노치, 홈 인디케이터)
- 터치 타겟 최소 44x44px
- Pull to Refresh 기능
- 스와이프 제스처 지원

### 5. 주요 페이지 구현
- **홈**: D-Day 카운터, 오늘의 일정, 여행 하이라이트
- **일정**: 일자별 타임라인 뷰, 상세 정보 연결
- **가이드**: 관광지 목록, 검색/필터링, 상세 정보
- **꿀팁**: 여행 유의사항, 약관, 현지 언어, 준비물
- **설정**: 다크모드, 알림, 데이터 관리

### 6. 배포 설정
- GitHub Pages 정적 배포
- Vercel 배포 설정
- CI/CD 워크플로우 구성

---

## 프로젝트 구조

\`\`\`
trip.com/
├── app.vue                 # 루트 컴포넌트
├── nuxt.config.ts          # Nuxt 설정
├── tailwind.config.ts      # Tailwind 설정
├── components/             # Vue 컴포넌트
├── composables/            # Composition API 함수
├── layouts/                # 레이아웃 (하단 네비게이션)
├── pages/                  # 페이지 컴포넌트
│   ├── index.vue           # 홈
│   ├── schedule.vue        # 일정
│   ├── tips.vue            # 꿀팁
│   ├── settings.vue        # 설정
│   └── guide/              # 가이드
├── stores/                 # Pinia 스토어
├── types/                  # TypeScript 타입
└── public/data/            # JSON 데이터
\`\`\`

---

## 주요 명령어

\`\`\`bash
# 개발 서버
npm run dev

# 빌드
npm run build           # Vercel용
npm run generate        # GitHub Pages용

# 타입 검사
npm run typecheck
\`\`\`

---

## 개발 팁

### SSR 설정
이 프로젝트는 \`ssr: false\`로 설정되어 있어 클라이언트 사이드 렌더링만 사용해요.

### 데이터 로딩
\`composables/useTripData.ts\`의 composables를 사용해서 데이터를 로드해요:
- \`useTrips()\`: 여행 목록
- \`useItinerary()\`: 일정 데이터
- \`usePlaces()\`: 장소 정보
- \`useHighlights()\`: 하이라이트

### 상태 관리
\`stores/trip.ts\`의 Pinia 스토어로 전역 상태를 관리해요:
- 현재 선택된 여행 ID
- 여행 목록 캐싱
- localStorage 자동 동기화

---

*이 문서는 Claude Code를 통해 자동 생성되었습니다. (${new Date().toISOString().split('T')[0]})*
`;

fs.writeFileSync('E:/apps/trip.com/CLAUDE.md', output, 'utf8');
console.log('CLAUDE.md 파일이 생성되었습니다!');
console.log('총 세션 수:', allData.length);
console.log('총 요약 수:', allData.reduce((sum, s) => sum + s.summaries.length, 0));
