# dsh-ui-placement

Two placement fixes for the agent runtime Web page, shipped as one stylesheet.

| What | Before | After |
| --- | --- | --- |
| Question panel's **Skip / Submit** | pinned to the card's right edge by `space-between` | pulled in to centre-right (`clamp(24px, 26%, 320px)`) |
| The **composer column** | centred and wide, so on a narrower window its right edge reaches under a bottom-right desktop pet | steps left by a reserved lane, between 880px and 1560px wide |

No changes to the harness source, no edits to `app.asar`: the plugin only pushes one `<style>` row into the page `<head>` through `webserver/index-inject`. Disable it and the stock layout is back immediately.

## Why the container, not the buttons

What gets covered is the **right half of the composer column** — the card's trailing controls plus the dock row beneath it — not a couple of buttons. Nudging individual buttons neither fixes that nor keeps the two rows aligned, so the adjustment sits on the container (`[data-composer-seat]`): its content box narrows from the right, the centred card re-centres inside what is left, and the whole column slides left without changing width — so the text area keeps its line length.

Padding rather than `transform` on purpose: a transform makes that element a containing block for `position: fixed` descendants, and the dropdown panels inside the composer are fixed-positioned — they would be pinned to the element rather than the viewport.

## Tuning

The lane is a single custom property on `:root`:

```css
--dsh-ui-placement-pet-lane
```

`0px` by default (a wide window looks exactly like stock). It only becomes `clamp(48px, 7.5vw, 112px)` between 880px and 1560px wide:

- wider than that, the capped card already ends before the pet — nothing to fix;
- narrower, a reserved lane would eat the card itself, so the pet should yield instead of the composer.

Resized or moved the pet? Change this one value. Want it off? Set it to `0px`, or disable the plugin.

## Install

```sh
dsh plugin --profile <profile> add https://github.com/inaflash123/dsh-ui-placement/releases/download/v0.1.0/dsh-ui-placement-0.1.0.tgz
```

Or straight from the repo:

```sh
dsh plugin --profile <profile> add github:inaflash123/dsh-ui-placement
```

DSH Desktop manages its own `desktop` profile — install through **Settings → Plugins** in the app instead of pointing the CLI at it.

Reload the page afterwards; no restart needed.

## Notes

- **The selectors are build output.** The `wnLwla_` and `an3WzG_` prefixes are CSS Modules hashes; an upgrade that rebuilds those modules renames them, the rules stop matching, and the layout quietly returns to stock — no error, no breakage. Each rule therefore also names the stable `data-*` attribute the same element carries; the pet rule uses `[data-composer-seat]`, which the hash cannot rename.
- **No DOM watching, no read/write of page state.** The plugin adds one stylesheet and does nothing else.
- **Collects nothing.**

## License

MIT
