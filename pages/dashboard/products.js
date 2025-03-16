'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'

export default function Products() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
  })
  const [editingProduct, setEditingProduct] = useState(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated') {
      fetchProducts()
    }
  }, [status, router])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products/get-products')
      if (!response.ok) throw new Error('Eroare la încărcarea produselor')
      const data = await response.json()
      setProducts(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const response = await fetch('/api/products/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProduct),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Eroare la crearea produsului')
      }

      setProducts((prev) => [...prev, data.product])
      setNewProduct({
        name: '',
        description: '',
        price: '',
        category: '',
        image: '',
      })
    } catch (err) {
      setError(err.message)
    }
  }

  const handleEdit = async (e) => {
    e.preventDefault()
    if (!editingProduct) return

    try {
      const response = await fetch(
        `/api/products/update/${editingProduct._id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(editingProduct),
        }
      )

      if (!response.ok) throw new Error('Eroare la actualizarea produsului')

      setProducts((prev) =>
        prev.map((p) => (p._id === editingProduct._id ? editingProduct : p))
      )
      setEditingProduct(null)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDelete = async (productId) => {
    if (!confirm('Sigur doriți să ștergeți acest produs?')) return

    try {
      const response = await fetch(`/api/products/delete/${productId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Eroare la ștergerea produsului')

      setProducts((prev) => prev.filter((p) => p._id !== productId))
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Gestionare Produse
          </h2>
        </div>
      </div>

      {error && (
        <div className="mt-4 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      {/* Formular adăugare produs nou */}
      <div className="mt-8 bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {editingProduct ? 'Editare produs' : 'Adaugă produs nou'}
        </h3>
        <form
          onSubmit={editingProduct ? handleEdit : handleSubmit}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Nume produs
              </label>
              <input
                type="text"
                name="name"
                id="name"
                required
                value={editingProduct ? editingProduct.name : newProduct.name}
                onChange={(e) =>
                  editingProduct
                    ? setEditingProduct({
                        ...editingProduct,
                        name: e.target.value,
                      })
                    : setNewProduct({ ...newProduct, name: e.target.value })
                }
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
              />
            </div>

            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700"
              >
                Categorie
              </label>
              <input
                type="text"
                name="category"
                id="category"
                required
                value={
                  editingProduct ? editingProduct.category : newProduct.category
                }
                onChange={(e) =>
                  editingProduct
                    ? setEditingProduct({
                        ...editingProduct,
                        category: e.target.value,
                      })
                    : setNewProduct({
                        ...newProduct,
                        category: e.target.value,
                      })
                }
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
              />
            </div>

            <div>
              <label
                htmlFor="price"
                className="block text-sm font-medium text-gray-700"
              >
                Preț (RON)
              </label>
              <input
                type="number"
                name="price"
                id="price"
                required
                step="0.01"
                value={editingProduct ? editingProduct.price : newProduct.price}
                onChange={(e) =>
                  editingProduct
                    ? setEditingProduct({
                        ...editingProduct,
                        price: e.target.value,
                      })
                    : setNewProduct({ ...newProduct, price: e.target.value })
                }
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
              />
            </div>

            <div>
              <label
                htmlFor="image"
                className="block text-sm font-medium text-gray-700"
              >
                URL Imagine
              </label>
              <input
                type="text"
                name="image"
                id="image"
                value={editingProduct ? editingProduct.image : newProduct.image}
                onChange={(e) =>
                  editingProduct
                    ? setEditingProduct({
                        ...editingProduct,
                        image: e.target.value,
                      })
                    : setNewProduct({ ...newProduct, image: e.target.value })
                }
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Descriere
              </label>
              <textarea
                name="description"
                id="description"
                rows="3"
                value={
                  editingProduct
                    ? editingProduct.description
                    : newProduct.description
                }
                onChange={(e) =>
                  editingProduct
                    ? setEditingProduct({
                        ...editingProduct,
                        description: e.target.value,
                      })
                    : setNewProduct({
                        ...newProduct,
                        description: e.target.value,
                      })
                }
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
              ></textarea>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            {editingProduct && (
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Anulează
              </button>
            )}
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {editingProduct ? 'Salvează modificările' : 'Adaugă produs'}
            </button>
          </div>
        </form>
      </div>

      {/* Lista produse */}
      <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {products.map((product) => (
            <li key={product._id}>
              <div className="px-4 py-4 flex items-center sm:px-6">
                <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <div className="flex text-sm">
                      <p className="font-medium text-indigo-600 truncate">
                        {product.name}
                      </p>
                      <p className="ml-1 flex-shrink-0 font-normal text-gray-500">
                        {product.category}
                      </p>
                    </div>
                    <div className="mt-2">
                      <div className="flex items-center text-sm text-gray-500">
                        <p>{product.description}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex-shrink-0 sm:mt-0 sm:ml-5">
                    <div className="flex -space-x-1 overflow-hidden">
                      <span className="text-lg font-bold text-gray-900">
                        {product.price} RON
                      </span>
                    </div>
                  </div>
                </div>
                <div className="ml-5 flex-shrink-0">
                  <button
                    onClick={() => setEditingProduct(product)}
                    className="mr-2 text-indigo-600 hover:text-indigo-900"
                  >
                    Editează
                  </button>
                  <button
                    onClick={() => handleDelete(product._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Șterge
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
