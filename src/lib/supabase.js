import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

export async function callAdminFn(action, data) {
  const { data: { session } } = await supabase.auth.getSession()

  // On utilise fetch directement pour lire le vrai JSON d'erreur
  // (le SDK Supabase écrase toujours le message avec un texte générique)
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-user`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session?.access_token}`,
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action, ...data }),
  })

  const json = await res.json()
  if (!res.ok || json.error) throw new Error(json.error || 'Erreur inconnue')
  return json
}
