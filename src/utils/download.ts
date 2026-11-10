export const downloadCSV = (filename: string, rows: string[][]): void => {
  const escapeCell = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const csv = rows.map((row) => row.map(escapeCell).join(',')).join('\r\n');
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export const downloadPrintableCertificate = (recipient: string, courseTitle: string): void => {
  const escapeHTML = (value: string) => value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character] ?? character);
  const date = new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(new Date());
  const html = `<!doctype html>
<html lang="id">
<head><meta charset="utf-8"><title>Sertifikat - ${escapeHTML(courseTitle)}</title>
<style>
body{margin:0;padding:40px;font-family:Georgia,serif;color:#12204a;background:#fff}
main{min-height:75vh;border:8px double #2f4bdb;padding:48px;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center}
h1{font-size:42px;margin:12px 0;color:#2f4bdb}h2{font-size:32px;margin:12px 0}
p{font-size:18px;line-height:1.6}.course{font-size:24px;font-weight:bold;margin:20px}
@media print{body{padding:0}main{min-height:90vh}}
</style></head>
<body><main><p>EduSpace</p><h1>SERTIFIKAT PENYELESAIAN</h1>
<p>Dengan ini menyatakan bahwa</p><h2>${escapeHTML(recipient)}</h2>
<p>telah menyelesaikan kursus</p><div class="course">${escapeHTML(courseTitle)}</div>
<p>Diterbitkan pada ${escapeHTML(date)}</p></main>
<script>window.addEventListener('load',()=>window.print())</script></body></html>`;
  const url = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.target = '_blank';
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
};
