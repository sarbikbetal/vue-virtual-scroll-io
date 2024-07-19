import { ref, Ref, toValue, watch, readonly } from "vue"

/** Arbitrary size of a single batch */
const GROUP_SIZE = 20

/**
 * Does a binary search on `arr` and return the highest value less than `height`.
 */
function calculateIndexFromHeight(arr: number[], height: number) {
  // Do a binary search on the list
  let low = 0
  let high = Array.isArray(arr) ? arr.length - 1 : Object.keys(arr).length - 1
  let mid
  while (low < high) {
    mid = Math.floor((high + low) / 2)
    // Check if height is present at middle position
    if (arr[mid] === height) {
      break
    } else if (arr[mid] > height) {
      high = mid - 1
    } else {
      low = mid + 1
    }
  }

  mid = Math.floor((high + low) / 2)
  if (height <= arr[mid]) return Math.max(0, mid - 1) // we don't want -1 as an index
  return mid
}

function divideAndRoundToEven(number) {
  let divided = number / 3
  let rounded = Math.round(divided)
  if (rounded % 2 !== 0) {
    if (divided > rounded) rounded++
    else rounded--
  }
  return rounded
}

export default function useDynamicHeightList(
  rowCount: Ref<number>,
  wrapper: Ref<Element | null>
) {
  /**
   * Array containing the height from which the
   * i-th elemnent start inside the scroll container
   */
  const sizeList = [0]

  /**
   * It containes the highest [1] and lowest [0] index of the current visible buffer
   */
  const listIndices = ref([0, Math.min(GROUP_SIZE, rowCount.value)])

  const topHeight = ref(0)
  const fullHeight = ref(0)

  function handleIntersection(scrollTop: number, clientHeight: number) {
    const range: number[] = []
    range[0] = calculateIndexFromHeight(sizeList, scrollTop)
    range[1] = calculateIndexFromHeight(sizeList, scrollTop + clientHeight)
    const diff = divideAndRoundToEven(GROUP_SIZE)
    listIndices.value = [
      Math.max(0, range[0] - diff),
      Math.min(rowCount.value, range[1] + diff),
    ]

    topHeight.value = sizeList[listIndices.value[0]]
    fullHeight.value = sizeList[sizeList.length - 1]

    console.log(
      diff,
      range,
      toValue(listIndices.value),
      topHeight.value,
      fullHeight.value,
      sizeList
    )
  }

  watch(
    [listIndices, wrapper, rowCount],
    () => {
      console.log("Overflow")
      const visibleIndices = listIndices.value
      // Set it to 1 if ref="topMarker" element is visible
      const offset = visibleIndices[0] ? 1 : 0

      // Keep recording the height of the elements
      // TODO: Account for the spacer elements
      // while (sizeList.length < visibleIndices[1] + offset && wrapper.value) {
      //   console.log("overflow2")
      //   const nthChildIndex = sizeList.length - (visibleIndices[0] + offset)
      //   const nthChild = wrapper.value?.children[nthChildIndex]

      //   // if (nthChild.id !== "virtual-list-bottom-marker") {
      //   const size = sizeList[sizeList.length - 1] + nthChild.clientHeight
      //   sizeList.push(size)
      //   // }
      // }

      for (
        let index = sizeList.length;
        index < visibleIndices[1] + offset && wrapper.value;
        index++
      ) {
        console.log("overflow2")
        const nthChildIndex = sizeList.length - (visibleIndices[0] + offset)
        const nthChild = wrapper.value?.children[nthChildIndex]

        // if (nthChild.id !== "virtual-list-bottom-marker") {
        const size = sizeList[sizeList.length - 1] + nthChild.clientHeight
        sizeList.push(size)
        // }
      }
    },
    { flush: "post", immediate: true }
  )

  function reset() {
    console.trace("reset")
    topHeight.value = 0
    listIndices.value = [0, Math.min(GROUP_SIZE, rowCount.value)]
    sizeList.splice(1)
  }

  return {
    handleIntersection,
    topHeight: readonly(topHeight),
    fullHeight: readonly(fullHeight),
    listIndices: readonly(listIndices),
    reset,
  }
}
