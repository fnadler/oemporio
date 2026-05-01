'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, CheckCircle, XCircle } from 'lucide-react'

type Lead = {
  id: string
  primeiro_nome: string
  sobrenome: string
  email: string
  telefone: string
  cupom_utilizado: boolean
  idioma_preferido: string
  criado_em: string
}

export function LeadsTable({ initialLeads }: { initialLeads: Lead[] }) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads)
  const [search, setSearch] = useState('')
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const supabase = createClient()

  const filteredLeads = leads.filter(
    (lead) =>
      lead.primeiro_nome.toLowerCase().includes(search.toLowerCase()) ||
      lead.sobrenome.toLowerCase().includes(search.toLowerCase()) ||
      lead.email.toLowerCase().includes(search.toLowerCase())
  )

  const toggleCoupon = async (id: string, currentStatus: boolean) => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .update({ cupom_utilizado: !currentStatus })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      setLeads((prev) =>
        prev.map((lead) => (lead.id === id ? { ...lead, cupom_utilizado: !currentStatus } : lead))
      )
      
      if (selectedLead && selectedLead.id === id) {
        setSelectedLead({ ...selectedLead, cupom_utilizado: !currentStatus })
      }
    } catch (err) {
      console.error('Failed to toggle coupon status:', err)
      alert('Failed to update status.')
    }
  }

  return (
    <div>
      <div className="mb-6 relative">
        <Search className="absolute left-4 top-3 text-white/50 h-5 w-5" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-black border border-white/20 px-12 py-3 text-white placeholder-white/30 focus:border-white focus:ring-1 focus:ring-white outline-none transition-colors"
        />
      </div>

      <div className="overflow-x-auto border border-white/20">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 border-b border-white/20">
            <tr>
              <th className="px-6 py-4 font-medium text-white/80">Name</th>
              <th className="px-6 py-4 font-medium text-white/80">Email</th>
              <th className="px-6 py-4 font-medium text-white/80">Phone</th>
              <th className="px-6 py-4 font-medium text-white/80 text-center">Coupon Used</th>
              <th className="px-6 py-4 font-medium text-white/80 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.map((lead) => (
              <tr key={lead.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                <td className="px-6 py-4">
                  {lead.primeiro_nome} {lead.sobrenome}
                </td>
                <td className="px-6 py-4 text-white/70">{lead.email}</td>
                <td className="px-6 py-4 text-white/70">{lead.telefone}</td>
                <td className="px-6 py-4 text-center">
                  {lead.cupom_utilizado ? (
                    <span className="inline-flex items-center text-green-400 bg-green-400/10 px-2 py-1 text-xs uppercase tracking-wider">
                      <CheckCircle className="w-3 h-3 mr-1" /> Yes
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-white/40 bg-white/5 px-2 py-1 text-xs uppercase tracking-wider">
                      <XCircle className="w-3 h-3 mr-1" /> No
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => setSelectedLead(lead)}
                    className="text-white hover:text-gray-300 underline underline-offset-4 decoration-white/30 hover:decoration-white transition-all text-xs tracking-wider uppercase"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
            {filteredLeads.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-white/50">
                  No leads found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-black border border-white/20 p-8 w-full max-w-lg relative">
            <button
              onClick={() => setSelectedLead(null)}
              className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
            >
              <XCircle className="w-6 h-6" />
            </button>
            
            <h2 className="font-bourton text-2xl mb-6 tracking-wider">Lead Details</h2>
            
            <div className="space-y-4 font-inter text-sm">
              <div>
                <span className="text-white/50 block text-xs uppercase tracking-wider mb-1">Name</span>
                <span className="text-lg">{selectedLead.primeiro_nome} {selectedLead.sobrenome}</span>
              </div>
              <div>
                <span className="text-white/50 block text-xs uppercase tracking-wider mb-1">Email</span>
                <span>{selectedLead.email}</span>
              </div>
              <div>
                <span className="text-white/50 block text-xs uppercase tracking-wider mb-1">Phone</span>
                <span>{selectedLead.telefone}</span>
              </div>
              <div>
                <span className="text-white/50 block text-xs uppercase tracking-wider mb-1">Language</span>
                <span>{selectedLead.idioma_preferido === 'pt_PT' ? 'Português' : 'English'}</span>
              </div>
              <div>
                <span className="text-white/50 block text-xs uppercase tracking-wider mb-1">Date</span>
                <span>{new Date(selectedLead.criado_em).toLocaleDateString()}</span>
              </div>
              
              <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-white/50 block text-xs uppercase tracking-wider mb-1">Coupon Status</span>
                  <span className={selectedLead.cupom_utilizado ? 'text-green-400' : 'text-white/70'}>
                    {selectedLead.cupom_utilizado ? 'Used' : 'Not Used'}
                  </span>
                </div>
                <button
                  onClick={() => toggleCoupon(selectedLead.id, selectedLead.cupom_utilizado)}
                  className={`px-4 py-2 text-sm uppercase tracking-wider transition-colors ${
                    selectedLead.cupom_utilizado 
                      ? 'border border-white/30 text-white hover:bg-white/5' 
                      : 'bg-white text-black hover:bg-gray-200'
                  }`}
                >
                  {selectedLead.cupom_utilizado ? 'Mark as Unused' : 'Mark as Used'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
