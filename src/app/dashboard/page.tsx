'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function DashboardRedirect() {
  const router = useRouter()
  const supabase = createClient()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }

      const { data: membership } = await supabase
        .from('memberships')
        .select('role')
        .eq('user_id', session.user.id)
        .eq('is_active', true)
        .limit(1)
        .single()

      if (membership?.role === 'super_admin') router.push('/dashboard/super-admin')
      else if (membership?.role === 'client_admin') router.push('/dashboard/admin')
      else router.push('/dashboard/team')
    }
    check()
  }, [router, supabase])

  return <div className="flex items-center justify-center h-64">Redirecting...</div>
}
