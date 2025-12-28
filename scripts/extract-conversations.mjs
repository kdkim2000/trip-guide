import fs from 'fs';
import path from 'path';

const dir = 'C:/Users/kdkim2000/.claude/projects/E--apps-trip-com';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsonl'));

let allSummaries = [];
let userMessages = [];

files.forEach(file => {
  const content = fs.readFileSync(path.join(dir, file), 'utf8');
  const lines = content.split('\n').filter(l => l.trim());

  lines.forEach(line => {
    try {
      const data = JSON.parse(line);

      if (data.type === 'summary' && data.summary) {
        allSummaries.push(data.summary);
      }

      if (data.type === 'user' && data.message?.content) {
        const content = typeof data.message.content === 'string'
          ? data.message.content
          : '';
        if (content && content.length > 10 && content.length < 2000) {
          userMessages.push({
            content: content.substring(0, 300),
            time: data.timestamp,
            session: data.sessionId
          });
        }
      }
    } catch(e) {}
  });
});

console.log('=== 대화 요약 목록 (' + allSummaries.length + '개) ===\n');
[...new Set(allSummaries)].forEach((s, i) => console.log((i+1) + '. ' + s));

console.log('\n\n=== 주요 사용자 요청 (샘플) ===\n');
userMessages.slice(0, 20).forEach((m, i) => {
  console.log((i+1) + '. ' + m.content.replace(/\n/g, ' ').substring(0, 100) + '...');
});
