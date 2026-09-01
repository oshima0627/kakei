// OGカード（1200×630 PNG）を描くコード。
//
// ⚠️ Node では動かない。**ブラウザのコンソールに貼って実行する。**
// Node に canvas を入れずに済ませるための割り切りで、日本語のフォントも
// ブラウザ側のものをそのまま使う（Windows なら Yu Gothic）。
//
// 使い方:
//   1. サイトをローカルで開く（npm run dev）
//   2. コンソールにこのファイルの中身を貼って実行する
//   3. 返ってきた data URL の base64 部分を site/public/img/og/site.png に書き出す
//      （Node なら: Buffer.from(b64, 'base64') を writeFileSync）
//   4. 保存したら PNG のシグネチャ（89504e470d0a1a0a）と IHDR の幅・高さを必ず確かめる
//
// 意匠はファビコン（site/public/favicon.svg）と揃えてある。
// 背景 #0f4c3a ＝ 公式の記載を確かめた印のチェック、左上の3本線は公式ページの本文。
(() => {
  const W = 1200, H = 630;
  const JP = '"Yu Gothic UI","Yu Gothic","Meiryo","Hiragino Kaku Gothic ProN",sans-serif';
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const g = c.getContext('2d');

  g.fillStyle = '#0f4c3a';
  g.fillRect(0, 0, W, H);

  // 右側のチェック
  g.save();
  g.globalAlpha = 0.16;
  g.strokeStyle = '#ffffff';
  g.lineWidth = 46;
  g.lineCap = 'round';
  g.lineJoin = 'round';
  g.beginPath();
  g.moveTo(830, 360);
  g.lineTo(930, 470);
  g.lineTo(1130, 160);
  g.stroke();
  g.restore();

  // 左上の3本線
  g.save();
  g.globalAlpha = 0.3;
  g.strokeStyle = '#ffffff';
  g.lineWidth = 10;
  g.lineCap = 'round';
  for (const [x, y, w] of [[90, 150, 330], [90, 186, 270], [90, 222, 200]]) {
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + w, y);
    g.stroke();
  }
  g.restore();

  g.fillStyle = '#ffffff';
  g.font = '700 88px ' + JP;
  g.fillText('家計の制度ログ', 88, 360);

  g.fillStyle = 'rgba(255,255,255,0.88)';
  g.font = '400 42px ' + JP;
  g.fillText('お金の制度を、公式の原文で確かめて書く', 92, 436);

  g.fillStyle = 'rgba(255,255,255,0.60)';
  g.font = '400 34px ' + JP;
  g.fillText('kakei.nexeed-lab.com', 92, 552);

  return c.toDataURL('image/png');
})();
