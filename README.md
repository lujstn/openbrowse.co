# openbrowse.co

The website and documentation for [OpenBrowse](https://github.com/lujstn/openbrowse), a self-hosted alternative to Browser Use Cloud.

A static Next.js export. It exists to be the crawlable canonical that search engines and LLM retrievers quote instead of the source repository, so every claim on it is real HTML text, the benchmark is a semantic table rather than an image, and the figures are derived from `data/` rather than typed into components.

The documentation itself is at [openbrowse.co/docs](https://openbrowse.co/docs). Every page there is also available as plain Markdown by adding `.md` to its address.

This repository is published for reference. It is not set up for outside contribution, and several of its checks expect a local checkout of the product repository alongside it.

```bash
npm install
npm run build   # static export to out/
npm run check   # typecheck, constants, citation contract, markdown mirrors
```

MIT licensed. See [LICENSE](LICENSE).
