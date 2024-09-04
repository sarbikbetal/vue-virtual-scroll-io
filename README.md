# Vue Virtual List 🚀

A fast and performant list virtualization library for Vue.js using Intersection Observer. Efficiently render large lists by only rendering visible items and re-rendering the list only when required, improving performance and reducing memory usage.

> **A note on Intersection Observers:**
> Intersection Observers are generally more performant than scroll handlers because they only trigger when required rather than triggering everytime a scroll happens

## Features 🌟

- **High Performance**: Efficiently handle large datasets.
- **Smooth Scrolling**: Seamless user experience with smooth scrolling.
- **Customizable**: Easily adaptable to your project's needs.
- **Simple API**: Intuitive and easy-to-use.

## Installation 📦

```bash
npm install vue-virtual-list
```

or

```bash
pnpm add vue-virtual-list
```

## Usage 🛠️

### Basic Example

```vue
<template>
  <virtual-list :items="items" :item-height="50" v-slot="{ item }">
    <div class="list-item">{{ item.name }}</div>
  </virtual-list>
</template>

<script>
import VirtualList from "vue-virtual-list"

export default {
  components: {
    VirtualList,
  },
  data() {
    return {
      items: Array.from({ length: 10000 }, (_, i) => ({
        name: `Item ${i + 1}`,
      })),
    }
  },
}
</script>

<style>
.list-item {
  height: 50px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  border-bottom: 1px solid #ddd;
}
</style>
```

## Props 📋

| Prop             | Type      | Default | Description                                         |
| ---------------- | --------- | ------- | --------------------------------------------------- |
| `data`           | Array<{}> | `[]`    | Array of items to display                           |
| `dataKey`        | String    | ``      | Key of the object to use as unique render key       |
| `variableHeight` | Boolean   | `false` | Whether the height of each list item is same or not |

## Slots 🎨

- `default`: Scoped slot for rendering each item.

  ### Slot Props

  | Prop    | Type   | Description                                               |
  | ------- | ------ | --------------------------------------------------------- |
  | `item`  | Object | Individual object from the list passed in to `data` prop. |
  | `index` | Number | Index of the element in the actual `data` array.          |

- `loader`: Slot for a bottom loader element just below the list's last rendered element

- `footer`: Slot for rendering a custom footer that is always visible just below the list

```vue
<virtual-list :items="items" :item-height="50" v-slot="{ item }">
  <div class="list-item">{{ item.name }}</div>
</virtual-list>
```
