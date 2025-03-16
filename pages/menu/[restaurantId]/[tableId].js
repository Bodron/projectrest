'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

export default function Menu() {
  const router = useRouter()
  const { restaurantId, tableId } = router.query
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    if (restaurantId) {
      fetchProducts()
    }
  }, [restaurantId])

  const fetchProducts = async () => {
    try {
      const response = await fetch(
        `/api/products/get-products?restaurantId=${restaurantId}`
      )
      if (!response.ok) throw new Error('Eroare la încărcarea meniului')
      const data = await response.json()
      setProducts(data)

      // Extrage categoriile unice
      const uniqueCategories = [
        ...new Set(data.map((product) => product.category)),
      ]
      setCategories(uniqueCategories)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item._id === product._id)
      if (existingItem) {
        return prevCart.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prevCart, { ...product, quantity: 1 }]
    })
  }

  const removeFromCart = (productId) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item._id === productId)
      if (existingItem.quantity > 1) {
        return prevCart.map((item) =>
          item._id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
      }
      return prevCart.filter((item) => item._id !== productId)
    })
  }

  const placeOrder = async () => {
    try {
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tableId,
          items: cart.map((item) => ({
            product: item._id,
            quantity: item.quantity,
            price: item.price,
          })),
          specialRequests: '',
        }),
      })

      if (!response.ok) throw new Error('Eroare la plasarea comenzii')

      const data = await response.json()

      // Resetează coșul după plasarea comenzii
      setCart([])
      alert('Comanda a fost plasată cu succes!')
    } catch (err) {
      setError(err.message)
      alert(
        'A apărut o eroare la plasarea comenzii. Vă rugăm încercați din nou.'
      )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  const filteredProducts =
    selectedCategory === 'all'
      ? products
      : products.filter((product) => product.category === selectedCategory)

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Meniu</h1>
          <p className="text-gray-600">Masa {tableId}</p>
        </div>

        {/* Categorii */}
        <div className="bg-white rounded-lg shadow p-4 mb-6 overflow-x-auto">
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                selectedCategory === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Toate
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  selectedCategory === category
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Produse */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {filteredProducts.map((product) => (
            <div
              key={product._id}
              className="bg-white rounded-lg shadow overflow-hidden"
            >
              {product.image && (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {product.name}
                </h3>
                <p className="text-gray-500 text-sm mb-2">
                  {product.description}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">
                    {product.price} RON
                  </span>
                  <button
                    onClick={() => addToCart(product)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
                  >
                    Adaugă în coș
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Coș de cumpărături - fix la baza ecranului */}
        {cart.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-gray-700">{cart.length} produse</span>
                  <span className="mx-2">•</span>
                  <span className="font-bold">{totalAmount} RON</span>
                </div>
                <button
                  onClick={placeOrder}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
                >
                  Plasează comanda
                </button>
              </div>

              {/* Lista produse din coș */}
              <div className="mt-4 space-y-2">
                {cart.map((item) => (
                  <div
                    key={item._id}
                    className="flex justify-between items-center"
                  >
                    <div>
                      <span className="font-medium">{item.name}</span>
                      <span className="text-gray-500 mx-2">
                        x{item.quantity}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="font-bold">
                        {item.price * item.quantity} RON
                      </span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => removeFromCart(item._id)}
                          className="text-red-600 hover:text-red-800 px-2 py-1 rounded-md border border-red-600 hover:border-red-800"
                        >
                          -
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => addToCart(item)}
                          className="text-green-600 hover:text-green-800 px-2 py-1 rounded-md border border-green-600 hover:border-green-800"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
