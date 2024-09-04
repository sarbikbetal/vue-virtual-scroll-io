<template>
  <div>
    <span>Total: {{ data.length }}&nbsp;&nbsp;</span>
    <span>Rendering: {{ listIndices }}&nbsp;&nbsp;</span>
    <span>Top: {{ topHeight }}px&nbsp;&nbsp;</span>
    <span>Full: {{ fullHeight }}px&nbsp;&nbsp;</span>
  </div>
  <div ref="root" class="virtual-list-container">
    <div ref="wrapper" class="virtual-list-scroll" :style="wrapperStyle">
      <!-- This element is only rendered when the virtual list does not start from 0th element -->
      <div
        v-if="listIndices[0]"
        ref="topMarker"
        class="virtual-list-top-marker"
        :style="topStyle"
      >
        Top Buffer
      </div>
      <div
        v-for="(item, idx) in pool"
        :key="item?.[dataKey]"
        class="virtual-list-item"
      >
        <slot :item="item" :index="idx + listIndices[0]"></slot>
      </div>
      <!-- This element is only rendered when the virtual list does not end at last element -->
      <div
        v-if="listIndices[1] != data.length"
        ref="bottomMarker"
        class="vitual-list-bottom-marker"
      >
        <slot name="loader" />
      </div>
    </div>

    <div v-if="$slots?.footer" class="footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Usage:
 * ```
 *  <VirtualList :data="list" :data-key="keyField">
 *      <template #default="{ item, index }">
 *
 *      </template>
 *  </VirtualList>
 * ```
 */

import { ref, toRefs, onMounted, watch, computed, nextTick } from "vue"
import useDynamicHeightList from "./dynamicList"
import useFixedHeightList from "./fixedList"

interface Props {
  data: Record<string, any>[]
  dataKey: string
  /**
   * Set it to `true` if the height of the rows may be
   * different for each row, but will never change.
   * Set it to `false` if the height of the rows will be same for every row,
   * but height of individual rows can change in runtime but never be different.
   */
  variableHeight?: boolean
}

defineOptions({ name: "VirtualList" })

const props = defineProps<Props>()

const { data } = toRefs(props)
const root = ref<Element | null>(null)
const wrapper = ref<Element | null>(null)

/**
 * Top/Bottom most element of the virtual list that
 * is watched by the intersection observer. We hide
 * them with v-if when not needed and check for
 * intersection and recalculate/rerender the virtual list.
 */
const bottomMarker = ref<Element | null>(null)
const topMarker = ref<Element | null>(null)

const rowCount = computed(() => data.value.length)

const { handleIntersection, topHeight, fullHeight, listIndices, reset } =
  props.variableHeight
    ? useDynamicHeightList(rowCount, wrapper)
    : useFixedHeightList(rowCount, wrapper)

// We dynamically change these css property to give the illusion of scroll
const wrapperStyle = computed(() => ({
  height: fullHeight.value ? `${fullHeight.value}px` : "auto",
}))

const topStyle = computed(() => ({
  "max-height": `${topHeight.value}px`,
  "min-height": `${topHeight.value}px`,
}))

watch(topStyle, () => {
  console.log("top-height", topMarker.value?.clientHeight)
})

// Virtualize the container if there are more than 20 elements
// for varible-height, always virtualize.
// const isVirtualised = computed(() => data.value?.length > 20)
const isVirtualised = ref(true)

/** Slice of the data that is actually rendered on the screen */
const pool = computed(() =>
  data.value.slice(listIndices.value[0], listIndices.value[1])
)

let lastListLength = data.value.length

let iObserver: IntersectionObserver

function observeThreshold(observer: IntersectionObserver) {
  if (bottomMarker.value) observer.observe(bottomMarker.value)
  if (topMarker.value) observer.observe(topMarker.value)
}

function observationCallback(
  entries: IntersectionObserverEntry[],
  observer: IntersectionObserver
) {
  /**
   * Checks if any of the visible observed elements are
   * intersecting, if yes run the calculations. Something
   * to note here is that either or any of `topMarker` and
   * `bottomMarker` might not be visible, so we do this check.
   */
  const intersecting = entries.reduce(
    (acc, elem) => acc || elem.isIntersecting,
    false
  )
  if (intersecting) {
    observer.disconnect()
    handleIntersection(root.value?.scrollTop!, root.value?.clientHeight!)
    nextTick(() => observeThreshold(observer))
  }
}

/**
 * Initializes/resets the internal state of the component
 */
async function init() {
  // sizeList.splice(1)
  // listIndices.value = [0, Math.min(GROUP_SIZE, data.value.length)]
  // topStyle.height = 'auto'
  // wrapperStyle.height = 'auto'
  // reset()
  iObserver = new IntersectionObserver(observationCallback, {
    root: root.value,
    threshold: [0],
  })
  await nextTick()
  observeThreshold(iObserver)
}

onMounted(async () => {
  await nextTick()
  init()
})

watch(data, async () => {
  iObserver.disconnect()
  await init()
  handleIntersection(root.value?.scrollTop!, root.value?.clientHeight!)
})

watch([isVirtualised, data], (value, oldValue) => {
  // Reset the list when the mode is set to virtualised
  // or when the length of list smaller than the last one
  if (value[0] !== oldValue[0] || lastListLength > data.value.length) {
    reset()
  }

  lastListLength = data.value.length
})
</script>

<style scoped>
.virtual-list-container {
  flex: 1 1 auto;
  margin: 0px;
  overflow: auto;
}

.virtual-list-scroll {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.virtual-list-item {
  flex-shrink: 0;
  /* overflow: hidden; */
}

.virtual-list-top-marker {
  flex-shrink: 0;
  /* transition: height 150ms; */
}

.vitual-list-bottom-marker {
  min-height: 5px;
  display: flex;
  justify-content: center;
  flex-grow: 1;
  background-image: linear-gradient(
    45deg,
    #ffd900 25%,
    #000000 25%,
    #000000 50%,
    #ffd900 50%,
    #ffd900 75%,
    #000000 75%,
    #000000 100%
  );
  background-size: 40px 40px;
}

.footer {
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
}
</style>
