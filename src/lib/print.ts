interface PrintContent {
  title: string;
  bodyHTML: string;
}

export function printReport({ title, bodyHTML }: PrintContent) {
  const win = window.open("", "_blank", "width=800,height=600");
  if (!win) return;

  win.document.write(`
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8" />
<title>${title}</title>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;600;700&display=swap" rel="stylesheet" />
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: "Noto Sans Arabic", sans-serif; padding: 40px; color: #2a241e; background: #fff; }
  h1 { font-size: 24px; margin-bottom: 8px; }
  .demo-label { display: inline-block; background: #eee9e2; color: #6f6150; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-bottom: 20px; }
  table { width: 100%; border-collapse: collapse; margin: 16px 0; }
  th, td { text-align: right; padding: 10px 12px; border-bottom: 1px solid #ddd5c8; font-size: 14px; }
  th { background: #f7f5f2; font-weight: 700; }
  .section-title { font-size: 18px; font-weight: 700; margin: 24px 0 8px; }
  .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 16px 0; }
  .summary-card { border: 1px solid #ddd5c8; border-radius: 8px; padding: 12px; }
  .summary-card .label { font-size: 12px; color: #6f6150; font-weight: 600; }
  .summary-card .value { font-size: 22px; font-weight: 700; }
  @media print { body { padding: 20px; } }
</style>
</head>
<body>
  <span class="demo-label">بيانات النظام</span>
  <h1>${title}</h1>
  ${bodyHTML}
</body>
</html>
  `);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 500);
}
