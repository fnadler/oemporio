'use client'

import { useState } from 'react'
import Image from 'next/image'
import { LeadForm } from '@/components/LeadForm'

const translations = {
  en: {
    welcome: "Welcome to",
    cta: "Sign Up for 20% Off Comfort Food",
    visitTitle: "Visit us in Ericeira",
    joinTitle: "Join The Club",
    joinSub: "Sign up today and receive an exclusive 20% discount on comfort food for your next visit.",
    footerRights: "All rights reserved.",
  },
  pt: {
    welcome: "Bem-vindo ao",
    cta: "Registe-se para 20% de Desconto",
    visitTitle: "Visite-nos na Ericeira",
    joinTitle: "Junte-se ao Clube",
    joinSub: "Registe-se hoje e receba um desconto exclusivo de 20% em comfort food na sua próxima visita.",
    footerRights: "Todos os direitos reservados.",
  }
}

export default function Home() {
  const [lang, setLang] = useState<'en' | 'pt'>('en')
  const t = translations[lang]

  return (
    <main className="min-h-screen text-white relative" style={{ backgroundColor: '#373435' }}>
      {/* Language Toggle */}
      <div className="fixed top-6 right-6 z-[100] flex space-x-2 bg-black/20 backdrop-blur-md p-1 border border-white/10 rounded-full">
        <button 
          onClick={() => setLang('en')}
          className={`px-4 py-1.5 rounded-full text-xs font-bourton tracking-widest transition-all ${lang === 'en' ? 'bg-white text-black' : 'text-white/60 hover:text-white'}`}
        >
          EN
        </button>
        <button 
          onClick={() => setLang('pt')}
          className={`px-4 py-1.5 rounded-full text-xs font-bourton tracking-widest transition-all ${lang === 'pt' ? 'bg-white text-black' : 'text-white/60 hover:text-white'}`}
        >
          PT
        </button>
      </div>
      {/* Hero Section */}
      <section className="bg-white text-black min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden" style={{ backgroundColor: '#ffffff', color: '#000000', colorScheme: 'light' }}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.03)_0%,transparent_100%)]"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center text-center space-y-8">
          <p className="font-bourton text-2xl md:text-3xl tracking-widest uppercase text-black/80">
            {t.welcome}
          </p>
          
          <div className="relative w-72 h-72 md:w-96 md:h-96 lg:w-[28rem] lg:h-[28rem] -mt-4">
            <Image
              src="/assets/brand/positive-stamp.png"
              alt="O Empório Logo"
              fill
              className="object-contain"
              priority
              unoptimized
            />
          </div>


          <a 
            href="#signup"
            className="inline-block mt-8 text-white font-bourton py-4 px-10 text-xl tracking-wider hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#373435' }}
          >
            {t.cta}
          </a>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-24 px-6 text-center bg-black">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-4">
            <h2 className="font-bourton text-3xl md:text-5xl tracking-wider uppercase">{t.visitTitle}</h2>
            <p className="text-white/60 font-inter text-xl">Rua de Santo António 12B</p>
          </div>
          
          <div className="w-full h-[400px] md:h-[500px] border border-white/10 shadow-2xl overflow-hidden">
            <iframe 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              loading="lazy" 
              allowFullScreen 
              referrerPolicy="no-referrer-when-downgrade" 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3101.4!2d-9.4144!3d38.9667!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd1ed96317b94911%3A0x7d6f6e8e58f0a0c!2sR.+de+Santo+Ant%C3%B3nio+12B%2C+2655-360+Ericeira%2C+Portugal!5e0!3m2!1sen!2spt!4v1714595800000!5m2!1sen!2spt"
            ></iframe>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section id="signup" className="py-24 px-6 relative" style={{ backgroundColor: '#373435' }}>
        {/* Subtle top border/gradient transition */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-bourton text-3xl md:text-5xl mb-4 tracking-wider">{t.joinTitle}</h2>
            <p className="text-white/60 font-inter text-lg">
              {t.joinSub}
            </p>
          </div>
          
          <LeadForm lang={lang} />
        </div>
      </section>

      {/* Footer */}
      <footer className="pt-4 pb-12 px-6 flex flex-col items-center" style={{ backgroundColor: '#373435' }}>
        <div className="relative w-full max-w-lg h-12 md:h-16 lg:h-20 mb-4">
          <Image
            src="/assets/brand/negative-horizontal.png"
            alt="O Empório Logo Footer"
            fill
            className="object-contain"
            unoptimized
          />
        </div>
        <div className="text-center text-white/50 text-[10px] font-inter uppercase tracking-widest space-y-1">
          <p>&copy; {new Date().getFullYear()} O Empório. {t.footerRights}</p>
          <p>Ericeira, Portugal</p>
        </div>
      </footer>
    </main>
  )
}
