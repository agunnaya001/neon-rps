import { useState } from 'react'
import { Trophy, Plus, X, Users, DollarSign, Layers } from 'lucide-react'
import { useGetTournaments, useCreateTournament, getGetTournamentsQueryKey } from '@workspace/api-client-react'
import { useQueryClient } from '@tanstack/react-query'
import Layout from '@/components/Layout'

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

  const statusStyle = (status: string) => {
    if (status === 'open') return { backgroundColor: 'rgba(0,255,136,0.15)', color: '#00ff88', border: '1px solid rgba(0,255,136,0.3)' }
    if (status === 'active') return { backgroundColor: 'rgba(0,204,255,0.15)', color: '#00ccff', border: '1px solid rgba(0,204,255,0.3)' }
    return { backgroundColor: 'rgba(100,100,100,0.15)', color: '#888', border: '1px solid rgba(100,100,100,0.3)' }
  }

  return (
    <Layout activePath="/tournaments">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-4xl sm:text-5xl font-black text-white mb-2">Tournaments</h1>
            <p style={{ color: '#888' }}>Compete in bracket tournaments for massive prize pools</p>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all hover:-translate-y-0.5 shrink-0"
            style={{ backgroundColor: showCreateForm ? 'rgba(255,0,110,0.15)' : 'rgba(0,255,136,0.15)', color: showCreateForm ? '#ff006e' : '#00ff88', border: `1px solid ${showCreateForm ? 'rgba(255,0,110,0.3)' : 'rgba(0,255,136,0.3)'}` }}
          >
            {showCreateForm ? <X size={16} /> : <Plus size={16} />}
            {showCreateForm ? 'Cancel' : 'Create Tournament'}
          </button>
        </div>

        {showCreateForm && (
          <div className="rounded-2xl p-8 border mb-8 fade-in" style={{ backgroundColor: 'rgba(26,26,58,0.8)', borderColor: 'rgba(0,255,136,0.3)' }}>
            <h2 className="text-2xl font-black text-white mb-6">New Tournament</h2>
            <form onSubmit={handleCreateTournament} className="space-y-5">
              <div>
                <label className="block text-xs font-bold tracking-widest mb-2" style={{ color: '#00ff88' }}>TOURNAMENT NAME</label>
                <input
                  name="name"
                  required
                  className="w-full rounded-xl px-4 py-3 text-white font-medium focus:outline-none transition-all"
                  style={{ backgroundColor: '#0f0f23', border: '1px solid #2a2a4a' }}
                  placeholder="e.g. Weekly Grand Prix"
                  onFocus={e => (e.target.style.borderColor = '#00ff88')}
                  onBlur={e => (e.target.style.borderColor = '#2a2a4a')}
                />
              </div>
              <div>
                <label className="block text-xs font-bold tracking-widest mb-2" style={{ color: '#00ff88' }}>DESCRIPTION</label>
                <textarea
                  name="description"
                  rows={2}
                  className="w-full rounded-xl px-4 py-3 text-white font-medium focus:outline-none transition-all resize-none"
                  style={{ backgroundColor: '#0f0f23', border: '1px solid #2a2a4a' }}
                  placeholder="Optional description..."
                  onFocus={e => (e.target.style.borderColor = '#00ff88')}
                  onBlur={e => (e.target.style.borderColor = '#2a2a4a')}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  {
                    name: 'format', label: 'FORMAT', type: 'select',
                    options: [
                      { value: 'single-elimination', label: 'Single Elimination' },
                      { value: 'double-elimination', label: 'Double Elimination' },
                      { value: 'round-robin', label: 'Round Robin' },
                    ]
                  },
                  { name: 'maxPlayers', label: 'MAX PLAYERS', type: 'number', defaultValue: '8', min: '2' },
                  { name: 'entryFee', label: 'ENTRY FEE (ETH)', type: 'text', defaultValue: '0.01' },
                ].map(field => (
                  <div key={field.name}>
                    <label className="block text-xs font-bold tracking-widest mb-2" style={{ color: '#00ff88' }}>{field.label}</label>
                    {field.type === 'select' ? (
                      <select
                        name={field.name}
                        className="w-full rounded-xl px-4 py-3 text-white font-medium focus:outline-none transition-all"
                        style={{ backgroundColor: '#0f0f23', border: '1px solid #2a2a4a' }}
                      >
                        {field.options!.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    ) : (
                      <input
                        name={field.name}
                        type={field.type}
                        defaultValue={field.defaultValue}
                        min={field.min}
                        required
                        className="w-full rounded-xl px-4 py-3 text-white font-medium focus:outline-none transition-all"
                        style={{ backgroundColor: '#0f0f23', border: '1px solid #2a2a4a' }}
                        onFocus={e => (e.target.style.borderColor = '#00ff88')}
                        onBlur={e => (e.target.style.borderColor = '#2a2a4a')}
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={createTournament.isPending}
                  className="px-8 py-3 rounded-xl font-bold text-[#0f0f23] shimmer-btn transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createTournament.isPending ? 'Creating...' : 'Create Tournament'}
                </button>
              </div>
            </form>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-20 gap-3">
            <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#00ff88', borderTopColor: 'transparent' }} />
            <span style={{ color: '#666' }}>Loading tournaments...</span>
          </div>
        ) : tournaments.length === 0 ? (
          <div className="text-center py-24 fade-in">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: 'rgba(0,204,255,0.1)' }}>
              <Trophy size={40} style={{ color: '#00ccff' }} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No tournaments yet</h3>
            <p className="mb-8" style={{ color: '#666' }}>Be the first to create one and start competing!</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-8 py-3 rounded-xl font-bold shimmer-btn text-[#0f0f23] transition-all hover:-translate-y-0.5"
            >
              Create First Tournament
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tournaments.map((t) => (
              <div key={t.id} className="rounded-2xl p-6 border transition-all duration-300 hover:-translate-y-1 flex flex-col"
                style={{ backgroundColor: 'rgba(26,26,58,0.6)', borderColor: '#2a2a4a' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#00ccff')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#2a2a4a')}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="text-lg font-bold text-white leading-tight">{t.name}</h3>
                  <span className="px-3 py-1 rounded-full text-xs font-bold capitalize shrink-0" style={statusStyle(t.status)}>
                    {t.status}
                  </span>
                </div>
                {t.description && <p className="text-sm mb-4 leading-relaxed" style={{ color: '#888' }}>{t.description}</p>}

                <div className="grid grid-cols-2 gap-2 mb-5 mt-auto">
                  {[
                    { icon: Layers, label: 'Format', value: t.format.replace(/-/g, ' '), color: '#888' },
                    { icon: Users, label: 'Max Players', value: String(t.maxPlayers), color: '#888' },
                    { icon: DollarSign, label: 'Entry Fee', value: `${t.entryFee} ETH`, color: '#00ff88' },
                    { icon: Trophy, label: 'Prize Pool', value: t.prizePool ? `${t.prizePool} ETH` : 'TBD', color: '#00ccff' },
                  ].map(({ icon: Icon, label, value, color }) => (
                    <div key={label} className="rounded-xl p-3" style={{ backgroundColor: '#0f0f23' }}>
                      <div className="text-xs mb-1" style={{ color: '#555' }}>{label}</div>
                      <div className="font-bold capitalize text-sm" style={{ color }}>{value}</div>
                    </div>
                  ))}
                </div>

                {t.status === 'open' && (
                  <button className="w-full py-3 rounded-xl font-bold text-sm transition-all hover:-translate-y-0.5"
                    style={{ backgroundColor: 'rgba(0,204,255,0.15)', color: '#00ccff', border: '1px solid rgba(0,204,255,0.3)' }}>
                    Join Tournament
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </Layout>
  )
}
