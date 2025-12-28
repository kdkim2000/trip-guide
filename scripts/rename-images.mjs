import fs from 'fs';
import path from 'path';

const imageDir = 'E:/apps/trip.com/public/images/shanghai';

// 한글-영문 매핑
const nameMapping = {
  '남경로': 'nanjing-road',
  '상해 엑스포': 'expo-museum',
  '상해 임시정부청사': 'provisional-government',
  '스타벅스 리저브': 'starbucks-reserve',
  '신천지': 'xintiandi',
  '예원옛거리': 'yuyuan-garden',
  '외탄': 'the-bund',
  '우캉루': 'wukang-road',
  '티엔즈팡': 'tianzifang',
  '판롱티엔디': 'panlong-tiandi'
};

const files = fs.readdirSync(imageDir);

files.forEach(file => {
  for (const [korean, english] of Object.entries(nameMapping)) {
    if (file.includes(korean)) {
      const ext = path.extname(file);
      const match = file.match(/(\d+)/);
      const num = match ? match[1] : '1';
      const newName = `${english}${num}${ext}`;

      const oldPath = path.join(imageDir, file);
      const newPath = path.join(imageDir, newName);

      console.log(`Renaming: ${file} -> ${newName}`);
      fs.renameSync(oldPath, newPath);
      break;
    }
  }
});

console.log('\nDone! Listing renamed files:');
fs.readdirSync(imageDir).forEach(f => console.log(f));
