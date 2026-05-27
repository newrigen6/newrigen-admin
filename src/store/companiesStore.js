import { create } from 'zustand'
import { supabase, callAdminFn } from '../lib/supabase'

function genLicence() {
  const seg = () => Math.random().toString(36).slice(2, 6).toUpperCase()
  return `${seg()}-${seg()}-${seg()}-${seg()}`
}

function fromDB(c) {
  return {
    id: c.id,
    nom: c.nom,
    contact: c.contact || '',
    email: c.email || '',
    telephone: c.telephone || '',
    npa: c.npa || '',
    ville: c.ville || '',
    plan: c.plan || 'mensuel',
    statut: c.statut || 'actif',
    dateInscription: c.date_inscription || '',
    datePaiement: c.date_paiement || '',
    dateExpiration: c.date_expiration || '',
    licenceKey: c.licence_key || '',
    notes: c.notes || '',
    modules: c.modules || [],
    createdAt: c.created_at,
  }
}

function toDB(data) {
  const row = {}
  if (data.nom !== undefined) row.nom = data.nom
  if (data.contact !== undefined) row.contact = data.contact
  if (data.email !== undefined) row.email = data.email
  if (data.telephone !== undefined) row.telephone = data.telephone
  if (data.npa !== undefined) row.npa = data.npa
  if (data.ville !== undefined) row.ville = data.ville
  if (data.plan !== undefined) row.plan = data.plan
  if (data.statut !== undefined) row.statut = data.statut
  if (data.dateInscription !== undefined) row.date_inscription = data.dateInscription || null
  if (data.datePaiement !== undefined) row.date_paiement = data.datePaiement || null
  if (data.dateExpiration !== undefined) row.date_expiration = data.dateExpiration || null
  if (data.licenceKey !== undefined) row.licence_key = data.licenceKey
  if (data.notes !== undefined) row.notes = data.notes
  return row
}

export const useCompaniesStore = create((set, get) => ({
  companies: [],
  loaded: false,

  load: async () => {
    const { data } = await supabase.from('companies').select('*').order('created_at', { ascending: false })
    set({ companies: (data || []).map(fromDB), loaded: true })
  },

  addCompany: async (data) => {
    const id = Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
    const licenceKey = genLicence()
    const row = { id, ...toDB(data), licence_key: licenceKey, statut: data.statut || 'actif' }
    await supabase.from('companies').insert(row)
    const company = fromDB({ ...row, created_at: new Date().toISOString() })
    set(s => ({ companies: [company, ...s.companies] }))
    return company
  },

  updateCompany: async (id, data) => {
    // Optimistic update — UI responds instantly
    set(s => ({ companies: s.companies.map(c => c.id === id ? { ...c, ...data } : c) }))
    const { error } = await supabase.from('companies').update(toDB(data)).eq('id', id)
    if (error) get().load() // rollback on error
  },

  deleteCompany: async (id) => {
    // Optimistic update — UI responds instantly
    set(s => ({ companies: s.companies.filter(c => c.id !== id) }))
    // Supprimer d'abord tous les utilisateurs liés (contrainte FK profiles → companies)
    const { data: profiles } = await supabase.from('profiles').select('id').eq('company_id', id)
    if (profiles?.length) {
      await Promise.all(profiles.map(p => callAdminFn('deleteUser', { userId: p.id }).catch(() => {})))
    }
    await supabase.from('companies').delete().eq('id', id)
  },

  toggleBlock: async (id) => {
    const c = get().companies.find(c => c.id === id)
    if (!c) return
    const newStatut = c.statut === 'bloqué' ? 'actif' : 'bloqué'
    // Optimistic update — UI responds instantly
    set(s => ({ companies: s.companies.map(c => c.id === id ? { ...c, statut: newStatut } : c) }))
    const { error } = await supabase.from('companies').update({ statut: newStatut }).eq('id', id)
    if (error) get().load() // rollback on error
  },

  regenLicence: async (id) => {
    const key = genLicence()
    // Optimistic update — UI responds instantly
    set(s => ({ companies: s.companies.map(c => c.id === id ? { ...c, licenceKey: key } : c) }))
    const { error } = await supabase.from('companies').update({ licence_key: key }).eq('id', id)
    if (error) get().load() // rollback on error
    return key
  },

  updateModules: async (id, modules) => {
    set(s => ({ companies: s.companies.map(c => c.id === id ? { ...c, modules } : c) }))
    const { error } = await supabase.from('companies').update({ modules }).eq('id', id)
    if (error) get().load()
  },

  isBlocked: (companyId) => {
    const c = get().companies.find(c => c.id === companyId)
    return c?.statut === 'bloqué'
  },

  getStats: () => {
    const { companies } = get()
    const now = new Date()
    return {
      total: companies.length,
      actifs: companies.filter(c => c.statut === 'actif').length,
      bloques: companies.filter(c => c.statut === 'bloqué').length,
      essai: companies.filter(c => c.statut === 'essai').length,
      expiresSoon: companies.filter(c => {
        if (!c.dateExpiration || c.statut !== 'actif') return false
        const diff = (new Date(c.dateExpiration) - now) / 86400000
        return diff >= 0 && diff <= 7
      }).length,
    }
  },
}))
