import { useCallback, useEffect, useRef, useState } from 'react'
import './App.css'

function wsUrl(path: string) {
  const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${proto}//${window.location.host}${path}`
}

export default function App() {
  const [apiHealth, setApiHealth] = useState<string>('…')
  const [dbHealth, setDbHealth] = useState<string>('…')
  const [wsLog, setWsLog] = useState<string[]>([])
  const [outgoing, setOutgoing] = useState('SKU-001 @ 12.99')
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then((j: { status: string }) => setApiHealth(j.status))
      .catch(() => setApiHealth('unreachable (start FastAPI on :8000)'))

    fetch('/api/health/db')
      .then((r) => r.json())
      .then((j: { status: string; detail?: string }) =>
        setDbHealth(j.status === 'ok' ? 'ok' : `error: ${j.detail ?? 'unknown'}`),
      )
      .catch(() =>
        setDbHealth('unreachable (start Postgres + FastAPI, see commands below)'),
      )
  }, [])

  const appendLog = useCallback((line: string) => {
    setWsLog((prev) => [...prev.slice(-49), line])
  }, [])

  useEffect(() => {
    const url = wsUrl('/ws/prices')
    const ws = new WebSocket(url)
    wsRef.current = ws
    ws.onopen = () => appendLog('[ws] connected')
    ws.onmessage = (ev) => appendLog(`[ws] ${ev.data}`)
    ws.onerror = () => appendLog('[ws] error')
    ws.onclose = () => appendLog('[ws] closed')
    return () => {
      ws.close()
      wsRef.current = null
    }
  }, [appendLog])

  const sendPrice = () => {
    const ws = wsRef.current
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      appendLog('[ws] not connected')
      return
    }
    ws.send(outgoing)
  }

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <h1>Retail pricing manager dashboard</h1>
        <p className="dashboard__subtitle">
          CMPE 295A — Sprint 0 scaffold (React + FastAPI + PostgreSQL)
        </p>
      </header>

      <section className="panel">
        <h2>Service status</h2>
        <ul className="status-list">
          <li>
            <span>FastAPI</span>
            <code>{apiHealth}</code>
          </li>
          <li>
            <span>PostgreSQL (via API)</span>
            <code>{dbHealth}</code>
          </li>
        </ul>
        <p className="hint">
          Run Postgres:{' '}
          <code>
            docker compose -f docker/docker-compose.yml up -d
          </code>
          · API:{' '}
          <code>
            cd services/dashboard-api && python -m uvicorn app.main:app
            --reload --host 0.0.0.0 --port 8000
          </code>
        </p>
      </section>

      <section className="panel">
        <h2>WebSocket echo (workbook section 8.4)</h2>
        <p className="panel__lead">
          Messages to <code>/ws/prices</code> are echoed by FastAPI (proxied
          through Vite in dev).
        </p>
        <div className="ws-row">
          <input
            type="text"
            value={outgoing}
            onChange={(e) => setOutgoing(e.target.value)}
            aria-label="WebSocket message"
          />
          <button type="button" onClick={sendPrice}>
            Send
          </button>
        </div>
        <pre className="ws-log" aria-live="polite">
          {wsLog.join('\n') || '(no messages yet)'}
        </pre>
      </section>

      <section className="panel panel--muted">
        <h2>Next (Sprint 1)</h2>
        <p>
          MQTT bridge, live price table, placeholder SHAP panel — per workbook
          schedule.
        </p>
      </section>
    </div>
  )
}
