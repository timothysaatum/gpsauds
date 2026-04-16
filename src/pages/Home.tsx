import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowRight, BookOpen, Heart, Newspaper,
  Briefcase, Users, ChevronLeft, ChevronRight,
} from 'lucide-react'
import { eventsApi } from '@/api/services'
import { Button, CardSkeleton, EmptyState, SectionHeader } from '@/components/ui'
import { EventCard, CountdownBlock } from '@/components/shared'
import { cn, formatDateTime } from '@/utils'

// ── Slide data ─────────────────────────────────────────────────────────────────

const SLIDES = [
  {
    img: '/src/assets/KCP_4243.jpg',
    tag: 'Health Week 2025',
    heading: 'Welcome to',
    highlight: 'GPSA-UDS',
    sub: 'Empowering pharmacy students through academics, welfare, and professional development at UDS.',
  },
  {
    img: '/src/assets/KCP_4248.jpg',
    tag: 'Community & Events',
    heading: 'One Family,',
    highlight: 'One Vision',
    sub: 'Join hundreds of pharmacy students driving change through collaboration and professional excellence.',
  },
  {
    img: '/src/assets/KCP_4495.jpg',
    tag: 'PharmaCare Welfare',
    heading: 'Your Wellbeing,',
    highlight: 'Our Priority',
    sub: 'Access welfare support, academic resources, and exciting opportunities — all in one place.',
  },
]

const SLIDE_INTERVAL_MS = 5500
const SWIPE_THRESHOLD   = 50

// ── Hero ───────────────────────────────────────────────────────────────────────

function Hero() {
  const navigate = useNavigate()
  const [current, setCurrent]         = useState(0)
  const [transitioning, setTransitioning] = useState(false)
  const dragStartX = useRef<number | null>(null)

  // go() is the single function that drives all navigation
  const go = useCallback(
    (next: number) => {
      if (transitioning) return
      setTransitioning(true)
      setTimeout(() => {
        setCurrent(next)
        setTransitioning(false)
      }, 380)
    },
    [transitioning],
  )

  const prev = useCallback(() => go((current - 1 + SLIDES.length) % SLIDES.length), [current, go])
  const next = useCallback(() => go((current + 1) % SLIDES.length), [current, go])

  // Auto-advance
  useEffect(() => {
    const t = setTimeout(() => go((current + 1) % SLIDES.length), SLIDE_INTERVAL_MS)
    return () => clearTimeout(t)
  }, [current, go])

  // ── Pointer / touch swipe support ──────────────────────────────────────────
  const onPointerDown = (e: React.PointerEvent) => {
    dragStartX.current = e.clientX
  }
  const onPointerUp = (e: React.PointerEvent) => {
    if (dragStartX.current === null) return
    const delta = e.clientX - dragStartX.current
    dragStartX.current = null
    if (Math.abs(delta) > SWIPE_THRESHOLD) {
      delta > 0 ? prev() : next()
    }
  }
  const onPointerLeave = () => { dragStartX.current = null }

  const slide = SLIDES[current]

  return (
    <>
      {/* ── Injected keyframes ── */}
      <style>{`
        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes kenBurns {
          from { transform: scale(1);    }
          to   { transform: scale(1.07); }
        }
        @keyframes heroProgressBar {
          from { width: 0%;    }
          to   { width: 100%; }
        }
        .hero-content-animate {
          animation: heroFadeUp 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
      `}</style>

      <section
        className="relative overflow-hidden select-none"
        style={{ minHeight: 'min(92vh, 820px)', touchAction: 'pan-y' }}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerLeave}
      >
        {/* ── All slide images: pre-rendered, switched by opacity ── */}
        {SLIDES.map((s, i) => (
          <div
            key={i}
            aria-hidden={i !== current}
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: i === current ? 1 : 0 }}
          >
            <img
              src={s.img}
              alt=""
              className="w-full h-full object-cover object-center"
              style={
                i === current
                  ? { animation: 'kenBurns 7s ease-out forwards' }
                  : undefined
              }
            />
          </div>
        ))}

        {/* ── Gradient overlays ── */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(to top, rgba(27,61,34,0.94) 0%, rgba(27,61,34,0.60) 42%, rgba(27,61,34,0.10) 78%, transparent 100%)',
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(118deg, rgba(60,181,89,0.28) 0%, transparent 50%)',
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at 88% 8%, rgba(242,193,46,0.13) 0%, transparent 50%)',
          }}
        />

        {/* ── Auto-advance progress bar ── */}
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/10 z-20">
          <div
            key={`pb-${current}`}
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, #3CB559, #7DD98A)',
              animation: `heroProgressBar ${SLIDE_INTERVAL_MS}ms linear forwards`,
            }}
          />
        </div>

        {/* ── Side arrows — hidden on xs, visible sm+ ── */}
        <button
          onClick={prev}
          aria-label="Previous slide"
          className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-20 hidden sm:flex w-10 h-10 md:w-11 md:h-11 rounded-full items-center justify-center border border-white/20 bg-black/25 text-white backdrop-blur-sm hover:bg-white/20 hover:border-white/40 transition-all duration-200"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={next}
          aria-label="Next slide"
          className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-20 hidden sm:flex w-10 h-10 md:w-11 md:h-11 rounded-full items-center justify-center border border-white/20 bg-black/25 text-white backdrop-blur-sm hover:bg-white/20 hover:border-white/40 transition-all duration-200"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* ── Main content ── */}
        <div
          className="relative z-10 section-container flex flex-col"
          style={{ minHeight: 'inherit' }}
        >
          <div className="mt-auto pb-12 sm:pb-14 lg:pb-20 pt-24 sm:pt-28">

            {/*
              key={current} forces React to unmount + remount this node on
              every slide change → CSS animation replays automatically.
            */}
            <div key={current} className="hero-content-animate max-w-2xl">

              {/* Tag pill */}
              <span
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-700 uppercase tracking-widest mb-5"
                style={{
                  background: 'linear-gradient(90deg, #3CB559, #7DD98A)',
                  color: '#1B3D22',
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#1B3D22] opacity-60" />
                {slide.tag}
              </span>

              {/* Heading */}
              <h1
                className="font-display font-bold text-white leading-[1.03] tracking-tight mb-4"
                style={{ fontSize: 'clamp(2.4rem, 6.5vw, 4.8rem)' }}
              >
                {slide.heading}{' '}
                <span
                  style={{
                    backgroundImage: 'linear-gradient(90deg, #F2C12E, #f5cf55)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {slide.highlight}
                </span>
              </h1>

              <p className="text-base sm:text-lg text-white/70 leading-relaxed mb-8 max-w-xl">
                {slide.sub}
              </p>

              <div className="flex flex-wrap gap-3">
                <Button
                  variant="gold"
                  size="lg"
                  onClick={() => navigate('/events')}
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  Register for Events
                </Button>
                <Button
                  variant="outline-white"
                  size="lg"
                  onClick={() => navigate('/academics')}
                >
                  Learn More
                </Button>
              </div>
            </div>

            {/* ── Controls row ── */}
            <div className="mt-7 flex items-center gap-3">

              {/* Prev — mobile only (xs), since side arrows cover sm+ */}
              <button
                onClick={prev}
                aria-label="Previous slide"
                className="sm:hidden flex w-9 h-9 rounded-full border border-white/25 items-center justify-center text-white bg-black/20 active:scale-95 transition-all"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {/* Dot indicators */}
              <div className="flex gap-2 items-center">
                {SLIDES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => go(i)}
                    aria-label={`Go to slide ${i + 1}`}
                    className="transition-all duration-300 rounded-full"
                    style={{
                      width:  i === current ? 24 : 7,
                      height: 7,
                      background:
                        i === current
                          ? 'linear-gradient(90deg, #3CB559, #7DD98A)'
                          : 'rgba(255,255,255,0.35)',
                    }}
                  />
                ))}
              </div>

              {/* Slide counter — desktop */}
              <span className="hidden sm:inline text-xs text-white/35 font-mono tabular-nums ml-1">
                {String(current + 1).padStart(2, '0')}&thinsp;/&thinsp;{String(SLIDES.length).padStart(2, '0')}
              </span>

              {/* Next — mobile only */}
              <button
                onClick={next}
                aria-label="Next slide"
                className="sm:hidden flex w-9 h-9 rounded-full border border-white/25 items-center justify-center text-white bg-black/20 active:scale-95 transition-all"
              >
                <ChevronRight className="h-4 w-4" />
              </button>

            </div>
          </div>
        </div>
      </section>
    </>
  )
}

// ── Quick actions ──────────────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  {
    icon: Users,
    label: 'Join GPSA',
    desc: 'Register as an official member',
    to: '/register',
    iconColor: '#3CB559',
    iconBg: 'rgba(60,181,89,0.09)',
    glowColor: 'rgba(60,181,89,0.18)',
    borderHover: 'hover:border-green-300',
  },
  {
    icon: BookOpen,
    label: 'Academics',
    desc: 'Slides, questions, lab reports',
    to: '/academics',
    iconColor: '#3CB559',
    iconBg: 'rgba(60,181,89,0.07)',
    glowColor: 'rgba(60,181,89,0.14)',
    borderHover: 'hover:border-green-300',
  },
  {
    icon: Newspaper,
    label: 'About Us',
    desc: 'Who we are and what we stand for',
    to: '/about',
    iconColor: '#C8991A',
    iconBg: 'rgba(242,193,46,0.10)',
    glowColor: 'rgba(242,193,46,0.22)',
    borderHover: 'hover:border-gold-200',
  },
  {
    icon: Heart,
    label: 'Gallery',
    desc: 'Photos and memories from our events',
    to: '/gallery',
    iconColor: '#C8991A',
    iconBg: 'rgba(242,193,46,0.10)',
    glowColor: 'rgba(242,193,46,0.22)',
    borderHover: 'hover:border-gold-200',
  },
]

function QuickActions() {
  const navigate = useNavigate()

  return (
    <section className="section-padding bg-cream-dark">
      <div className="section-container">
        <SectionHeader title="Quick Actions" subtitle="Jump straight to what you need" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {QUICK_ACTIONS.map(({ icon: Icon, label, desc, to, iconColor, iconBg, glowColor, borderHover }) => (
            <button
              key={label}
              onClick={() => navigate(to)}
              className={cn(
                'card p-5 lg:p-6 text-left border border-transparent hover:shadow-card-md hover:-translate-y-1 transition-all group relative overflow-hidden',
                borderHover,
              )}
            >
              {/* Corner accent glow — reveals on hover */}
              <div
                className="absolute -top-5 -right-5 w-24 h-24 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)` }}
              />

              {/* Icon badge */}
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-transform duration-200 group-hover:scale-110"
                style={{ background: iconBg }}
              >
                <Icon className="h-5 w-5" style={{ color: iconColor }} />
              </div>

              <h3 className="font-body font-700 text-green-800 mb-1 text-sm lg:text-base">
                {label}
              </h3>
              <p className="text-xs text-green-600 leading-relaxed hidden sm:block">{desc}</p>

              <span
                className="mt-3 inline-flex items-center gap-1 text-xs font-700"
                style={{ color: iconColor }}
              >
                Explore{' '}
                <ArrowRight className="h-3 w-3 transition-transform duration-150 group-hover:translate-x-0.5" />
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Featured event ─────────────────────────────────────────────────────────────

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
      <div
        className="rounded-3xl p-8 lg:p-10 flex flex-col lg:flex-row gap-8 items-start lg:items-center overflow-hidden relative"
        style={{ background: 'linear-gradient(135deg, #3CB559 0%, #52C96E 50%, #7DD98A 100%)' }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 80% 50%, rgba(242,193,46,0.15) 0%, transparent 60%)' }}
        />
        <div className="text-5xl lg:text-6xl flex-shrink-0 relative">{event.banner_emoji ?? '🎓'}</div>
        <div className="flex-1 relative">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gold-500/15 text-gold-700 rounded-full text-xs font-700 uppercase tracking-wide mb-3">
            ⭐ Featured Event
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

// ── Upcoming events ────────────────────────────────────────────────────────────

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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/events')}
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
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

// ── Opportunities & Welfare ────────────────────────────────────────────────────

function SplitCards() {
  const navigate = useNavigate()
  return (
    <section className="section-padding bg-cream-dark">
      <div className="section-container">
        <SectionHeader title="Opportunities & Welfare" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Opportunities */}
          <div
            className="rounded-3xl p-8 relative overflow-hidden cursor-pointer group"
            style={{ background: 'linear-gradient(135deg, #3CB559 0%, #52C96E 50%, #7DD98A 100%)' }}
            onClick={() => navigate('/opportunities')}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at 80% 20%, rgba(242,193,46,0.18) 0%, transparent 60%)' }}
            />
            <div className="relative">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                style={{ background: 'rgba(242,193,46,0.18)' }}
              >
                <Briefcase className="h-7 w-7 text-[#F2C12E]" />
              </div>
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
          <div
            className="rounded-3xl p-8 border border-cream-dark relative overflow-hidden cursor-pointer group bg-white"
            onClick={() => navigate('/welfare')}
          >
            <div
              className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(239,68,68,0.07) 0%, transparent 70%)',
                transform: 'translate(30%, -30%)',
              }}
            />
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
              style={{ background: 'rgba(239,68,68,0.08)' }}
            >
              <Heart className="h-7 w-7 text-red-500" />
            </div>
            <h3 className="font-display text-2xl font-bold text-green-700 mb-3">PharmaCare Welfare</h3>
            <p className="text-muted text-sm leading-relaxed mb-6">
              Report issues, request support, or submit confidential concerns. We are here for you — always.
            </p>
            <Button variant="primary" size="md">Get Support →</Button>
          </div>

        </div>
      </div>
    </section>
  )
}

// ── Student voice CTA ──────────────────────────────────────────────────────────

function StudentVoice() {
  const navigate = useNavigate()
  return (
    <section className="section-padding bg-cream-dark">
      <div className="section-container">
        <div className="rounded-3xl p-10 lg:p-14 text-center max-w-2xl mx-auto relative overflow-hidden bg-cream-dark border border-cream-dark">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at 50% 0%, rgba(77,184,80,0.15) 0%, transparent 60%)',
            }}
          />
          <span className="text-4xl mb-5 block relative">🗣️</span>
          <h3 className="font-display text-3xl font-bold text-green-700 mb-3 relative">
            Have Something to Say?
          </h3>
          <p className="text-green-600 text-base mb-7 max-w-md mx-auto relative">
            Your voice shapes the decisions we make. Submit a suggestion, report an issue,
            or request support — confidentially if you prefer.
          </p>
          <Button variant="primary" size="lg" onClick={() => navigate('/welfare')}>
            Reach Out to Us
          </Button>
        </div>
      </div>
    </section>
  )
}

// ── Word from the President ────────────────────────────────────────────────────

function WordFromPresident() {
  return (
    <section className="section-padding overflow-hidden">
      <div className="section-container">
        <SectionHeader title="Word from the President" />

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] rounded-3xl overflow-hidden shadow-card-lg">

            {/* ── Left panel: identity ── */}
            <div
              className="relative flex flex-col items-center justify-center gap-0 px-8 py-10 lg:py-12"
              style={{ background: 'linear-gradient(160deg, #1B3D22 0%, #2d6840 100%)' }}
            >
              {/* Subtle pattern overlay */}
              <div
                className="absolute inset-0 pointer-events-none opacity-[0.04]"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Ccircle cx='20' cy='20' r='1.5'/%3E%3C/g%3E%3C/svg%3E")`,
                }}
              />
              <div className="relative z-10 flex flex-col items-center text-center">
                {/*
                  Photo placeholder — swap the inner <div> for:
                  <img src={presidentPhoto} alt="President Name" className="w-full h-full object-cover object-top" />
                */}
                <div
                  className="w-28 h-28 lg:w-36 lg:h-36 rounded-2xl overflow-hidden mb-5 flex-shrink-0"
                  style={{
                    border: '3px solid rgba(60,181,89,0.5)',
                    boxShadow: '0 0 0 6px rgba(60,181,89,0.10)',
                  }}
                >
                  <div
                    className="w-full h-full flex flex-col items-center justify-end pb-3"
                    style={{ background: 'linear-gradient(160deg, #2d6840 0%, #1B3D22 100%)' }}
                  >
                    {/* Silhouette — replace with <img> */}
                    <svg viewBox="0 0 80 80" className="w-20 h-20 opacity-30" fill="white" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="40" cy="28" r="16" />
                      <ellipse cx="40" cy="72" rx="28" ry="20" />
                    </svg>
                  </div>
                </div>

                {/* Gold accent rule */}
                <div
                  className="w-8 h-0.5 rounded-full mb-3"
                  style={{ background: 'linear-gradient(90deg, #F2C12E, #f5cf55)' }}
                />

                {/* Name — replace placeholder */}
                <p className="font-display font-bold text-white text-base lg:text-lg leading-tight mb-1">
                  {/* Replace: President Full Name */}
                  President Name
                </p>
                <p className="text-xs font-500 uppercase tracking-widest" style={{ color: '#7DD98A' }}>
                  President, GPSA-UDS
                </p>
                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.38)' }}>
                  2024 / 2025 Executive
                </p>
              </div>
            </div>

            {/* ── Right panel: quote ── */}
            <div
              className="relative flex flex-col justify-center px-8 py-10 lg:px-12 lg:py-12"
              style={{
                background: 'linear-gradient(135deg, #f4fbf6 0%, #eef7f1 100%)',
                borderTop: '1px solid #d1ead8',
                borderRight: '1px solid #d1ead8',
                borderBottom: '1px solid #d1ead8',
              }}
            >
              {/* Faint gold glow top-right */}
              <div
                className="absolute top-0 right-0 w-56 h-56 pointer-events-none"
                style={{
                  background: 'radial-gradient(ellipse at 90% 10%, rgba(242,193,46,0.12) 0%, transparent 65%)',
                }}
              />

              {/* Large decorative quotation mark */}
              <span
                className="font-display font-bold select-none block leading-none mb-2"
                style={{
                  fontSize: 'clamp(4rem, 10vw, 7rem)',
                  color: '#3CB559',
                  opacity: 0.15,
                  lineHeight: 0.8,
                }}
              >
                &ldquo;
              </span>

              <blockquote
                className="font-body leading-relaxed relative z-10"
                style={{
                  fontSize: 'clamp(1rem, 2.2vw, 1.25rem)',
                  color: '#1B3D22',
                  fontStyle: 'italic',
                  fontWeight: 500,
                  letterSpacing: '-0.01em',
                }}
              >
                {/* Replace with actual quote */}
                Together, we are building a stronger, more united pharmacy community — one that
                uplifts every student and champions excellence in all we do.
              </blockquote>

              {/* Closing mark + rule */}
              <div className="flex items-center gap-4 mt-7 relative z-10">
                <div
                  className="h-px flex-1 max-w-[48px] rounded-full"
                  style={{ background: '#3CB559', opacity: 0.4 }}
                />
                <p className="text-xs font-700 uppercase tracking-widest" style={{ color: '#3CB559' }}>
                  GPSA-UDS · 2024–2025
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}

// ── Gallery teaser ─────────────────────────────────────────────────────────────

/**
 * GALLERY TILES — replace `gradient` / `accentColor` with actual <img> tags
 * once you have real event photos:
 *
 *   <img src={tile.img} alt={tile.label}
 *        className="w-full h-full object-cover object-center
 *                   group-hover:scale-105 transition-transform duration-500" />
 *
 * Keep the overlay <div> so the label stays readable over photos.
 */
const GALLERY_TILES = [
  {
    label: 'Graduation Ceremony',
    category: 'Events',
    gradient: 'linear-gradient(145deg, #1B3D22 0%, #2d6840 60%, #3CB559 100%)',
    accentColor: '#7DD98A',
    span: 'md:col-span-2 md:row-span-2',
    height: 'h-[220px] md:h-auto',
  },
  {
    label: 'Health Week',
    category: 'Welfare',
    gradient: 'linear-gradient(145deg, #7a4a00 0%, #C8991A 100%)',
    accentColor: '#F2C12E',
    span: '',
    height: 'h-[140px]',
  },
  {
    label: 'Academic Symposium',
    category: 'Academic',
    gradient: 'linear-gradient(145deg, #0c3347 0%, #185FA5 100%)',
    accentColor: '#85B7EB',
    span: '',
    height: 'h-[140px]',
  },
  {
    label: 'Community Outreach',
    category: 'Outreach',
    gradient: 'linear-gradient(145deg, #1B3D22 0%, #3a8050 100%)',
    accentColor: '#5fa874',
    span: '',
    height: 'h-[140px]',
  },
  {
    label: 'Awards Night',
    category: 'Events',
    gradient: 'linear-gradient(145deg, #4a1600 0%, #993c1d 100%)',
    accentColor: '#F09575',
    span: '',
    height: 'h-[140px]',
  },
]

function GalleryTeaser() {
  const navigate = useNavigate()
  return (
    <section className="section-padding" style={{ background: '#f4f7f4' }}>
      <div className="section-container">
        <SectionHeader
          title="Gallery"
          subtitle="Moments from our events and activities"
          action={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/gallery')}
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              View All
            </Button>
          }
        />

        {/* Bento grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 md:grid-rows-2 gap-3 md:h-[320px]">
          {GALLERY_TILES.map(({ label, category, gradient, accentColor, span, height }) => (
            <div
              key={label}
              onClick={() => navigate('/gallery')}
              className={cn(
                span,
                height,
                'relative rounded-2xl overflow-hidden cursor-pointer group',
              )}
              style={{ background: gradient }}
            >
              {/*
                ── When you have real photos, replace this <div> with an <img>:
                <img src={photoUrl} alt={label}
                     className="absolute inset-0 w-full h-full object-cover
                                group-hover:scale-105 transition-transform duration-500" />
              ──────────────────────────────────────────────────────────────── */}

              {/* Subtle texture overlay */}
              <div
                className="absolute inset-0 opacity-[0.06]"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h32v32H0z' fill='none'/%3E%3Ccircle cx='8' cy='8' r='1' fill='white'/%3E%3Ccircle cx='24' cy='8' r='1' fill='white'/%3E%3Ccircle cx='8' cy='24' r='1' fill='white'/%3E%3Ccircle cx='24' cy='24' r='1' fill='white'/%3E%3C/svg%3E")`,
                }}
              />

              {/* Bottom-to-top fade so text is always legible over photos */}
              <div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.05) 55%, transparent 100%)',
                }}
              />

              {/* Hover reveal: subtle brightness lift */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              />

              {/* Category pill — top left */}
              <div className="absolute top-3 left-3 z-10">
                <span
                  className="inline-block text-[10px] font-700 uppercase tracking-widest px-2 py-0.5 rounded-full"
                  style={{
                    background: 'rgba(255,255,255,0.15)',
                    color: accentColor,
                    backdropFilter: 'blur(4px)',
                    border: `1px solid ${accentColor}33`,
                  }}
                >
                  {category}
                </span>
              </div>

              {/* Arrow — top right, appears on hover */}
              <div
                className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full flex items-center justify-center
                           opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0
                           transition-all duration-200"
                style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(4px)' }}
              >
                <ArrowRight className="h-3.5 w-3.5 text-white" />
              </div>

              {/* Label — bottom left */}
              <div className="absolute bottom-0 left-0 right-0 p-3.5 z-10">
                <p className="text-white font-700 text-sm leading-snug drop-shadow-sm">
                  {label}
                </p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-muted mt-5">
          Photos will appear here once uploaded —{' '}
          <span className="font-600 text-green-700 cursor-pointer hover:underline" onClick={() => navigate('/gallery')}>
            visit the Gallery
          </span>
        </p>
      </div>
    </section>
  )
}

// ── Page assembly ──────────────────────────────────────────────────────────────

export function HomePage() {
  return (
    <>
      <Hero />
      <QuickActions />
      <WordFromPresident />
      <UpcomingEvents />
      <SplitCards />
      <GalleryTeaser />
      <StudentVoice />
    </>
  )
}