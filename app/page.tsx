import Link from 'next/link'

export default function Home() {
  return (
    <div className="text-center py-16">
      <h2 className="text-4xl font-bold mb-4">Find Your Path</h2>
      <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
        Degree apprenticeships are a different path than university. Learn directly from people
        who are living it right now.
      </p>

      <div className="flex gap-4 justify-center mb-12">
        <Link
          href="/signup"
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700"
        >
          I'm an Aspiring Apprentice
        </Link>
        <Link
          href="/apprentice/signup"
          className="bg-gray-300 text-gray-800 px-8 py-3 rounded-lg font-semibold hover:bg-gray-400"
        >
          I'm an Apprentice
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Talk to Real Apprentices</h3>
          <p className="text-gray-600">Get advice from people who just completed the journey you're considering.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Sector-Specific Guidance</h3>
          <p className="text-gray-600">Connect with apprentices in your target sector and company.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Free & Accessible</h3>
          <p className="text-gray-600">No fees. Just real conversations with real people.</p>
        </div>
      </div>
    </div>
  )
}
