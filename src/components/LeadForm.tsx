'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2, CheckCircle, X } from 'lucide-react'

declare global {
  interface Window {
    grecaptcha: any;
  }
}

const formSchema = z.object({
  primeiro_nome: z.string().min(1, 'First name is required'),
  sobrenome: z.string().min(1, 'Last name is required'),
  telefone: z.string().min(1, 'Phone with country code is required'),
  email: z.string().email('Invalid email address'),
  idioma_preferido: z.enum(['pt_PT', 'en']),
  aceitou_cupom: z.boolean().refine(val => val === true, {
    message: 'You must accept the coupon terms'
  }),
  aceitou_marketing: z.boolean().optional(),
})

type FormData = z.infer<typeof formSchema>

export function LeadForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      idioma_preferido: 'en',
      aceitou_cupom: false,
      aceitou_marketing: false
    }
  })

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      // Execute reCAPTCHA Enterprise
      const token = await new Promise<string>((resolve, reject) => {
        if (typeof window === 'undefined' || !window.grecaptcha) {
          reject(new Error('reCAPTCHA not loaded'))
          return
        }

        window.grecaptcha.enterprise.ready(async () => {
          try {
            const token = await window.grecaptcha.enterprise.execute(
              process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY, 
              { action: 'LOGIN' }
            )
            resolve(token)
          } catch (err) {
            reject(err)
          }
        })
      })
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, recaptchaToken: token })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Something went wrong')
      }

      setShowModal(true)
      reset()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-black p-6 sm:p-10 border border-white/20 shadow-2xl">
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 text-sm font-inter">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-xs uppercase tracking-widest font-medium text-white/50">First Name *</label>
            <input
              {...register('primeiro_nome')}
              className="w-full bg-transparent border border-white/20 px-4 py-3.5 text-white placeholder-white/10 focus:border-white focus:ring-0 outline-none transition-all duration-300 font-inter"
              placeholder="John"
            />
            {errors.primeiro_nome && <p className="text-red-500 text-[10px] uppercase tracking-tighter mt-1">{errors.primeiro_nome.message}</p>}
          </div>
          <div className="space-y-2">
            <label className="block text-xs uppercase tracking-widest font-medium text-white/50">Last Name *</label>
            <input
              {...register('sobrenome')}
              className="w-full bg-transparent border border-white/20 px-4 py-3.5 text-white placeholder-white/10 focus:border-white focus:ring-0 outline-none transition-all duration-300 font-inter"
              placeholder="Doe"
            />
            {errors.sobrenome && <p className="text-red-500 text-[10px] uppercase tracking-tighter mt-1">{errors.sobrenome.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-xs uppercase tracking-widest font-medium text-white/50">Phone (with DDI) *</label>
            <input
              {...register('telefone')}
              className="w-full bg-transparent border border-white/20 px-4 py-3.5 text-white placeholder-white/10 focus:border-white focus:ring-0 outline-none transition-all duration-300 font-inter"
              placeholder="+351 912 345 678"
            />
            {errors.telefone && <p className="text-red-500 text-[10px] uppercase tracking-tighter mt-1">{errors.telefone.message}</p>}
          </div>
          <div className="space-y-2">
            <label className="block text-xs uppercase tracking-widest font-medium text-white/50">Email *</label>
            <input
              {...register('email')}
              type="email"
              className="w-full bg-transparent border border-white/20 px-4 py-3.5 text-white placeholder-white/10 focus:border-white focus:ring-0 outline-none transition-all duration-300 font-inter"
              placeholder="john@example.com"
            />
            {errors.email && <p className="text-red-500 text-[10px] uppercase tracking-tighter mt-1">{errors.email.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-xs uppercase tracking-widest font-medium text-white/50">Preferred Language</label>
          <div className="relative">
            <select
              {...register('idioma_preferido')}
              className="w-full bg-black border border-white/20 px-4 py-3.5 text-white focus:border-white focus:ring-0 outline-none transition-all duration-300 font-inter appearance-none cursor-pointer"
            >
              <option value="en">English</option>
              <option value="pt_PT">Português</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-white/10">
          <label className="flex items-start space-x-4 cursor-pointer group">
            <div className="relative flex items-center mt-0.5">
              <input
                type="checkbox"
                {...register('aceitou_cupom')}
                className="peer sr-only"
              />
              <div className="w-5 h-5 border border-white/30 peer-checked:bg-white peer-checked:border-white transition-all duration-300 group-hover:border-white"></div>
              <svg className="absolute w-5 h-5 text-black pointer-events-none opacity-0 peer-checked:opacity-100 p-1 transition-opacity duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <span className="text-sm text-white/60 group-hover:text-white transition-colors font-inter">
              I want to receive the 20% off coupon for Comfort Food *
            </span>
          </label>
          {errors.aceitou_cupom && <p className="text-red-500 text-[10px] uppercase tracking-tighter">{errors.aceitou_cupom.message}</p>}

          <label className="flex items-start space-x-4 cursor-pointer group">
            <div className="relative flex items-center mt-0.5">
              <input
                type="checkbox"
                {...register('aceitou_marketing')}
                className="peer sr-only"
              />
              <div className="w-5 h-5 border border-white/30 peer-checked:bg-white peer-checked:border-white transition-all duration-300 group-hover:border-white"></div>
              <svg className="absolute w-5 h-5 text-black pointer-events-none opacity-0 peer-checked:opacity-100 p-1 transition-opacity duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <span className="text-sm text-white/60 group-hover:text-white transition-colors font-inter">
              I agree to receive news, offers, and marketing communications from O Empório.
            </span>
          </label>
        </div>

        {/* reCAPTCHA Enterprise will be executed on submit */}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-white text-black font-bourton py-5 text-xl tracking-[0.2em] uppercase hover:bg-gray-200 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center group overflow-hidden relative"
        >
          <span className="relative z-10">
            {isSubmitting ? <Loader2 className="animate-spin h-6 w-6" /> : 'Get My 20% Off'}
          </span>
          <div className="absolute inset-0 bg-gray-100 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
        </button>
      </form>

      {/* Success Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-500">
          <div className="bg-white text-black max-w-lg w-full p-10 sm:p-16 relative overflow-hidden text-center animate-in zoom-in-95 duration-500">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 text-black/20 hover:text-black transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex justify-center mb-10">
              <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
            </div>

            <h3 className="font-bourton text-4xl mb-6 tracking-wider uppercase leading-tight">Welcome to the Club!</h3>
            
            <p className="text-black/60 font-inter text-lg leading-relaxed mb-10">
              Your exclusive 20% off coupon has been sent to your email. Check your inbox (and spam folder) to start enjoying O Empório's comfort food.
            </p>

            <button
              onClick={() => setShowModal(false)}
              className="inline-block bg-black text-white font-bourton py-4 px-10 text-lg tracking-widest uppercase hover:bg-black/80 transition-colors"
            >
              Got it, thanks!
            </button>

            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-black/5 rounded-full blur-3xl"></div>
          </div>
        </div>
      )}
    </>
  )
}
