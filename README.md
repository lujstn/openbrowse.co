<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset=".github/assets/openbrowse-dark.gif">
    <img src=".github/assets/openbrowse-light.gif" alt="OpenBrowse" width="432">
  </picture>
</p>

# openbrowse.co

**The website and documentation for [OpenBrowse](https://github.com/lujstn/openbrowse).** This repository holds the marketing site and the docs, not the product itself. If you are looking for the self-hosted AI browser agents, they live in [lujstn/openbrowse](https://github.com/lujstn/openbrowse).

[openbrowse.co](https://openbrowse.co)

<div align="left">
  <a href="https://buildin.london"><img src="https://buildin.london/badge.svg" alt="Built in London" style="width: 200px;"></a>
</div>

---

## 📚 Where the docs are

The documentation is at **[openbrowse.co/docs](https://openbrowse.co/docs)**. Every page there is also available as plain Markdown by adding `.md` to its address, so [openbrowse.co/docs/installation](https://openbrowse.co/docs/installation) is also [openbrowse.co/docs/installation.md](https://openbrowse.co/docs/installation.md).

The Markdown sources live in [`content/docs`](content/docs), and the pages that surround them live in [`app`](app).

## What this repository is

A dynamic Next.js app, deployed on Vercel. It exists to be the crawlable canonical that search engines and LLM retrievers quote instead of the source repository, so every claim on it is real HTML text, the benchmark is a semantic table rather than an image, and the figures are derived from [`data/`](data) rather than typed into components.

It is published for reference rather than for outside contribution, and several of its checks expect a local checkout of the product repository alongside it.

```bash
npm install
npm run build   # production build
npm run check   # typecheck, tests, constants, citation contract, served-site checks
```

## Licence

MIT licensed. See [LICENSE](LICENSE).

<br><br>

<table align="center">
  <tr>
    <th colspan="2">built with <з by @lujstn</th>
  </tr>
  <tr>
    <td><img src=".github/assets/IMG_8874.jpg" alt="@lujstn" width="400"></td>
    <td valign="middle">
      <a href="https://x.com/intent/user?screen_name=lujstn"><img src="https://img.shields.io/twitter/follow/lujstn?style=social" alt="Twitter"></a>
      <br>
      <a href="https://www.instagram.com/lujstn/"><img src="https://img.shields.io/badge/Instagram-Follow-E4405F?style=social&logo=instagram" alt="Instagram"></a>
      <br>
      <a href="https://www.tiktok.com/@lujstn"><img src="https://img.shields.io/badge/TikTok-000000?style=flat&logo=tiktok&logoColor=white" alt="TikTok"></a>
      <br>
      <a href="https://lujstn.com"><img src="https://img.shields.io/badge/%F0%9F%94%97_lujstn.com-1a1a1a" alt="lujstn.com"></a>
    </td>
  </tr>
</table>
