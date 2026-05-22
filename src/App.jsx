import { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { useNotes } from './hooks/useNotes'
import Login from './components/Login'
import Captura from './components/Captura'
import NotaCard from './components/NotaCard'
import Asistente from './components/Asistente'

export default function App() {
  const { user, loading, login, logout } = useAuth()
  const { notes, addNote, deleteNote } = useNotes(user?.uid)
  const [busqueda, setBusqueda] = useState('')
  const [filtroTag, setFiltroTag] = useState('')
  const [pantalla, setPantalla] = useState('notas')

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#555', fontFamily: 'monospace' }}>cargando...</p>
    </div>
  )

  if (!user) return <Login onLogin={login} />

  const tags = [...new Set(notes.map(n => n.tag).filter(Boolean))]

  const notasFiltradas = notes.filter(n => {
    const matchBusqueda = !busqueda ||
      n.texto?.toLowerCase().includes(busqueda.toLowerCase()) ||
      n.tag?.toLowerCase().includes(busqueda.toLowerCase())
    const matchTag = !filtroTag || n.tag === filtroTag
    return matchBusqueda && matchTag
  })

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', color: '#f5f0e8' }}>
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: '#0f0f0f', borderBottom: '1px solid #1a1a1a',
        padding: '1rem 1.25rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.25rem' }}>📋</span>
          <span style={{ fontFamily: "'Georgia', serif", fontWeight: '700', fontSize: '1.1rem' }}>Organizador</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img src={user.photoURL} alt="" style={{ width: '28px', height: '28px', borderRadius: '50%' }} />
          <button onClick={logout} style={{
            background: 'none', border: '1px solid #333',
            color: '#888', borderRadius: '8px', padding: '4px 10px',
            cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'monospace'
          }}>salir</button>
        </div>
      </div>

      <div style={{
        display: 'flex', borderBottom: '1px solid #1a1a1a',
        padding: '0 1.25rem', background: '#0f0f0f',
        position: 'sticky', top: '61px', zIndex: 9
      }}>
        {[
          { key: 'notas', icon: '📝', label: 'Mis notas' },
          { key: 'asistente', icon: '🤖', label: 'Asistente IA' }
        ].map(tab => (
          <button key={tab.key} onClick={() => setPantalla(tab.key)} style={{
            background: 'none', border: 'none',
            borderBottom: pantalla === tab.key ? '2px solid #f5f0e8' : '2px solid transparent',
            color: pantalla === tab.key ? '#f5f0e8' : '#555',
            padding: '0.75rem 1rem',
            cursor: 'pointer', fontSize: '0.9rem',
            fontFamily: 'monospace', display: 'flex',
            alignItems: 'center', gap: '0.4rem',
            marginBottom: '-1px'
          }}>
            <span>{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '1.25rem' }}>
        {pantalla === 'notas' && (
          <>
            <Captura onSave={addNote} />
            <input
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder="🔍 buscar notas..."
              style={{
                width: '100%', boxSizing: 'border-box',
                background: '#1a1a1a', color: '#f5f0e8',
                border: '1px solid #2a2a2a', borderRadius: '10px',
                padding: '0.75rem', fontSize: '0.95rem',
                fontFamily: 'monospace', marginBottom: '0.75rem'
              }}
            />
            {tags.length > 0 && (
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                <button onClick={() => setFiltroTag('')} style={{
                  background: !filtroTag ? '#f5f0e8' : '#1a1a1a',
                  color: !filtroTag ? '#0f0f0f' : '#888',
                  border: '1px solid #333', borderRadius: '8px',
                  padding: '4px 12px', cursor: 'pointer',
                  fontSize: '0.8rem', fontFamily: 'monospace'
                }}>todos</button>
                {tags.map(t => (
                  <button key={t} onClick={() => setFiltroTag(t === filtroTag ? '' : t)} style={{
                    background: filtroTag === t ? '#f5f0e8' : '#1a1a1a',
                    color: filtroTag === t ? '#0f0f0f' : '#888',
                    border: '1px solid #333', borderRadius: '8px',
                    padding: '4px 12px', cursor: 'pointer',
                    fontSize: '0.8rem', fontFamily: 'monospace'
                  }}>#{t}</button>
                ))}
              </div>
            )}
            <p style={{ color: '#555', fontFamily: 'monospace', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
              {notasFiltradas.length} {notasFiltradas.length === 1 ? 'nota' : 'notas'}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {notasFiltradas.map(n => (
                <NotaCard key={n.id} nota={n} onDelete={deleteNote} />
              ))}
              {notasFiltradas.length === 0 && (
                <p style={{ color: '#444', fontFamily: 'monospace', textAlign: 'center', padding: '2rem' }}>
                  {busqueda ? 'sin resultados para esa búsqueda' : 'aún no hay notas — ¡agregá la primera!'}
                </p>
              )}
            </div>
          </>
        )}
        {pantalla === 'asistente' && <Asistente notes={notes} />}
      </div>
    </div>
  )
}