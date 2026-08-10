/*
 * Cards — responsive grid of cards. Each authored row (`:scope > div`) is one card.
 * Card content: heading, optional meta lines (e.g. date/location), body, CTA link.
 * Variants:
 *   .event       — date + location get icon-style treatment
 *   .event-list  — compact, denser grid
 */
export default function init(el) {
  const cards = [...el.querySelectorAll(':scope > div')];
  for (const card of cards) {
    card.classList.add('card');
    // the single cell holding content
    const cell = card.querySelector(':scope > div') || card;
    cell.classList.add('card-body');

    // First heading = title
    const heading = cell.querySelector('h1,h2,h3,h4,h5,h6');
    if (heading) heading.classList.add('card-title');

    // CTA = last paragraph that is just a link
    const paras = [...cell.querySelectorAll(':scope > p')];
    const cta = paras.find((p) => p.children.length === 1 && p.firstElementChild?.tagName === 'A'
      && p.textContent.trim() === p.firstElementChild.textContent.trim());
    if (cta) {
      cta.classList.add('card-cta');
      cell.append(cta); // push to bottom
    }

    // For event variants: tag the meta paragraphs (date/location) that sit right after the title
    if (el.classList.contains('event') || el.classList.contains('event-list')) {
      let n = heading?.nextElementSibling;
      while (n && n.tagName === 'P' && n !== cta && n.children.length === 0) {
        n.classList.add('card-meta');
        n = n.nextElementSibling;
      }
    }
  }
}
