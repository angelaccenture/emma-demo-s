import { createPicture } from '../../scripts/utils/picture.js';

/*
 * event-cards — renders a grid of cards from a DA spreadsheet (one row = one card).
 * Author drops a link to the sheet (…/name.json); add/remove rows in the sheet to
 * add/remove cards — no HTML editing.
 *
 * Sheet columns (all optional except title):
 *   title | date | location | description | image | link
 *
 * The card markup mirrors the decorated `card` block, so blocks/card/card.css
 * styles it (white bg, gray border, blue CTA) with no extra CSS needed.
 */
function buildCard(row) {
  const card = document.createElement('div');
  card.className = 'card';

  const inner = document.createElement('div');
  inner.className = 'card-inner';
  card.append(inner);

  if (row.image) {
    const picWrap = document.createElement('div');
    picWrap.className = 'card-picture-container';
    picWrap.append(createPicture({ src: row.image, alt: row.title || '' }));
    inner.append(picWrap);
  }

  const content = document.createElement('div');
  content.className = 'card-content-container';
  if (row.title) {
    const h = document.createElement('h3');
    h.textContent = row.title;
    content.append(h);
  }
  for (const key of ['date', 'location', 'description']) {
    if (row[key]) {
      const p = document.createElement('p');
      p.textContent = row[key];
      content.append(p);
    }
  }
  inner.append(content);

  if (row.link) {
    const cta = document.createElement('p');
    cta.className = 'card-cta-container';
    const a = document.createElement('a');
    a.href = row.link;
    a.textContent = row.linktext || 'Learn more';
    cta.append(a);
    inner.append(cta);
  }

  return card;
}

export default async function init(el) {
  // Sheet path = authored link, or plain-text path in the cell.
  const link = el.querySelector('a');
  const path = link ? link.getAttribute('href') : el.textContent.trim();
  if (!path) return;

  el.textContent = '';

  let rows = [];
  try {
    const resp = await fetch(path);
    if (!resp.ok) throw new Error(resp.status);
    const json = await resp.json();
    rows = json.data || [];
  } catch (e) {
    return;
  }

  const grid = document.createElement('div');
  grid.className = 'event-cards-grid';
  for (const row of rows) grid.append(buildCard(row));
  el.append(grid);
}
