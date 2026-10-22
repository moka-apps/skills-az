<p align="center">
  <img src="assets/banner.svg" alt="skills-az: Your slash commands and skills, A to Z, as you type /." width="100%">
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/github/license/moka-apps/skills-az?style=flat-square&color=111111" alt="License"></a>
  <a href="https://github.com/moka-apps"><img src="https://img.shields.io/badge/moka--apps-Claude_Code_mod-bc8cff?style=flat-square" alt="moka-apps, Claude Code mod"></a>
</p>

---

Shows a list of your slash commands and skills in A to Z order as soon as you type `/` in the prompt, and narrows it as you keep typing.

## Why you might want it

You have installed a lot of plugins and cannot remember what a command is called. Type `/` and the list is right there. Type `/brain` and it shrinks to everything with "brain" in its name, such as `superpowers:brainstorming`. Names that start with what you typed come first.

## Install

```
claude plugin marketplace add moka-apps/skills-az
claude plugin install skills-az@skills-az
```

Needs Claude Code 2.1.287 or newer with mods enabled. Tested in the terminal on macOS. It has not been tried in the desktop app or on Windows.

## How to use

- Type `/` at the start of an empty prompt. The list opens by itself.
- Keep typing to narrow it. It closes when the prompt stops being a single `/word`, or when you press Enter.
- `/skills-az` opens the list by hand. Use it if your terminal was too narrow for the automatic one.

## What it touches

- Network: none.
- Files: none read or written.
- Model calls: none. It costs no tokens.
- On by default once installed.

## Turn it off / uninstall

```
claude plugin disable skills-az
claude plugin uninstall skills-az
```

## Known limits

- If the terminal is too narrow, the list does not open on its own. You get a one-time pop-up, and `/skills-az` still works.
- The list is read once each time it opens, so a command installed while it is open shows up the next time it opens.
- Only as many rows as fit on screen are shown, with a count of the rest.
- Typing a file path that starts with `/` also opens the list, with no matches.

## License

MIT.
