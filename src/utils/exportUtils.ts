import JSZip from 'jszip';
import { Story } from '../types';

/**
 * Professional printable Book PDF generator
 * Opens a formatted print document with cover art, TOC, chapter headings, and page numbers
 */
export function exportToPDF(story: Story) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to open the printable book preview.');
    return;
  }

  const isRTL = story.language === 'ar' || story.language === 'ur';
  const langFont =
    story.language === 'ar' || story.language === 'ur'
      ? "'Amiri', serif"
      : story.language === 'ml'
      ? "'Noto Sans Malayalam', sans-serif"
      : story.language === 'kn'
      ? "'Noto Sans Kannada', sans-serif"
      : "'Playfair Display', Georgia, serif";

  const chapters =
    story.chapters && story.chapters.length > 0
      ? story.chapters
      : [
          {
            id: 'c1',
            chapterNumber: 1,
            title: story.title || 'Chapter 1',
            content: story.content,
            illustrationUrl: story.coverImage,
            wordCount: story.wordCount,
          },
        ];

  const html = `<!DOCTYPE html>
<html lang="${story.language || 'en'}" dir="${isRTL ? 'rtl' : 'ltr'}">
<head>
  <meta charset="UTF-8">
  <title>${story.title || 'StoryNex Book'} - Book Edition</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Cinzel:wght@700&family=Noto+Sans+Kannada:wght@400;700&family=Noto+Sans+Malayalam:wght@400;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4 portrait;
      margin: 20mm 20mm 25mm 20mm;
      @bottom-right {
        content: counter(page);
        font-family: 'Space Grotesk', sans-serif;
        font-size: 9pt;
        color: #718096;
      }
      @top-center {
        content: "${story.title ? story.title.replace(/"/g, '') : ''}";
        font-family: 'Playfair Display', serif;
        font-size: 8pt;
        letter-spacing: 1px;
        color: #a0aec0;
      }
    }
    @page :first {
      @top-center { content: none; }
      @bottom-right { content: none; }
    }
    body {
      margin: 0;
      font-family: ${langFont};
      color: #1a202c;
      background: #ffffff;
      line-height: 1.85;
      font-size: 11pt;
    }
    .page-break {
      page-break-after: always;
      break-after: page;
    }
    .cover-page {
      min-height: 90vh;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      text-align: center;
      padding: 40px 20px;
    }
    .cover-title {
      font-family: 'Cinzel', ${langFont};
      font-size: 32pt;
      font-weight: 700;
      margin: 20px 0 10px;
      color: #0f172a;
      line-height: 1.15;
    }
    .cover-subtitle {
      font-size: 13pt;
      color: #4a5568;
      font-style: italic;
      margin-bottom: 30px;
    }
    .cover-image {
      max-width: 100%;
      max-height: 380px;
      object-fit: cover;
      border-radius: 8px;
      margin: 0 auto;
      box-shadow: 0 10px 30px rgba(0,0,0,0.15);
    }
    .cover-author {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 14pt;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #2b6cb0;
      margin-top: 40px;
    }
    .cover-tagline {
      font-size: 10pt;
      color: #718096;
      margin-top: 6px;
    }
    .toc-title {
      font-family: 'Cinzel', serif;
      font-size: 20pt;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 8px;
      margin-bottom: 25px;
      text-align: center;
    }
    .toc-list {
      list-style: none;
      padding: 0;
      margin: 0 20px;
    }
    .toc-item {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px dashed #e2e8f0;
      font-size: 11pt;
    }
    .chapter-heading {
      font-family: 'Cinzel', ${langFont};
      font-size: 22pt;
      text-align: center;
      margin-top: 40px;
      margin-bottom: 15px;
      color: #1a365d;
    }
    .chapter-number {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 10pt;
      text-transform: uppercase;
      letter-spacing: 3px;
      color: #3182ce;
      text-align: center;
      display: block;
      margin-bottom: 8px;
    }
    .chapter-image {
      width: 100%;
      max-height: 320px;
      object-fit: cover;
      border-radius: 6px;
      margin: 20px 0;
    }
    .chapter-text {
      text-align: justify;
      white-space: pre-wrap;
      margin-top: 20px;
    }
    .chapter-asterism {
      text-align: center;
      font-size: 18pt;
      color: #a0aec0;
      margin: 40px 0;
    }
    @media print {
      .no-print { display: none; }
    }
    .print-bar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #0f172a;
      color: #ffffff;
      padding: 12px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      z-index: 1000;
      font-family: sans-serif;
    }
    .print-bar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #0f172a;
      color: #ffffff;
      padding: 12px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      z-index: 1000;
      font-family: sans-serif;
    }
    .btn-print {
      background: #3182ce;
      color: white;
      border: 0;
      border-radius: 6px;
      padding: 8px 18px;
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
    }
    .story-scene {
      margin: 24px auto;
      text-align: center;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .story-scene img {
      width: 85%;
      max-height: 380px;
      object-fit: contain;
      border-radius: 8px;
    }
    .story-scene figcaption {
      font-size: 9pt;
      color: #718096;
      margin-top: 6px;
    }
    .scene-left {
      float: left;
      width: 48%;
      margin: 0 20px 15px 0;
      border-radius: 6px;
    }
    .scene-right {
      float: right;
      width: 48%;
      margin: 0 0 15px 20px;
      border-radius: 6px;
    }
    .scene-full {
      width: 100%;
      margin: 20px 0;
      border-radius: 6px;
      clear: both;
    }
  </style>
</head>
<body>
  <div class="print-bar no-print">
    <div>
      <strong>Bookora Book Publisher</strong> &mdash; Printable Book & Magazine Layout
    </div>
    <button class="btn-print" onclick="window.print()">Print / Save as PDF</button>
  </div>
  <div style="height: 50px;" class="no-print"></div>

  <!-- Cover Page -->
  <div class="cover-page page-break">
    <div>
      <div class="cover-tagline">BOOKORA EDITIONS &middot; ${story.genre.toUpperCase()}</div>
      <h1 class="cover-title">${story.title || 'Untitled Manuscript'}</h1>
      ${story.coverConfig?.subtitle ? `<div class="cover-subtitle">${story.coverConfig.subtitle}</div>` : ''}
    </div>
    
    ${
      story.coverImage
        ? `<img class="cover-image" src="${story.coverImage}" alt="Book Cover" />`
        : ''
    }

    <div>
      <div class="cover-author">${story.author || 'Bookora Author'}</div>
      <div class="cover-tagline">${story.coverConfig?.tagline || 'Published with Bookora Book Creation Studio'}</div>
    </div>
  </div>

  <!-- Table of Contents -->
  <div class="page-break" style="padding-top: 40px;">
    <h2 class="toc-title">Table of Contents</h2>
    <ul class="toc-list">
      ${chapters
        .map(
          (c, idx) => `
        <li class="toc-item">
          <span>Chapter ${c.chapterNumber || idx + 1}: ${c.title || 'Untitled'}</span>
          <span style="color: #718096;">${c.wordCount} words</span>
        </li>
      `
        )
        .join('')}
    </ul>
  </div>

  <!-- Chapters with Integrated Illustrations -->
  ${chapters
    .map((c, idx) => {
      const chapterScenes = (story.illustratedScenes || []).filter(
        (scene) =>
          scene.imageUrl &&
          (scene.chapterId === c.id ||
            scene.chapterNumber === (c.chapterNumber || idx + 1) ||
            (!scene.chapterId && idx === 0))
      );

      const paragraphs = String(c.content || '')
        .split(/\n\s*\n/)
        .filter((p) => p.trim());

      const illustratedContent = paragraphs
        .map((paragraph, paragraphIndex) => {
          const images = chapterScenes.filter(
            (scene) =>
              scene.paragraphIndex === paragraphIndex ||
              (scene.paragraphIndex === undefined && scene.sceneNumber === paragraphIndex + 1)
          );

          const imageHTML = images
            .map(
              (scene) => `
            <figure class="story-scene">
              <img src="${scene.imageUrl}" alt="${scene.title || 'Story illustration'}" />
              <figcaption>${scene.title || ''}</figcaption>
            </figure>
          `
            )
            .join('');

          return `<p>${paragraph.replace(/#+\s*/g, '').trim()}</p>${imageHTML}`;
        })
        .join('');

      return `
    <div class="page-break" style="padding-top: 30px;">
      <span class="chapter-number">Chapter ${c.chapterNumber || idx + 1}</span>
      <h2 class="chapter-heading">${c.title || 'Chapter ' + (idx + 1)}</h2>

      ${
        c.illustrationUrl
          ? `<img class="chapter-image" src="${c.illustrationUrl}" alt="Chapter Illustration" />`
          : ''
      }

      <div class="chapter-text">
        ${illustratedContent}
      </div>

      <div style="clear: both;"></div>
      <div class="chapter-asterism">&lowast; &lowast; &lowast;</div>
    </div>
  `;
    })
    .join('')}

</body>
</html>`;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}

/**
 * Native EPUB 3 generator using JSZip
 * Generates an .epub archive adhering to the IDPF EPUB standard
 */
export async function exportToEPUB(story: Story) {
  const zip = new JSZip();

  // 1. mimetype (Must be first, uncompressed)
  zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });

  // 2. META-INF/container.xml
  zip.folder('META-INF')?.file(
    'container.xml',
    `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`
  );

  const oebps = zip.folder('OEBPS');
  if (!oebps) return;

  const chapters =
    story.chapters && story.chapters.length > 0
      ? story.chapters
      : [
          {
            id: 'c1',
            chapterNumber: 1,
            title: story.title || 'Chapter 1',
            content: story.content,
            illustrationUrl: story.coverImage,
            wordCount: story.wordCount,
          },
        ];

  const bookId = story.id || 'urn:uuid:' + crypto.randomUUID();
  const bookTitle = story.title || 'Untitled Story';
  const author = story.author || 'StoryNex Author';
  const lang = story.language || 'en';

  // 3. OEBPS/styles.css
  oebps.file(
    'styles.css',
    `body {
  font-family: Georgia, serif;
  margin: 5%;
  line-height: 1.8;
  color: #1a1a1a;
}
h1, h2 {
  text-align: center;
  font-weight: normal;
  margin-top: 1.5em;
  margin-bottom: 0.8em;
}
p {
  margin: 0;
  text-indent: 1.5em;
  margin-bottom: 0.5em;
}
.chapter-num {
  text-align: center;
  font-size: 0.8em;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #666;
}
.cover-wrap {
  text-align: center;
  padding: 10% 0;
}
.author {
  text-align: center;
  font-size: 1.2em;
  margin-top: 2em;
}`
  );

  // 4. Generate Chapter XHTML files
  const chapterItems: { id: string; href: string; title: string }[] = [];

  // Title Page
  oebps.file(
    'title.xhtml',
    `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="${lang}">
<head>
  <title>${bookTitle}</title>
  <link rel="stylesheet" type="text/css" href="styles.css" />
</head>
<body>
  <div class="cover-wrap">
    <h1>${bookTitle}</h1>
    <div class="author">By ${author}</div>
    <p style="text-align:center; margin-top: 2em; font-style: italic;">Genre: ${story.genre} &middot; StoryNex Studio</p>
  </div>
</body>
</html>`
  );

  chapters.forEach((chap, i) => {
    const filename = `chapter_${i + 1}.xhtml`;
    const paragraphs = chap.content
      .split('\n\n')
      .filter((p) => p.trim())
      .map((p) => `<p>${p.replace(/#+\s*/g, '').trim()}</p>`)
      .join('\n');

    oebps.file(
      filename,
      `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="${lang}">
<head>
  <title>${chap.title}</title>
  <link rel="stylesheet" type="text/css" href="styles.css" />
</head>
<body>
  <div class="chapter-num">Chapter ${chap.chapterNumber || i + 1}</div>
  <h2>${chap.title}</h2>
  ${paragraphs}
</body>
</html>`
    );

    chapterItems.push({
      id: `chap-${i + 1}`,
      href: filename,
      title: chap.title || `Chapter ${i + 1}`,
    });
  });

  // 5. OEBPS/toc.ncx (for older e-readers / Kindle)
  const navPoints = chapterItems
    .map(
      (item, idx) => `
    <navPoint id="navPoint-${idx + 1}" playOrder="${idx + 1}">
      <navLabel><text>${item.title}</text></navLabel>
      <content src="${item.href}"/>
    </navPoint>`
    )
    .join('');

  oebps.file(
    'toc.ncx',
    `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="${bookId}"/>
    <meta name="dtb:depth" content="1"/>
    <meta name="dtb:totalPageCount" content="0"/>
    <meta name="dtb:maxPageNumber" content="0"/>
  </head>
  <docTitle><text>${bookTitle}</text></docTitle>
  <navMap>
    <navPoint id="navPoint-title" playOrder="0">
      <navLabel><text>Title Page</text></navLabel>
      <content src="title.xhtml"/>
    </navPoint>
    ${navPoints}
  </navMap>
</ncx>`
  );

  // 6. OEBPS/nav.xhtml (EPUB 3 navigation doc)
  const tocList = chapterItems
    .map((item) => `<li><a href="${item.href}">${item.title}</a></li>`)
    .join('\n');

  oebps.file(
    'nav.xhtml',
    `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="${lang}">
<head>
  <title>Table of Contents</title>
  <link rel="stylesheet" type="text/css" href="styles.css" />
</head>
<body>
  <nav epub:type="toc" id="toc">
    <h1>Table of Contents</h1>
    <ol>
      <li><a href="title.xhtml">Title Page</a></li>
      ${tocList}
    </ol>
  </nav>
</body>
</html>`
  );

  // 7. OEBPS/content.opf (Packaging descriptor)
  const manifestItems = chapterItems
    .map(
      (item) =>
        `    <item id="${item.id}" href="${item.href}" media-type="application/xhtml+xml"/>`
    )
    .join('\n');

  const spineItems = chapterItems
    .map((item) => `    <itemref idref="${item.id}"/>`)
    .join('\n');

  oebps.file(
    'content.opf',
    `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookId" version="3.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:title>${bookTitle}</dc:title>
    <dc:creator>${author}</dc:creator>
    <dc:identifier id="BookId">${bookId}</dc:identifier>
    <dc:language>${lang}</dc:language>
    <meta property="dcterms:modified">${new Date().toISOString().replace(/\.[0-9]+Z$/, 'Z')}</meta>
  </metadata>
  <manifest>
    <item id="css" href="styles.css" media-type="text/css"/>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
    <item id="title" href="title.xhtml" media-type="application/xhtml+xml"/>
${manifestItems}
  </manifest>
  <spine toc="ncx">
    <itemref idref="title"/>
${spineItems}
  </spine>
</package>`
  );

  // Generate binary zip
  const blob = await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/epub+zip',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${bookTitle.replace(/[^a-z0-9-_]/gi, '_')}.epub`;
  a.click();
  URL.revokeObjectURL(url);
}
