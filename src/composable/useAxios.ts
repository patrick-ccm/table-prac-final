import axios from 'axios'
import type { Product, ProductData } from '@/models/index'

const url = 'https://dummyjson.com/products'
export const useAxios = async (): Promise<Product[]> => {
  const data = await axios.get<ProductData>(url)
  return data.data.products
}
