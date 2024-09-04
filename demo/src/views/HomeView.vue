<script setup lang="ts">
import { ref } from 'vue'
import { VirtualScroller } from 'vue-virtual-scroll-io'

const logArray = ref([])

const getTexts = async (qty: number) => {
  try {
    const data = await (
      await fetch(
        `https://fakerapi.it/api/v1/custom?_quantity=${qty}&author=name&title=city&description=longText`
      )
    ).json()

    logArray.value = [
      ...logArray.value,
      ...data.data.map((txt, index) => ({
        ...txt,
        id: index + logArray.value.length,
        description: txt.description.slice(0, -Math.round(Math.random() * 600))
      }))
    ]

    // logArray.value.push(
    //   ...data.data.map((txt, index) => ({
    //     ...txt,
    //     id: logArray.value.length + index,
    //     description: txt.description.slice(0, -Math.round(Math.random() * 600))
    //   }))
    // )
  } catch (error) {
    console.error(error)
  }
}

getTexts(40)
</script>

<template>
  <div class="h-screen w-screen bg-slate-50 flex flex-col">
    <div class="flex items-center justify-around py-5">
      <span class="text-2xl font-bold text-teal-500">Check out the demo!</span>
      <button class="minimal-btn" @click="() => getTexts(40)">Add 40 elements</button>
      <button class="minimal-btn" @click="() => getTexts(1000)">Add 1000 elements</button>
    </div>

    <div class="flex flex-col flex-grow px-4 overflow-y-auto text-new-gray-600">
      <VirtualScroller :data="logArray" :data-key="'id'" variable-height>
        <template #default="{ item }">
          <div class="py-6 border-b">
            <p class="text-base text-gray-700">#{{ item.id }} {{ item.title }}</p>
            <p class="text-sm font-semibold text-gray-600">{{ item.author }}</p>
            <p class="font-mono text-xs">{{ item.description }}</p>
          </div>
        </template>
      </VirtualScroller>
    </div>
  </div>
</template>

<style>
.minimal-btn {
  @apply bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded;
}
</style>
