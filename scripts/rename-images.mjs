/**
 * 이미지 파일명을 URL-safe 형태로 변환하는 스크립트
 * 한글 → 영문, 공백 → 하이픈, 특수문자 제거
 */
import { readdirSync, renameSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const IMAGES_DIR = 'public/images'
const PLACES_FILE = 'public/data/trips/spain-portugal-2025/places.json'

// 한글-영문 매핑 (장소명)
const koreanToEnglish = {
  '구엘공원': 'park-guell',
  '람블라스': 'las-ramblas',
  '로마시대 성벽': 'roman-wall',
  '로시우광장': 'rossio-square',
  '론다 투우장': 'ronda-bullring',
  '론다 파라도르': 'ronda-parador',
  '론다': 'ronda',
  '마요르광장': 'plaza-mayor',
  '몬세라트': 'montserrat',
  '바르셀로나 항구': 'barcelona-port',
  '발렌시아 대성당': 'valencia-cathedral',
  '발렌시아': 'valencia',
  '벨렘탑': 'belem-tower',
  '벨렝탑': 'belem-tower',
  '사그라다 파밀리아': 'sagrada-familia',
  '사라고사': 'zaragoza',
  '산타후스타 엘리베이터': 'santa-justa-elevator',
  '산토토메': 'santo-tome',
  '삼위일체': 'trinity',
  '성가족성당': 'sagrada-familia',
  '세비아대성당': 'sevilla-cathedral',
  '세비야대성당': 'sevilla-cathedral',
  '세비야': 'sevilla',
  '스페인 광장 \\(세비야\\)': 'spain-square-sevilla',
  '스페인 광장': 'spain-square',
  '스페인광장': 'spain-square',
  '알바이신': 'albaicin',
  '알함브라궁전': 'alhambra',
  '알함브라': 'alhambra',
  '에두아르도7세 공원': 'eduardo-vii-park',
  '제로니모스수도원': 'jeronimos-monastery',
  '제로니무스 수도원': 'jeronimos-monastery',
  '지구': 'district',
  '정원': 'garden',
  '카사밀라': 'casa-mila',
  '카사바트요': 'casa-batllo',
  '코메르시우광장': 'comercio-square',
  '톨레도': 'toledo',
  '탑': 'tower',
  '파티마성당': 'fatima-church',
  '푸에르타 델 솔': 'puerta-del-sol',
  '푸에르타델솔': 'puerta-del-sol',
  '프로도미술관': 'prado-museum',
  '프라도미술관': 'prado-museum',
  '프라도': 'prado',
  '필라르 광장': 'pilar-square',
  '필라르 대성당': 'pilar-basilica',
  '헤네랄리페': 'generalife',
  '황금의탑': 'torre-del-oro',
  '히랄다': 'giralda',
  '누에보다리': 'puente-nuevo',
  '대성당': 'cathedral',
  '교회': 'church',
  '성당': 'church',
  '밀라': 'mila',
  '카사': 'casa',
}

// 파일명 변환 함수
function convertFilename(filename) {
  let newName = filename

  // 한글을 영문으로 변환
  for (const [korean, english] of Object.entries(koreanToEnglish)) {
    const regex = new RegExp(korean, 'gi')
    newName = newName.replace(regex, english)
  }

  // 괄호와 내용 제거 또는 변환
  newName = newName.replace(/\s*\([^)]*\)\s*/g, '-')

  // 공백을 하이픈으로
  newName = newName.replace(/\s+/g, '-')

  // 연속 하이픈 정리
  newName = newName.replace(/-+/g, '-')

  // 앞뒤 하이픈 제거
  newName = newName.replace(/^-|-$/g, '')

  // 소문자로
  newName = newName.toLowerCase()

  // 확장자 정리 (.jfif → .jpg)
  newName = newName.replace(/\.jfif$/i, '.jpg')

  return newName
}

// 메인 실행
console.log('🔄 이미지 파일명 변환 시작...\n')

const files = readdirSync(IMAGES_DIR)
const renameMap = {}

// 1. 파일명 변환 맵 생성
for (const file of files) {
  const newName = convertFilename(file)
  if (file !== newName) {
    renameMap[`/images/${file}`] = `/images/${newName}`
    console.log(`  ${file} → ${newName}`)
  }
}

// 2. 실제 파일 이름 변경
console.log('\n📁 파일 이름 변경 중...')
for (const [oldPath, newPath] of Object.entries(renameMap)) {
  const oldFile = join(IMAGES_DIR, oldPath.replace('/images/', ''))
  const newFile = join(IMAGES_DIR, newPath.replace('/images/', ''))
  try {
    renameSync(oldFile, newFile)
    console.log(`  ✅ ${oldPath} → ${newPath}`)
  } catch (error) {
    console.error(`  ❌ 실패: ${oldPath}`, error.message)
  }
}

// 3. places.json 업데이트
console.log('\n📝 places.json 업데이트 중...')
let placesContent = readFileSync(PLACES_FILE, 'utf-8')

for (const [oldPath, newPath] of Object.entries(renameMap)) {
  placesContent = placesContent.split(oldPath).join(newPath)
}

writeFileSync(PLACES_FILE, placesContent, 'utf-8')
console.log('  ✅ places.json 업데이트 완료')

console.log('\n✨ 완료!')
console.log(`   ${Object.keys(renameMap).length}개 파일 변환됨`)
