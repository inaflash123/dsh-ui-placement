// dsh-ui-placement — Host half.
//
// This bundle ships two rules of CSS into the page head and nothing else: no
// service, no route, no settings card. A `style` row on
// `webserver/index-inject` is exactly the shape for that, and it re-applies on
// every index render, so a page reload picks up a change without a restart.
//
// Why a stylesheet rather than a Client plugin that owns the elements: both
// things being fixed are LAYOUT of rows that the kernel and other plugins
// already render. Taking ownership would mean re-implementing those rows and
// re-syncing them on every upgrade; nudging them keeps each kernel/plugin the
// single owner of its own markup and behaviour, and the nudge disappears the
// moment this bundle is disabled.
//
// On the selectors: the class prefixes below are CSS-module hashes generated at
// build time, so an upgrade that rebuilds those modules renames them. The rules
// then match nothing, the layout silently returns to stock, and nothing breaks.
// Every rule therefore also names the stable data attribute the same element
// carries, and the comments name the module each hash belongs to so a future
// reader can re-derive it.

/**
 * The stylesheet this bundle injects.
 *
 * Held as a string constant rather than a file: a `style` row carries text, and
 * reading a file per index render would put a synchronous disk read on every
 * page load to fetch 2 KiB of CSS.
 */
const CSS = `
/* ══════════════════════════════════════════════════════════════════════
   1. Question panel — Skip / Submit move in from the right edge
   ══════════════════════════════════════════════════════════════════════

   Owner: @deepseek-ai/dsh-client-ui-user-questions
   Module: lib/client.js, the QuestionComposer stylesheet (prefix wnLwla).

   The stock footer spreads three children with space-between: the pager
   (prev / "1 / N" / next), a status line, and the action group (Skip +
   Submit). space-between pins the action group to the card's right edge, so on
   a wide window it sits hard against the right margin — visually too far out,
   and right where the bottom-right desktop pet lives.

   Anchoring the group to the pager and pushing it across with one auto margin
   puts it at the centre-right of the card instead: still the primary corner of
   the footer, no longer glued to the border. The share is a percentage so it
   tracks the card width, and the clamp keeps it sane at both extremes — a floor
   so the group can never collide with the pager on a narrow card, a ceiling so
   it does not drift toward the middle on a very wide one.
*/
.wnLwla_footer {
  justify-content: flex-start !important;
}
.wnLwla_footer > .wnLwla_footerActions {
  margin-left: auto !important;
  margin-right: clamp(24px, 26%, 320px) !important;
}

/* ══════════════════════════════════════════════════════════════════════
   2. Composer — the whole column steps left, clear of the bottom-right pet
   ══════════════════════════════════════════════════════════════════════

   Owner: @deepseek-ai/dsh-client-ui-conversation
   Module: lib/client.js, the ConversationRoot stylesheet (prefix an3WzG); the
           element is the div carrying [data-composer-seat], which wraps the
           composer card AND the dock row beneath it.
   Overlap: dsh-pet, a fixed overlay pinned to the window's bottom-right corner
            (configured size 160, right 0, bottom 152).

   The composer card is centred and capped by a max width, and the dock row
   under it is centred too, so the wider the window is beyond the card's cap the
   more slack sits on either side. What collides with the pet is not one control
   but the RIGHT PORTION OF THE COLUMN — the card's trailing controls and the
   dock's right-hand items — so shifting individual rows cannot fully fix it and
   would leave the two rows visually misaligned with each other.

   Reserving a lane on the seat fixes all of them at once: the column's content
   box shrinks from the right, and a centred card simply re-centres inside what
   is left, i.e. it slides left by half the lane without changing width — the
   text area keeps its line length, and every row inside moves together.

   Padding rather than a transform on purpose: a transform would make the seat a
   containing block for position:fixed descendants, and the dropdown panels
   inside the composer are fixed-positioned, so they would be pinned to the seat
   instead of the viewport.

   The lane is a custom property so it can be re-tuned without touching this
   file. It is a fact about the pet's footprint, not about the window, so the
   single knob is named for the pet; set it to 0px to switch the reservation off
   entirely and get the stock layout back.
*/
:root {
  /* Off by default: with no pet, or on a window wide enough that the centred
     card already ends before the pet starts, the layout must look like stock. */
  --dsh-ui-placement-pet-lane: 0px;
}

/* The range where a centred column can actually reach a bottom-right pet: the
   card is capped, so on a very wide window it ends well before the corner and
   there is nothing to fix. The lower bound is where the card starts being
   width-constrained instead of sliding — below it, a reserved lane would eat
   into the card rather than move it, which is a bigger change than the ask. */
@media (min-width: 880px) and (max-width: 1560px) {
  :root {
    --dsh-ui-placement-pet-lane: clamp(48px, 7.5vw, 112px);
  }
}

/* Both spellings in one list: the compiled module class and the stable data
   attribute the same element carries, so a rebuild that renames the hash leaves
   the second selector matching. */
.an3WzG_composerSeat,
[data-composer-seat] {
  padding-right: var(--dsh-ui-placement-pet-lane);
}
`

/** Package name the loader mounts this row as. */
export const name = 'dsh-ui-placement'

/**
 * The one service this plugin needs.
 *
 * Declared rather than resolved dynamically because the row only ever exists in
 * a Web profile, which always has a web server — so this cannot be the thing
 * that leaves the fiber PENDING. Declaring it also makes the failure honest: a
 * profile composed without `webServer` reports the missing dependency instead
 * of silently doing nothing.
 */
export const inject = ['webServer']

/**
 * Mount the stylesheet into the page head.
 *
 * The listener is registered through `ctx.on`, which the fiber disposes with the
 * plugin — so disabling this bundle drops the row from the next index render
 * without restarting.
 * @param ctx - Host plugin context.
 */
export function apply(ctx) {
  ctx.on('webserver/index-inject', (table) => {
    // `style` rows render into the head; this kind carries no placement field.
    table.push({ kind: 'style', text: CSS })
  })
}
