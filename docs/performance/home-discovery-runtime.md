# Homepage discovery runtime measurement

Measured on 2026-09-04 by building the baseline and optimized revisions from clean detached worktrees. Both builds used macOS, Node.js 24.14.1, Next.js 16.2.4 with Turbopack, the same checked-out data, and the same copied `node_modules` dependency tree.

## Reproduce

For each revision, create a clean detached worktree, give it an identical dependency tree, and run:

```sh
PATH=/Users/guilherme/.nvm/versions/node/v24.14.1/bin:$PATH npm run build
node -e 'const fs=require("node:fs"); const rows=JSON.parse(fs.readFileSync(".next/diagnostics/route-bundle-stats.json","utf8")); console.log(rows.find(({route}) => route === "/"))'
```

The recorded metric is Next's `firstLoadUncompressedJsBytes` for `/`. It is the sum of file sizes for the route's initial JavaScript chunks. These are **Raw, uncompressed JavaScript bytes** on disk. They are not compressed transfer sizes and make no claim about gzip, Brotli, network transfer, parse time, or execution time.

## Result

| Revision | Homepage initial raw JS | Change |
| --- | ---: | ---: |
| `c5f73b4` (baseline) | 1,625,866 bytes | — |
| `909069c` (deferred discovery) | 1,322,326 bytes | -303,540 bytes (-18.67%) |

The baseline homepage statically imported `OpportunitiesPage`, so its first-load route contained the discovery runtime. The baseline-only initial chunk set included five route-specific chunks totaling 312,972 raw bytes (`0u5z_28vn25w3.js`, `0jm1fuquxc5.k.js`, `15z4~pt3ssa38.js`, `07eq6dy1mftpq.js`, and `0fl..q08gu5xn.js`). Inspection of those built files identifies `OpportunitiesPage`, `OpportunitiesScreen`, and `OpportunitiesFilters`; the remaining files are dependencies pulled into the initial graph by that discovery runtime. Chunk names are content/build outputs and may change on another build.

The optimized homepage replaces that static edge with an `import()` behind the near-viewport observer. Its small home boundary chunk grows and shared chunks are regrouped, so the honest route-level reduction is 303,540 raw bytes rather than the 312,972-byte sum of removed baseline-only chunks. The dedicated `/opportunities` export still loads the complete discovery runtime immediately.

The production build enforces a homepage ceiling of 1,338,710 raw bytes: the reviewed 1,322,326-byte result plus a 16 KiB tolerance. The 1.24% allowance absorbs small compiler metadata changes while still failing well before the removed 303,540-byte discovery graph could return. Any intentional increase must be measured and this note and validator budget reviewed together.

This build evidence establishes the root cause narrowly: the heavy discovery component graph accounted for the removed homepage first-load JavaScript. It does not claim a measured main-thread-time improvement; browser execution timing was not captured in this run.
