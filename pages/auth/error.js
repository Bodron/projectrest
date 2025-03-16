import { useRouter } from 'next/router'
import Link from 'next/link'

export default function ErrorPage() {
  const router = useRouter()
  const { error } = router.query

  const getErrorMessage = (error) => {
    switch (error) {
      case 'Configuration':
        return 'A apărut o eroare de configurare.'
      case 'AccessDenied':
        return 'Nu aveți acces la această resursă.'
      case 'Verification':
        return 'Link-ul de verificare a expirat sau a fost deja folosit.'
      default:
        return 'A apărut o eroare la autentificare.'
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Eroare de autentificare
            </h2>
            <p className="text-gray-600 mb-6">{getErrorMessage(error)}</p>
            <div className="space-y-4">
              <Link
                href="/auth/signin"
                className="block w-full text-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Încearcă din nou
              </Link>
              <Link
                href="/"
                className="block w-full text-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Înapoi la pagina principală
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
