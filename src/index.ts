import VirtualScroller from "./VirtualList.vue"

export { VirtualScroller }

function registerComponents(app, prefix) {
  app.component(`${prefix}virtual-scroller`, VirtualScroller)
  app.component(`${prefix}VirtualScroller`, VirtualScroller)
}

const plugin = {
  // eslint-disable-next-line no-undef
  version: "0.1.0",
  install(app, options) {
    const finalOptions = Object.assign(
      {},
      {
        installComponents: true,
        componentsPrefix: "",
      },
      options
    )

    if (finalOptions.installComponents) {
      registerComponents(app, finalOptions.componentsPrefix)
    }
  },
}

export default plugin
