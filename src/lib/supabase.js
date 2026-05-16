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
  if (res.error) throw new Error(res.error.message)
  return res.data
}
