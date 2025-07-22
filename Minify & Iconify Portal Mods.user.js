// ==UserScript==
// @id             iitc-plugin-minify-and-iconify-porta;-mods
// @name           IITC plugin: Minify & Iconify Portal Mods
// @version        20250722.1432
// @author         ODBLK
// @namespace     https://github.com/IITC-CE/ingress-intel-total-conversion
// @description    Click mod bar to toggle between mod icon and abbreviation view. State is remembered. Optimized for fast image load.
// @updateURL      
// @downloadURL    
// @match          https://intel.ingress.com/*
// @grant          none
// ==/UserScript==
function wrapper(plugin_info) {
  if (typeof window.plugin !== 'function') window.plugin = () => {};
  const PLUGIN = window.plugin.minifyAndIconifyMods = {};

  PLUGIN.obj = {};
  PLUGIN.storage = {
    NAME: 'plugin-minify-iconify-mods',
    save() { localStorage[this.NAME] = JSON.stringify(PLUGIN.obj); },
    load() { PLUGIN.obj = JSON.parse(localStorage[this.NAME]); },
    reset() { PLUGIN.obj = { minify: false }; this.save(); },
    check() {
      if (!localStorage[this.NAME]) this.reset();
      else this.load();
    }
  };

  PLUGIN.isMinify = () => !!PLUGIN.obj.minify;

  PLUGIN._abbr = {
    mod(name='') {
      if (name.includes('Heat Sink')) return 'HS';
      if (name.includes('Multi-hack')) return 'MH';
      if (name.includes('Force Amp')) return 'FA';
      if (name.includes('Link Amp')) return 'LA';
      if (name.includes('Turret')) return 'T';
      if (name.includes('Portal Shield')) return 'S';
      if (name.includes('Aegis Shield')) return 'AES';
      if (name.includes('SoftBank')) return 'SBU';
      if (name.includes('ITO+')) return 'ITO+';
      if (name.includes('ITO-')) return 'ITO-';
      return '';
    },
    rarity(r='') {
      const val = r.toUpperCase();
      if (val === 'VERY_RARE') return '[VR]';
      if (val === 'RARE') return '[R]';
      if (val === 'COMMON') return '[C]';
      return '';
    },
    color(r='') {
      const c = window.COLORS_MOD;
      if (!c) return 'limegreen';
      const val = r.toUpperCase();
      if (val === 'VERY_RARE') return c.VERY_RARE;
      if (val === 'RARE') return c.RARE;
      if (val === 'COMMON') return c.COMMON;
      return 'limegreen';
    }
  };

  PLUGIN.getModList = function(d) {
    const mods = [];
    for (let i = 0; i < 4; i++) {
      const mod = d.mods[i];
      const item = { name: '', class: 'mod_free_slot', tooltip: '', color: '', rarity: '' };
      if (mod) {
        item.name = mod.name || '(unknown mod)';
        item.class = mod.name.toLowerCase().replace('(-)', 'minus').replace('(+)', 'plus').replace(/[^a-z]/g, '_');
        if (mod.rarity) {
          item.name = mod.rarity.capitalize().replace(/_/g, ' ') + ' ' + item.name;
          item.class += ' ' + mod.rarity.toLowerCase();
          item.color = PLUGIN._abbr.color(mod.rarity);
          item.rarity = mod.rarity;
        }
        item.tooltip = item.name + '\n';
        if (mod.owner) item.tooltip += 'Installed by: ' + mod.owner + '\n';
        if (mod.stats) {
          item.tooltip += 'Stats:';
          for (const key in mod.stats) {
            let val = mod.stats[key];
            if (key === 'HACK_SPEED') val = (val / 10000) + '%';
            else if (key === 'HIT_BONUS') val = (val / 10000) + '%';
            else if (key === 'ATTACK_FREQUENCY') val = (val / 1000) + 'x';
            else if (key === 'FORCE_AMPLIFIER') val = (val / 1000) + 'x';
            else if (key === 'LINK_RANGE_MULTIPLIER') val = (val / 1000) + 'x';
            else if (key === 'LINK_DEFENSE_BOOST') val = (val / 1000) + 'x';
            else if (key === 'REMOVAL_STICKINESS' && val > 100) val = (val / 10000) + '%';
            item.tooltip += '\n+' + val + ' ' + key.capitalize().replace(/_/g, ' ');
          }
        }
      }
      mods.push(item);
    }
    return mods;
  };

  PLUGIN.setDefaultStyle = function() {
    $('#portaldetails').removeClass('minifyIconify');
    const guid = window.selectedPortal;
    if (!guid) return;
    const details = window.portalDetail.get(guid);
    if (!details) return;
    const html = PLUGIN.getModList(details).map(item => `<span class="${item.class}" title="${item.tooltip}" style="user-select:none;outline:none;" tabindex="-1"></span>`).join('');
    $('#portaldetails .mods').empty().append(html);
  };

  PLUGIN.setSmallerStyle = function() {
    $('#portaldetails').addClass('minifyIconify');
    const guid = window.selectedPortal;
    if (!guid) return;
    const details = window.portalDetail.get(guid);
    if (!details) return;
    const html = PLUGIN.getModList(details).map(item => {
      const modAbbr = item.class === 'mod_free_slot' ? '&nbsp;' : PLUGIN._abbr.mod(item.name);
      const rarAbbr = item.rarity ? `&nbsp;${PLUGIN._abbr.rarity(item.rarity)}` : '';
      const style = item.color ? `color:${item.color};border:1px solid ${item.color};background:none;background-size:0;height:16px;line-height:16px;padding:0 4px;font-size:13px;display:inline-block;margin:1px 2px;border-radius:0;vertical-align:middle;user-select:none;outline:none;` : '';
      return `<span class="${item.class}" title="${item.tooltip}" style="${style}" tabindex="-1">${modAbbr}${rarAbbr}</span>`;
    }).join('');
    $('#portaldetails .mods').empty().append(html);
  };

  PLUGIN.toggle = function() {
    PLUGIN.obj.minify = !PLUGIN.obj.minify;
    PLUGIN.storage.save();
    PLUGIN.render();
  };

  PLUGIN.render = function() {
    if (PLUGIN.isMinify()) PLUGIN.setSmallerStyle();
    else PLUGIN.setDefaultStyle();
    $('#portaldetails .mods').off('click.icons').on('click.icons', PLUGIN.toggle);
  };

  PLUGIN._injectCSS = function() {
    const css = `
      #portaldetails .mods {
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        justify-content: center;
        align-items: center;
        gap: 6px;
      }

      #portaldetails .mods span {
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
        width: 68px;
        height: 68px;
        background-color: inherit;
        border: none;
        user-select: none;
        outline: none;
      }

      .mod_free_slot { background-image: url("https://raw.githubusercontent.com/ameba64/ingress-items/main/boxed/boxed_mod_free_slot.svg"); }
      .portal_shield.common { background-image: url("https://raw.githubusercontent.com/ameba64/ingress-items/main/boxed/boxed_portal_shield_common.svg"); }
      .portal_shield.rare { background-image: url("https://raw.githubusercontent.com/ameba64/ingress-items/main/boxed/boxed_portal_shield_rare.svg"); }
      .portal_shield.very_rare { background-image: url("https://raw.githubusercontent.com/ameba64/ingress-items/main/boxed/boxed_portal_shield_very_rare.svg"); }
      .aegis_shield.very_rare { background-image: url("https://raw.githubusercontent.com/ameba64/ingress-items/main/boxed/boxed_portal_shield_very_rare_aegis.svg"); }
      .force_amp.rare { background-image: url("https://raw.githubusercontent.com/ameba64/ingress-items/main/boxed/boxed_force_amp_rare.svg"); }
      .turret.rare { background-image: url("https://raw.githubusercontent.com/ameba64/ingress-items/main/boxed/boxed_turret_rare.svg"); }
      .heat_sink.common { background-image: url("https://raw.githubusercontent.com/ameba64/ingress-items/main/boxed/boxed_heat_sink_common.svg"); }
      .heat_sink.rare { background-image: url("https://raw.githubusercontent.com/ameba64/ingress-items/main/boxed/boxed_heat_sink_rare.svg"); }
      .heat_sink.very_rare { background-image: url("https://raw.githubusercontent.com/ameba64/ingress-items/main/boxed/boxed_heat_sink_very_rare.svg"); }
      .multi_hack.common { background-image: url("https://raw.githubusercontent.com/ameba64/ingress-items/main/boxed/boxed_multi_hack_common.svg"); }
      .multi_hack.rare { background-image: url("https://raw.githubusercontent.com/ameba64/ingress-items/main/boxed/boxed_multi_hack_rare.svg"); }
      .multi_hack.very_rare { background-image: url("https://raw.githubusercontent.com/ameba64/ingress-items/main/boxed/boxed_multi_hack_very_rare.svg"); }
      .link_amp.rare { background-image: url("https://raw.githubusercontent.com/ameba64/ingress-items/main/boxed/boxed_link_amp_rare.svg"); }
      .link_amp.very_rare { background-image: url("https://raw.githubusercontent.com/ameba64/ingress-items/main/boxed/boxed_link_amp_very_rare.svg"); }
      .softbank_ultra_link.very_rare { background-image: url("https://raw.githubusercontent.com/ameba64/ingress-items/main/boxed/boxed_softbank_ultra_link_very_rare.svg"); }
      .ito_en_transmuter_plus.very_rare { background-image: url("https://raw.githubusercontent.com/ameba64/ingress-items/main/boxed/boxed_ito_en_transmuter_+_very_rare.svg"); }
      .ito_en_transmuter_minus.very_rare { background-image: url("https://raw.githubusercontent.com/ameba64/ingress-items/main/boxed/boxed_ito_en_transmuter_-_very_rare.svg"); }

      #portaldetails.minifyIconify .mods > span {
        background-image: none !important;
        background-size: 0 !important;
        font-size: 13px;
        padding: 0 4px;
        line-height: 16px;
        height: 17px;
        border-width: 1px;
        border-style: solid;
        border-radius: 0;
        margin: 1px 2px;
        display: inline-block;
        vertical-align: middle;
        box-shadow: 0 0 3px currentColor;
        text-shadow: 0 0 2px black;
      }


      #portaldetails.minifyIconify .mods { height: auto !important; }
      #portaldetails.minifyIconify #resodetails td { display: none !important; }
      #portaldetails.minifyIconify #resodetails tr { width: 50% !important; float: left !important; }
    `;
    $('<style>').text(css).appendTo('head');
  };

  PLUGIN._preloadImages = function () {
    const urls = [
      'https://raw.githubusercontent.com/ameba64/ingress-items/main/boxed/boxed_mod_free_slot.svg',
      'https://raw.githubusercontent.com/ameba64/ingress-items/main/boxed/boxed_portal_shield_common.svg',
      'https://raw.githubusercontent.com/ameba64/ingress-items/main/boxed/boxed_portal_shield_rare.svg',
      'https://raw.githubusercontent.com/ameba64/ingress-items/main/boxed/boxed_portal_shield_very_rare.svg',
      'https://raw.githubusercontent.com/ameba64/ingress-items/main/boxed/boxed_portal_shield_very_rare_aegis.svg',
      'https://raw.githubusercontent.com/ameba64/ingress-items/main/boxed/boxed_force_amp_rare.svg',
      'https://raw.githubusercontent.com/ameba64/ingress-items/main/boxed/boxed_turret_rare.svg',
      'https://raw.githubusercontent.com/ameba64/ingress-items/main/boxed/boxed_heat_sink_common.svg',
      'https://raw.githubusercontent.com/ameba64/ingress-items/main/boxed/boxed_heat_sink_rare.svg',
      'https://raw.githubusercontent.com/ameba64/ingress-items/main/boxed/boxed_heat_sink_very_rare.svg',
      'https://raw.githubusercontent.com/ameba64/ingress-items/main/boxed/boxed_multi_hack_common.svg',
      'https://raw.githubusercontent.com/ameba64/ingress-items/main/boxed/boxed_multi_hack_rare.svg',
      'https://raw.githubusercontent.com/ameba64/ingress-items/main/boxed/boxed_multi_hack_very_rare.svg',
      'https://raw.githubusercontent.com/ameba64/ingress-items/main/boxed/boxed_link_amp_rare.svg',
      'https://raw.githubusercontent.com/ameba64/ingress-items/main/boxed/boxed_link_amp_very_rare.svg',
      'https://raw.githubusercontent.com/ameba64/ingress-items/main/boxed/boxed_softbank_ultra_link_very_rare.svg',
      'https://raw.githubusercontent.com/ameba64/ingress-items/main/boxed/boxed_ito_en_transmuter_+_very_rare.svg',
      'https://raw.githubusercontent.com/ameba64/ingress-items/main/boxed/boxed_ito_en_transmuter_-_very_rare.svg'
    ];
    const hiddenDiv = $('<div>').css({ position: 'absolute', top: '-9999px', left: '-9999px', width: 0, height: 0, overflow: 'hidden' }).appendTo('body');
    urls.forEach(url => {
      const img = new Image();
      img.loading = 'eager';
      img.decoding = 'async';
      img.src = url;
      hiddenDiv.append(img);
    });
  };

  PLUGIN.setup = function() {
    PLUGIN.storage.check();
    PLUGIN._injectCSS();
    PLUGIN._preloadImages();
    window.addHook('portalDetailsUpdated', PLUGIN.render);
    if (window.iitcLoaded) PLUGIN.render();
  };

  PLUGIN.setup.info = plugin_info;
  if (!window.bootPlugins) window.bootPlugins = [];
  window.bootPlugins.push(PLUGIN.setup);
}

const script = document.createElement('script');
const info = {};
if (typeof GM_info !== 'undefined' && GM_info.script) info.script = GM_info.script;
script.appendChild(document.createTextNode('(' + wrapper + ')(' + JSON.stringify(info) + ')'));
(document.body || document.head || document.documentElement).appendChild(script);
