# Minify & Iconify Portal Mods

This IITC-CE plugin adds a toggleable display mode to the portal mod slots:

* **Full Mode**: Displays full icon graphics for each mod (using images from ameba64/ingress-items).
* **Mini Mode**: Shows compact text abbreviations like `HS [VR]`, with rarity-based color highlights.
* The toggle is activated by clicking on the mod bar.
* The selected view mode is remembered across sessions.

## Features

* 📦 **Icon mode** with high-quality SVGs.
* 🧩 **Text mode** with abbreviations and rarity tags.
* 🎨 Text color and border dynamically match mod rarity via IITC's `COLORS_MOD`.
* ⚡ Preloads mod icons for faster switching.
* 🧠 Intelligent caching using `localStorage`.

## Installation

Install as a Tampermonkey/Greasemonkey script or include via IITC plugin manager.

## Credits

This plugin was built by **ODBLK + ChatGPT**.

### References and Thanks:

* 🔌 **Minify Some Portal Details** by Zaso — for the mini layout inspiration.
* 🧩 **Ingress Icons** by ameba64 — for high-quality boxed mod icon assets.
* 🧠 IITC-CE core developers — for framework and mod detail hooks.

## License

MIT — Feel free to reuse, modify, and contribute!
