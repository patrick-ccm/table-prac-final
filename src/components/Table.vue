<script setup lang="ts">
import { ref,computed,onMounted, watch } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import {
  deleteProduct,
  products,
  expandedRows,
  editingRows,
  editOption,
  editOptions,
  sorting,
  filters,
  debounce,
  fetchLaptop,
  rules,
  validationObj
} from '../helpers'
import Button from 'primevue/button'
import Image from 'primevue/image'
import { useAxios } from '../composable/useAxios'
import Rating from 'primevue/rating'
import { useCapitalize } from '../composable/useCapitalize'
import Galleria from 'primevue/galleria'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'
import type { Product } from '../models'
import useVuelidate from '@vuelidate/core'

const toast = useToast()
const vuelidate = useVuelidate(rules, validationObj)

const editMode = computed(() => {
  return editOption.value === 'Row Edit' ? 'row' : 'cell'
})
const helperArr = ref<Product[]>([])
const searchMode = ref('Local Search')
onMounted(async () => {
  products.value = await useAxios()
  helperArr.value = products.value
})
const toggleExpandedRow = (id: number) => {
  if (expandedRows.value[id]) {
    const newRows: Record<number, boolean> = { ...expandedRows.value }
    delete newRows[id]
    expandedRows.value = newRows
  } else {
    expandedRows.value = { ...expandedRows.value, [id]: true }
  }
}
const onRowSelect = (event: { data: { id: number } }) => {
  if (editMode.value === 'row') {
    toggleExpandedRow(event.data.id)
  }
}
const onRowEditSave = (event: { newData: Product }) => {
  const { newData } = event
  validationObj.value = newData
  vuelidate.value.$touch()
  if (!vuelidate.value.$invalid) {
    products.value = products.value.map((p) => (p.id === newData.id ? newData : p))
  } else {
    console.log(vuelidate.value.$error)
    editingRows.value = [...editingRows.value, newData]
  }
}

const onCellEditComplete = (event: { newData: Product }) => {
  const { newData } = event
  validationObj.value = newData
  console.log(validationObj.value)
  vuelidate.value.$touch()
  if (!vuelidate.value.$invalid) {
    products.value = products.value.map((p) => (p.id === newData.id ? newData : p))
  } else {
    event.preventDefault()
  }
}

const searchServerFilter = ref('')
const debounceFetch = debounce(async () => {
  const data: Product[] = await fetchLaptop()
  products.value = data.map((x) => x)
  searchMode.value = 'Local Search'
}, 3000)

watch(searchServerFilter, () => {
  if (searchMode.value === 'Server Search') {
    debounceFetch()
  }
})
</script>

<template>
  <Toast />

  <DataTable
    :value="products"
    tableStyle="min-width: 50rem"
    paginator
    :rows="5"
    :rowsPerPageOptions="[5, 10, 20, 50]"
    paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
    currentPageReportTemplate="Page {currentPage} of {totalPages} - Total Records - {totalRecords}"
    removableSort
    v-model:expandedRows="expandedRows"
    sortMode="multiple"
    :multiSortMeta="sorting"
    :sortOrder="-1"
    :editMode="editMode"
    dataKey="id"
    @row-edit-save="onRowEditSave"
    v-model:editingRows="editingRows"
    @cell-edit-complete="onCellEditComplete"
    v-model:filters="filters"
    filterDisplay="row"
    :globalFilterFields="[
      'title',
      'brand',
      'category',
      'discountPercentage',
      'rating',
      'stock',
      'price'
    ]"
    selectionMode="single"
    @rowSelect="onRowSelect"
  >
    <template #header>
      <div class="flex justify-content-end">
        <i class="pi pi-search" />
        <InputText
          v-if="searchMode === 'Local Search'"
          placeholder="Search Product"
          v-model="filters.global.value"
        />
        <InputText v-else placeholder="Search Product" v-model="searchServerFilter" />
        <Dropdown :options="editOptions" v-model="editOption" />
        <Button
          v-if="searchMode === 'Local Search'"
          :onclick="
            () => {
              searchMode = 'Server Search'
              filters.global.value = null
            }
          "
          >Local Search</Button
        >
        <Button
          v-else
          :onclick="
            () => {
              searchMode = 'Local Search'
              products = helperArr
              searchServerFilter = ''
            }
          "
          >Server Search</Button
        >
      </div>
    </template>
    <Column field="title" header="Title" sortable>
      <template #body="{ data }">
        <div class="flex">
          <div>
            <img class="circle-img" :src="data.thumbnail" width="200" />
          </div>
          <p v-tooltip="data.description">{{ useCapitalize(data.title) }}</p>
        </div>
      </template>
      <template #editor="{ data, field }">
        <div class="flex">
          <img :src="data.thumbnail" class="circle-img" />
          <div class="error-msg">
            <InputText type="text" size="small" v-model="data[field]" />
            <p v-if="vuelidate[field].$error">Error: {{ vuelidate[field].$errors[0].$message }}</p>
          </div>
        </div>
      </template>
    </Column>
    <Column field="price" sortable header="Price"
      ><template #body="{ data, field }">
        <p>${{ data[field] }}</p> </template
      ><template #editor="{ data, field }">
        <div class="error-msg">
          <div class="flex-price">
            <p>$</p>
            <InputText type="number" size="small" v-model="data[field]" />
          </div>
          <p v-if="vuelidate[field].$error">Error: {{ vuelidate[field].$errors[0].$message }}</p>
        </div></template
      ></Column
    >
    <Column field="discountPercentage" sortable header="Discount Percentage"
      ><template #body="{ data, field }">
        <p>{{ data[field] }} %</p>
      </template>
      <template #editor="{ data, field }">
        <div class="error-msg">
          <InputText type="number" size="small" v-model="data[field]" />
          <p v-if="vuelidate[field].$error">Error: {{ vuelidate[field].$errors[0].$message }}</p>
        </div>
      </template></Column
    >
    <Column field="brand" sortable header="Brand"
      ><template #editor="{ data, field }">
        <div class="error-msg">
          <InputText type="text" size="small" v-model="data[field]" />
          <p v-if="vuelidate[field].$error">Error: {{ vuelidate[field].$errors[0].$message }}</p>
        </div>
      </template></Column
    >
    <Column field="category" sortable header="Category">
      <template #body="{ data, field }">{{ useCapitalize(data[field]) }}</template>
      <template #editor="{ data, field }">
        <div class="error-msg">
          <InputText type="text" size="small" v-model="data[field]" />
          <p v-if="vuelidate[field].$error">Error: {{ vuelidate[field].$errors[0].$message }}</p>
        </div>
      </template></Column
    >
    <Column field="stock" sortable header="Stock"
      ><template #editor="{ data, field }">
        <div class="error-msg">
          <InputText type="number" size="small" v-model="data[field]" />
          <p v-if="vuelidate[field].$error">Error: {{ vuelidate[field].$errors[0].$message }}</p>
        </div></template
      ></Column
    >
    <Column field="rating" header="Rating" sortable>
      <template #body="{ data }">
        <div class="flex">
          <Rating :modelValue="parseInt(data.rating)" readonly :cancel="false" />
          <p>({{ data.rating }})</p>
        </div>
      </template>
      <template #editor="{ data, field }">
        <div class="error-msg">
          <InputText
            type="number
        "
            size="small"
            min="0"
            max="5"
            v-model="data[field]"
          />
          <p v-if="vuelidate[field].$error">Error: {{ vuelidate[field].$errors[0].$message }}</p>
        </div>
      </template>
    </Column>
    <Column header="Actions">
      <template #body="{ data, editorInitCallback }">
        <div class="btn-group">
          <Button @click="editorInitCallback" :disabled="editMode === 'cell'">Edit</Button>
          <Button
            @click="
              () => {
                toast.add({ severity: 'error', summary: 'Row Deleted', life: 3000 })
                deleteProduct(data.title)
              }
            "
            >Delete</Button
          >
          <Button @click="toggleExpandedRow(data.id)">View</Button>
        </div>
      </template>
      <template #editor="{ editorCancelCallback, editorSaveCallback }">
        <div class="btn-group">
          <Button @click="editorSaveCallback">Save</Button>
          <Button @click="editorCancelCallback">Cancel</Button>
        </div>
      </template>
    </Column>

    <template #expansion="{ data }">
      <!-- <div class="flex">
        <Image
          v-for="(item, index) in data.images"
          :src="item"
          :key="index"
          alt="image"
          :width="200"
        />
      </div> -->
      <Galleria
        :value="data.images"
        :numVisible="5"
        containerStyle="max-width: 800px margin: 0 auto"
        :show-indicators="true"
        :show-thumbnails="false"
      >
        <template #item="slotProps">
          <Image :src="slotProps.item" alt="image" />
        </template>
        <template #thumbnail="slotProps">
          <Image :src="slotProps.item" alt="image" :width="300" />
        </template>
      </Galleria>
    </template>
  </DataTable>
</template>

<style scoped>
.flex {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.flex-price {
  display: flex;
  align-items: center;
}
.btn-group {
  display: flex;
  gap: 1rem;
}
.circle-img {
  display: inline-block;
  position: relative;
  width: 200px;
  height: 200px;
  overflow: hidden;
  border-radius: 50%;
}
.error-msg {
  display: flex;
  flex-direction: column;
}
.error-msg p {
  color: red;
}
</style>
