module.exports = {
  version: "3.0",
  title: "StyleAligned",
  icon: "icon.png",
  description: "Style Aligned Image Generation via Shared Attention https://style-aligned-gen.github.io/",
  menu: async (kernel) => {
    let installing = await kernel.running(__dirname, "install.js")
    let installed = await kernel.exists(__dirname, "venv")
    let running = await kernel.running(__dirname, "start.json")
    if (installing) {
      return [{
        default: true,
        icon: "fa-solid fa-plug",
        text: "Installing",
        href: "install.js",
      }]
    } else if (installed) {
      if (running) {
        let local = kernel.memory.local[path.resolve(__dirname, "start.js")]
        if (local && local.url) {
          return [{
            default: true,
            icon: "fa-solid fa-rocket",
            text: "Open Web UI",
            href: local.url,
          }, {
            icon: 'fa-solid fa-terminal',
            text: "Terminal",
            href: "start.js",
          }]
        } else {
          return [{
            default: true,
            icon: 'fa-solid fa-terminal',
            text: "Terminal",
            href: "start.js",
          }]
        }
      } else {
        return [{
          default: true,
          icon: "fa-solid fa-power-off",
          text: "Start",
          href: "start.js",
        }, {
          icon: "fa-solid fa-plug",
          text: "Update",
          href: "update.js",
        }, {
          icon: "fa-solid fa-plug",
          text: "Install",
          href: "install.js",
        }, {
          icon: "fa-regular fa-circle-xmark",
          text: "Reset",
          href: "reset.js",
        }]
      }
    } else {
      return [{
        default: true,
        icon: "fa-solid fa-plug",
        text: "Install",
        href: "install.js",
      }]
    }
    let installed = await kernel.exists(__dirname, "venv")
    if (installed) {
      let running = await kernel.running(__dirname, "start.json")
      if (running) {
        let local = info.local("start.js")
        if (local && local.url) {
          return [{
            icon: "fa-solid fa-terminal",
            text: "Terminal",
            href: "start.json",
          }, {
            default: true,
            icon: "fa-solid fa-rocket",
            text: "Open UI",
            href: local.url,
          }]
        } else {
          return [{
            icon: "fa-solid fa-terminal",
            text: "Terminal",
            href: "start.json",
          }]
        }
      } else {
        return [{
          default: true,
          icon: "fa-solid fa-power-off",
          text: "Launch",
          href: "start.json",
          params: { fullscreen: true, run: true }
        }]
      }
    } else {
      return [{
        default: true,
        icon: "fa-solid fa-plug",
        text: "Install",
        href: "install.js",
        params: { run: true, fullscreen: true }
      }]
    }
  }
}
