/**
 * An inert block of build-time HTML inside a hydrated tree. React adopts it as-is during hydration (it never
 * diffs dangerouslySetInnerHTML children) and simply removes it when the page swaps in its live sections.
 * The client always passes the markup it finds in the DOM (lib/boot.js islandHtml), so server and client agree.
 */
export default function StaticIsland({ name, html }) {
  return <div data-al-island={name} dangerouslySetInnerHTML={{ __html: html }} />;
}
