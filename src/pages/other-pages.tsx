// ─────────────────────────────────────────────────────────────────────────────
// Welfare Page
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ExternalLink, Search, Bell, BellOff, ChevronRight} from 'lucide-react'
import { opportunitiesApi, newsApi, notificationsApi } from '@/api/services'

// Import more detailed pages from dedicated files. These will replace
// the simplified placeholders defined later in this file. When the
// router imports `AboutPage` or `GalleryPage` from `other-pages.tsx`, it
// will instead use the richer implementations from `AboutPage.tsx` and
// `GalleryPage.tsx`.
import { AboutPage as DetailedAboutPage } from './AboutPage'
import { GalleryPage as DetailedGalleryPage } from './GalleryPage'
export { WelfarePage } from './WelfarePage'
import { useAuthStore } from '@/store/authStore'
import { Button, Badge, CardSkeleton, EmptyState, Skeleton } from '@/components/ui'
import { FilterBar, PageHeader, NewsCard, OpportunityCard } from '@/components/shared'
import {
  cn, formatDate, deadlineUrgency,
  NEWS_CATEGORY_LABELS, relativeTime,
} from '@/utils'
import type { OpportunityType, NewsCategory } from '@/types'

// ── Opportunities ─────────────────────────────────────────────────────────────

export function OpportunitiesPage() {
  const [typeFilter, setTypeFilter] = useState<OpportunityType | 'all'>('all')
  const [deadlineFilter, setDeadlineFilter] = useState<'all' | 'closing_soon' | 'open'>('all')
  const [search, setSearch] = useState('')
  const [redirectOpp, setRedirectOpp] = useState<{ title: string; url: string } | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['opportunities', { type: typeFilter }],
    queryFn: () => opportunitiesApi.list({ opp_type: typeFilter !== 'all' ? typeFilter : undefined, limit: 24 }),
    staleTime: 2 * 60 * 1000,
  })

  const filtered = (data?.items ?? []).filter((o) => {
    const matchSearch = !search || o.title.toLowerCase().includes(search.toLowerCase()) || o.organization.toLowerCase().includes(search.toLowerCase())
    const urgency = deadlineUrgency(o.deadline)
    const matchDeadline = deadlineFilter === 'all'
      || (deadlineFilter === 'closing_soon' && (urgency === 'closing_today' || urgency === 'closing_soon'))
      || (deadlineFilter === 'open' && urgency === 'open')
    return matchSearch && matchDeadline
  })

  const typeOptions: { value: OpportunityType | 'all'; label: string }[] = [
    { value: 'all',         label: 'All Types' },
    { value: 'internship',  label: 'Internship' },
    { value: 'scholarship', label: 'Scholarship' },
    { value: 'job',         label: 'Job' },
    { value: 'training',    label: 'Training' },
  ]

  const deadlineOptions: { value: 'all' | 'closing_soon' | 'open'; label: string }[] = [
    { value: 'all',          label: 'All Deadlines' },
    { value: 'closing_soon', label: '🔴 Closing Soon' },
    { value: 'open',         label: '🟢 Open' },
  ]

  return (
    <>
      <PageHeader title="Opportunities Hub" subtitle="Discover internships, scholarships, and career opportunities tailored for you." />

      <div className="section-container section-padding">
        <div className="relative max-w-lg mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder='Search e.g. "internship" or "Ghana MoH"'
            className="form-input pl-11" />
        </div>

        <div className="flex flex-wrap gap-6 mb-8">
          <div>
          <p className="text-xs font-700 text-muted uppercase tracking-wide mb-2">Type</p>
            <FilterBar options={typeOptions} value={typeFilter} onChange={setTypeFilter} />
          </div>
          <div>
          <p className="text-xs font-700 text-muted uppercase tracking-wide mb-2">Deadline</p>
            <FilterBar options={deadlineOptions} value={deadlineFilter} onChange={setDeadlineFilter} />
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map((i) => <CardSkeleton key={i} />)}
          </div>
        ) : !filtered.length ? (
          <EmptyState icon="💼" title="No opportunities found" description="Try adjusting your filters." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((o) => (
              <OpportunityCard
                key={o.id}
                opportunity={o}
                onApply={() => setRedirectOpp({ title: o.title, url: o.external_link })}
              />
            ))}
          </div>
        )}
      </div>

      {/* Redirect modal */}
      {redirectOpp && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-card-lg w-full max-w-sm p-8 animate-fade-up text-center">
            <span className="text-4xl mb-4 block">🔗</span>
            <h3 className="font-display text-xl font-bold text-green-700 mb-3">External Redirect</h3>
            <p className="text-sm text-muted mb-6">
              You are being redirected to an external website to complete your application for{' '}
              <strong>{redirectOpp.title}</strong>.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" size="md" className="flex-1" onClick={() => setRedirectOpp(null)}>Cancel</Button>
              <a
                href={redirectOpp.url}
                target="_blank"
                rel="noreferrer"
                onClick={() => setRedirectOpp(null)}
                className="btn-md btn-primary flex-1 flex items-center justify-center gap-1.5"
              >
                Proceed <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ── News ──────────────────────────────────────────────────────────────────────

const NEWS_PAGE_SIZE = 9

export function NewsPage() {
  const navigate = useNavigate()
  const [catFilter, setCatFilter] = useState<NewsCategory | 'all'>('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  // Reset to page 1 when filters change
  const handleCatChange = (v: NewsCategory | 'all') => { setCatFilter(v); setPage(1) }
  const handleSearch    = (v: string)                 => { setSearch(v);   setPage(1) }

  const { data: featured } = useQuery({
    queryKey: ['news', 'featured'],
    queryFn: newsApi.getFeatured,
    staleTime: 5 * 60 * 1000,
  })

  const { data, isLoading } = useQuery({
    queryKey: ['news', { category: catFilter }],
    queryFn: () => newsApi.list({ category: catFilter !== 'all' ? catFilter : undefined, limit: 100 }),
    staleTime: 60_000,
  })

  const catOptions: { value: NewsCategory | 'all'; label: string }[] = [
    { value: 'all',             label: 'All' },
    { value: 'announcement',    label: 'Announcements' },
    { value: 'academic_update', label: 'Academic' },
    { value: 'welfare_update',  label: 'Welfare' },
    { value: 'events_recap',    label: 'Events Recap' },
    { value: 'opportunities',   label: 'Opportunities' },
    { value: 'general',         label: 'General' },
  ]

  const allFiltered = (data?.items ?? []).filter((p) =>
    !search ||
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.summary.toLowerCase().includes(search.toLowerCase())
  )

  const totalPages  = Math.max(1, Math.ceil(allFiltered.length / NEWS_PAGE_SIZE))
  const safePage    = Math.min(page, totalPages)
  const paginated   = allFiltered.slice((safePage - 1) * NEWS_PAGE_SIZE, safePage * NEWS_PAGE_SIZE)

  // Split first page into magazine layout: 1 hero + 2 secondary + rest in grid
  const heroPost      = safePage === 1 ? paginated[0]    : undefined
  const secondaryPosts= safePage === 1 ? paginated.slice(1, 3) : []
  const gridPosts     = safePage === 1 ? paginated.slice(3) : paginated

  return (
    <>
      <PageHeader title="News & Announcements" subtitle="Official updates, notices, and important information from GPSA-UDS." />

      <div className="section-container section-padding">

        {/* Featured pinned post (server-selected) */}
        {featured && safePage === 1 && !search && catFilter === 'all' && (
          <div
            className="bg-green-700 rounded-3xl p-8 lg:p-10 mb-10 flex flex-col lg:flex-row gap-8 items-start cursor-pointer hover:shadow-card-lg transition-all group"
            onClick={() => navigate(`/news/${featured.id}`)}
          >
            <div className="text-7xl flex-shrink-0 group-hover:scale-110 transition-transform">{featured.banner_emoji ?? '📢'}</div>
            <div className="flex-1">
              <div className="flex gap-2 mb-3">
                <Badge variant="gold">📌 Pinned</Badge>
                <Badge variant="green">{NEWS_CATEGORY_LABELS[featured.category]}</Badge>
                {featured.is_urgent && <Badge variant="red">🔴 Urgent</Badge>}
              </div>
              <h2 className="font-display text-2xl lg:text-3xl font-bold text-white mb-2 leading-snug">{featured.title}</h2>
              {featured.published_at && (
                <p className="text-white/50 text-xs mb-3">{formatDate(featured.published_at)}</p>
              )}
              <p className="text-white/70 text-sm line-clamp-2 leading-relaxed mb-5">{featured.summary}</p>
              <Button variant="gold" size="md">Read Full Story →</Button>
            </div>
          </div>
        )}

        {/* Search + filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
            <input
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder='Search news…'
              className="form-input pl-11"
            />
          </div>
          {allFiltered.length > 0 && (
            <p className="text-sm text-muted self-center flex-shrink-0">
              {allFiltered.length} {allFiltered.length === 1 ? 'post' : 'posts'}
            </p>
          )}
        </div>

        <FilterBar options={catOptions} value={catFilter} onChange={handleCatChange} className="mb-8" />

        {isLoading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2"><CardSkeleton /></div>
              <CardSkeleton />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3].map((i) => <CardSkeleton key={i} />)}
            </div>
          </div>
        ) : !paginated.length ? (
          <EmptyState icon="📰" title="No posts found" description="Try a different search or category." />
        ) : (
          <>
            {/* ── Magazine layout (page 1 only, no active search) ── */}
            {heroPost && (
              <div className="mb-8">
                {/* Hero post — large horizontal card */}
                <div
                  className="card card-hover overflow-hidden mb-6 flex flex-col lg:flex-row"
                  onClick={() => navigate(`/news/${heroPost.id}`)}
                >
                  <div className={cn(
                    'lg:w-64 h-48 lg:h-auto flex items-center justify-center text-7xl flex-shrink-0',
                    heroPost.category === 'announcement' ? 'bg-gold-50' :
                    heroPost.category === 'academic_update' ? 'bg-green-50' :
                    heroPost.category === 'welfare_update' ? 'bg-green-50' : 'bg-cream-dark'
                  )}>
                    {heroPost.banner_emoji ?? '📰'}
                  </div>
                  <div className="p-6 lg:p-8 flex flex-col justify-center flex-1">
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge variant="green">{NEWS_CATEGORY_LABELS[heroPost.category]}</Badge>
                      {heroPost.is_urgent && <Badge variant="red">🔴 Urgent</Badge>}
                    </div>
                    <h2 className="font-display text-2xl lg:text-3xl font-bold text-[#1B3D22] mb-3 leading-snug">
                      {heroPost.title}
                    </h2>
                    <p className="text-muted text-sm leading-relaxed line-clamp-3 mb-4">{heroPost.summary}</p>
                    <div className="flex items-center justify-between">
                      {heroPost.published_at && (
                        <span className="text-xs text-muted">{formatDate(heroPost.published_at)}</span>
                      )}
                      <span className="text-sm font-700 text-green-700">Read More →</span>
                    </div>
                  </div>
                </div>

                {/* Two secondary posts side by side */}
                {secondaryPosts.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {secondaryPosts.map((p) => (
                      <div
                        key={p.id}
                        className="card card-hover overflow-hidden flex gap-4 p-5"
                        onClick={() => navigate(`/news/${p.id}`)}
                      >
                        <div className={cn(
                          'w-16 h-16 rounded-xl flex items-center justify-center text-3xl flex-shrink-0',
                          p.category === 'announcement' ? 'bg-gold-50' :
                          p.category === 'academic_update' ? 'bg-green-50' : 'bg-cream-dark'
                        )}>
                          {p.banner_emoji ?? '📰'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex gap-1.5 mb-1.5 flex-wrap">
                            <Badge variant="green">{NEWS_CATEGORY_LABELS[p.category]}</Badge>
                            {p.is_urgent && <Badge variant="red">Urgent</Badge>}
                          </div>
                          <h3 className="font-body font-700 text-deep text-sm leading-snug line-clamp-2 mb-1">
                            {p.title}
                          </h3>
                          {p.published_at && (
                            <p className="text-xs text-muted">{formatDate(p.published_at)}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Standard card grid for remaining posts */}
            {gridPosts.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gridPosts.map((p) => (
                  <NewsCard key={p.id} post={p} onClick={() => navigate(`/news/${p.id}`)} />
                ))}
              </div>
            )}

            {/* ── Pagination ── */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <button
                  onClick={() => { setPage((p) => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                  disabled={safePage === 1}
                  className="px-4 py-2 rounded-xl text-sm font-600 border border-cream-dark bg-white text-muted hover:border-green-300 hover:text-green-700 disabled:opacity-40 disabled:pointer-events-none transition-all"
                >
                  ← Prev
                </button>

                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => {
                    const isEllipsis = totalPages > 7 && Math.abs(n - safePage) > 2 && n !== 1 && n !== totalPages
                    if (isEllipsis && (n === safePage - 3 || n === safePage + 3)) {
                      return <span key={n} className="px-2 py-2 text-muted text-sm">…</span>
                    }
                    if (isEllipsis) return null
                    return (
                      <button
                        key={n}
                        onClick={() => { setPage(n); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                        className={cn(
                          'w-9 h-9 rounded-xl text-sm font-600 transition-all',
                          n === safePage
                            ? 'bg-green-700 text-white shadow-card'
                            : 'border border-cream-dark bg-white text-muted hover:border-green-300 hover:text-green-700'
                        )}
                      >
                        {n}
                      </button>
                    )
                  })}
                </div>

                <button
                  onClick={() => { setPage((p) => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                  disabled={safePage === totalPages}
                  className="px-4 py-2 rounded-xl text-sm font-600 border border-cream-dark bg-white text-muted hover:border-green-300 hover:text-green-700 disabled:opacity-40 disabled:pointer-events-none transition-all"
                >
                  Next →
                </button>
              </div>
            )}

            {/* Page info */}
            {totalPages > 1 && (
              <p className="text-center text-xs text-muted mt-3">
                Page {safePage} of {totalPages} · {allFiltered.length} posts
              </p>
            )}
          </>
        )}
      </div>
    </>
  )
}

// ── News detail ───────────────────────────────────────────────────────────────

export function NewsDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: post, isLoading } = useQuery({
    queryKey: ['news', id],
    queryFn: () => newsApi.getById(id!),
    enabled: !!id,
  })

  // Related posts — same category, exclude current
  const { data: related } = useQuery({
    queryKey: ['news', 'related', post?.category],
    queryFn: () => newsApi.list({ category: post!.category, limit: 4 }),
    enabled: !!post?.category,
  })
  const relatedPosts = (related?.items ?? []).filter((p) => p.id !== id).slice(0, 3)

  const NEWS_BG: Record<string, string> = {
    announcement:    'bg-gold-50',
    academic_update: 'bg-green-50',
    welfare_update:  'bg-green-50',
    events_recap:    'bg-cream-dark',
    opportunities:   'bg-gold-50',
    general:         'bg-cream-dark',
  }

  if (isLoading) return (
    <div className="section-container py-20 max-w-3xl">
      <Skeleton className="h-6 w-32 mb-8 rounded-xl" />
      <Skeleton className="h-48 rounded-3xl mb-8" />
      <Skeleton className="h-10 w-3/4 mb-3 rounded-xl" />
      <Skeleton className="h-4 w-40 mb-8 rounded-xl" />
      <div className="space-y-3">
        {[1,2,3,4,5].map((i) => <Skeleton key={i} className="h-4 rounded" />)}
      </div>
    </div>
  )

  if (!post) return (
    <EmptyState icon="📰" title="Post not found"
      action={<Button variant="primary" onClick={() => navigate('/news')}>Back to News</Button>} />
  )

  return (
    <div className="section-container py-12">
      <div className="max-w-3xl mx-auto">

        {/* Back */}
        <button
          onClick={() => navigate('/news')}
          className="text-green-700 hover:text-green-600 text-sm mb-8 flex items-center gap-1.5 font-500 transition-colors"
        >
          ← Back to News
        </button>

        {/* Banner */}
        <div className={cn('h-56 rounded-3xl flex items-center justify-center text-9xl mb-8', NEWS_BG[post.category] ?? 'bg-cream-dark')}>
          {post.banner_emoji ?? '📰'}
        </div>

        {/* Meta */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="green">{NEWS_CATEGORY_LABELS[post.category]}</Badge>
          {post.is_urgent && <Badge variant="red">🔴 Urgent</Badge>}
        </div>

        <h1 className="font-display text-4xl lg:text-5xl font-bold text-green-700 mb-4 leading-tight">
          {post.title}
        </h1>

        {post.published_at && (
          <p className="text-sm text-muted mb-8 pb-8 border-b border-cream-dark">
            Published {formatDate(post.published_at)}
          </p>
        )}

        {/* Summary callout */}
        {post.summary && (
          <div className="bg-green-50 border-l-4 border-green-500 rounded-r-xl p-5 mb-8">
            <p className="text-[#1B3D22] text-base leading-relaxed font-500">{post.summary}</p>
          </div>
        )}

        {/* Body */}
        <div className="text-muted leading-relaxed whitespace-pre-wrap font-body text-base space-y-4">
          {post.body}
        </div>

        {/* Share / action row */}
        <div className="mt-12 pt-8 border-t border-cream-dark flex items-center justify-between flex-wrap gap-4">
          <button
            onClick={() => navigate('/news')}
            className="text-green-700 hover:text-green-600 text-sm font-600 flex items-center gap-1.5 transition-colors"
          >
            ← All News
          </button>
          {post.is_urgent && (
            <div className="flex items-center gap-2 text-sm text-red-600 font-600">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              Urgent notice
            </div>
          )}
        </div>
      </div>

      {/* Related posts */}
      {relatedPosts.length > 0 && (
        <div className="mt-16 pt-12 border-t border-cream-dark">
          <div className="max-w-3xl mx-auto mb-6">
            <h2 className="font-display text-2xl font-bold text-green-700">More in {NEWS_CATEGORY_LABELS[post.category]}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {relatedPosts.map((p) => (
              <NewsCard key={p.id} post={p} onClick={() => navigate(`/news/${p.id}`)} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Notifications ─────────────────────────────────────────────────────────────

export function NotificationsPage() {
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [unreadOnly, setUnreadOnly] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['notifications', { unreadOnly }],
    queryFn: () => notificationsApi.list({ unread_only: unreadOnly, limit: 50 }),
    enabled: isAuthenticated,
  })

  const markAllRead = useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const markRead = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })

  if (!isAuthenticated) {
    return (
      <div className="section-container py-20 text-center">
        <EmptyState icon="🔔" title="Sign in to view notifications"
          action={<Button variant="primary" onClick={() => navigate('/login')}>Sign In</Button>} />
      </div>
    )
  }

  const unreadCount = data?.total ?? 0

  return (
    <div className="section-container py-12 max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-green-700">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-muted mt-1">{unreadCount} unread</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setUnreadOnly((o) => !o)}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-500 border transition-all',
              unreadOnly
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-white border-cream-dark text-muted'
            )}
          >
            {unreadOnly ? <Bell className="h-3.5 w-3.5" /> : <BellOff className="h-3.5 w-3.5" />}
            {unreadOnly ? 'Unread only' : 'All'}
          </button>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={() => markAllRead.mutate()}>
              Mark all read
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3,4].map((i) => <Skeleton key={i} className="h-20" />)}</div>
      ) : !data?.items.length ? (
        <EmptyState icon="🔔" title="No notifications" description="You're all caught up!" />
      ) : (
        <div className="space-y-2">
          {data.items.map((n) => (
            <div
              key={n.id}
              onClick={() => { if (!n.is_read) markRead.mutate(n.id); if (n.link) navigate(n.link) }}
              className={cn(
                'card p-5 cursor-pointer hover:shadow-card-md transition-all flex gap-4',
                !n.is_read && 'bg-green-50 border-green-200'
              )}
            >
              <div className="w-2 h-2 rounded-full bg-green-700 flex-shrink-0 mt-2 opacity-0 transition-opacity"
                style={{ opacity: n.is_read ? 0 : 1 }} />
              <div className="flex-1">
                <p className={cn('text-sm font-600 text-[#1B3D22]', !n.is_read && 'font-700')}>{n.title}</p>
                <p className="text-sm text-muted mt-0.5">{n.body}</p>
                <p className="text-xs text-muted opacity-60 mt-1.5">{relativeTime(n.created_at)}</p>
              </div>
              {n.link && <ChevronRight className="h-4 w-4 text-muted flex-shrink-0 mt-1" />}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
// ── About Page ────────────────────────────────────────────────────────────────

// Renamed to avoid collision with the detailed AboutPage imported above.
function OtherAboutPage() {
  return (
    <>
      <PageHeader
        title="About GPSA-UDS"
        subtitle="Who we are, what we stand for, and the community we are building."
      />

      <div className="section-container section-padding">

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-14">
          <div
            className="rounded-3xl p-8 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #3CB559 0%, #52C96E 50%, #7DD98A 100%)' }}
          >
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at 80% 20%, rgba(242,193,46,0.18) 0%, transparent 60%)' }} />
            <div className="relative">
              <span className="text-4xl mb-4 block">🎯</span>
              <h3 className="font-display text-2xl font-bold text-white mb-3">Our Mission</h3>
              <p className="text-white/75 text-sm leading-relaxed">
                To promote the academic, social, and professional development of pharmacy students at the
                University for Development Studies, while advocating for their welfare and rights.
              </p>
            </div>
          </div>

          <div className="card p-8">
            <span className="text-4xl mb-4 block">🔭</span>
            <h3 className="font-display text-2xl font-bold text-green-700 mb-3">Our Vision</h3>
            <p className="text-muted text-sm leading-relaxed">
              To be the leading pharmacy students' association in Ghana — known for excellence,
              unity, and impactful community service that shapes the future of pharmaceutical practice.
            </p>
          </div>
        </div>

        {/* What we do */}
        <div className="mb-14">
          <h2 className="section-title mb-2">What We Do</h2>
          <div className="divider mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { emoji: '📚', title: 'Academics', desc: 'We provide study resources, past questions, lecture notes, and academic support to help students excel in their studies.' },
              { emoji: '❤️', title: 'Welfare', desc: 'Our GPSA-UDS Welfare team ensures every student has access to support — whether academic, financial, health-related, or personal.' },
              { emoji: '💼', title: 'Opportunities', desc: 'We connect pharmacy students with internships, scholarships, research programmes, and career development resources.' },
            ].map(({ emoji, title, desc }) => (
              <div key={title} className="card p-7">
                <span className="text-4xl mb-4 block">{emoji}</span>
                <h3 className="font-body font-700 text-[#1B3D22] text-lg mb-2">{title}</h3>
                <p className="text-sm text-muted leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Executives placeholder */}
        <div className="mb-14">
          <h2 className="section-title mb-2">The Executive Team</h2>
          <div className="divider mb-8" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { role: 'President',          name: 'Name Here' },
              { role: 'Vice President',     name: 'Name Here' },
              { role: 'Secretary',          name: 'Name Here' },
              { role: 'Financial Secretary',name: 'Name Here' },
            ].map(({ role, name }) => (
              <div key={role} className="card p-6 text-center">
                <div
                  className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl"
                  style={{ background: 'linear-gradient(135deg, #3CB559, #7DD98A)' }}
                >
                  👤
                </div>
                <p className="font-body font-700 text-[#1B3D22] text-sm">{name}</p>
                <p className="text-xs text-muted mt-1">{role}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted text-center mt-4">
            Update names and photos in <code className="font-mono bg-cream-dark px-1 rounded">other-pages.tsx</code> → AboutPage.
          </p>
        </div>

        {/* Reach out */}
        <div className="max-w-2xl mx-auto text-center">
          <div className="card p-10">
            <span className="text-4xl mb-5 block">📬</span>
            <h3 className="font-display text-2xl font-bold text-green-700 mb-3">Get in Touch</h3>
            <p className="text-muted text-sm mb-6">
              Have questions or want to get involved? Reach out to the GPSA-UDS executive team
              through any of our social media platforms or via the welfare portal.
            </p>
            <div className="flex flex-wrap justify-center gap-3 text-sm font-600">
              {[
                { label: 'WhatsApp',  emoji: '💬', color: 'bg-green-50 text-green-700 border-green-200' },
                { label: 'Instagram', emoji: '📸', color: 'bg-gold-50 text-gold-700 border-gold-200' },
                { label: 'LinkedIn',  emoji: '💼', color: 'bg-green-50 text-green-700 border-green-200' },
              ].map(({ label, emoji, color }) => (
                <span key={label} className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border ${color}`}>
                  {emoji} {label}
                </span>
              ))}
            </div>
          </div>
        </div>

      </div>
    </>
  )
}

// ── Gallery Page ──────────────────────────────────────────────────────────────

const GALLERY_ITEMS = [
  { id: 1,  emoji: '🎓', label: 'Graduation Ceremony 2024',   category: 'events' },
  { id: 2,  emoji: '🏥', label: 'Health Week 2024',           category: 'health' },
  { id: 3,  emoji: '📚', label: 'Academic Symposium',         category: 'academic' },
  { id: 4,  emoji: '🤝', label: 'Community Outreach',         category: 'outreach' },
  { id: 5,  emoji: '🎤', label: 'Public Speaking Contest',    category: 'events' },
  { id: 6,  emoji: '🌿', label: 'Field Trip – Herbarium',     category: 'academic' },
  { id: 7,  emoji: '⚽', label: 'Inter-Level Sports Day',     category: 'social' },
  { id: 8,  emoji: '🍽️', label: 'End-of-Year Dinner',        category: 'social' },
  { id: 9,  emoji: '🔬', label: 'Lab Skills Workshop',        category: 'academic' },
  { id: 10, emoji: '📣', label: 'GPSA Induction Ceremony',    category: 'events' },
  { id: 11, emoji: '💊', label: 'Drug Awareness Campaign',    category: 'health' },
  { id: 12, emoji: '🤲', label: 'Blood Donation Drive',       category: 'outreach' },
]

const GALLERY_BG: Record<string, string> = {
  events:   'bg-green-50',
  health:   'bg-gold-50',
  academic: 'bg-cream-dark',
  outreach: 'bg-green-50',
  social:   'bg-gold-50',
}

const GALLERY_CATEGORIES = [
  { value: 'all',      label: 'All' },
  { value: 'events',   label: 'Events' },
  { value: 'academic', label: 'Academic' },
  { value: 'health',   label: 'Health' },
  { value: 'outreach', label: 'Outreach' },
  { value: 'social',   label: 'Social' },
]

// Renamed to avoid collision with the detailed GalleryPage imported above.
function OtherGalleryPage() {
  const [filter, setFilter] = useState<string>('all')
  const [lightbox, setLightbox] = useState<typeof GALLERY_ITEMS[number] | null>(null)

  const filtered = filter === 'all' ? GALLERY_ITEMS : GALLERY_ITEMS.filter((g) => g.category === filter)

  return (
    <>
      <PageHeader title="Gallery" subtitle="Moments, memories, and milestones from the GPSA-UDS community." />

      <div className="section-container section-padding">

        {/* Filter bar */}
        <div className="flex flex-wrap gap-2 mb-8">
          {GALLERY_CATEGORIES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={[
                'px-4 py-2 rounded-xl text-sm font-600 font-body border transition-all duration-150',
                filter === value
                  ? 'bg-green-700 text-white border-green-700 shadow-card'
                  : 'bg-white text-muted border-cream-dark hover:border-green-300 hover:text-green-700',
              ].join(' ')}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => setLightbox(item)}
              className={[
                GALLERY_BG[item.category] ?? 'bg-cream-dark',
                'rounded-2xl h-44 flex flex-col items-center justify-center gap-2 cursor-pointer',
                'hover:shadow-card-md hover:-translate-y-1 transition-all group border border-cream-dark',
              ].join(' ')}
            >
              <span className="text-5xl group-hover:scale-110 transition-transform">{item.emoji}</span>
              <p className="text-xs font-700 text-green-700 text-center px-3 line-clamp-2">{item.label}</p>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-muted mt-8">
          Replace emoji placeholders with real photos by updating <code className="font-mono bg-cream-dark px-1 rounded">GALLERY_ITEMS</code> in <code className="font-mono bg-cream-dark px-1 rounded">other-pages.tsx</code>.
        </p>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          onClick={() => setLightbox(null)}
        >
          <div
            className={['rounded-3xl p-12 flex flex-col items-center gap-4 max-w-sm w-full', GALLERY_BG[lightbox.category] ?? 'bg-white'].join(' ')}
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-8xl">{lightbox.emoji}</span>
            <p className="font-display text-xl font-bold text-green-700 text-center">{lightbox.label}</p>
            <button
              onClick={() => setLightbox(null)}
              className="mt-2 text-sm text-muted hover:text-green-700 font-600 transition-colors"
            >
              Close ✕
            </button>
          </div>
        </div>
      )}
    </>
  )
}

// ── Export detailed pages ───────────────────────────────────────────────────
// Re-export the detailed implementations imported at the top so that
// consumers of this module get the full-featured pages rather than the
// simplified placeholders. The placeholders remain defined above for
// reference but are not exported.
export { DetailedAboutPage as AboutPage, DetailedGalleryPage as GalleryPage }