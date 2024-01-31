import type { Product } from '../models'
import { ref } from 'vue'
import { type DataTableSortMeta } from 'primevue/datatable'
import { FilterMatchMode } from 'primevue/api'
import axios from 'axios'
import {
  required,
  helpers,
  minLength,
  maxLength,
  maxValue,
  minValue,
  numeric,
  integer
} from '@vuelidate/validators'

const alphaNumSpaceDash = helpers.regex(/^[A-Za-z\s'-]+$/)
const twoDecimals = helpers.regex(/^[0-9]*\.[0-9]{2}$/)
const alphaNumDash = helpers.regex(/^[a-zA-Z\d\-']+$/)

export const products = ref<Product[]>([
  {
    id: 0,
    title: '',
    description: '',
    thumbnail: '',
    price: 0,
    discountPercentage: 0,
    brand: '',
    category: '',
    rating: 0,
    stock: 0,
    images: ['']
  }
])
export const rules = {
  title: {
    required,
    alphaNumSpaceDash: helpers.withMessage(
      'Only letters, numbers, spaces, apostrophes, and dashes',
      alphaNumSpaceDash
    ),
    minLength: helpers.withMessage('Must be at least 5 characters', minLength(5)),
    maxLength: helpers.withMessage('Must be at most 75 characters', maxLength(75))
  },
  price: {
    required,
    minValue: helpers.withMessage('Price is from 1 to 1000', minValue(1)),
    maxValue: helpers.withMessage('Price is from 1 to 1000', maxValue(1000)),
    numeric: helpers.withMessage('Only numbers allowed', numeric)
  },
  discountPercentage: {
    required,
    minValue: helpers.withMessage('Discount is from 1 to 20', minValue(1)),
    maxValue: helpers.withMessage('Discount is from 1 to 20', maxValue(20)),
    numeric: helpers.withMessage('Only numbers allowed', numeric),
    twoDecimals: helpers.withMessage('Only two decimals allowed', twoDecimals)
  },
  brand: {
    required,
    alphaNumSpaceDash: helpers.withMessage(
      'Only letters, numbers, spaces, apostrophes, and dashes',
      alphaNumDash
    ),
    minLength: helpers.withMessage('Must be at least 5 characters', minLength(5)),
    maxLength: helpers.withMessage('Must be at most 50 characters', maxLength(50))
  },
  category: {
    required,
    alphaNumSpaceDash: helpers.withMessage(
      'Only letters, numbers, spaces, apostrophes, and dashes',
      alphaNumDash
    ),
    minLength: helpers.withMessage('Must be at least 5 characters', minLength(5)),
    maxLength: helpers.withMessage('Must be at most 50 characters', maxLength(50))
  },
  rating: {
    required,
    minValue: helpers.withMessage('Rating is from 1 to 5', minValue(1)),
    maxValue: helpers.withMessage('Rating is from 1 to 5', maxValue(5)),
    twoDecimals: helpers.withMessage('Only two decimals allowed', twoDecimals)
  },
  stock: {
    required,
    minValue: helpers.withMessage('Min stock is 0', minValue(0)),
    maxValue: helpers.withMessage('Max stock is 500', maxValue(500)),
    integer: helpers.withMessage('Only whole numbers', integer)
  }
}
export const validationObj = ref<Product>({
  id: 0,
  title: '',
  description: '',
  thumbnail: '',
  price: 0,
  discountPercentage: 0,
  brand: '',
  category: '',
  rating: 0,
  stock: 0,
  images: ['']
})
// export const rules = {
//   collection: {
//     $each: helpers.forEach({
//       title: { required },
//       description: { required },
//       price: { required },
//       discountPercentage: { required },
//       brand: { required },
//       category: { required },
//       rating: { required },
//       stock: { required }
//     })
//   }
// }
export const expandedRows = ref<Record<number, boolean>>([])
export const sorting: DataTableSortMeta[] = [
  { field: 'discountPercentage', order: -1 },
  { field: 'rating', order: -1 }
]
export const editOptions = ['Row Edit', 'Cell Edit']
export const editOption = ref('Row Edit')
export const editingRows = ref<Product[]>([])
export const deleteProduct = (title: string) => {
  products.value = products.value.filter((product) => product.title != title)
  console.log(products.value)
}

export const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  title: { value: null, matchMode: FilterMatchMode.CONTAINS },
  price: { value: null, matchMode: FilterMatchMode.EQUALS },
  discountPercentage: { value: null, matchMode: FilterMatchMode.EQUALS },
  category: { value: null, matchMode: FilterMatchMode.CONTAINS },
  stock: { value: null, matchMode: FilterMatchMode.EQUALS },
  rating: { value: null, matchMode: FilterMatchMode.EQUALS }
})

export function debounce(fn: Function, delay: number) {
  let timer: any
  return (...args: any) => {
    if (timer) {
      clearTimeout(timer) // clear any pre-existing timer
    } // get the current context
    timer = setTimeout(() => {
      fn(...args) // call the function if time expires
    }, delay)
  }
}
const url = 'https://dummyjson.com/products/search?q=Laptop'
export const fetchLaptop = async () => {
  const { data } = await axios.get(url)
  console.log(data)
  return data.products
}
