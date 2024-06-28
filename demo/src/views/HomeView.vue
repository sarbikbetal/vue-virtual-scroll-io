<script setup lang="ts">
import { ref } from 'vue'
import VirtualList from '../../../src/VirtualList.vue'

const logArray = ref([])

const getTexts = async () => {
  try {
    const data = await (await fetch('https://fakerapi.it/api/v1/custom?_quantity=1000&author=name&title=city&description=longText')).json()

    logArray.value = data.data.map((txt, index) => ({
      ...txt,
      id: index,
      description: txt.description.slice(0, -Math.round(Math.random() * 600))
    }))
  } catch (error) {
    console.error(error)
  }
}

getTexts()
</script>

<template>
  <div class="h-screen w-screen bg-slate-50 flex flex-col">
    <main>Hello All, Welcome</main>
    <div class="flex flex-col flex-grow px-4 overflow-y-auto text-new-gray-600">
      <VirtualList v-if="logArray.length" :data="logArray" :data-key="'id'" variable-height>
        <template #default="{ item }">
          <div class="py-6 border-b">
            <p class="text-base text-gray-700">#{{ item.id }} {{ item.title }}</p>
            <p class="text-sm font-semibold text-gray-600">{{ item.author }}</p>
            <p class="font-mono text-xs">{{ item.description }}</p>
          </div>
        </template>
      </VirtualList>
    </div>
  </div>
</template>
