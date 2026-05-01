import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LeadsTable } from './LeadsTable'
import { LogOut } from 'lucide-react'

export const revalidate = 0

export default async function AdminDashboard() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user || user.email !== 'mkt@oemporio.pt') {
    redirect('/admin/login')
  }

  const { data: leads, error: leadsError } = await supabase
    .from('leads')
    .select('*')
    .order('criado_em', { ascending: false })

  if (leadsError) {
    console.error('Error fetching leads:', leadsError)
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 font-inter">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b border-white/10 pb-8 gap-6">
          <div>
            <h1 className="font-bourton text-4xl md:text-5xl tracking-widest uppercase mb-4">Admin Dashboard</h1>
            <div className="flex items-center space-x-4">
              <p className="text-white/40 text-xs uppercase tracking-widest font-medium">System Status: Online</p>
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-1">Accessing as</p>
              <p className="text-sm font-medium text-white/80">{user.email}</p>
            </div>
            
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="p-3 border border-white/10 hover:bg-white hover:text-black transition-all duration-300"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </form>
          </div>
        </header>

        <main className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="bg-white/[0.02] border border-white/5 p-6 sm:p-8">
            <LeadsTable initialLeads={leads || []} />
          </div>
        </main>
      </div>
    </div>
  )
}
