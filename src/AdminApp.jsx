import { useState, useMemo, useEffect } from 'react'
import {
  Shield, Eye, EyeOff, Building2, Plus, Search, Lock, Unlock,
  Trash2, Edit, Copy, Check, AlertTriangle, RefreshCw,
  X, Users, UserPlus, LogOut, ChevronRight, Calendar,
  TrendingUp, Clock, Crown, UserCheck, Slash, KeyRound,
  Menu, LayoutDashboard, Bell, Zap, LayoutGrid
} from 'lucide-react'
import { useCompaniesStore } from './store/companiesStore'
import { supabase, callAdminFn } from './lib/supabase'

// ── Login ────────────────────────────────────────────────────────────────────

function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [mdp, setMdp] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: mdp })
      if (error) { setError('Identifiants incorrects.'); setLoading(false); return }
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single()
      if (profile?.role !== 'superadmin') {
        await supabase.auth.signOut()
        setError('Accès réservé aux administrateurs Newrigen.')
        setLoading(false); return
      }
      onLogin()
    } catch { setError('Erreur de connexion.') }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex">
      {/* Panneau gauche */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-indigo-500 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-violet-500 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur rounded-3xl mb-6 border border-white/20">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">Newrigen</h1>
          <p className="text-slate-300 text-lg mb-8">Plateforme d'administration SaaS</p>
          <div className="space-y-3 text-left">
            {['Gérez vos clients et licences', 'Créez des comptes patrons', 'Suivez les abonnements'].map(t => (
              <div key={t} className="flex items-center gap-3 text-slate-300 text-sm">
                <div className="w-5 h-5 rounded-full bg-indigo-500/30 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-indigo-300" />
                </div>
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Panneau droit */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Newrigen</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Bon retour 👋</h2>
          <p className="text-gray-500 text-sm mb-8">Connectez-vous à votre espace admin</p>

          {error && (
            <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />{error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white shadow-sm"
                placeholder="tiago@newrigen.com" required autoComplete="email" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Mot de passe</label>
              <div className="relative">
                <input type={show ? 'text' : 'password'} value={mdp} onChange={e => setMdp(e.target.value)}
                  className="w-full px-4 py-3 pr-11 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white shadow-sm"
                  required autoComplete="current-password" />
                <button type="button" onClick={() => setShow(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-xl transition-colors text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 mt-2">
              {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {loading ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

// ── Badges ───────────────────────────────────────────────────────────────────

function StatutBadge({ statut }) {
  const styles = {
    actif:  'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    bloqué: 'bg-red-50 text-red-700 ring-1 ring-red-200',
    essai:  'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  }
  const dots = { actif: 'bg-emerald-500', bloqué: 'bg-red-500', essai: 'bg-amber-500' }
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${styles[statut] || 'bg-gray-100 text-gray-600'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dots[statut] || 'bg-gray-400'}`} />
      {statut}
    </span>
  )
}

function PlanBadge({ plan }) {
  const styles = {
    mensuel: 'bg-blue-50 text-blue-700',
    annuel: 'bg-violet-50 text-violet-700',
    'essai gratuit': 'bg-gray-100 text-gray-500',
  }
  return <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles[plan] || 'bg-gray-100 text-gray-500'}`}>{plan}</span>
}

// ── Modals ────────────────────────────────────────────────────────────────────

const PLANS = ['mensuel', 'annuel', 'essai gratuit']
const STATUTS = ['actif', 'essai', 'bloqué']
const defaultForm = {
  nom: '', contact: '', email: '', telephone: '', ville: '',
  plan: 'mensuel', statut: 'actif',
  dateInscription: new Date().toISOString().slice(0, 10),
  datePaiement: '', dateExpiration: '', notes: '',
}

function Modal({ title, subtitle, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-gray-900">{title}</h3>
            {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 transition-colors"><X className="w-4 h-4" /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

function EntrepriseModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial ? { ...defaultForm, ...initial } : defaultForm)
  const [error, setError] = useState('')
  const setField = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleSubmit = () => {
    if (!form.nom.trim()) { setError('Le nom est requis.'); return }
    onSave(form); onClose()
  }

  const fields = [
    { label: "Nom *", key: 'nom', type: 'text', placeholder: 'Hydrotech Sàrl', full: true },
    { label: 'Contact', key: 'contact', type: 'text', placeholder: 'Jean Dupont' },
    { label: 'Email', key: 'email', type: 'email', placeholder: 'contact@entreprise.ch' },
    { label: 'Téléphone', key: 'telephone', type: 'tel', placeholder: '+41 79 000 00 00' },
    { label: 'Ville', key: 'ville', type: 'text', placeholder: 'Lausanne' },
    { label: 'Inscription', key: 'dateInscription', type: 'date' },
    { label: 'Dernier paiement', key: 'datePaiement', type: 'date' },
    { label: 'Expiration', key: 'dateExpiration', type: 'date' },
  ]

  return (
    <Modal title={initial ? 'Modifier le client' : 'Nouveau client'} onClose={onClose}>
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2 mb-4">{error}</p>}
        <div className="grid grid-cols-2 gap-3">
          {fields.map(({ label, key, type, placeholder, full }) => (
            <div key={key} className={full ? 'col-span-2' : ''}>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">{label}</label>
              <input type={type} value={form[key]} onChange={e => setField(key, e.target.value)} placeholder={placeholder || ''}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50/50" />
            </div>
          ))}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Plan</label>
            <select value={form.plan} onChange={e => setField('plan', e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50/50">
              {PLANS.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Statut</label>
            <select value={form.statut} onChange={e => setField('statut', e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50/50">
              {STATUTS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Notes internes</label>
            <textarea value={form.notes} onChange={e => setField('notes', e.target.value)} rows={3}
              placeholder="Remarques, conditions spéciales…"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50/50 resize-none" />
          </div>
        </div>
      </div>
      <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end">
        <button onClick={onClose} className="px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">Annuler</button>
        <button onClick={handleSubmit} className="px-5 py-2.5 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl font-semibold transition-colors shadow-lg shadow-indigo-100">
          {initial ? 'Enregistrer' : 'Créer'}
        </button>
      </div>
    </Modal>
  )
}

function CredentialsResult({ result, onClose }) {
  const [revealed, setRevealed] = useState(false)
  return (
    <div className="p-6 space-y-4">
      <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-2xl text-center">
        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <Check className="w-6 h-6 text-emerald-600" />
        </div>
        <p className="font-semibold text-emerald-800 mb-4">Compte créé avec succès !</p>
        <div className="bg-white rounded-xl border border-emerald-100 p-4 space-y-3 text-left">
          <div>
            <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide font-medium">Email</p>
            <p className="font-mono text-sm font-semibold text-gray-800">{result.email}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide font-medium">Mot de passe temporaire</p>
            <div className="flex items-center gap-2">
              <p className="font-mono text-xl font-bold tracking-widest text-slate-800 flex-1">
                {revealed ? result.motDePasse : '•'.repeat(result.motDePasse?.length || 8)}
              </p>
              <button onClick={() => setRevealed(v => !v)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400">
                {revealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
        <p className="text-xs text-emerald-600 mt-3 font-medium">⚠️ Note ce mot de passe — il ne sera plus affiché.</p>
      </div>
      <button onClick={onClose} className="w-full py-3 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors">
        J'ai noté les identifiants
      </button>
    </div>
  )
}

function AccountModal({ title, subtitle, role, companyId, onClose }) {
  const [nom, setNom] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      const res = await callAdminFn('createUser', { nom: nom.trim(), email: email.trim().toLowerCase(), role, companyId: companyId || null, tauxHoraire: 0 })
      setResult(res)
    } catch (e) { setError(e.message || 'Erreur lors de la création.') }
    setLoading(false)
  }

  return (
    <Modal title={title} subtitle={subtitle} onClose={onClose}>
      {result ? <CredentialsResult result={result} onClose={onClose} /> : (
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Nom complet</label>
            <input type="text" value={nom} onChange={e => setNom(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50/50"
              placeholder="Prénom Nom" required />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50/50"
              placeholder="email@exemple.com" required />
          </div>
          <p className="text-xs text-gray-400">Un mot de passe temporaire sera généré automatiquement.</p>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-3 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">Annuler</button>
            <button type="submit" disabled={loading}
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 transition-colors">
              {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {loading ? 'Création…' : 'Créer le compte'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  )
}

function ChangePwdModal({ onClose }) {
  const [form, setForm] = useState({ nouveau: '', confirmer: '' })
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.nouveau.length < 6) { setError('Minimum 6 caractères.'); return }
    if (form.nouveau !== form.confirmer) { setError('Les mots de passe ne correspondent pas.'); return }
    setLoading(true)
    const { error: err } = await supabase.auth.updateUser({ password: form.nouveau })
    if (err) { setError(err.message); setLoading(false); return }
    setSuccess(true)
    setTimeout(onClose, 1800)
  }

  return (
    <Modal title="Changer le mot de passe" onClose={onClose}>
      {success ? (
        <div className="flex flex-col items-center py-10">
          <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
            <Check className="w-7 h-7 text-emerald-600" />
          </div>
          <p className="font-bold text-gray-900">Mot de passe mis à jour !</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>}
          {[{ label: 'Nouveau mot de passe', key: 'nouveau' }, { label: 'Confirmer', key: 'confirmer' }].map(({ label, key }) => (
            <div key={key}>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">{label}</label>
              <div className="relative">
                <input type={show ? 'text' : 'password'} value={form[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  className="w-full px-4 py-3 pr-11 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50/50"
                  required minLength={6} />
                {key === 'nouveau' && (
                  <button type="button" onClick={() => setShow(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                )}
              </div>
            </div>
          ))}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-3 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl">Annuler</button>
            <button type="submit" disabled={loading}
              className="flex-1 py-3 text-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 rounded-xl font-semibold flex items-center justify-center gap-2">
              {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {loading ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  )
}

// ── Fiche client ──────────────────────────────────────────────────────────────

function ClientDetail({ ent, onClose, onEdit, onToggle, onRegen, onDelete, onCreatePatron }) {
  const fmt = (d) => d ? new Date(d).toLocaleDateString('fr-CH') : '—'
  const expired = ent.dateExpiration && new Date(ent.dateExpiration) < new Date()
  const expiresSoon = ent.dateExpiration && !expired && (new Date(ent.dateExpiration) - new Date()) / 86400000 <= 7
  const [copied, setCopied] = useState(false)
  const copy = () => { navigator.clipboard.writeText(ent.licenceKey); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white w-full max-w-md h-full overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white/95 backdrop-blur border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold ${ent.statut === 'bloqué' ? 'bg-red-500' : ent.statut === 'essai' ? 'bg-amber-500' : 'bg-indigo-600'}`}>
              {ent.nom.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-gray-900">{ent.nom}</h3>
              <p className="text-xs text-gray-400">{ent.ville || 'Ville non renseignée'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex items-center gap-2 flex-wrap">
            <StatutBadge statut={ent.statut} />
            <PlanBadge plan={ent.plan} />
            {expired && <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">Expiré</span>}
            {expiresSoon && <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">Expire bientôt</span>}
          </div>

          {(expired || expiresSoon) && (
            <div className={`flex items-center gap-2 p-3 rounded-xl text-sm ${expired ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              {expired ? 'Abonnement expiré — renouvellement requis.' : 'Expire dans moins de 7 jours !'}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {[
              ['Contact', ent.contact || '—'], ['Email', ent.email || '—'],
              ['Téléphone', ent.telephone || '—'], ['Plan', ent.plan],
              ['Inscrit le', fmt(ent.dateInscription)], ['Dernier paiement', fmt(ent.datePaiement)],
              ['Expiration', fmt(ent.dateExpiration)], ['Ville', ent.ville || '—'],
            ].map(([label, val]) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                <p className="font-semibold text-gray-800 text-sm">{val}</p>
              </div>
            ))}
          </div>

          <div>
            <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide font-medium">Clé de licence</p>
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
              <code className="text-xs font-mono text-gray-700 flex-1">{ent.licenceKey}</code>
              <button onClick={copy} className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-400 transition-colors">
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button onClick={onRegen} className="p-1.5 hover:bg-amber-50 rounded-lg text-gray-400 hover:text-amber-600 transition-colors">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {ent.notes && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
              <p className="text-xs text-amber-600 font-semibold mb-1">Notes internes</p>
              <p className="text-sm text-gray-700">{ent.notes}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button onClick={onCreatePatron}
              className="flex items-center justify-center gap-2 py-3 text-sm font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors">
              <UserPlus className="w-4 h-4" />Créer patron
            </button>
            <button onClick={onToggle}
              className={`flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-xl transition-colors ${ent.statut === 'bloqué' ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-red-50 text-red-700 hover:bg-red-100'}`}>
              {ent.statut === 'bloqué' ? <><Unlock className="w-4 h-4" />Débloquer</> : <><Lock className="w-4 h-4" />Bloquer</>}
            </button>
            <button onClick={onEdit}
              className="flex items-center justify-center gap-2 py-3 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
              <Edit className="w-4 h-4" />Modifier
            </button>
            <button onClick={onDelete}
              className="flex items-center justify-center gap-2 py-3 text-sm font-semibold text-red-700 bg-red-50 hover:bg-red-100 rounded-xl transition-colors">
              <Trash2 className="w-4 h-4" />Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Modal Modules ─────────────────────────────────────────────────────────────

const ALL_MODULES = [
  { key: 'dashboard',       label: 'Dashboard' },
  { key: 'import-devis',    label: 'Nouveau Devis' },
  { key: 'devis-catalogue', label: 'Devis Catalogue' },
  { key: 'saisie',          label: 'Saisie Matériaux' },
  { key: 'bons-regie',      label: 'Bons de Régie' },
  { key: 'heures',          label: 'Mes Heures' },
  { key: 'facturation',     label: 'Facturation' },
  { key: 'employes',        label: 'Employés' },
  { key: 'fiduciaire',      label: 'Fiduciaire' },
  { key: 'ma-signature',    label: 'Ma Signature' },
  { key: 'parametres',      label: 'Paramètres' },
]

function ModulesModal({ company, onClose }) {
  const { updateModules } = useCompaniesStore()
  const current = company.modules?.length ? company.modules : ALL_MODULES.map(m => m.key)
  const [selected, setSelected] = useState(new Set(current))
  const [saving, setSaving] = useState(false)

  const toggle = (key) => setSelected(s => {
    const next = new Set(s)
    next.has(key) ? next.delete(key) : next.add(key)
    return next
  })

  const handleSave = async () => {
    setSaving(true)
    await updateModules(company.id, [...selected])
    setSaving(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <LayoutGrid className="w-4 h-4 text-indigo-500" />Accès modules
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">{company.nom}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-1">
          <div className="flex gap-3 mb-3">
            <button onClick={() => setSelected(new Set(ALL_MODULES.map(m => m.key)))}
              className="text-xs text-indigo-600 hover:underline font-medium">Tout cocher</button>
            <button onClick={() => setSelected(new Set())}
              className="text-xs text-gray-400 hover:underline">Tout décocher</button>
          </div>
          {ALL_MODULES.map(m => (
            <label key={m.key} className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input type="checkbox" checked={selected.has(m.key)} onChange={() => toggle(m.key)}
                className="w-4 h-4 rounded accent-indigo-600" />
              <span className="text-sm text-gray-700">{m.label}</span>
            </label>
          ))}
        </div>
        <div className="flex justify-end gap-3 p-5 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Annuler</button>
          <button onClick={handleSave} disabled={saving}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white text-sm font-semibold rounded-xl transition-colors">
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Onglet Clients ────────────────────────────────────────────────────────────

function ClientsTab() {
  const { companies, addCompany, updateCompany, deleteCompany, toggleBlock, regenLicence, getStats, load } = useCompaniesStore()
  const stats = getStats()
  useEffect(() => { load() }, [])

  const [search, setSearch] = useState('')
  const [filterStatut, setFilterStatut] = useState('Tous')
  const [showModal, setShowModal] = useState(false)
  const [editEnt, setEditEnt] = useState(null)
  const [detailEnt, setDetailEnt] = useState(null)
  const [patronCompany, setPatronCompany] = useState(null)
  const [modulesCompany, setModulesCompany] = useState(null)

  const filtered = useMemo(() => {
    let list = [...companies]
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(c => c.nom.toLowerCase().includes(q) || c.contact?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q) || c.ville?.toLowerCase().includes(q))
    }
    if (filterStatut !== 'Tous') list = list.filter(c => c.statut === filterStatut)
    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [companies, search, filterStatut])

  const fmt = (d) => d ? new Date(d).toLocaleDateString('fr-CH') : '—'
  const isExpired = (c) => c.dateExpiration && new Date(c.dateExpiration) < new Date()
  const expiresSoon = (c) => {
    if (!c.dateExpiration || c.statut !== 'actif') return false
    return (new Date(c.dateExpiration) - new Date()) / 86400000 <= 7
  }

  const handleSave = (data) => editEnt ? updateCompany(editEnt.id, data) : addCompany(data)
  const handleDelete = (c) => { if (confirm(`Supprimer "${c.nom}" ?`)) { deleteCompany(c.id); setDetailEnt(null) } }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Total clients', value: stats.total, sub: 'entreprises', color: 'text-slate-900', bg: 'bg-slate-900', light: 'bg-slate-50', Icon: Building2 },
          { label: 'Actifs', value: stats.actifs, sub: 'abonnements actifs', color: 'text-emerald-600', bg: 'bg-emerald-500', light: 'bg-emerald-50', Icon: TrendingUp },
          { label: 'Bloqués', value: stats.bloques, sub: 'accès suspendus', color: 'text-red-600', bg: 'bg-red-500', light: 'bg-red-50', Icon: Lock },
          { label: 'Expirent bientôt', value: stats.expiresSoon, sub: 'dans 7 jours', color: stats.expiresSoon > 0 ? 'text-amber-600' : 'text-gray-300', bg: stats.expiresSoon > 0 ? 'bg-amber-500' : 'bg-gray-200', light: stats.expiresSoon > 0 ? 'bg-amber-50' : 'bg-gray-50', Icon: Clock },
        ].map(({ label, value, sub, color, light, bg, Icon }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl ${light} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div className={`w-2 h-2 rounded-full ${bg}`} />
            </div>
            <p className={`text-3xl font-bold ${color} mb-0.5`}>{value}</p>
            <p className="text-xs text-gray-400">{label}</p>
          </div>
        ))}
      </div>

      {/* Barre */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher…"
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white shadow-sm" />
        </div>
        <select value={filterStatut} onChange={e => setFilterStatut(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm">
          <option value="Tous">Tous les statuts</option>
          <option value="actif">Actif</option>
          <option value="essai">Essai</option>
          <option value="bloqué">Bloqué</option>
        </select>
        <button onClick={() => { setEditEnt(null); setShowModal(true) }}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-indigo-100">
          <Plus className="w-4 h-4" />Nouveau client
        </button>
      </div>

      {/* Grille clients */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center shadow-sm">
          <Building2 className="w-12 h-12 mx-auto mb-3 text-gray-200" />
          <p className="text-gray-400 font-medium">Aucun client trouvé</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(c => {
            const expired = isExpired(c)
            const soon = expiresSoon(c)
            return (
              <div key={c.id} onClick={() => setDetailEnt(c)}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group overflow-hidden">
                <div className={`h-1 ${c.statut === 'actif' ? 'bg-gradient-to-r from-emerald-400 to-teal-400' : c.statut === 'bloqué' ? 'bg-gradient-to-r from-red-400 to-rose-400' : 'bg-gradient-to-r from-amber-400 to-orange-400'}`} />
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm ${c.statut === 'bloqué' ? 'bg-red-500' : c.statut === 'essai' ? 'bg-amber-500' : 'bg-indigo-600'}`}>
                        {c.nom.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm leading-tight">{c.nom}</h3>
                        <p className="text-xs text-gray-400 mt-0.5">{c.ville || '—'}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-200 group-hover:text-indigo-400 transition-colors mt-1" />
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <StatutBadge statut={c.statut} />
                    <PlanBadge plan={c.plan} />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                    <div className="bg-gray-50 rounded-lg px-2.5 py-2">
                      <p className="text-gray-400 mb-0.5">Inscrit</p>
                      <p className="font-semibold text-gray-700">{fmt(c.dateInscription)}</p>
                    </div>
                    <div className={`rounded-lg px-2.5 py-2 ${expired ? 'bg-red-50' : soon ? 'bg-amber-50' : 'bg-gray-50'}`}>
                      <p className={`mb-0.5 ${expired ? 'text-red-400' : soon ? 'text-amber-400' : 'text-gray-400'}`}>Expire</p>
                      <p className={`font-semibold ${expired ? 'text-red-600' : soon ? 'text-amber-600' : 'text-gray-700'}`}>{fmt(c.dateExpiration)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 pt-3 border-t border-gray-50">
                    <button onClick={e => { e.stopPropagation(); setPatronCompany(c) }}
                      className="flex items-center gap-1 text-xs text-indigo-600 hover:bg-indigo-50 font-medium px-2.5 py-1.5 rounded-lg transition-colors">
                      <UserPlus className="w-3 h-3" />Patron
                    </button>
                    <button onClick={e => { e.stopPropagation(); toggleBlock(c.id) }}
                      className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors ${c.statut === 'bloqué' ? 'text-emerald-600 hover:bg-emerald-50' : 'text-red-500 hover:bg-red-50'}`}>
                      {c.statut === 'bloqué' ? <><Unlock className="w-3 h-3" />Débloquer</> : <><Lock className="w-3 h-3" />Bloquer</>}
                    </button>
                    <button onClick={e => { e.stopPropagation(); setModulesCompany(c) }}
                      className="flex items-center gap-1 text-xs text-indigo-600 hover:bg-indigo-50 font-medium px-2.5 py-1.5 rounded-lg transition-colors">
                      <LayoutGrid className="w-3 h-3" />Modules
                    </button>
                    <button onClick={e => { e.stopPropagation(); setEditEnt(c); setShowModal(true) }}
                      className="flex items-center gap-1 text-xs text-gray-500 hover:bg-gray-100 font-medium px-2.5 py-1.5 rounded-lg transition-colors ml-auto">
                      <Edit className="w-3 h-3" />Modifier
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <p className="text-xs text-gray-400 text-center">{filtered.length} client{filtered.length !== 1 ? 's' : ''}</p>

      {showModal && <EntrepriseModal initial={editEnt} onSave={handleSave} onClose={() => { setShowModal(false); setEditEnt(null) }} />}
      {detailEnt && (
        <ClientDetail
          ent={companies.find(c => c.id === detailEnt.id) || detailEnt}
          onClose={() => setDetailEnt(null)}
          onEdit={() => { setEditEnt(detailEnt); setShowModal(true); setDetailEnt(null) }}
          onToggle={() => { toggleBlock(detailEnt.id); setDetailEnt(null) }}
          onRegen={() => regenLicence(detailEnt.id)}
          onDelete={() => handleDelete(detailEnt)}
          onCreatePatron={() => { setPatronCompany(detailEnt); setDetailEnt(null) }}
        />
      )}
      {patronCompany && <AccountModal title="Créer un compte patron" subtitle={patronCompany.nom} role="patron" companyId={patronCompany.id} onClose={() => setPatronCompany(null)} />}
      {modulesCompany && <ModulesModal company={companies.find(c => c.id === modulesCompany.id) || modulesCompany} onClose={() => setModulesCompany(null)} />}
    </div>
  )
}

// ── Onglet Équipe ─────────────────────────────────────────────────────────────

function EquipeTab() {
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdminModal, setShowAdminModal] = useState(false)

  const loadAdmins = async () => {
    setLoading(true)
    const { data } = await supabase.from('profiles').select('*').eq('role', 'superadmin').order('created_at', { ascending: true })
    setAdmins(data || [])
    setLoading(false)
  }

  useEffect(() => { loadAdmins() }, [])

  const fmt = (d) => d ? new Date(d).toLocaleDateString('fr-CH') : '—'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Équipe Newrigen</h2>
          <p className="text-sm text-gray-400 mt-0.5">{admins.length} administrateur{admins.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowAdminModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-indigo-100">
          <UserPlus className="w-4 h-4" />Ajouter un admin
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {admins.map((admin, i) => (
            <div key={admin.id} className={`bg-white rounded-2xl border border-gray-100 p-5 shadow-sm ${admin.actif === false ? 'opacity-50' : ''}`}>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center flex-shrink-0 shadow-lg">
                    <span className="text-white font-bold text-xl">{admin.nom?.charAt(0).toUpperCase()}</span>
                  </div>
                  {i === 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center">
                      <Crown className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900">{admin.nom}</p>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{admin.email}</p>
                  <p className="text-xs text-gray-300 mt-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />Membre depuis {fmt(admin.created_at)}
                  </p>
                </div>
                {admin.actif !== false ? (
                  <button onClick={async () => { if (!confirm('Désactiver ?')) return; await supabase.from('profiles').update({ actif: false }).eq('id', admin.id); setAdmins(a => a.map(x => x.id === admin.id ? { ...x, actif: false } : x)) }}
                    className="p-2 hover:bg-red-50 rounded-xl text-gray-300 hover:text-red-500 transition-colors" title="Désactiver">
                    <Slash className="w-4 h-4" />
                  </button>
                ) : (
                  <button onClick={async () => { await supabase.from('profiles').update({ actif: true }).eq('id', admin.id); setAdmins(a => a.map(x => x.id === admin.id ? { ...x, actif: true } : x)) }}
                    className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl transition-colors">
                    <UserCheck className="w-3.5 h-3.5" />Réactiver
                  </button>
                )}
              </div>
              {admin.actif !== false && (
                <div className="mt-4 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />Actif
                  </span>
                  <span className="text-xs text-gray-400">Accès complet à Newrigen</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showAdminModal && <AccountModal title="Ajouter un administrateur" subtitle="Accès complet à Newrigen" role="superadmin" onClose={() => { setShowAdminModal(false); loadAdmins() }} />}
    </div>
  )
}

// ── Layout principal ──────────────────────────────────────────────────────────

function Dashboard({ onLogout }) {
  const [tab, setTab] = useState('clients')
  const [showChangePwd, setShowChangePwd] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { companies } = useCompaniesStore()
  const alerts = companies.filter(c => {
    if (!c.dateExpiration || c.statut !== 'actif') return false
    return (new Date(c.dateExpiration) - new Date()) / 86400000 <= 7
  }).length

  const navItems = [
    { key: 'clients', label: 'Clients', Icon: Building2 },
    { key: 'equipe', label: 'Équipe', Icon: Users },
  ]

  const Sidebar = ({ mobile = false }) => (
    <div className={`flex flex-col h-full bg-slate-900 ${mobile ? 'w-64' : 'w-56'}`}>
      {/* Logo */}
      <div className="px-5 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-900">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm">Newrigen</p>
            <p className="text-slate-500 text-xs">Administration</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="text-slate-600 text-xs font-semibold uppercase tracking-widest px-3 mb-3">Menu</p>
        {navItems.map(({ key, label, Icon }) => (
          <button key={key} onClick={() => { setTab(key); setMobileOpen(false) }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === key ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span>{label}</span>
            {key === 'clients' && alerts > 0 && (
              <span className="ml-auto bg-amber-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{alerts}</span>
            )}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/10 space-y-1">
        <button onClick={() => { setShowChangePwd(true); setMobileOpen(false) }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:bg-white/5 hover:text-white transition-colors">
          <KeyRound className="w-4 h-4" /><span>Mot de passe</span>
        </button>
        <button onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors">
          <LogOut className="w-4 h-4" /><span>Déconnexion</span>
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar desktop */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <Sidebar />
      </div>

      {/* Sidebar mobile overlay */}
      {mobileOpen && (
        <>
          <div className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="lg:hidden fixed inset-y-0 left-0 z-50 flex">
            <Sidebar mobile />
          </div>
        </>
      )}

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-100 px-4 lg:px-6 py-3.5 flex items-center gap-4 sticky top-0 z-20 shadow-sm">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded-xl text-gray-500">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-base font-bold text-gray-900">
              {tab === 'clients' ? 'Clients' : 'Équipe Newrigen'}
            </h1>
            <p className="text-xs text-gray-400 hidden sm:block">
              {tab === 'clients' ? `${companies.length} client${companies.length !== 1 ? 's' : ''} au total` : 'Administrateurs de la plateforme'}
            </p>
          </div>
          {alerts > 0 && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 text-amber-700 px-3 py-1.5 rounded-xl text-xs font-semibold">
              <Bell className="w-3.5 h-3.5" />{alerts} expiration{alerts > 1 ? 's' : ''} imminente{alerts > 1 ? 's' : ''}
            </div>
          )}
          <div className="flex items-center gap-2 bg-indigo-50 rounded-xl px-3 py-1.5">
            <div className="w-6 h-6 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-xs font-semibold text-indigo-700 hidden sm:inline">DevisTrack</span>
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 p-4 lg:p-6">
          {tab === 'clients' ? <ClientsTab /> : <EquipeTab />}
        </main>
      </div>

      {showChangePwd && <ChangePwdModal onClose={() => setShowChangePwd(false)} />}
    </div>
  )
}

// ── App racine ────────────────────────────────────────────────────────────────

export default function AdminApp() {
  const [authed, setAuthed] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    Promise.race([
      supabase.auth.getSession(),
      new Promise(resolve => setTimeout(() => resolve({ data: { session: null } }), 3000))
    ]).then(result => {
      if (result?.data?.session) setAuthed(true)
      setChecking(false)
    }).catch(() => setChecking(false))

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => { setAuthed(!!session) })
    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = () => {
    // UI responds instantly — signOut fires in background
    setAuthed(false)
    supabase.auth.signOut().catch(() => {})
  }

  if (checking) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderWidth: 3 }} />
        <p className="text-slate-500 text-sm">Chargement…</p>
      </div>
    </div>
  )

  if (!authed) return <Login onLogin={() => setAuthed(true)} />
  return <Dashboard onLogout={handleLogout} />
}
