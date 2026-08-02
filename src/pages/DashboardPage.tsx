import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { createWine, deleteWine, subscribeToWines, updateWine } from '../lib/wines'
import type { Wine, WineInput } from '../types/wine'

const emptyForm: WineInput = {
  name: '',
  category: '',
  vintage: '',
  volume: '75 cl',
  price: 0,
  stock: 0,
  available: true,
  order: 0,
}

export function DashboardPage() {
  const { user, logout } = useAuth()
  const [wines, setWines] = useState<Wine[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<WineInput>(emptyForm)
  const [savingId, setSavingId] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = subscribeToWines(
      (data) => setWines(data),
    )
    return unsubscribe
  }, [])

  const nextOrder = useMemo(
    () => (wines && wines.length > 0 ? Math.max(...wines.map((w) => w.order)) + 1 : 0),
    [wines],
  )

  async function handleStockChange(wine: Wine, delta: number) {
    const newStock = Math.max(0, wine.stock + delta)
    setSavingId(wine.id)
    try {
      await updateWine(wine.id, { stock: newStock })
    } catch {
      setError("Impossible de mettre à jour le stock.")
    } finally {
      setSavingId(null)
    }
  }

  async function handleToggleAvailable(wine: Wine) {
    setSavingId(wine.id)
    try {
      await updateWine(wine.id, { available: !wine.available })
    } catch {
      setError('Impossible de mettre à jour la disponibilité.')
    } finally {
      setSavingId(null)
    }
  }

  async function handleDelete(wine: Wine) {
    if (!window.confirm(`Supprimer "${wine.name}" ?`)) return
    setSavingId(wine.id)
    try {
      await deleteWine(wine.id)
    } catch {
      setError('Impossible de supprimer ce vin.')
    } finally {
      setSavingId(null)
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      await createWine({ ...form, order: nextOrder })
      setForm(emptyForm)
      setShowForm(false)
    } catch {
      setError('Impossible de créer ce vin.')
    }
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Tributerre — Stocks</h1>
          <p className="dashboard-user">{user?.email}</p>
        </div>
        <button type="button" className="btn-secondary" onClick={() => logout()}>
          Se déconnecter
        </button>
      </header>

      {error && (
        <div className="banner-error">
          {error}
          <button type="button" onClick={() => setError(null)}>
            ×
          </button>
        </div>
      )}

      <div className="toolbar">
        <button type="button" className="btn-primary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Annuler' : '+ Ajouter un vin'}
        </button>
      </div>

      {showForm && (
        <form className="wine-form" onSubmit={handleCreate}>
          <input
            placeholder="Nom (ex. Terre Rouge)"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            placeholder="Catégorie (ex. Assemblage)"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />
          <input
            placeholder="Millésime (ex. 2023)"
            value={form.vintage}
            onChange={(e) => setForm({ ...form, vintage: e.target.value })}
          />
          <input
            placeholder="Volume (ex. 75 cl)"
            value={form.volume}
            onChange={(e) => setForm({ ...form, volume: e.target.value })}
          />
          <input
            type="number"
            step="0.01"
            placeholder="Prix (CHF)"
            required
            value={form.price}
            onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
          />
          <input
            type="number"
            placeholder="Stock"
            required
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
          />
          <button type="submit" className="btn-primary">
            Créer
          </button>
        </form>
      )}

      <div className="wine-table">
        <div className="wine-row wine-row-head">
          <span>Vin</span>
          <span>Prix</span>
          <span>Stock</span>
          <span>Disponible</span>
          <span></span>
        </div>

        {wines === null && <p className="wine-empty">Chargement…</p>}
        {wines !== null && wines.length === 0 && (
          <p className="wine-empty">Aucun vin. Ajoutez-en un ci-dessus.</p>
        )}

        {wines?.map((wine) => (
          <div className="wine-row" key={wine.id}>
            <div className="wine-name">
              <strong>{wine.name}</strong>
              <span className="wine-meta">
                {[wine.category, wine.vintage, wine.volume].filter(Boolean).join(' · ')}
              </span>
            </div>
            <span className="wine-price">CHF {wine.price.toFixed(2)}</span>
            <div className="wine-stock">
              <button
                type="button"
                disabled={savingId === wine.id}
                onClick={() => handleStockChange(wine, -1)}
              >
                −
              </button>
              <span>{wine.stock}</span>
              <button
                type="button"
                disabled={savingId === wine.id}
                onClick={() => handleStockChange(wine, 1)}
              >
                +
              </button>
            </div>
            <label className="wine-toggle">
              <input
                type="checkbox"
                checked={wine.available}
                disabled={savingId === wine.id}
                onChange={() => handleToggleAvailable(wine)}
              />
              <span>{wine.available ? 'Oui' : 'Non'}</span>
            </label>
            <button
              type="button"
              className="btn-danger"
              disabled={savingId === wine.id}
              onClick={() => handleDelete(wine)}
            >
              Supprimer
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
