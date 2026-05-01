'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2, CheckCircle, X } from 'lucide-react'

declare global {
  interface Window {
    grecaptcha: any;
  }
}

const formSchema = (t: any) => z.object({
  primeiro_nome: z.string().min(1, t.errorFirstName),
  sobrenome: z.string().min(1, t.errorLastName),
  ddi: z.string().min(1, 'DDI is required'),
  telefone: z.string().min(1, t.errorPhone),
  email: z.string().email(t.errorEmail),
  idioma_preferido: z.enum(['pt_PT', 'en']),
  aceitou_cupom: z.boolean().refine(val => val === true, {
    message: t.errorTerms
  }),
  aceitou_marketing: z.boolean().optional(),
})

const countries = [
  { name: 'Portugal', code: '+351', flag: '🇵🇹' },
  { name: 'United Kingdom', code: '+44', flag: '🇬🇧' },
  { name: 'Brazil', code: '+55', flag: '🇧🇷' },
  { name: 'USA', code: '+1', flag: '🇺🇸' },
  { name: 'Afghanistan', code: '+93', flag: '🇦🇫' },
  { name: 'Albania', code: '+355', flag: '🇦🇱' },
  { name: 'Algeria', code: '+213', flag: '🇩🇿' },
  { name: 'Andorra', code: '+376', flag: '🇦🇩' },
  { name: 'Angola', code: '+244', flag: '🇦🇴' },
  { name: 'Argentina', code: '+54', flag: '🇦🇷' },
  { name: 'Armenia', code: '+374', flag: '🇦🇲' },
  { name: 'Australia', code: '+61', flag: '🇦🇺' },
  { name: 'Austria', code: '+43', flag: '🇦🇹' },
  { name: 'Azerbaijan', code: '+994', flag: '🇦🇿' },
  { name: 'Bahrain', code: '+973', flag: '🇧🇭' },
  { name: 'Bangladesh', code: '+880', flag: '🇧🇩' },
  { name: 'Belarus', code: '+375', flag: '🇧🇾' },
  { name: 'Belgium', code: '+32', flag: '🇧🇪' },
  { name: 'Belize', code: '+501', flag: '🇧🇿' },
  { name: 'Benin', code: '+229', flag: '🇧🇯' },
  { name: 'Bolivia', code: '+591', flag: '🇧🇴' },
  { name: 'Bosnia and Herzegovina', code: '+387', flag: '🇧🇦' },
  { name: 'Botswana', code: '+267', flag: '🇧🇼' },
  { name: 'Bulgaria', code: '+359', flag: '🇧🇬' },
  { name: 'Cambodia', code: '+855', flag: '🇰🇭' },
  { name: 'Cameroon', code: '+237', flag: '🇨🇲' },
  { name: 'Canada', code: '+1', flag: '🇨🇦' },
  { name: 'Cape Verde', code: '+238', flag: '🇨🇻' },
  { name: 'Chile', code: '+56', flag: '🇨🇱' },
  { name: 'China', code: '+86', flag: '🇨🇳' },
  { name: 'Colombia', code: '+57', flag: '🇨🇴' },
  { name: 'Costa Rica', code: '+506', flag: '🇨🇷' },
  { name: 'Croatia', code: '+385', flag: '🇭🇷' },
  { name: 'Cuba', code: '+53', flag: '🇨🇺' },
  { name: 'Cyprus', code: '+357', flag: '🇨🇾' },
  { name: 'Czech Republic', code: '+420', flag: '🇨🇿' },
  { name: 'Denmark', code: '+45', flag: '🇩🇰' },
  { name: 'Dominican Republic', code: '+1', flag: '🇩🇴' },
  { name: 'Ecuador', code: '+593', flag: '🇪🇨' },
  { name: 'Egypt', code: '+20', flag: '🇪🇬' },
  { name: 'El Salvador', code: '+503', flag: '🇸🇻' },
  { name: 'Estonia', code: '+372', flag: '🇪🇪' },
  { name: 'Ethiopia', code: '+251', flag: '🇪🇹' },
  { name: 'Finland', code: '+358', flag: '🇫🇮' },
  { name: 'France', code: '+33', flag: '🇫🇷' },
  { name: 'Georgia', code: '+995', flag: '🇬🇪' },
  { name: 'Germany', code: '+49', flag: '🇩🇪' },
  { name: 'Ghana', code: '+233', flag: '🇬🇭' },
  { name: 'Greece', code: '+30', flag: '🇬🇷' },
  { name: 'Guatemala', code: '+502', flag: '🇬🇹' },
  { name: 'Honduras', code: '+504', flag: '🇭🇳' },
  { name: 'Hong Kong', code: '+852', flag: '🇭🇰' },
  { name: 'Hungary', code: '+36', flag: '🇭🇺' },
  { name: 'Iceland', code: '+354', flag: '🇮🇸' },
  { name: 'India', code: '+91', flag: '🇮🇳' },
  { name: 'Indonesia', code: '+62', flag: '🇮🇩' },
  { name: 'Iran', code: '+98', flag: '🇮🇷' },
  { name: 'Iraq', code: '+964', flag: '🇮🇶' },
  { name: 'Ireland', code: '+353', flag: '🇮🇪' },
  { name: 'Israel', code: '+972', flag: '🇮🇱' },
  { name: 'Italy', code: '+39', flag: '🇮🇹' },
  { name: 'Jamaica', code: '+1', flag: '🇯🇲' },
  { name: 'Japan', code: '+81', flag: '🇯🇵' },
  { name: 'Jordan', code: '+962', flag: '🇯🇴' },
  { name: 'Kazakhstan', code: '+7', flag: '🇰🇿' },
  { name: 'Kenya', code: '+254', flag: '🇰🇪' },
  { name: 'Kuwait', code: '+965', flag: '🇰🇼' },
  { name: 'Latvia', code: '+371', flag: '🇱🇻' },
  { name: 'Lebanon', code: '+961', flag: '🇱🇧' },
  { name: 'Libya', code: '+218', flag: '🇱🇾' },
  { name: 'Liechtenstein', code: '+423', flag: '🇱🇮' },
  { name: 'Lithuania', code: '+370', flag: '🇱🇹' },
  { name: 'Luxembourg', code: '+352', flag: '🇱🇺' },
  { name: 'Macau', code: '+853', flag: '🇲🇴' },
  { name: 'Macedonia', code: '+389', flag: '🇲🇰' },
  { name: 'Malaysia', code: '+60', flag: '🇲🇾' },
  { name: 'Malta', code: '+356', flag: '🇲🇹' },
  { name: 'Mexico', code: '+52', flag: '🇲🇽' },
  { name: 'Moldova', code: '+373', flag: '🇲🇩' },
  { name: 'Monaco', code: '+377', flag: '🇲🇨' },
  { name: 'Montenegro', code: '+382', flag: '🇲🇪' },
  { name: 'Morocco', code: '+212', flag: '🇲🇦' },
  { name: 'Mozambique', code: '+258', flag: '🇲🇿' },
  { name: 'Nepal', code: '+977', flag: '🇳🇵' },
  { name: 'Netherlands', code: '+31', flag: '🇳🇱' },
  { name: 'New Zealand', code: '+64', flag: '🇳🇿' },
  { name: 'Nicaragua', code: '+505', flag: '🇳🇮' },
  { name: 'Nigeria', code: '+234', flag: '🇳🇬' },
  { name: 'Norway', code: '+47', flag: '🇳🇴' },
  { name: 'Oman', code: '+968', flag: '🇴🇲' },
  { name: 'Pakistan', code: '+92', flag: '🇵🇰' },
  { name: 'Panama', code: '+507', flag: '🇵🇦' },
  { name: 'Paraguay', code: '+595', flag: '🇵🇾' },
  { name: 'Peru', code: '+51', flag: '🇵🇪' },
  { name: 'Philippines', code: '+63', flag: '🇵🇭' },
  { name: 'Poland', code: '+48', flag: '🇵🇱' },
  { name: 'Puerto Rico', code: '+1', flag: '🇵🇷' },
  { name: 'Qatar', code: '+974', flag: '🇶🇦' },
  { name: 'Romania', code: '+40', flag: '🇷🇴' },
  { name: 'Russia', code: '+7', flag: '🇷🇺' },
  { name: 'Saudi Arabia', code: '+966', flag: '🇸🇦' },
  { name: 'Senegal', code: '+221', flag: '🇸🇳' },
  { name: 'Serbia', code: '+381', flag: '🇷🇸' },
  { name: 'Singapore', code: '+65', flag: '🇸🇬' },
  { name: 'Slovakia', code: '+421', flag: '🇸🇰' },
  { name: 'Slovenia', code: '+386', flag: '🇸🇮' },
  { name: 'South Africa', code: '+27', flag: '🇿🇦' },
  { name: 'South Korea', code: '+82', flag: '🇰🇷' },
  { name: 'Spain', code: '+34', flag: '🇪🇸' },
  { name: 'Sri Lanka', code: '+94', flag: '🇱🇰' },
  { name: 'Sweden', code: '+46', flag: '🇸🇪' },
  { name: 'Switzerland', code: '+41', flag: '🇨🇭' },
  { name: 'Taiwan', code: '+886', flag: '🇹🇼' },
  { name: 'Thailand', code: '+66', flag: '🇹🇭' },
  { name: 'Tunisia', code: '+216', flag: '🇹🇳' },
  { name: 'Turkey', code: '+90', flag: '🇹🇷' },
  { name: 'Ukraine', code: '+380', flag: '🇺🇦' },
  { name: 'United Arab Emirates', code: '+971', flag: '🇦🇪' },
  { name: 'Uruguay', code: '+598', flag: '🇺🇾' },
  { name: 'Uzbekistan', code: '+998', flag: '🇺🇿' },
  { name: 'Venezuela', code: '+58', flag: '🇻🇪' },
  { name: 'Vietnam', code: '+84', flag: '🇻🇳' }
]

type FormData = z.infer<ReturnType<typeof formSchema>>

const formTranslations = {
  en: {
    firstName: "First Name *",
    lastName: "Last Name *",
    phone: "Phone (with DDI) *",
    email: "Email *",
    langLabel: "Preferred Language",
    couponLabel: "I want to receive the 20% off coupon for Comfort Food *",
    marketingLabel: "I agree to receive news, offers, and marketing communications from O Empório.",
    submit: "Get My 20% Off",
    submitting: "Processing...",
    successTitle: "Welcome to the Club!",
    successSub: "Your exclusive 20% off coupon has been sent to your email. Check your inbox (and spam folder) to start enjoying O Empório's comfort food.",
    successButton: "Got it, thanks!",
    errorTerms: "You must accept the coupon terms",
    errorFirstName: "First name is required",
    errorLastName: "Last name is required",
    errorPhone: "Phone with country code is required",
    errorEmail: "Invalid email address",
    errorEmailExists: "This email is already registered.",
    errorRecaptcha: "reCAPTCHA not loaded",
    errorGeneral: "Something went wrong"
  },
  pt: {
    firstName: "Primeiro Nome *",
    lastName: "Apelido *",
    phone: "Telemóvel (com DDI) *",
    email: "E-mail *",
    langLabel: "Idioma de Preferência",
    couponLabel: "Quero receber o cupão de 20% de desconto *",
    marketingLabel: "Concordo em receber notícias, ofertas e comunicações de marketing do O Empório.",
    submit: "Obter Meus 20% de Desconto",
    submitting: "A processar...",
    successTitle: "Bem-vindo ao Clube!",
    successSub: "O seu cupão exclusivo de 20% de desconto foi enviado para o seu e-mail. Verifique a sua caixa de entrada (e pasta de spam).",
    successButton: "Entendido, obrigado!",
    errorTerms: "Deve aceitar os termos do cupão",
    errorFirstName: "O primeiro nome é obrigatório",
    errorLastName: "O apelido é obrigatório",
    errorPhone: "O telemóvel com código do país é obrigatório",
    errorEmail: "E-mail inválido",
    errorEmailExists: "Este e-mail já está registado.",
    errorRecaptcha: "reCAPTCHA não carregado",
    errorGeneral: "Algo correu mal"
  }
}

interface LeadFormProps {
  lang: 'en' | 'pt';
}

export function LeadForm({ lang }: LeadFormProps) {
  const t = formTranslations[lang]
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema(t)),
    defaultValues: {
      idioma_preferido: lang === 'pt' ? 'pt_PT' : 'en',
      ddi: '+351',
      aceitou_cupom: false,
      aceitou_marketing: false
    }
  })

  // Synchronize language field with global language toggle
  useEffect(() => {
    setValue('idioma_preferido', lang === 'pt' ? 'pt_PT' : 'en')
  }, [lang, setValue])

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      // Execute reCAPTCHA Enterprise
      const token = await new Promise<string>((resolve, reject) => {
        if (typeof window === 'undefined' || !window.grecaptcha) {
          reject(new Error(t.errorRecaptcha))
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
        body: JSON.stringify({ 
          ...data, 
          telefone: `${data.ddi} ${data.telefone}`,
          recaptchaToken: token 
        })
      })

      const result = await response.json()

      if (!response.ok) {
        if (result.error === 'EMAIL_ALREADY_EXISTS') {
          throw new Error(t.errorEmailExists)
        }
        throw new Error(result.error || t.errorGeneral)
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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6 sm:p-10 border border-white/20 shadow-2xl" style={{ backgroundColor: '#373435' }}>
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 text-sm font-inter">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-xs uppercase tracking-widest font-medium text-white/50">{t.firstName}</label>
            <input
              {...register('primeiro_nome')}
              className="w-full bg-transparent border border-white/20 px-4 py-3.5 text-white placeholder-white/10 focus:border-white focus:ring-0 outline-none transition-all duration-300 font-inter"
              placeholder="John"
            />
            {errors.primeiro_nome && <p className="text-red-500 text-[10px] uppercase tracking-tighter mt-1">{errors.primeiro_nome.message}</p>}
          </div>
          <div className="space-y-2">
            <label className="block text-xs uppercase tracking-widest font-medium text-white/50">{t.lastName}</label>
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
            <label className="block text-xs uppercase tracking-widest font-medium text-white/50">{t.phone}</label>
            <div className="flex space-x-2">
              <div className="relative w-32 shrink-0">
                <select
                  {...register('ddi')}
                  className="w-full h-full border border-white/20 px-3 py-3.5 text-white focus:border-white focus:ring-0 outline-none transition-all duration-300 font-inter appearance-none cursor-pointer text-sm"
                  style={{ backgroundColor: '#373435' }}
                >
                  {countries.map((country) => (
                    <option key={`${country.code}-${country.name}`} value={country.code}>
                      {country.flag} {country.code}
                    </option>
                  ))}
                </select>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                  <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                </div>
              </div>
              <input
                {...register('telefone')}
                className="w-full bg-transparent border border-white/20 px-4 py-3.5 text-white placeholder-white/10 focus:border-white focus:ring-0 outline-none transition-all duration-300 font-inter"
                placeholder="912 345 678"
              />
            </div>
            {(errors.telefone || errors.ddi) && <p className="text-red-500 text-[10px] uppercase tracking-tighter mt-1">{errors.telefone?.message || errors.ddi?.message}</p>}
          </div>
          <div className="space-y-2">
            <label className="block text-xs uppercase tracking-widest font-medium text-white/50">{t.email}</label>
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
          <label className="block text-xs uppercase tracking-widest font-medium text-white/50">{t.langLabel}</label>
          <div className="relative">
            <select
              {...register('idioma_preferido')}
              className="w-full border border-white/20 px-4 py-3.5 text-white focus:border-white focus:ring-0 outline-none transition-all duration-300 font-inter appearance-none cursor-pointer"
              style={{ backgroundColor: '#373435' }}
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
              {t.couponLabel}
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
              {t.marketingLabel}
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
            {isSubmitting ? t.submitting : t.submit}
          </span>
          <div className="absolute inset-0 bg-gray-100 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
        </button>
      </form>

      {/* Success Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-xl animate-in fade-in duration-500" style={{ backgroundColor: 'rgba(55, 52, 53, 0.9)' }}>
          <div className="bg-white text-black max-w-lg w-full p-10 sm:p-16 relative overflow-hidden text-center animate-in zoom-in-95 duration-500">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 text-black/20 hover:text-black transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex justify-center mb-10">
              <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: '#373435' }}>
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
            </div>

            <h3 className="font-bourton text-4xl mb-6 tracking-wider uppercase leading-tight">{t.successTitle}</h3>
            
            <p className="text-black/60 font-inter text-lg leading-relaxed mb-10">
              {t.successSub}
            </p>

            <button
              onClick={() => setShowModal(false)}
              className="inline-block text-white font-bourton py-4 px-10 text-lg tracking-widest uppercase hover:opacity-80 transition-opacity"
              style={{ backgroundColor: '#373435' }}
            >
              {t.successButton}
            </button>

            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-black/5 rounded-full blur-3xl"></div>
          </div>
        </div>
      )}
    </>
  )
}
