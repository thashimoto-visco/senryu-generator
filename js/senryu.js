// 川柳生成ロジック＋スクショ／コピー機能
let line1 = [], line2 = [], line3 = [];

async function loadLines() {
  try {
    const res = await fetch('resources/lines.csv');
    const buffer = await res.arrayBuffer();
    const decoder = new TextDecoder('utf-8');
    let text = decoder.decode(buffer);
    if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
const rows = text.trim().split(/\r?\n/);
    rows.shift();
    rows.forEach(row => {
      const parts = row.split(',');
      const p1 = parts[0]?.trim() || '';
      const p2 = parts[1]?.trim() || '';
      const p3 = parts[2]?.trim() || '';
      if (p1) line1.push(p1);
      if (p2) line2.push(p2);
      if (p3) line3.push(p3);
    });
  } catch (e) {
    console.error('CSV読み込み失敗:', e);
  }
}
loadLines();

function updateSenryu() {
  const a = line1[Math.floor(Math.random() * line1.length)];
  const b = line2[Math.floor(Math.random() * line2.length)];
  const c = line3[Math.floor(Math.random() * line3.length)];
  document.getElementById('senryu').textContent = `${a}
${b}
${c}`;
}

document.getElementById('generate').addEventListener('click', () => {
  if (!line1.length || !line2.length || !line3.length) {
    alert('素材が読み込まれていません');
    return;
  }
  updateSenryu();
});

// キャプチャ対象を判定
function getCaptureTarget() {
  // Cute版: .wrapper があれば画像+吹き出しをキャプチャ
  const wrapper = document.querySelector('.wrapper');
  if (wrapper) return wrapper;
  // Simple/Cool版: senryu 部分のみ
  return document.getElementById('senryu');
}

// トリミング付きキャプチャ
function captureAndTrim(target) {
  return html2canvas(target, {backgroundColor: '#ffffff', scale: 2}).then(canvas => {
    const ctx = canvas.getContext('2d');
    const {width, height} = canvas;
    const imgData = ctx.getImageData(0, 0, width, height).data;
    let minX = width, maxX = 0, minY = height, maxY = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const alpha = imgData[(y * width + x) * 4 + 3];
        if (alpha) {
          minX = Math.min(minX, x);
          maxX = Math.max(maxX, x);
          minY = Math.min(minY, y);
          maxY = Math.max(maxY, y);
        }
      }
    }
    const trimW = maxX - minX + 1;
    const trimH = maxY - minY + 1;
    const trimmed = document.createElement('canvas');
    trimmed.width = trimW;
    trimmed.height = trimH;
    const tctx = trimmed.getContext('2d');
    tctx.fillStyle = '#ffffff';
    tctx.fillRect(0, 0, trimW, trimH);
    tctx.drawImage(canvas, minX, minY, trimW, trimH, 0, 0, trimW, trimH);
    return trimmed;
  });
}

// PNGダウンロード
document.getElementById('download').addEventListener('click', () => {
  const target = getCaptureTarget();
  captureAndTrim(target).then(trimmed => {
    const link = document.createElement('a');
    link.download = 'senryu.png';
    link.href = trimmed.toDataURL();
    link.click();
  });
});

// クリップボードコピー
document.getElementById('copy').addEventListener('click', async () => {
  try {
    const target = getCaptureTarget();
    const trimmed = await captureAndTrim(target);
    trimmed.toBlob(async blob => {
      const item = new ClipboardItem({[blob.type]: blob});
      await navigator.clipboard.write([item]);
      alert('クリップボードにコピーしました');
    });
  } catch (e) {
    alert('コピー失敗: ' + e);
  }
});

// GitHub APIでフォルダ内画像を取得、その中からランダム表示
async function loadMascotImages() {
  const img = document.getElementById('mascot');
  if (!img) return;
  const folder = img.dataset.folder; // 例: "cute"
  const owner = location.host.split('.')[0]; // GitHub Pagesのユーザ名
  const repo = location.pathname.split('/')[1]; // リポジトリ名
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/resources/Images/${folder}`;
  try {
    const res = await fetch(apiUrl);
    const data = await res.json();
    const files = data.filter(item => item.type === 'file');
    if (!files.length) return;
    const file = files[Math.floor(Math.random() * files.length)];
    img.src = file.download_url;
  } catch (e) {
    console.error('Mascot画像読み込み失敗:', e);
  }
}
// ページロード時に実行
window.addEventListener('load', loadMascotImages);
  
  // キャプチャ対象を判定
  function getCaptureTarget() {
	const wrapper = document.querySelector('.wrapper');
	if (wrapper) return wrapper;
	return document.getElementById('senryu');
  }