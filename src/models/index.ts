export type Product = {
    id: number
    title: string
    description: string
    thumbnail: string
    discountPercentage: number
    price: number
    brand: string
    category: string
    rating: number
    stock: number
    images: string[]
  }
  
  export type ProductData = {
    products: Product[]
  }
  