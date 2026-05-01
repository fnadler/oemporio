import Image from 'next/image'
import { LeadForm } from '@/components/LeadForm'

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="bg-white text-black min-h-[80vh] flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.03)_0%,transparent_100%)]"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center text-center space-y-12">
          <p className="font-bourton text-2xl md:text-3xl tracking-widest uppercase text-black/80 mt-12">
            Welcome to
          </p>
          
          <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96">
            <Image
              src="/assets/brand/positive-stamp.svg"
              alt="O Empório Logo"
              fill
              className="object-contain"
              priority
            />
          </div>

          <div className="space-y-4">
            <h1 className="font-inter font-light text-xl md:text-2xl lg:text-3xl tracking-widest uppercase">
              Craft Beer <span className="mx-2 md:mx-4 opacity-30">|</span> Comfort Food <span className="mx-2 md:mx-4 opacity-30">|</span> Ericeira – Portugal
            </h1>
          </div>

          <a 
            href="#signup"
            className="inline-block mt-8 bg-black text-white font-bourton py-4 px-10 text-xl tracking-wider hover:bg-black/80 transition-colors"
          >
            Sign Up for 20% Off Comfort Food
          </a>
        </div>
      </section>

      {/* Form Section */}
      <section id="signup" className="py-24 px-6 relative bg-black">
        {/* Subtle top border/gradient transition */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-bourton text-3xl md:text-5xl mb-4 tracking-wider">Join The Club</h2>
            <p className="text-white/60 font-inter text-lg">
              Sign up today and receive an exclusive 20% discount on comfort food for your next visit.
            </p>
          </div>
          
          <LeadForm />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 text-center text-white/40 text-sm font-inter">
        <p>&copy; {new Date().getFullYear()} O Empório. All rights reserved.</p>
        <p className="mt-2">Ericeira, Portugal</p>
      </footer>
    </main>
  )
}
