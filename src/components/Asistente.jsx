import { useState, useRef, useEffect } from 'react'
import OpenAI from 'openai'

function TypingDots() {
  return (
    <div style={{ display: 'flex', gap: '4px', alignItems: 'center', padding: '4px 0' }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: '6px', height: '6px', borderRadius: '50%',
          background: '#555',
          animation: 'pulse 1.2s ease-in-out infinite',
          animationDelay: `${i * 0.2}s`
        }} />
      ))}
      <style>{`
        @keyframes pulse {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.4; }
          40% { transform: scale(1.2); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

const client = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
})

export default function Asistente({ notes }) {
  const [mensajes, setMensajes] = useState([
    { rol: 'asistente', texto: '¡Hola! Soy tu asistente. Tengo acceso a todas tus notas. Preguntame sobre pendientes, recordatorios, ideas — lo que quieras.' }
  ])
  const [input, setInput] = useState('')
  const [cargando, setCargando] = useState(false)
  const [streamText, setStreamText] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes, cargando, streamText])

  const construirContexto = () => {
    if (!notes.length) return 'El usuario aún no tiene notas guardadas.'
    return notes.map((n, i) => {
      const fecha = n.createdAt?.toDate ? n.createdAt.toDate().toLocaleDateString('es-ES') : 'sin fecha'
      const tag = n.tag ? `[${n.tag}]` : ''
      const archivo = n.archivo ? `[archivo: ${n.archivo.nombre || n.archivo.url}]` : ''
      return `Nota ${i + 1} (${n.tipo}) ${tag} - ${fecha}: ${n.texto || ''} ${archivo}`
    }).join('\n')
  }

  const enviar = async () => {
    if (!input.trim() || cargando) return
    const pregunta = input.trim()
    setInput('')

    const nuevosMensajes = [...mensajes, { rol: 'usuario', texto: pregunta }]
    setMensajes(nuevosMensajes)
    setCargando(true)
    setStreamText('')

    const contexto = construirContexto()
    const historial = nuevosMensajes.map(m => ({
      role: m.rol === 'usuario' ? 'user' : 'assistant',
      content: m.texto
    }))

    try {
      const stream = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        stream: true,
        messages: [
          {
            role: 'system',
            content: `Sos un asistente personal inteligente. El usuario tiene las siguientes notas guardadas:\n\n${contexto}\n\nRespondé en español, de forma clara y útil. Cuando el usuario pregunte por pendientes, temas o recordatorios, buscá en las notas y resumí lo relevante. Sé conciso pero completo.`
          },
          ...historial
        ]
      })

      let respuestaCompleta = ''
      setCargando(false)

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content || ''
        respuestaCompleta += delta
        setStreamText(respuestaCompleta)
      }

      setMensajes(prev => [...prev, { rol: 'asistente', texto: respuestaCompleta }])
      setStreamText('')
    } catch (err) {
      setCargando(false)
      setStreamText('')
      setMensajes(prev => [...prev, { rol: 'asistente', texto: 'Error al conectar con el asistente. Verificá tu API key en el archivo .env' }])
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviar() }
  }

  const sugerencias = [
    '¿Qué tengo pendiente?',
    '¿Qué notas tengo sobre trabajo?',
    'Resumí todo lo que guardé hoy',
    '¿Qué ideas tengo anotadas?'
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 130px)' }}>
      <div style={{ padding: '0 0 1rem', borderBottom: '1px solid #1a1a1a', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.25rem' }}>🤖</span>
          <div>
            <p style={{ color: '#f5f0e8', fontFamily: 'monospace', fontWeight: '600', margin: 0 }}>Asistente IA</p>
            <p style={{ color: '#555', fontFamily: 'monospace', fontSize: '0.75rem', margin: 0 }}>
              {notes.length} {notes.length === 1 ? 'nota disponible' : 'notas disponibles'}
            </p>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '1rem' }}>
        {mensajes.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.rol === 'usuario' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '85%',
              background: m.rol === 'usuario' ? '#f5f0e8' : '#1a1a1a',
              color: m.rol === 'usuario' ? '#0f0f0f' : '#e2e8f0',
              borderRadius: m.rol === 'usuario' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              padding: '0.75rem 1rem',
              fontFamily: 'monospace', fontSize: '0.9rem', lineHeight: '1.6',
              border: m.rol === 'asistente' ? '1px solid #2a2a2a' : 'none',
              whiteSpace: 'pre-wrap'
            }}>
              {m.texto}
            </div>
          </div>
        ))}

        {/* Respuesta en streaming */}
        {streamText && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{
              maxWidth: '85%', background: '#1a1a1a', color: '#e2e8f0',
              borderRadius: '16px 16px 16px 4px', padding: '0.75rem 1rem',
              fontFamily: 'monospace', fontSize: '0.9rem', lineHeight: '1.6',
              border: '1px solid #2a2a2a', whiteSpace: 'pre-wrap'
            }}>
              {streamText}
              <span style={{ display: 'inline-block', width: '2px', height: '14px', background: '#888', marginLeft: '2px', animation: 'blink 1s infinite' }} />
              <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
            </div>
          </div>
        )}

        {cargando && !streamText && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '16px 16px 16px 4px', padding: '0.75rem 1rem' }}>
              <TypingDots />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {mensajes.length === 1 && (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
          {sugerencias.map(s => (
            <button key={s} onClick={() => setInput(s)}
              style={{
                background: '#1a1a1a', border: '1px solid #2a2a2a',
                color: '#888', borderRadius: '20px',
                padding: '6px 12px', cursor: 'pointer',
                fontSize: '0.78rem', fontFamily: 'monospace'
              }}>
              {s}
            </button>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid #1a1a1a' }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Preguntá sobre tus notas... (Enter para enviar)"
          rows={2}
          style={{
            flex: 1, background: '#1a1a1a', color: '#f5f0e8',
            border: '1px solid #2a2a2a', borderRadius: '12px',
            padding: '0.65rem 0.75rem', fontSize: '0.9rem',
            fontFamily: 'monospace', resize: 'none'
          }}
        />
        <button onClick={enviar} disabled={!input.trim() || cargando}
          style={{
            background: input.trim() && !cargando ? '#f5f0e8' : '#1a1a1a',
            color: input.trim() && !cargando ? '#0f0f0f' : '#444',
            border: '1px solid #2a2a2a', borderRadius: '12px',
            padding: '0 1rem', cursor: 'pointer',
            fontSize: '1.2rem', alignSelf: 'stretch'
          }}>
          ↑
        </button>
      </div>
    </div>
  )
}