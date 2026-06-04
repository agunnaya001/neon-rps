'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Tournament {
  id: string
  name: string
  description?: string
  format: string
  maxPlayers: number
  entryFee: string
  prizePool: string
  status: string
  createdAt: string
}

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)

  useEffect(() => {
    loadTournaments()
  }, [])

  const loadTournaments = async () => {
    try {
      const res = await fetch('/api/tournaments')
      const data = await res.json()
      setTournaments(data)
    } catch (error) {
      console.error('[v0] Load tournaments error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTournament = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    try {
      const res = await fetch('/api/tournaments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          description: formData.get('description'),
          format: formData.get('format'),
          maxPlayers: formData.get('maxPlayers'),
          entryFee: formData.get('entryFee'),
        }),
      })

      if (res.ok) {
        const newTournament = await res.json()
        setTournaments([newTournament, ...tournaments])
        setShowCreateForm(false)
        // Reset form
        ;(e.target as HTMLFormElement).reset()
      }
    } catch (error) {
      console.error('[v0] Create tournament error:', error)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a3a] to-[#0f0f23]">
      {/* Navigation */}
      <nav className="border-b border-[#333333] bg-[#0f0f23]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-[#00ff88]">
            NEON RPS
          </Link>
          <div className="flex gap-6">
            <Link href="/tournaments" className="text-[#00ff88]">Tournaments</Link>
            <Link href="/challenges" className="text-[#ffffff]">Challenges</Link>
            <Link href="/leaderboard" className="text-[#ffffff]">Leaderboard</Link>
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
            {showCreateForm ? 'Cancel' : 'Create Tournament'}
          </button>
        </div>

        {showCreateForm && (
          <form onSubmit={handleCreateTournament} className="bg-[#1a1a3a] border border-[#333333] rounded-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#00ff88] font-bold mb-2">Tournament Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g., Weekend Blitz"
                  className="w-full bg-[#0f0f23] border border-[#333333] rounded px-4 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-[#00ff88] font-bold mb-2">Format</label>
                <select
                  name="format"
                  className="w-full bg-[#0f0f23] border border-[#333333] rounded px-4 py-2 text-white"
                >
                  <option value="single-elimination">Single Elimination</option>
                  <option value="round-robin">Round Robin</option>
                </select>
              </div>
              <div>
                <label className="block text-[#00ff88] font-bold mb-2">Max Players</label>
                <input
                  type="number"
                  name="maxPlayers"
                  required
                  min="2"
                  max="256"
                  placeholder="8"
                  className="w-full bg-[#0f0f23] border border-[#333333] rounded px-4 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-[#00ff88] font-bold mb-2">Entry Fee (ETH)</label>
                <input
                  type="text"
                  name="entryFee"
                  required
                  placeholder="0.01"
                  className="w-full bg-[#0f0f23] border border-[#333333] rounded px-4 py-2 text-white"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[#00ff88] font-bold mb-2">Description</label>
                <textarea
                  name="description"
                  placeholder="Describe your tournament..."
                  className="w-full bg-[#0f0f23] border border-[#333333] rounded px-4 py-2 text-white"
                  rows={3}
                />
              </div>
            </div>
            <button
              type="submit"
              className="mt-4 w-full px-6 py-2 bg-[#00ff88] text-[#0f0f23] font-bold rounded hover:bg-[#00ccff] transition"
            >
              Create Tournament
            </button>
          </form>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-[#666666]">Loading tournaments...</p>
          </div>
        ) : tournaments.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#666666] mb-4">No tournaments yet. Be the first to create one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tournaments.map((tournament) => (
              <Link key={tournament.id} href={`/tournaments/${tournament.id}`}>
                <div className="bg-[#1a1a3a] border border-[#333333] rounded-lg p-6 hover:border-[#00ff88] transition h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1">{tournament.name}</h3>
                      <span className={`inline-block px-3 py-1 rounded text-sm font-bold ${
                        tournament.status === 'open'
                          ? 'bg-[#00ff88] text-[#0f0f23]'
                          : 'bg-[#666666] text-white'
                      }`}>
                        {tournament.status}
                      </span>
                    </div>
                  </div>

                  {tournament.description && (
                    <p className="text-[#666666] text-sm mb-4">{tournament.description}</p>
                  )}

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#666666]">Format:</span>
                      <span className="text-white">{tournament.format}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#666666]">Players:</span>
                      <span className="text-white">Max {tournament.maxPlayers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#666666]">Entry Fee:</span>
                      <span className="text-[#00ff88]">{tournament.entryFee} ETH</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#666666]">Prize Pool:</span>
                      <span className="text-[#00ccff]">{tournament.prizePool} ETH</span>
                    </div>
                  </div>

                  <button className="w-full mt-6 px-4 py-2 bg-[#00ff88] text-[#0f0f23] font-bold rounded hover:bg-[#00ccff] transition">
                    Join Tournament
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
