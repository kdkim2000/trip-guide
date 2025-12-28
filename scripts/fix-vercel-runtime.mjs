/**
 * Vercel 런타임 버전을 nodejs20.x로 수정하는 스크립트
 * Vercel은 아직 nodejs22.x를 지원하지 않음
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

const VERCEL_OUTPUT_DIR = '.vercel/output/functions'
const TARGET_RUNTIME = 'nodejs20.x'

function fixRuntimeInDir(dir) {
  try {
    const entries = readdirSync(dir)

    for (const entry of entries) {
      const fullPath = join(dir, entry)
      const stat = statSync(fullPath)

      if (stat.isDirectory()) {
        // 재귀적으로 하위 디렉토리 처리
        fixRuntimeInDir(fullPath)
      } else if (entry === '.vc-config.json') {
        // .vc-config.json 파일 수정
        const content = JSON.parse(readFileSync(fullPath, 'utf-8'))

        if (content.runtime && content.runtime !== TARGET_RUNTIME) {
          const oldRuntime = content.runtime
          content.runtime = TARGET_RUNTIME
          writeFileSync(fullPath, JSON.stringify(content, null, 2))
          console.log(`✅ ${fullPath}: ${oldRuntime} → ${TARGET_RUNTIME}`)
        }
      }
    }
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error(`Error processing ${dir}:`, error.message)
    }
  }
}

console.log('🔧 Fixing Vercel runtime version...')
fixRuntimeInDir(VERCEL_OUTPUT_DIR)
console.log('✨ Done!')
