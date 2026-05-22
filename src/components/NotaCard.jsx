const ICONOS = { texto: '✏️', voz: '🎤', foto: '📷', archivo: '📄' }

function formatFecha(ts) {
  if (!ts) return ''
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function NotaCard({ nota, onDelete }) {
  return (
    <div style={{
      background: '#1a1a1a',
      borderRadius: '14px',
      padding: '1rem 1.1rem',
      border: '1px solid #2a2a2a',
      position: 'relative'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <span style={{ fontSize: '1rem' }}>{ICONOS[nota.tipo] || '📝'}</span>
        {nota.tag && (
          <span style={{
            background: '#2a2a2a', color: '#a0aec0',
            borderRadius: '6px', padding: '2px 8px',
            fontSize: '0.75rem', fontFamily: 'monospace'
          }}>#{nota.tag}</span>
        )}
        <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#555', fontFamily: 'monospace' }}>
          {formatFecha(nota.createdAt)}
        </span>
        <button onClick={() => onDelete(nota.id)} style={{
          background: 'none', border: 'none', color: '#555',
          cursor: 'pointer', fontSize: '1rem', padding: '0 0 0 4px'
        }}>✕</button>
      </div>

      {nota.archivo?.tipo?.startsWith('image/') && (
        <img src={nota.archivo.url} alt="foto" style={{
          width: '100%', borderRadius: '10px',
          maxHeight: '220px', objectFit: 'cover', marginBottom: '0.5rem'
        }} />
      )}

      {nota.archivo && !nota.archivo.tipo?.startsWith('image/') && (
        <a href={nota.archivo.url} target="_blank" rel="noreferrer" style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          color: '#68d391', fontFamily: 'monospace', fontSize: '0.85rem',
          marginBottom: '0.5rem', textDecoration: 'none'
        }}>
          📄 {nota.archivo.nombre}
        </a>
      )}

      {nota.texto && (
        <p style={{
          color: '#e2e8f0', fontFamily: 'monospace',
          fontSize: '0.95rem', lineHeight: '1.6',
          margin: 0, whiteSpace: 'pre-wrap'
        }}>{nota.texto}</p>
      )}
    </div>
  )
}
