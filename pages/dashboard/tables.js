'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Image from 'next/image'

export default function Tables() {
  const { data: session } = useSession()
  const router = useRouter()
  const [tables, setTables] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [newTable, setNewTable] = useState({
    number: '',
    capacity: '',
    location: 'interior',
  })

  useEffect(() => {
    if (session) {
      fetchTables()
    }
  }, [session])

  const fetchTables = async () => {
    try {
      const response = await fetch('/api/tables/get-tables')
      if (!response.ok) {
        throw new Error('Eroare la încărcarea meselor')
      }
      const data = await response.json()
      setTables(data)
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
      const response = await fetch('/api/tables/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTable),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Eroare la crearea mesei')
      }

      setTables((prev) => [...prev, data.table])
      setNewTable({
        number: '',
        capacity: '',
        location: 'interior',
      })
    } catch (err) {
      setError(err.message)
    }
  }

  const downloadQR = async (table) => {
    try {
      // Creează un element anchor temporar
      const link = document.createElement('a')
      link.href = table.qrCode
      link.download = `masa-${table.number}-qr.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      setError('Eroare la descărcarea codului QR')
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
            Gestionare Mese
          </h2>
        </div>
      </div>

      {error && (
        <div className="mt-4 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      {/* Formular adăugare masă nouă */}
      <div className="mt-8 bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Adaugă masă nouă
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label
                htmlFor="number"
                className="block text-sm font-medium text-gray-700"
              >
                Număr masă
              </label>
              <input
                type="number"
                name="number"
                id="number"
                required
                value={newTable.number}
                onChange={(e) =>
                  setNewTable((prev) => ({ ...prev, number: e.target.value }))
                }
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
              />
            </div>

            <div>
              <label
                htmlFor="capacity"
                className="block text-sm font-medium text-gray-700"
              >
                Capacitate
              </label>
              <input
                type="number"
                name="capacity"
                id="capacity"
                required
                value={newTable.capacity}
                onChange={(e) =>
                  setNewTable((prev) => ({
                    ...prev,
                    capacity: e.target.value,
                  }))
                }
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
              />
            </div>

            <div>
              <label
                htmlFor="location"
                className="block text-sm font-medium text-gray-700"
              >
                Locație
              </label>
              <select
                name="location"
                id="location"
                value={newTable.location}
                onChange={(e) =>
                  setNewTable((prev) => ({
                    ...prev,
                    location: e.target.value,
                  }))
                }
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
              >
                <option value="interior">Interior</option>
                <option value="terasa">Terasă</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Adaugă masă
            </button>
          </div>
        </form>
      </div>

      {/* Lista mese */}
      <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {tables.map((table) => (
            <li key={table._id}>
              <div className="px-4 py-4 flex items-center sm:px-6">
                <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <div className="flex text-sm">
                      <p className="font-medium text-indigo-600 truncate">
                        Masa {table.number}
                      </p>
                      <p className="ml-1 flex-shrink-0 font-normal text-gray-500">
                        • {table.location}
                      </p>
                    </div>
                    <div className="mt-2">
                      <div className="flex items-center text-sm text-gray-500">
                        <p>Capacitate: {table.capacity} persoane</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="ml-5 flex-shrink-0">
                  {table.qrCode && (
                    <div className="flex flex-col items-center space-y-2">
                      <img
                        src={table.qrCode}
                        alt={`QR Code pentru masa ${table.number}`}
                        className="w-24 h-24"
                      />
                      <button
                        onClick={() => downloadQR(table)}
                        className="text-indigo-600 hover:text-indigo-900 text-sm"
                      >
                        Descarcă QR
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
