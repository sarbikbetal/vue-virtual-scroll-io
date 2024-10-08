import { resolve } from "path"
import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import dts from "vite-plugin-dts"
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    cssInjectedByJsPlugin(),
    dts({
      include: "./src",
      cleanVueFileName: true,
      beforeWriteFile: (filePath, content) => {
        if (filePath.endsWith("index.d.ts"))
          return {
            filePath: filePath.replace(
              "index.d.ts",
              "vue-virtual-scroll-io.d.ts"
            ),
            content,
          }
      },
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "Vue-virtual-scroll-io",
      // the proper extensions will be added
      fileName: "vue-virtual-scroll-io",
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ["vue"],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          vue: "Vue",
        },
      },
    },
  },
})
