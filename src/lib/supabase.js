import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

export async function callAdminFn(action, data) {
  const { data: { session } } = await supabase.auth.getSession()
  const res = await supabase.functions.invoke('admin-user', {
    body: { action, ...data },
    headers: { Authorization: `Bearer ${session?.access_token}` },
  })

  if (res.error) {
    // Supabase JS v2 : le vrai message d'erreur de la fonction est dans res.error.context
    const ctx = res.error.context
    const detail = ctx?.error          // { "error": "..." }  ← notre format
                || ctx?.message        // format alternatif
                || (typeof ctx === 'string' ? ctx : null)
                || res.error.message   // fallback générique SDK
    throw new Error(detail)
  }

  if (res.data?.error) throw new Error(res.data.error)
  return res.data
}
