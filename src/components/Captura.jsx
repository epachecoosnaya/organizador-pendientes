import { useState, useRef } from 'react'
import { uploadToCloudinary } from '../cloudinary'

const TIPOS = [
  { key: 'texto', icon: '✏️', label: 'Texto' },
  { key: 'voz', icon: '🎤', label: 'Voz' },
  { key: 'foto', icon: '📷', label: 'Foto' },
  { key: 'archivo', icon: '📄', label: 'Archivo' },
]

export default function Captura({ onSave }) {
  const [tipo, setTipo] = useState('texto')
  const [texto, setTexto] = useState('')
  const [tag, setTag] = useState('')
  const [grabando, setGrabando] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(null)
  const [archivoInfo, setArchivoInfo] = useState(null)
  const recognitionRef = useRef(null)
  const fileRef = useRef(null)

  const startVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { alert('Tu navegador no soporta reconocimiento de voz. Usá Chrome.'); return }
    const rec = new SR()
    rec.lang = 'es-ES'
    rec.continuous = true
    rec.interimResults = true
    rec.onresult = (e) => {
      let t = ''
      for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript
      setTexto(t)
    }
    rec.start()
    recognitionRef.current = rec
    setGrabando(true)
  }

  const stopVoice = () => {
    recognitionRef.current?.stop()
    setGrabando(false)
  }

  const handleFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (ev) => setPreview(ev.target.result)
        reader.readAsDataURL(file)
      }
      const result = await uploadToCloudinary(file)
      setArchivoInfo({ url: result.url, nombre: file.name, tipo: file.type })
    } catch (err) {
      alert('Error subiendo archivo: ' + err.message)
    }
    setUploading(false)
  }

  const handleSave = async () => {
    if (!texto.trim() && !archivoInfo) return
    const nota = {
      tipo,
      texto: texto.trim(),
      tag: tag.trim(),
      ...(archivoInfo && { archivo: archivoInfo }),
    }
    await onSave(nota)
    setTexto('')
    setTag('')
    setPreview(null)
    setArchivoInfo(null)
  }

  return (
    <div style={{
      background: '#1a1a1a',
      borderRadius: '16px',
      padding: '1.25rem',
      marginBottom: '1.5rem',
      border: '1px solid #2a2a2a'
    }}>
      {/* Selector de tipo */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        {TIPOS.map(t => (
          <button key={t.key} onClick={() => { setTipo(t.key); setTexto(''); setPreview(null); setArchivoInfo(null) }}
            style={{
              flex: 1,
              padding: '0.5rem 0',
              borderRadius: '10px',
              border: tipo === t.key ? '2px solid #f5f0e8' : '1px solid #333',
              background: tipo === t.key ? '#f5f0e8' : 'transparent',
              color: tipo === t.key ? '#0f0f0f' : '#888',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontFamily: 'monospace',
              fontWeight: tipo === t.key ? '600' : '400'
            }}>
            <div>{t.icon}</div>
            <div>{t.label}</div>
          </button>
        ))}
      </div>

      {/* Contenido según tipo */}
      {(tipo === 'texto' || tipo === 'voz') && (
        <textarea
          value={texto}
          onChange={e => setTexto(e.target.value)}
          placeholder={tipo === 'voz' ? 'Presioná el botón para dictar...' : 'Escribí tu nota...'}
          rows={4}
          style={{
            width: '100%', boxSizing: 'border-box',
            background: '#0f0f0f', color: '#f5f0e8',
            border: '1px solid #333', borderRadius: '10px',
            padding: '0.75rem', fontSize: '1rem',
            fontFamily: 'monospace', resize: 'vertical'
          }}
        />
      )}

      {tipo === 'voz' && (
        <button onClick={grabando ? stopVoice : startVoice} style={{
          marginTop: '0.75rem', width: '100%',
          padding: '0.75rem',
          background: grabando ? '#e53e3e' : '#2d6a4f',
          color: '#fff', border: 'none', borderRadius: '10px',
          fontSize: '1rem', cursor: 'pointer', fontFamily: 'monospace'
        }}>
          {grabando ? '⏹ Detener grabación' : '🎤 Iniciar dictado'}
        </button>
      )}

      {(tipo === 'foto' || tipo === 'archivo') && (
        <div>
          <input ref={fileRef} type="file"
            accept={tipo === 'foto' ? 'image/*' : '*/*'}
            capture={tipo === 'foto' ? 'environment' : undefined}
            onChange={handleFile}
            style={{ display: 'none' }}
          />
          <button onClick={() => fileRef.current.click()} style={{
            width: '100%', padding: '2rem',
            background: '#0f0f0f', border: '2px dashed #333',
            borderRadius: '10px', color: '#888',
            cursor: 'pointer', fontSize: '1rem', fontFamily: 'monospace'
          }}>
            {uploading ? '⏳ Subiendo...' : tipo === 'foto' ? '📷 Tocar para tomar foto o elegir imagen' : '📄 Elegir archivo (PDF, doc...)'}
          </button>
          {preview && <img src={preview} alt="preview" style={{ marginTop: '0.5rem', width: '100%', borderRadius: '10px', maxHeight: '200px', objectFit: 'cover' }} />}
          {archivoInfo && !preview && <p style={{ color: '#68d391', fontFamily: 'monospace', fontSize: '0.85rem', marginTop: '0.5rem' }}>✓ {archivoInfo.nombre}</p>}
          <textarea
            value={texto}
            onChange={e => setTexto(e.target.value)}
            placeholder="Comentario o descripción (opcional)..."
            rows={2}
            style={{
              marginTop: '0.75rem', width: '100%', boxSizing: 'border-box',
              background: '#0f0f0f', color: '#f5f0e8',
              border: '1px solid #333', borderRadius: '10px',
              padding: '0.75rem', fontSize: '0.95rem',
              fontFamily: 'monospace', resize: 'none'
            }}
          />
        </div>
      )}

      {/* Tag */}
      <input
        value={tag}
        onChange={e => setTag(e.target.value)}
        placeholder="# etiqueta (trabajo, ideas, personal...)"
        style={{
          marginTop: '0.75rem', width: '100%', boxSizing: 'border-box',
          background: '#0f0f0f', color: '#f5f0e8',
          border: '1px solid #333', borderRadius: '10px',
          padding: '0.65rem 0.75rem', fontSize: '0.9rem',
          fontFamily: 'monospace'
        }}
      />

      {/* Guardar */}
      <button onClick={handleSave} disabled={uploading || (!texto.trim() && !archivoInfo)}
        style={{
          marginTop: '0.75rem', width: '100%',
          padding: '0.85rem',
          background: (!texto.trim() && !archivoInfo) ? '#222' : '#f5f0e8',
          color: (!texto.trim() && !archivoInfo) ? '#555' : '#0f0f0f',
          border: 'none', borderRadius: '10px',
          fontSize: '1rem', fontWeight: '600',
          cursor: 'pointer', fontFamily: 'monospace'
        }}>
        Guardar nota
      </button>
    </div>
  )
}
