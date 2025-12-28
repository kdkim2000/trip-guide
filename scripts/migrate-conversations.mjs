/**
 * Claude Code Conversation Migration Script for TripGuide
 *
 * Claude Code 대화 내역을 Markdown으로 마이그레이션합니다.
 *
 * 사용법:
 *   node scripts/migrate-conversations.mjs [options]
 *
 * 옵션:
 *   --limit=N      처리할 세션 수 제한
 *   --session=ID   특정 세션만 처리
 *   --force        이미 처리된 세션도 다시 처리
 *   --status       현재 마이그레이션 상태 출력
 *   --reset        추적 파일 초기화
 *   --output=PATH  출력 파일 경로 (기본: CLAUDE.md)
 *   --verbose      상세 로그 출력
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const HOME = process.env.HOME || process.env.USERPROFILE;
const CLAUDE_DIR = path.join(HOME, '.claude');
const PROJECT_DIR = path.join(CLAUDE_DIR, 'projects', 'E--apps-trip-com');
const OUTPUT_FILE = path.join(__dirname, '..', 'CLAUDE.md');
const TRACKING_FILE = path.join(__dirname, '..', '.migrated-sessions.json');
const SESSIONS_DIR = path.join(__dirname, '..', 'docs', 'claude-sessions');

// Parse command line arguments
const args = process.argv.slice(2);
const forceMode = args.includes('--force');
const statusMode = args.includes('--status');
const resetMode = args.includes('--reset');
const verboseMode = args.includes('--verbose');
const limitArg = args.find(a => a.startsWith('--limit='));
const limit = limitArg ? parseInt(limitArg.split('=')[1]) : null;
const sessionArg = args.find(a => a.startsWith('--session='));
const sessionId = sessionArg ? sessionArg.split('=')[1] : null;
const outputArg = args.find(a => a.startsWith('--output='));
const outputPath = outputArg ? outputArg.split('=')[1] : OUTPUT_FILE;

/**
 * 추적 파일 로드
 */
function loadTrackingData() {
  if (fs.existsSync(TRACKING_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(TRACKING_FILE, 'utf8'));
    } catch (e) {
      console.warn('⚠️ Warning: Could not parse tracking file, starting fresh');
    }
  }
  return {
    migratedSessions: [],
    lastMigration: null,
    totalMigrated: 0,
    stats: {
      byCategory: {},
      byMonth: {}
    }
  };
}

/**
 * 추적 파일 저장
 */
function saveTrackingData(data) {
  data.lastMigration = new Date().toISOString();
  fs.writeFileSync(TRACKING_FILE, JSON.stringify(data, null, 2), 'utf8');
}

/**
 * 세션이 이미 처리되었는지 확인
 */
function isAlreadyMigrated(trackingData, sessionId) {
  return trackingData.migratedSessions.includes(sessionId);
}

/**
 * 세션을 처리 완료로 표시
 */
function markAsMigrated(trackingData, sessionId, category, month) {
  if (!trackingData.migratedSessions.includes(sessionId)) {
    trackingData.migratedSessions.push(sessionId);
    trackingData.totalMigrated++;
    trackingData.stats.byCategory[category] = (trackingData.stats.byCategory[category] || 0) + 1;
    trackingData.stats.byMonth[month] = (trackingData.stats.byMonth[month] || 0) + 1;
  }
}

/**
 * 현재 상태 출력
 */
function showStatus() {
  const data = loadTrackingData();

  console.log('='.repeat(60));
  console.log('Claude Code Migration Status - TripGuide');
  console.log('='.repeat(60));
  console.log(`\n📊 총 마이그레이션된 세션: ${data.totalMigrated}`);
  console.log(`📅 마지막 마이그레이션: ${data.lastMigration || 'Never'}`);

  if (Object.keys(data.stats.byCategory).length > 0) {
    console.log('\n📁 카테고리별:');
    for (const [cat, count] of Object.entries(data.stats.byCategory)) {
      console.log(`   ${cat}: ${count}`);
    }
  }

  if (Object.keys(data.stats.byMonth).length > 0) {
    console.log('\n📆 월별:');
    for (const [month, count] of Object.entries(data.stats.byMonth).sort()) {
      console.log(`   ${month}: ${count}`);
    }
  }

  // 처리되지 않은 파일 확인
  if (fs.existsSync(PROJECT_DIR)) {
    const allFiles = fs.readdirSync(PROJECT_DIR)
      .filter(f => f.endsWith('.jsonl') && !f.startsWith('agent-'));
    const pendingCount = allFiles.length - data.migratedSessions.length;
    console.log(`\n⏳ 대기 중인 세션: ${Math.max(0, pendingCount)}`);
  }

  console.log('='.repeat(60));
}

/**
 * 추적 파일 초기화
 */
function resetTracking() {
  if (fs.existsSync(TRACKING_FILE)) {
    fs.unlinkSync(TRACKING_FILE);
    console.log('✅ Tracking file has been reset');
  } else {
    console.log('ℹ️ No tracking file to reset');
  }
}

/**
 * JSONL 파일을 읽어서 대화 내용을 파싱
 */
async function parseJsonlFile(filePath) {
  const messages = [];
  const summaries = [];
  const metadata = {
    sessionId: null,
    branch: null,
    cwd: null,
    startTime: null,
    endTime: null,
    version: null
  };

  const fileStream = fs.createReadStream(filePath, { encoding: 'utf8' });
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    if (!line.trim()) continue;

    try {
      const data = JSON.parse(line);

      // 요약 추출
      if (data.type === 'summary' && data.summary) {
        summaries.push(data.summary);
      }

      // 메타데이터 추출
      if (data.sessionId && !metadata.sessionId) {
        metadata.sessionId = data.sessionId;
      }
      if (data.gitBranch) {
        metadata.branch = data.gitBranch;
      }
      if (data.cwd) {
        metadata.cwd = data.cwd;
      }
      if (data.version) {
        metadata.version = data.version;
      }
      if (data.timestamp) {
        const ts = new Date(data.timestamp);
        if (!metadata.startTime || ts < metadata.startTime) {
          metadata.startTime = ts;
        }
        if (!metadata.endTime || ts > metadata.endTime) {
          metadata.endTime = ts;
        }
      }

      // 사용자 메시지 추출
      if (data.type === 'user' && data.message) {
        const content = typeof data.message.content === 'string'
          ? data.message.content
          : '';
        if (content && content.length > 0) {
          messages.push({
            role: 'user',
            content: content,
            timestamp: data.timestamp,
            uuid: data.uuid
          });
        }
      }
      // 어시스턴트 메시지 추출
      else if (data.message && data.message.role === 'assistant') {
        let content = '';
        if (Array.isArray(data.message.content)) {
          content = data.message.content
            .filter(c => c.type === 'text')
            .map(c => c.text)
            .join('\n');
        } else if (typeof data.message.content === 'string') {
          content = data.message.content;
        }

        if (content) {
          messages.push({
            role: 'assistant',
            content: content,
            timestamp: data.timestamp,
            uuid: data.uuid,
            model: data.message.model
          });
        }
      }
    } catch (e) {
      // JSON 파싱 에러 무시
    }
  }

  return { messages, metadata, summaries };
}

/**
 * 문자열로 변환 (안전하게)
 */
function ensureString(content) {
  if (typeof content === 'string') return content;
  if (content === null || content === undefined) return '';
  if (Array.isArray(content)) {
    return content
      .filter(c => c && c.type === 'text')
      .map(c => c.text || '')
      .join('\n');
  }
  return String(content);
}

/**
 * 대화 내용에서 제목 생성
 */
function generateTitle(messages, summaries) {
  // 요약이 있으면 첫 번째 요약 사용
  if (summaries.length > 0) {
    return summaries[0];
  }

  // 첫 번째 사용자 메시지에서 제목 추출
  const firstUserMessage = messages.find(m => m.role === 'user');
  if (!firstUserMessage) return 'Untitled Session';

  const content = ensureString(firstUserMessage.content);
  let title = content.substring(0, 100);
  title = title.replace(/[\r\n]+/g, ' ').trim();
  title = title.replace(/[<>:"/\\|?*]/g, '');

  if (content.length > 100) {
    title += '...';
  }

  return title || 'Untitled Session';
}

/**
 * 카테고리 자동 분류
 */
function categorize(messages, summaries) {
  const allContent = [
    ...messages.map(m => ensureString(m.content).toLowerCase()),
    ...summaries.map(s => s.toLowerCase())
  ].join(' ');

  if (allContent.includes('ui') || allContent.includes('ux') || allContent.includes('디자인') || allContent.includes('design')) {
    return 'ui-ux';
  }
  if (allContent.includes('배포') || allContent.includes('deploy') || allContent.includes('github') || allContent.includes('vercel')) {
    return 'deployment';
  }
  if (allContent.includes('버그') || allContent.includes('bug') || allContent.includes('fix') || allContent.includes('오류')) {
    return 'bug-fix';
  }
  if (allContent.includes('기능') || allContent.includes('feature') || allContent.includes('구현') || allContent.includes('추가')) {
    return 'feature';
  }
  if (allContent.includes('리팩토') || allContent.includes('refactor')) {
    return 'refactor';
  }
  if (allContent.includes('설정') || allContent.includes('config') || allContent.includes('setup')) {
    return 'setup';
  }

  return 'general';
}

/**
 * 개별 세션 Markdown 생성
 */
function generateSessionMarkdown(messages, metadata, summaries, title) {
  const category = categorize(messages, summaries);
  const startDate = metadata.startTime ? metadata.startTime.toISOString().split('T')[0] : 'Unknown';
  const duration = metadata.startTime && metadata.endTime
    ? Math.round((metadata.endTime - metadata.startTime) / 60000)
    : 0;

  let md = `## ${title}\n\n`;
  md += `| 항목 | 값 |\n`;
  md += `|------|---|\n`;
  md += `| **날짜** | ${startDate} |\n`;
  md += `| **카테고리** | ${category} |\n`;
  md += `| **소요시간** | ${duration}분 |\n`;
  md += `| **메시지 수** | ${messages.length} |\n`;
  if (metadata.branch) {
    md += `| **브랜치** | ${metadata.branch} |\n`;
  }
  md += `\n`;

  if (summaries.length > 1) {
    md += `**관련 주제:**\n`;
    summaries.slice(1).forEach(s => {
      md += `- ${s}\n`;
    });
    md += `\n`;
  }

  md += `### 대화 내용\n\n`;

  // 메시지 표시 (처음 10개만, 너무 길면 축약)
  const displayMessages = messages.slice(0, 20);
  for (const msg of displayMessages) {
    const timestamp = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString('ko-KR') : '';
    let content = ensureString(msg.content);

    // 너무 긴 내용은 축약
    if (content.length > 500) {
      content = content.substring(0, 500) + '...';
    }

    if (msg.role === 'user') {
      md += `**👤 사용자** ${timestamp ? `(${timestamp})` : ''}\n\n`;
      md += `\`\`\`\n${content}\n\`\`\`\n\n`;
    } else {
      md += `**🤖 Claude** ${timestamp ? `(${timestamp})` : ''}\n\n`;
      md += `${content}\n\n`;
    }
  }

  if (messages.length > 20) {
    md += `\n*... 이하 ${messages.length - 20}개 메시지 생략 ...*\n\n`;
  }

  md += `---\n\n`;

  return { markdown: md, category };
}

/**
 * 통합 CLAUDE.md 생성
 */
function generateCombinedMarkdown(sessions) {
  let md = `# TripGuide 프로젝트 개발 대화 기록

> 이 문서는 TripGuide 여행 가이드 애플리케이션 개발 과정에서 Claude와 나눈 대화를 정리한 것입니다.
> 자동 생성일: ${new Date().toISOString().split('T')[0]}

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

## 개발 세션 목록

| # | 날짜 | 제목 | 카테고리 | 메시지 수 |
|---|------|------|----------|-----------|
`;

  sessions.forEach((session, idx) => {
    const date = session.metadata.startTime
      ? session.metadata.startTime.toISOString().split('T')[0]
      : 'Unknown';
    const shortTitle = session.title.length > 40
      ? session.title.substring(0, 40) + '...'
      : session.title;
    md += `| ${idx + 1} | ${date} | ${shortTitle} | ${session.category} | ${session.messages.length} |\n`;
  });

  md += `\n---\n\n## 세션 상세\n\n`;

  // 각 세션의 상세 내용 추가
  sessions.forEach((session, idx) => {
    md += `### 세션 ${idx + 1}: ${session.title}\n\n`;
    md += session.markdown;
  });

  // 주요 구현 기능 요약
  md += `
## 주요 구현 기능 요약

### 1. 프로젝트 초기 설정
- Nuxt 3 프로젝트 구조 설계
- TypeScript, Tailwind CSS 설정
- PWA 지원 구성

### 2. 데이터 구조 설계
- \`trips.json\`: 여행 목록 메타데이터
- \`itinerary.json\`: 상세 일정 정보
- \`places.json\`: 관광지 정보
- \`highlights.json\`: 하이라이트, 포토스팟, 꿀팁

### 3. UI/UX 디자인 개선
- Apple 스타일의 미니멀하고 플랫한 디자인
- Backdrop blur 효과의 탭바
- 다크모드 지원

### 4. 모바일 최적화
- Safe Area 대응 (노치, 홈 인디케이터)
- 터치 타겟 최소 44x44px
- Pull to Refresh 기능

### 5. 주요 페이지 구현
- **홈**: D-Day 카운터, 오늘의 일정, 하이라이트
- **일정**: 일자별 타임라인 뷰
- **가이드**: 관광지 목록 및 상세 정보
- **꿀팁**: 여행 유의사항, 약관, 현지 언어
- **설정**: 다크모드, 알림, 데이터 관리

### 6. 배포 설정
- GitHub Pages 정적 배포
- Vercel 배포 설정

---

## 프로젝트 구조

\`\`\`
trip.com/
├── app.vue                 # 루트 컴포넌트
├── nuxt.config.ts          # Nuxt 설정
├── components/             # Vue 컴포넌트
├── composables/            # Composition API 함수
├── layouts/                # 레이아웃
├── pages/                  # 페이지 컴포넌트
├── stores/                 # Pinia 스토어
├── types/                  # TypeScript 타입
└── public/data/            # JSON 데이터
\`\`\`

---

## 주요 명령어

\`\`\`bash
npm run dev        # 개발 서버
npm run build      # Vercel용 빌드
npm run generate   # GitHub Pages용 정적 빌드
npm run typecheck  # 타입 검사
\`\`\`

---

*이 문서는 Claude Code를 통해 자동 생성되었습니다.*
`;

  return md;
}

/**
 * 메인 실행
 */
async function main() {
  // 상태 모드
  if (statusMode) {
    showStatus();
    return;
  }

  // 리셋 모드
  if (resetMode) {
    resetTracking();
    return;
  }

  console.log('='.repeat(60));
  console.log('Claude Code Conversation Migration - TripGuide');
  console.log('='.repeat(60));
  console.log(`Mode: ${forceMode ? 'Force (reprocess all)' : 'Incremental (new only)'}`);

  // 디렉토리 확인
  if (!fs.existsSync(PROJECT_DIR)) {
    console.error(`❌ Project directory not found: ${PROJECT_DIR}`);
    process.exit(1);
  }

  // 추적 데이터 로드
  const trackingData = loadTrackingData();
  console.log(`📊 Previously migrated: ${trackingData.totalMigrated} sessions`);

  // JSONL 파일 목록
  const files = fs.readdirSync(PROJECT_DIR)
    .filter(f => f.endsWith('.jsonl') && !f.startsWith('agent-'))
    .filter(f => {
      const stats = fs.statSync(path.join(PROJECT_DIR, f));
      return stats.size > 0;
    });

  console.log(`\n📁 Found ${files.length} conversation files`);

  // 특정 세션만 처리
  let targetFiles = files;
  if (sessionId) {
    targetFiles = files.filter(f => f.includes(sessionId));
    console.log(`🎯 Filtering for session: ${sessionId}`);
  }

  // 제한 적용
  if (limit) {
    targetFiles = targetFiles.slice(0, limit);
    console.log(`📊 Limited to ${limit} sessions`);
  }

  console.log(`\n🔄 Processing ${targetFiles.length} sessions...\n`);

  const sessions = [];
  let processedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const file of targetFiles) {
    const filePath = path.join(PROJECT_DIR, file);
    const fileSessionId = file.replace('.jsonl', '');

    // 중복 체크
    if (!forceMode && isAlreadyMigrated(trackingData, fileSessionId)) {
      skippedCount++;
      if (verboseMode) {
        console.log(`  ⏭️  Skipped: ${file} (already migrated)`);
      }
      continue;
    }

    console.log(`Processing: ${file}`);

    try {
      const { messages, metadata, summaries } = await parseJsonlFile(filePath);

      if (messages.length === 0) {
        console.log(`  ⏭️  Skipped (no messages)`);
        skippedCount++;
        continue;
      }

      const actualSessionId = metadata.sessionId || fileSessionId;

      // 메타데이터 기반 중복 체크
      if (!forceMode && isAlreadyMigrated(trackingData, actualSessionId)) {
        console.log(`  ⏭️  Skipped (already migrated)`);
        skippedCount++;
        continue;
      }

      const title = generateTitle(messages, summaries);
      const { markdown, category } = generateSessionMarkdown(messages, metadata, summaries, title);
      const month = metadata.startTime
        ? metadata.startTime.toISOString().substring(0, 7)
        : new Date().toISOString().substring(0, 7);

      sessions.push({
        title,
        markdown,
        category,
        messages,
        metadata,
        summaries
      });

      console.log(`  📝 Title: ${title.substring(0, 50)}...`);
      console.log(`  💬 Messages: ${messages.length}`);
      console.log(`  🏷️  Category: ${category}`);

      // 추적 데이터 업데이트
      markAsMigrated(trackingData, actualSessionId, category, month);
      if (fileSessionId !== actualSessionId) {
        trackingData.migratedSessions.push(fileSessionId);
      }

      processedCount++;
    } catch (error) {
      console.error(`  ❌ Error: ${error.message}`);
      errorCount++;
    }
  }

  // 세션을 날짜순으로 정렬
  sessions.sort((a, b) => {
    const dateA = a.metadata.startTime || new Date(0);
    const dateB = b.metadata.startTime || new Date(0);
    return dateA - dateB;
  });

  // 통합 Markdown 생성 및 저장
  if (sessions.length > 0) {
    const combinedMarkdown = generateCombinedMarkdown(sessions);
    fs.writeFileSync(outputPath, combinedMarkdown, 'utf8');
    console.log(`\n📄 Combined markdown saved to: ${outputPath}`);

    // 개별 세션 파일도 저장 (옵션)
    if (!fs.existsSync(SESSIONS_DIR)) {
      fs.mkdirSync(SESSIONS_DIR, { recursive: true });
    }

    sessions.forEach((session, idx) => {
      const date = session.metadata.startTime
        ? session.metadata.startTime.toISOString().split('T')[0]
        : 'unknown';
      const safeName = session.title.substring(0, 30)
        .toLowerCase()
        .replace(/[^a-z0-9가-힣]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '') || 'session';
      const filename = `${date}-${safeName}.md`;
      const sessionPath = path.join(SESSIONS_DIR, filename);

      let sessionMd = `# ${session.title}\n\n`;
      sessionMd += session.markdown;
      fs.writeFileSync(sessionPath, sessionMd, 'utf8');
    });
    console.log(`📁 Individual sessions saved to: ${SESSIONS_DIR}`);
  }

  // 추적 데이터 저장
  saveTrackingData(trackingData);

  console.log('\n' + '='.repeat(60));
  console.log(`✅ New sessions processed: ${processedCount}`);
  console.log(`⏭️  Skipped (already migrated): ${skippedCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log(`📊 Total migrated (all time): ${trackingData.totalMigrated}`);
  console.log('='.repeat(60));

  if (processedCount === 0 && skippedCount > 0) {
    console.log('\nℹ️  No new sessions to process. Use --force to reprocess all.');
  }
}

main().catch(console.error);
