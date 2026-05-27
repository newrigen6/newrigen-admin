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
  // Extraire le vrai message d'erreur depuis le body de la fonction (pas le message générique SDK)
  if (res.error) {
    const detail = res.data?.error || res.error.message
    throw new Error(detail)
  }
  if (res.data?.error) throw new Error(res.data.error)
  return res.data
}
