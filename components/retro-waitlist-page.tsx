"use client"
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, CheckCircle, Package, Zap, Palette } from "lucide-react"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Component() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [subscriberCount, setSubscriberCount] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchSubscriberCount()

    const subscription = supabase
      .channel('table-db-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'waitlist'
      }, () => {
        fetchSubscriberCount()
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const fetchSubscriberCount = async () => {
    try {
      const { count, error } = await supabase
        .from('waitlist')
        .select('*', { count: 'exact', head: true })

      if (error) throw error

      setSubscriberCount(count || 0)
    } catch (error) {
      console.error('Error fetching subscriber count:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const { error } = await supabase
        .from('waitlist')
        .insert([{ email }])

      if (error) throw error

      setIsSubmitted(true)
      setEmail('')
      // We don't need to call fetchSubscriberCount() here anymore
    } catch (error: any) {
      if (error.code === '23505') { // Unique constraint violation
        setError('This email is already registered.')
      } else {
        setError('An error occurred. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FFA500] flex flex-col items-center justify-center p-4 relative overflow-hidden font-mono">
      {/* Retro grid background */}
      <div className="absolute inset-0 grid grid-cols-[repeat(20,1fr)] grid-rows-[repeat(20,1fr)] opacity-20 pointer-events-none">
        {[...Array(400)].map((_, i) => (
          <div key={i} className="border border-[#800080]" />
        ))}
      </div>

      <div className="max-w-4xl w-full space-y-8 text-center relative z-10">
        <h1 className="text-4xl md:text-6xl font-bold text-[#800080] mb-4 drop-shadow-[2px_2px_0_#FFF]">
          Welcome to Vortex UI
        </h1>
        <p className="text-xl text-[#800080] mb-8 drop-shadow-[1px_1px_0_#FFF]">
          The groovy UI library for building rad web applications. Join our waitlist to be the first to experience the past and future of web design, man!
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
          <Input
            type="email"
            placeholder="Your far-out email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-grow bg-[#FFD700] text-[#800080] placeholder-[#800080]/70 border-[#800080] focus:ring-[#800080]"
          />
          <Button 
            type="submit" 
            disabled={isLoading || isSubmitted} 
            className="w-full sm:w-auto bg-[#800080] text-[#FFD700] hover:bg-[#4B0082] focus:ring-[#FFD700]"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : isSubmitted ? (
              <CheckCircle className="mr-2 h-4 w-4" />
            ) : null}
            {isSubmitted ? "You're on the list!" : 'Join Waitlist'}
          </Button>
        </form>

        {error && <p className="text-red-600 mt-2">{error}</p>}

        <p className="text-[#800080] text-lg mt-4">
          {subscriberCount>0 ? subscriberCount : "..."} groovy developers have joined the waitlist!
        </p>

        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="bg-[#FFD700] rounded-lg p-6 text-[#800080] border-4 border-[#800080] shadow-[4px_4px_0_#800080]">
            <Package className="w-12 h-12 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Groovy Packager</h3>
            <p>{"Bundle your components with our far-out packager. It's outta sight!"}</p>
          </div>
          <div className="bg-[#FFD700] rounded-lg p-6 text-[#800080] border-4 border-[#800080] shadow-[4px_4px_0_#800080]">
            <Zap className="w-12 h-12 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
            <p>Optimized for performance, ensuring your applications run smoother than a disco ball.</p>
          </div>
          <div className="bg-[#FFD700] rounded-lg p-6 text-[#800080] border-4 border-[#800080] shadow-[4px_4px_0_#800080]">
            <Palette className="w-12 h-12 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Customizable</h3>
            <p>{"Easily adapt the look and feel to match your brand's unique style. It's like a mood ring for your UI!"}</p>
          </div>
        </div>
      </div>
    </div>
  )
}