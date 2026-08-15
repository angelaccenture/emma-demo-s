import { createPicture } from '../../scripts/utils/picture.js';

/*
 * event-cards — renders a grid (or full-width `list`) of cards from a DA
 * spreadsheet (one row = one card). Add/remove rows in the sheet to add/remove
 * cards — no HTML editing.
 *
 * Sheet columns (all optional except title):
 *   title | date | location | description | image | link | linktext
 *
 * Optional authored `filter` row narrows rows by location:
 *   | filter | virtual-live |      -> location === "Online - Live"
 *   | filter | virtual-on-demand | -> location === "Online - On-demand"
 *   | filter | in-person |         -> everything that is NOT "Online - ..."
 *   (no filter / explore-all)      -> all rows
 */
function applyFilter(rows, filter) {
  const isOnline = (r) => /^online\s*-/i.test((r.location || '').trim());
  switch (filter) {
    case 'virtual-live':
      return rows.filter((r) => /^online\s*-\s*live$/i.test((r.location || '').trim()));
    case 'virtual-on-demand':
      return rows.filter((r) => /^online\s*-\s*on-demand$/i.test((r.location || '').trim()));
    case 'in-person':
      return rows.filter((r) => !isOnline(r));
    default:
      return rows;
  }
}
const ICONS = {
  date: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 2v2H5.5A2.5 2.5 0 0 0 3 6.5v12A2.5 2.5 0 0 0 5.5 21h13a2.5 2.5 0 0 0 2.5-2.5v-12A2.5 2.5 0 0 0 18.5 4H17V2h-2v2H9V2H7Zm11.5 6H5.5V6.5h13V8Zm0 2v8.5h-13V10h13Z"/></svg>',
  location: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2a7 7 0 0 0-7 7c0 4.4 5.4 10.5 6.3 11.5a1 1 0 0 0 1.5 0C13.6 19.5 19 13.4 19 9a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z"/></svg>',
};

function metaItem(kind, text) {
  const span = document.createElement('span');
  span.className = `event-meta-item event-meta-${kind}`;
  const icon = document.createElement('span');
  icon.className = 'event-meta-icon';
  icon.innerHTML = ICONS[kind];
  const label = document.createElement('span');
  label.textContent = text;
  span.append(icon, label);
  return span;
}

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

  if (row.description) {
    const p = document.createElement('p');
    p.className = 'event-desc';
    p.textContent = row.description;
    content.append(p);
  }

  // meta row: date + location with icons
  if (row.date || row.location) {
    const meta = document.createElement('p');
    meta.className = 'event-meta';
    if (row.date) meta.append(metaItem('date', row.date));
    if (row.location) meta.append(metaItem('location', row.location));
    content.append(meta);
  }

  if (row.link) {
    const cta = document.createElement('p');
    cta.className = 'card-cta-container';
    const a = document.createElement('a');
    a.href = row.link;
    a.textContent = row.linktext || 'Learn more';
    cta.append(a);
    content.append(cta);
  }

  inner.append(content);

  return card;
}

export default async function init(el) {
  const link = el.querySelector('a');
  const path = link ? link.getAttribute('href') : null;

  // Optional `filter` config: any 2-cell row whose first cell reads "filter".
  // Cells may be <div> or <p>, nested at any depth within the block.
  let filter = '';
  for (const rowEl of el.querySelectorAll('div')) {
    const cells = [...rowEl.children].filter((c) => c.tagName === 'DIV' || c.tagName === 'P');
    if (cells.length === 2 && cells[0].textContent.trim().toLowerCase() === 'filter') {
      filter = cells[1].textContent.trim().toLowerCase();
      break;
    }
  }

  const sheet = path || el.textContent.trim();
  if (!sheet) return;

  el.textContent = '';

  let rows = [];
  try {
    const resp = await fetch(sheet);
    if (!resp.ok) throw new Error(resp.status);
    const json = await resp.json();
    rows = json.data || [];
  } catch (e) {
    return;
  }

  rows = applyFilter(rows, filter);

  const grid = document.createElement('div');
  grid.className = 'event-cards-grid';
  for (const row of rows) grid.append(buildCard(row));
  el.append(grid);
}
