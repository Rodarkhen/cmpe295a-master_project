import { useCallback, useEffect, useMemo, useState } from 'react'
import { ShapPlaceholder } from './ShapPlaceholder'
import './App.css'

export type PriceRow = {
  product_id: string
  price: string
  reason: string
  topic?: string
  updated_at: string
}

function wsUrl(path: string) {
  const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${proto}//${window.location.host}${path}`
}

function mergePrices(
  prev: Record<string, PriceRow>,
  incoming: Record<string, PriceRow>,
): Record<string, PriceRow> {
  return { ...prev, ...incoming }
}

export default function App() {
  const [apiHealth, setApiHealth] = useState<string>('…')
  const [dbHealth, setDbHealth] = useState<string>('…')
  const [mqttHealth, setMqttHealth] = useState<string>('…')
  const [prices, setPrices] = useState<Record<string, PriceRow>>({})
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [wsStatus, setWsStatus] = useState<string>('connecting…')
  const [devSku, setDevSku] = useState('SKU-001')
  const [devPrice, setDevPrice] = useState('12.99')
  const [devReason, setDevReason] = useState('Inventory high')
  const [devMsg, setDevMsg] = useState<string | null>(null)

  const sortedRows = useMemo(() => {
    return Object.values(prices).sort((a, b) =>
      a.product_id.localeCompare(b.product_id),
    )
  }, [prices])

  const applySnapshot = useCallback((map: Record<string, PriceRow>) => {
    setPrices((p) => mergePrices(p, map))
  }, [])

  const applyUpdate = useCallback((row: PriceRow) => {
    setPrices((p) => ({ ...p, [row.product_id]: row }))
  }, [])

  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then((j: { status: string }) => setApiHealth(j.status))
      .catch(() => setApiHealth('unreachable'))

    fetch('/api/health/db')
      .then((r) => r.json())
      .then((j: { status: string; detail?: string }) =>
        setDbHealth(j.status === 'ok' ? 'ok' : `error: ${j.detail ?? ''}`),
      )
      .catch(() => setDbHealth('unreachable'))

    fetch('/api/health/mqtt')
      .then((r) => r.json())
      .then((j: { status: string; detail?: string }) => {
        if (j.status === 'ok') setMqttHealth('ok')
        else if (j.status === 'disabled') setMqttHealth('disabled')
        else setMqttHealth(j.detail ?? j.status)
      })
      .catch(() => setMqttHealth('unreachable'))

    fetch('/api/prices')
      .then((r) => r.json())
      .then((j: { prices: Record<string, PriceRow> }) => {
        if (j.prices) applySnapshot(j.prices)
      })
      .catch(() => {})
  }, [applySnapshot])

  useEffect(() => {
    const url = wsUrl('/ws/prices')
    const ws = new WebSocket(url)
    ws.onopen = () => setWsStatus('connected')
    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data) as
          | { type: 'snapshot'; prices: Record<string, PriceRow> }
          | { type: 'price_update'; data: PriceRow }
        if (msg.type === 'snapshot') applySnapshot(msg.prices)
        if (msg.type === 'price_update') applyUpdate(msg.data)
      } catch {
        /* ignore */
      }
    }
    ws.onerror = () => setWsStatus('error')
    ws.onclose = () => setWsStatus('closed')
    return () => ws.close()
  }, [applySnapshot, applyUpdate])

  const publishDev = () => {
    setDevMsg(null)
    fetch('/api/dev/publish-price', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_id: devSku,
        price: devPrice,
        reason: devReason,
      }),
    })
      .then((r) => r.json())
      .then((j: { status: string; detail?: string; topic?: string }) => {
        if (j.status === 'published')
          setDevMsg(`Published to ${j.topic ?? 'MQTT'}`)
        else setDevMsg(j.detail ?? j.status)
      })
      .catch(() => setDevMsg('request failed'))
  }

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <h1>Retail pricing manager dashboard</h1>
        <p className="dashboard__subtitle">
          CMPE 295A — Sprint 1: MQTT bridge, live prices, SHAP placeholder
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
            <span>PostgreSQL</span>
            <code>{dbHealth}</code>
          </li>
          <li>
            <span>MQTT bridge</span>
            <code>{mqttHealth}</code>
          </li>
          <li>
            <span>WebSocket</span>
            <code>{wsStatus}</code>
          </li>
        </ul>
        <p className="hint">
          Full stack: <code>make up</code> from repo root (includes Mosquitto on
          port 1883). Stub agent or ESP32 should publish JSON to{' '}
          <code>retail/price/&lt;product_id&gt;</code>.
        </p>
      </section>

      <section className="panel">
        <h2>Smoke test (dev publish)</h2>
        <p className="panel__lead">
          POSTs the workbook-shaped payload to MQTT via the API (same path the
          real pricing agent will use).
        </p>
        <div className="dev-grid">
          <label>
            SKU
            <input
              value={devSku}
              onChange={(e) => setDevSku(e.target.value)}
              aria-label="Product id"
            />
          </label>
          <label>
            Price
            <input
              value={devPrice}
              onChange={(e) => setDevPrice(e.target.value)}
              aria-label="Price"
            />
          </label>
          <label className="dev-grid__wide">
            Reason
            <input
              value={devReason}
              onChange={(e) => setDevReason(e.target.value)}
              aria-label="Reason"
            />
          </label>
        </div>
        <div className="ws-row">
          <button type="button" onClick={publishDev}>
            Publish to MQTT
          </button>
          {devMsg ? <span className="dev-msg">{devMsg}</span> : null}
        </div>
      </section>

      <div className="dashboard__grid">
        <section className="panel">
          <h2>Live prices</h2>
          <p className="panel__lead">
            Updates from <code>/ws/prices</code> (fed by the MQTT subscriber).
          </p>
          <div className="table-wrap">
            <table className="price-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Price</th>
                  <th>Reason</th>
                  <th>Updated (UTC)</th>
                </tr>
              </thead>
              <tbody>
                {sortedRows.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="price-table__empty">
                      No rows yet — publish a price or start the stub agent.
                    </td>
                  </tr>
                ) : (
                  sortedRows.map((row) => (
                    <tr
                      key={row.product_id}
                      className={
                        selectedId === row.product_id
                          ? 'price-table__row price-table__row--selected'
                          : 'price-table__row'
                      }
                    >
                      <td>
                        <button
                          type="button"
                          className="linkish"
                          onClick={() => setSelectedId(row.product_id)}
                        >
                          {row.product_id}
                        </button>
                      </td>
                      <td>${row.price}</td>
                      <td>{row.reason || '—'}</td>
                      <td className="price-table__mono">{row.updated_at}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel">
          <h2>SHAP transparency</h2>
          <ShapPlaceholder selectedProductId={selectedId} />
        </section>
      </div>
    </div>
  )
}
