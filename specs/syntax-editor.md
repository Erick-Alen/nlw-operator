# Syntax-Highlighted Code Editor

> Feature spec for upgrading the `CodeEditor` component from a plain textarea to a syntax-highlighted editor using the Shiki + textarea overlay pattern.

## Motivation

The current editor (`src/app/components/ui/code-editor.tsx`) renders code as plain white text. The read-only `CodeBlock` already uses Shiki with the "vesper" theme for beautiful syntax colors. Bridging this gap gives users immediate visual feedback as they type/paste code — inspired by [ray.so](https://github.com/raycast/ray-so).

## Approach

**Shiki + Textarea Overlay** — a transparent `<textarea>` (for input) sits on top of a Shiki-highlighted `<pre>` (for display). Both layers share identical typography so they align pixel-perfectly. Zero new dependencies (Shiki 4.0.2 is already installed).

## TODO

### Infrastructure

- [ ] Create `src/app/lib/shiki-client.ts` — singleton highlighter module
  - [ ] Use `createHighlighter` from `shiki/bundle/web`
  - [ ] Use JS regex engine (`shiki/engine/javascript`) — no WASM
  - [ ] Pre-load `vesper` theme only
  - [ ] Pre-load web development languages: `javascript`, `typescript`, `python`, `php`, `java`, `sql`, `html`, `css`, `json`, `yaml`, `bash`
  - [ ] Export `getClientHighlighter()` — lazy cached promise
  - [ ] Export `highlightCode(code, lang)` — convenience wrapper around `codeToHtml()`

- [ ] Create `src/app/hooks/use-shiki-highlight.ts` — custom hook
  - [ ] Initialize highlighter lazily on mount via `useEffect` + `useRef`
  - [ ] Debounce re-highlighting at 150ms on value changes
  - [ ] Return `{ html: string; isReady: boolean }`
  - [ ] Clean up debounce timer on unmount

### Component Refactor (`code-editor.tsx`)

- [ ] Add overlay container (`position: relative`) wrapping both layers
- [ ] Add `<pre>` highlight layer
  - [ ] `position: absolute`, `inset: 0`, `pointer-events: none`
  - [ ] Render Shiki HTML via `dangerouslySetInnerHTML`
  - [ ] Override Shiki background with `[&_pre]:bg-transparent!`
- [ ] Update `<textarea>` to be transparent input layer
  - [ ] `color: transparent`, `-webkit-text-fill-color: transparent`
  - [ ] `caret-color: var(--text-primary)` (visible white cursor)
  - [ ] `z-index: 1` (on top for input capture)
- [ ] Ensure pixel-perfect alignment between layers
  - [ ] Shared properties: `font-family` (JetBrains Mono), `font-size` (12px), `line-height` (20px), `padding` (16px), `white-space: pre`, `tab-size: 2`
- [ ] Implement scroll synchronization
  - [ ] `onScroll` handler mirrors `scrollTop`/`scrollLeft` from textarea to pre ref
  - [ ] Throttle with `requestAnimationFrame`
- [ ] Handle placeholder state
  - [ ] Render placeholder text in the `<pre>` layer when value is empty (textarea placeholder is invisible)
- [ ] Handle loading fallback
  - [ ] Show plain white text in `<pre>` while Shiki highlighter initializes (~200ms)

### Editor UX Enhancements

- [ ] Tab key inserts 2 spaces instead of changing focus
  - [ ] `onKeyDown` handler intercepts Tab, prevents default, inserts spaces at cursor
- [ ] Add `language` prop (defaults to `"javascript"`, supports all pre-loaded languages)
- [ ] Preserve existing API: `value`, `onChange`, `placeholder` props unchanged

### Integration

- [ ] Update `src/app/home-actions.tsx` — pass `language="javascript"` to `<CodeEditor>`

### Verification

- [ ] `npx biome check src/app/` — lint + format clean
- [ ] `npx tsc --noEmit` — types pass
- [ ] Type code in editor → syntax colors appear within ~150ms
- [ ] Line numbers stay in sync when adding/removing lines
- [ ] Scroll sync works with long snippets (vertical + horizontal)
- [ ] Cursor is visible (white caret) while text is transparent
- [ ] Placeholder appears when editor is empty
- [ ] "roast_my_code" button stays disabled when editor is empty
- [ ] No regressions on `/example` page

## Technical Notes

- **No new dependencies** — uses existing `shiki@4.0.2`
- **Bundle**: `shiki/bundle/web` + JS engine dynamically loads only needed grammars
- **Theme parity**: vesper theme colors match the `--syn-*` tokens in `globals.css`
- **Reuse patterns**: `dangerouslySetInnerHTML` + biome-ignore comment from `code-block.tsx`
