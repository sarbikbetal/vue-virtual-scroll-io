<template>
  <div ref="root" class="virtual-list-container">
    <div
      v-if="isVirtualised"
      ref="wrapper"
      class="flex flex-col virtual-list-scroll"
      :style="wrapperStyle"
    >
      <!-- This element is only rendered when the virtual list does not start from 0th element -->
      <div v-if="listIndices[0]" ref="topMarker" class="flex-shrink-0" :style="topStyle">
        Top Buffer
      </div>
      <div
        v-for="(item, idx) in pool"
        :key="item?.[dataKey]"
        class="flex-shrink-0 virtual-list-item"
      >
        <slot :item="item" :index="idx + listIndices[0]"></slot>
      </div>
      <!-- This element is only rendered when the virtual list does not end at last element -->
      <div
        v-if="listIndices[1] != data.length"
        ref="bottomMarker"
        class="flex justify-center flex-grow"
      >
        <slot name="loader" />
      </div>
    </div>
    <TransitionGroup v-else-if="data.length" tag="div" :name="hasListTransition ? 'fade' : ''">
      <div
        v-for="(item, idx) in data"
        :key="item?.[dataKey]"
        class="flex-shrink-0 virtual-list-item"
        :style="{ '--index': idx }"
      >
        <slot :item="item" :index="idx"></slot>
      </div>
    </TransitionGroup>
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

const hasListTransition = ref(true)

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

const { handleIntersection, topHeight, fullHeight, listIndices, reset } = props.variableHeight
  ? useDynamicHeightList(rowCount, wrapper)
  : useFixedHeightList(rowCount, wrapper)

// We dynamically change these css property to give the illusion of scroll
const wrapperStyle = computed(() => ({
  height: `${fullHeight.value}px`,
}))

const topStyle = computed(() => ({
  height: `${topHeight.value}px`,
}))

// Virtualize the container if there are more than 20 elements
// for varible-height, always virtualize.
// const isVirtualised = computed(() => data.value?.length > 20)
const isVirtualised = ref(false)

/** Slice of the data that is actually rendered on the screen */
const pool = computed(() => data.value.slice(listIndices.value[0], listIndices.value[1]))

let lastListLength = data.value.length

let iObserver: IntersectionObserver

function observeThreshold(observer: IntersectionObserver) {
  if (bottomMarker.value) observer.observe(bottomMarker.value)
  if (topMarker.value) observer.observe(topMarker.value)
}

function observationCallback(entries: IntersectionObserverEntry[], observer: IntersectionObserver) {
  /**
   * Checks if any of the visible observed elements are
   * intersecting, if yes run the calculations. Something
   * to note here is that either or any of `topMarker` and
   * `bottomMarker` might not be visible, so we do this check.
   */
  const intersecting = entries.reduce((acc, elem) => acc || elem.isIntersecting, false)
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
  // listSize.splice(1)
  // listIndices.value = [0, Math.min(GROUP_SIZE, data.value.length)]
  // topStyle.height = 'auto'
  // wrapperStyle.height = 'auto'
  iObserver = new IntersectionObserver(observationCallback, {
    root: root.value,
    threshold: [0],
  })
  await nextTick()
  observeThreshold(iObserver)
}

onMounted(init)

watch(data, init)
watch([isVirtualised, data], (cVal) => {
  // Reset the list when the mode is set to virtualised
  // or when the length of list smaller than the last one
  if (cVal || lastListLength > data.value.length) {
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
}

.virtual-list-item {
  overflow: hidden;
}

.footer {
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
}

/* declare transitions */
.fade-move,
.fade-enter-active {
  transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);
}

.fade-enter-from {
  opacity: 0;
  transform: scaleY(0.01) translate(30px, 0);
}

.fade-leave-to,
.fade-leave-active {
  opacity: 0;
  display: none;
}

.fade-enter-active {
  transition-delay: calc(50ms * var(--index));
}
</style>
