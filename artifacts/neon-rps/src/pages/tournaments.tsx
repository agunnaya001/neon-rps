import { useState } from 'react'
import { Link } from 'wouter'
import { useGetTournaments, useCreateTournament } from '@workspace/api-client-react'
import { useQueryClient } from '@tanstack/react-query'
import { getGetTournamentsQueryKey } from '@workspace/api-client-react'

export default function TournamentsPage() {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const queryClient = useQueryClient()
  const { data: tournaments = [], isLoading } = useGetTournaments()
  const createTournament = useCreateTournament({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetTournamentsQueryKey() })
        setShowCreateForm(false)
      }
    }
  })

  const handleCreateTournament = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    createTournament.mutate({
      data: {
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        format: formData.get('format') as string,
        maxPlayers: parseInt(formData.get('maxPlayers') as string),
        entryFee: formData.get('entryFee') as string,
      }
    })
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a3a] to-[#0f0f23]">
      <nav className="border-b border-[#333333] bg-[#0f0f23]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-[#00ff88]">NEON RPS</Link>
          <div className="flex gap-6">
            <Link href="/tournaments" className="text-[#00ff88]">Tournaments</Link>
            <Link href="/challenges" className="text-white hover:text-[#00ff88] transition">Challenges</Link>
            <Link href="/leaderboard" className="text-white hover:text-[#00ff88] transition">Leaderboard</Link>
          </div>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-white">🏆 Tournaments</h1>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-6 py-2 bg-[#00ff88] text-[#0f0f23] font-bold rounded hover:bg-[#00ccff] transition"
          >
            + Create Tournament
          </button>
        </div>

        {showCreateForm && (
          <div className="bg-[#1a1a3a] border border-[#00ff88] rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Create New Tournament</h2>
            <form onSubmit={handleCreateTournament} className="space-y-4">
              <div>
                <label className="block text-[#00ff88] font-bold mb-2">Tournament Name</label>
                <input name="name" required className="w-full bg-[#0f0f23] border border-[#333333] rounded px-4 py-2 text-white" />
              </div>
              <div>
                <label className="block text-[#00ff88] font-bold mb-2">Description</label>
                <textarea name="description" className="w-full bg-[#0f0f23] border border-[#333333] rounded px-4 py-2 text-white" rows={3} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[#00ff88] font-bold mb-2">Format</label>
                  <select name="format" className="w-full bg-[#0f0f23] border border-[#333333] rounded px-4 py-2 text-white">
                    <option value="single-elimination">Single Elimination</option>
                    <option value="double-elimination">Double Elimination</option>
                    <option value="round-robin">Round Robin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#00ff88] font-bold mb-2">Max Players</label>
                  <input name="maxPlayers" type="number" defaultValue="8" min="2" required className="w-full bg-[#0f0f23] border border-[#333333] rounded px-4 py-2 text-white" />
                </div>
                <div>
                  <label className="block text-[#00ff88] font-bold mb-2">Entry Fee (ETH)</label>
                  <input name="entryFee" type="text" defaultValue="0.01" required className="w-full bg-[#0f0f23] border border-[#333333] rounded px-4 py-2 text-white" />
                </div>
              </div>
              <div className="flex gap-4">
                <button type="submit" disabled={createTournament.isPending} className="px-8 py-3 bg-[#00ff88] text-[#0f0f23] font-bold rounded hover:bg-[#00ccff] transition disabled:opacity-50">
                  {createTournament.isPending ? 'Creating...' : 'Create Tournament'}
                </button>
                <button type="button" onClick={() => setShowCreateForm(false)} className="px-8 py-3 bg-[#333333] text-white font-bold rounded hover:bg-[#444444] transition">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-[#666666]">Loading tournaments...</p>
          </div>
        ) : tournaments.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏆</div>
            <p className="text-[#666666] text-lg mb-4">No tournaments yet. Be the first to create one!</p>
            <button onClick={() => setShowCreateForm(true)} className="px-8 py-3 bg-[#00ff88] text-[#0f0f23] font-bold rounded hover:bg-[#00ccff] transition">
              Create Tournament
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tournaments.map((t) => (
              <div key={t.id} className="bg-[#1a1a3a] border border-[#333333] rounded-lg p-6 hover:border-[#00ccff] transition">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">{t.name}</h3>
                  <span className={`px-3 py-1 rounded text-sm font-bold ${
                    t.status === 'open' ? 'bg-[#00ff88] text-[#0f0f23]' :
                    t.status === 'active' ? 'bg-[#00ccff] text-[#0f0f23]' :
                    'bg-[#333333] text-white'
                  }`}>
                    {t.status}
                  </span>
                </div>
                {t.description && <p className="text-[#666666] text-sm mb-4">{t.description}</p>}
                <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                  <div className="bg-[#0f0f23] rounded p-3">
                    <div className="text-[#666666]">Format</div>
                    <div className="text-white font-bold capitalize">{t.format.replace('-', ' ')}</div>
                  </div>
                  <div className="bg-[#0f0f23] rounded p-3">
                    <div className="text-[#666666]">Max Players</div>
                    <div className="text-white font-bold">{t.maxPlayers}</div>
                  </div>
                  <div className="bg-[#0f0f23] rounded p-3">
                    <div className="text-[#666666]">Entry Fee</div>
                    <div className="text-[#00ff88] font-bold">{t.entryFee} ETH</div>
                  </div>
                  <div className="bg-[#0f0f23] rounded p-3">
                    <div className="text-[#666666]">Prize Pool</div>
                    <div className="text-[#00ccff] font-bold">{t.prizePool ?? '—'} ETH</div>
                  </div>
                </div>
                {t.status === 'open' && (
                  <button className="w-full px-4 py-2 bg-[#00ccff] text-[#0f0f23] font-bold rounded hover:bg-[#00ff88] transition">
                    Join Tournament
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
