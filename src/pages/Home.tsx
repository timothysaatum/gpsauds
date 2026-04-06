import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, BookOpen, Heart, Newspaper, Briefcase, Users } from 'lucide-react'
import { eventsApi, newsApi } from '@/api/services'
import { Button, CardSkeleton, EmptyState, SectionHeader } from '@/components/ui'
import { EventCard, NewsCard, CountdownBlock } from '@/components/shared'
import { cn, formatDateTime } from '@/utils'

// ── Hero ──────────────────────────────────────────────────────────────────────

function Hero() {
  const navigate = useNavigate()
  return (
    <section className="bg-green-700 relative overflow-hidden min-h-[88vh] flex items-center">
      {/* Background layers */}
      <div
        className="absolute inset-0 opacity-[0.035] bg-hero-pattern"
        style={{ backgroundSize: '60px 60px' }}
      />
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 65% 45%, rgba(200,153,26,0.14) 0%, transparent 55%)' }}
      />
      {/* Decorative blobs */}
      <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-green-600/20 blur-3xl pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-gold-500/10 blur-3xl pointer-events-none" />

      <div className="section-container relative py-24 lg:py-32">
        <div className="max-w-3xl animate-fade-up">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold-500/30 bg-gold-500/10 text-gold-300 text-xs font-700 uppercase tracking-widest mb-8">
            <span className="w-1.5 h-1.5 bg-gold-400 rounded-full" />
            Official GPSA-UDS Portal
          </span>

          <h1 className="font-display text-5xl md:text-6xl lg:text-[76px] font-bold text-white leading-[1.03] tracking-tight mb-6">
            Welcome to{' '}
            <em className="not-italic text-gold-400">GPSA-UDS</em>
          </h1>

          <p className="text-xl text-white/65 leading-relaxed max-w-2xl mb-10">
            Empowering pharmacy students through academics, welfare, and professional
            development at the University for Development Studies.
          </p>

          <div className="flex flex-wrap gap-4">
            <Button variant="gold" size="lg" onClick={() => navigate('/events')} rightIcon={<ArrowRight className="h-4 w-4" />}>
              Register for Events
            </Button>
            <Button variant="outline-white" size="lg" onClick={() => navigate('/academics')}>
              Explore Academics
            </Button>
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl">
          {[
            { value: '600+', label: 'Active Students' },
            { value: '6', label: 'Year Levels' },
            { value: '100+', label: 'Resources' },
            { value: '10+', label: 'Events Yearly' },
          ].map(({ value, label }) => (
            <div key={label} className="bg-white/8 backdrop-blur-sm rounded-2xl px-5 py-4 border border-white/10">
              <p className="font-display text-3xl font-bold text-white">{value}</p>
              <p className="text-xs text-white/50 font-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Quick actions ─────────────────────────────────────────────────────────────

function QuickActions() {
  const navigate = useNavigate()
  const actions = [
    { icon: Users,    label: 'Join GPSA',        desc: 'Register as an official member',      to: '/register',      color: 'bg-green-50 text-green-700' },
    { icon: Heart,    label: 'Welfare Support',   desc: 'Report issues or request help',       to: '/welfare',       color: 'bg-red-50 text-red-600' },
    { icon: BookOpen, label: 'Academics Hub',     desc: 'Slides, questions, lab reports',      to: '/academics',     color: 'bg-blue-50 text-blue-700' },
    { icon: Newspaper,label: 'Latest News',       desc: 'Official updates and announcements',  to: '/news',          color: 'bg-gold-50 text-gold-700' },
  ]
  return (
    <section className="section-padding bg-[#f5f0e8]">
      <div className="section-container">
        <SectionHeader title="Quick Actions" subtitle="Jump straight to what you need" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {actions.map(({ icon: Icon, label, desc, to, color }) => (
            <button
              key={label}
              onClick={() => navigate(to)}
              className="card p-6 text-left hover:shadow-card-md hover:-translate-y-1 transition-all group"
            >
              <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mb-4', color)}>
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-body font-700 text-[#1c2b22] mb-1 group-hover:text-green-700 transition-colors">{label}</h3>
              <p className="text-sm text-[#5a7060]">{desc}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-700 text-green-700">
                Explore <ArrowRight className="h-3 w-3" />
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Featured event ────────────────────────────────────────────────────────────

function FeaturedEvent() {
  const navigate = useNavigate()
  const { data: event, isLoading } = useQuery({
    queryKey: ['events', 'featured'],
    queryFn: eventsApi.getFeatured,
    staleTime: 2 * 60 * 1000,
  })

  if (isLoading) return (
    <div className="section-container mb-10">
      <div className="h-56 skeleton rounded-3xl" />
    </div>
  )
  if (!event) return null

  return (
    <div className="section-container mb-12">
      <div className="bg-green-700 rounded-3xl p-8 lg:p-10 flex flex-col lg:flex-row gap-8 items-start lg:items-center overflow-hidden relative">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 80% 50%, rgba(200,153,26,0.12) 0%, transparent 60%)' }}
        />
        <div className="text-5xl lg:text-6xl flex-shrink-0 relative">{event.banner_emoji ?? '🎓'}</div>
        <div className="flex-1 relative">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-xs font-700 uppercase tracking-wide mb-3">
            🔴 Featured Event
          </span>
          <h2 className="font-display text-2xl lg:text-3xl font-bold text-white mb-2">{event.title}</h2>
          <p className="text-white/60 text-sm mb-4">
            📅 {formatDateTime(event.start_datetime)} &nbsp;·&nbsp; 📍 {event.location}
          </p>
          <CountdownBlock targetDate={event.start_datetime} className="mb-5" />
          <Button variant="gold" size="md" onClick={() => navigate(`/events/${event.id}`)}>
            Register Now →
          </Button>
        </div>
      </div>
    </div>
  )
}

// ── Upcoming events ───────────────────────────────────────────────────────────

function UpcomingEvents() {
  const navigate = useNavigate()
  const { data, isLoading } = useQuery({
    queryKey: ['events', 'upcoming'],
    queryFn: () => eventsApi.list({ event_status: 'upcoming', limit: 3 }),
  })

  return (
    <section className="section-padding">
      <div className="section-container">
        <SectionHeader
          title="Upcoming Events"
          subtitle="Don't miss out — register now"
          action={
            <Button variant="ghost" size="sm" onClick={() => navigate('/events')} rightIcon={<ArrowRight className="h-4 w-4" />}>
              View All
            </Button>
          }
        />
        <FeaturedEvent />
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => <CardSkeleton key={i} />)}
          </div>
        ) : !data?.items.length ? (
          <EmptyState icon="📅" title="No upcoming events" description="Check back soon for new events." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.items.map((e) => (
              <EventCard key={e.id} event={e} onRegister={() => navigate(`/events/${e.id}`)} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

// ── Opportunities & Welfare split ─────────────────────────────────────────────

function SplitCards() {
  const navigate = useNavigate()
  return (
    <section className="section-padding bg-[#f5f0e8]">
      <div className="section-container">
        <SectionHeader title="Opportunities & Welfare" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Opportunities */}
          <div className="bg-green-700 rounded-3xl p-8 relative overflow-hidden cursor-pointer group"
            onClick={() => navigate('/opportunities')}>
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at 80% 20%, rgba(200,153,26,0.15) 0%, transparent 60%)' }}
            />
            <div className="relative">
              <Briefcase className="h-10 w-10 text-gold-400 mb-5" />
              <h3 className="font-display text-2xl font-bold text-white mb-3">Opportunities Hub</h3>
              <p className="text-white/65 text-sm leading-relaxed mb-6">
                Internships, scholarships, jobs and training programmes curated for pharmacy students at UDS.
              </p>
              <Button variant="gold" size="md" className="group-hover:shadow-glow-gold transition-shadow">
                Browse Opportunities →
              </Button>
            </div>
          </div>

          {/* Welfare */}
          <div className="bg-[#faf9f5] rounded-3xl p-8 border border-[#e4ddd1] relative overflow-hidden cursor-pointer group"
            onClick={() => navigate('/welfare')}>
            <Heart className="h-10 w-10 text-red-500 mb-5" />
            <h3 className="font-display text-2xl font-bold text-green-700 mb-3">PharmaCare Welfare</h3>
            <p className="text-[#5a7060] text-sm leading-relaxed mb-6">
              Report issues, request support, or submit confidential concerns. We are here for you — always.
            </p>
            <Button variant="primary" size="md">
              Get Support →
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Latest news ───────────────────────────────────────────────────────────────

function LatestNews() {
  const navigate = useNavigate()
  const { data, isLoading } = useQuery({
    queryKey: ['news', 'home'],
    queryFn: () => newsApi.list({ limit: 3 }),
  })

  return (
    <section className="section-padding">
      <div className="section-container">
        <SectionHeader
          title="News & Announcements"
          subtitle="Official updates from GPSA-UDS"
          action={
            <Button variant="ghost" size="sm" onClick={() => navigate('/news')} rightIcon={<ArrowRight className="h-4 w-4" />}>
              All News
            </Button>
          }
        />
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => <CardSkeleton key={i} />)}
          </div>
        ) : !data?.items.length ? (
          <EmptyState icon="📰" title="No news yet" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.items.map((p) => (
              <NewsCard key={p.id} post={p} onClick={() => navigate(`/news/${p.id}`)} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

// ── Student voice CTA ─────────────────────────────────────────────────────────

function StudentVoice() {
  const navigate = useNavigate()
  return (
    <section className="section-padding bg-[#f5f0e8]">
      <div className="section-container">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-3xl border border-green-200 p-10 text-center max-w-2xl mx-auto">
          <span className="text-4xl mb-5 block">🗣️</span>
          <h3 className="font-display text-3xl font-bold text-green-700 mb-3">Have Something to Say?</h3>
          <p className="text-[#5a7060] text-base mb-7 max-w-md mx-auto">
            Your voice shapes the decisions we make. Submit a suggestion, report an issue,
            or request support — confidentially if you prefer.
          </p>
          <Button variant="primary" size="lg" onClick={() => navigate('/welfare')}>
            Reach Out to PharmaCare
          </Button>
        </div>
      </div>
    </section>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function HomePage() {
  return (
    <>
      <Hero />
      <QuickActions />
      <UpcomingEvents />
      <SplitCards />
      <LatestNews />
      <StudentVoice />
    </>
  )
}
