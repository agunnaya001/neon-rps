import { useState, useEffect } from 'react'

interface Tournament {
  id: number
  name: string
  description?: string
  status: 'registration' | 'in_progress' | 'completed' | 'cancelled'
  maxPlayers: number
  participantCount: number
  entryFee: string
  prizePool: string
  tournamentType: 'single_elimination' | 'round_robin'
  createdAt: string
}

const statusColors: Record<string, string> = {
  registration: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-800',
}

export default function Tournaments() {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<Tournament['status']>('registration')

  useEffect(() => {
    fetchTournaments()
  }, [status])

  async function fetchTournaments() {
    try {
      setLoading(true)
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/tournaments?status=${status}&page=1&limit=20`)
      const { data } = await response.json()
      setTournaments(data)
    } catch (error) {
      console.error('Failed to fetch tournaments:', error)
    } finally {
      setLoading(false)
    }
  }

  const statusLabels: Record<Tournament['status'], string> = {
    registration: 'Registration Open',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Tournaments</h1>

      <div className="flex gap-2 mb-6 flex-wrap">
        {(['registration', 'in_progress', 'completed'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`px-4 py-2 rounded-lg font-medium ${
              status === s ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
            }`}
          >
            {statusLabels[s]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-8">Loading tournaments...</div>
      ) : tournaments.length === 0 ? (
        <div className="text-center py-8 text-gray-600">
          No tournaments in {statusLabels[status]} status
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tournaments.map((tournament) => (
            <div key={tournament.id} className="border rounded-lg p-4 hover:shadow-lg transition">
              <div className="flex justify-between items-start mb-3">
                <h2 className="text-xl font-bold">{tournament.name}</h2>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColors[tournament.status]}`}>
                  {statusLabels[tournament.status]}
                </span>
              </div>

              {tournament.description && (
                <p className="text-gray-600 text-sm mb-3">{tournament.description}</p>
              )}

              <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                <div>
                  <span className="text-gray-500">Type</span>
                  <p className="font-medium capitalize">
                    {tournament.tournamentType.replace('_', ' ')}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Players</span>
                  <p className="font-medium">
                    {tournament.participantCount}/{tournament.maxPlayers}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Entry Fee</span>
                  <p className="font-medium">Ⓔ {(Number(tournament.entryFee) / 1e18).toFixed(3)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Prize Pool</span>
                  <p className="font-medium">Ⓔ {(Number(tournament.prizePool) / 1e18).toFixed(2)}</p>
                </div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{
                    width: `${(tournament.participantCount / tournament.maxPlayers) * 100}%`,
                  }}
                />
              </div>

              {tournament.status === 'registration' && (
                <button className="w-full bg-blue-500 text-white px-4 py-2 rounded font-medium hover:bg-blue-600">
                  Join Tournament
                </button>
              )}

              {tournament.status === 'in_progress' && (
                <button className="w-full bg-gray-500 text-white px-4 py-2 rounded font-medium">
                  View Bracket
                </button>
              )}

              {tournament.status === 'completed' && (
                <button className="w-full bg-gray-500 text-white px-4 py-2 rounded font-medium">
                  View Results
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
