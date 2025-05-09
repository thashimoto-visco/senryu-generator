// scripts/generate-images.js
// リポジトリの resources/Images/* フォルダを走査し、各サブフォルダに images.json を自動生成するスクリプト
// 実行前にプロジェクトルートで `npm init -y` → package.json の scripts に
// "generate-images": "node scripts/generate-images.js" を追加してください。

const fs = require('fs');
const path = require('path');

// base directory for images
const imagesBaseDir = path.join(__dirname, '..', 'resources', 'Images');

// resources/Images 以下のサブフォルダを取得
const folders = fs.readdirSync(imagesBaseDir)
  .map(name => path.join(imagesBaseDir, name))
  .filter(p => fs.statSync(p).isDirectory());

folders.forEach(folderPath => {
  const folderName = path.basename(folderPath);
  // 画像ファイルのみ抽出
  const files = fs.readdirSync(folderPath)
    .filter(file => /\.(png|jpe?g|gif)$/i.test(file));

  if (files.length === 0) {
    console.warn(`No image files found in ${folderName}`);
    return;
  }

  const jsonPath = path.join(folderPath, 'images.json');
  fs.writeFileSync(jsonPath, JSON.stringify(files, null, 2), 'utf-8');
  console.log(`Generated images.json in ${folderName} (total: ${files.length})`);
});
