import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  Clipboard,
  ClipboardList,
  Copy,
  Download,
  FileJson,
  FileSpreadsheet,
  History,
  KeyRound,
  Loader2,
  RotateCcw,
  Save,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  Wand2,
} from 'lucide-react'
import './App.css'
import { createDemoReply } from './lib/demoData'
import { defaultProfile, defaultReview, defaultSettings, sampleReviews } from './lib/defaults'
import { downloadCsv, downloadJson } from './lib/export'
import { generateWithGemini } from './lib/gemini'
import { scoreReply } from './lib/quality'
import { loadStored, saveStored } from './lib/storage'
import type { AppSettings, BrandProfile, GeneratedReply, ReplyDraft, ReviewInput } from './types/review'

const profileKey = 'review-responder-profile'
const settingsKey = 'review-responder-settings'
const historyKey = 'review-responder-history'

function App() {
  const [profile, setProfile] = useState(() => loadStored(profileKey, defaultProfile))
  const [settings, setSettings] = useState(() => loadStored(settingsKey, defaultSettings))
  const [review, setReview] = useState<ReviewInput>(() => defaultReview)
  const [history, setHistory] = useState<GeneratedReply[]>(() => loadStored(historyKey, []))
  const [activeReply, setActiveReply] = useState<GeneratedReply | null>(history[0] ?? null)
  const [batchText, setBatchText] = useState(sampleReviews.map(formatBatchLine).join('\n'))
  const [tab, setTab] = useState<'single' | 'batch'>('single')
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')
  const [copiedId, setCopiedId] = useState('')

  useEffect(() => saveStored(profileKey, profile), [profile])
  useEffect(() => saveStored(settingsKey, settings), [settings])
  useEffect(() => saveStored(historyKey, history.slice(0, 50)), [history])

  const batchCount = useMemo(() => parseBatch(batchText, profile.defaultLanguage).length, [batchText, profile.defaultLanguage])
  const hasApiKey = Boolean(settings.apiKey.trim())

  async function handleGenerate() {
    if (!review.reviewText.trim()) {
      setError('Paste a review first.')
      return
    }

    setIsGenerating(true)
    setError('')

    try {
      const generated = await createGeneratedReply(review)
      pushReply(generated)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not generate a reply.')
    } finally {
      setIsGenerating(false)
    }
  }

  async function handleBatchGenerate() {
    const reviews = parseBatch(batchText, profile.defaultLanguage)
    if (!reviews.length) {
      setError('Add at least one batch review.')
      return
    }

    setIsGenerating(true)
    setError('')

    try {
      const generated: GeneratedReply[] = []
      for (const item of reviews) {
        generated.push(await createGeneratedReply(item))
      }
      setHistory((current) => [...generated, ...current].slice(0, 50))
      setActiveReply(generated[0])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not generate batch replies.')
    } finally {
      setIsGenerating(false)
    }
  }

  async function createGeneratedReply(item: ReviewInput): Promise<GeneratedReply> {
    const draft: ReplyDraft =
      settings.demoMode || !hasApiKey
        ? createDemoReply(profile, item)
        : await generateWithGemini({
            apiKey: settings.apiKey,
            model: settings.model,
            profile,
            review: item,
          })

    const quality = scoreReply(draft, profile, item)

    return {
      ...draft,
      ...quality,
      id: crypto.randomUUID(),
      sourceMode: settings.demoMode || !hasApiKey ? 'demo' : 'gemini',
      createdAt: new Date().toISOString(),
      review: item,
    }
  }

  function pushReply(generated: GeneratedReply) {
    setActiveReply(generated)
    setHistory((current) => [generated, ...current].slice(0, 50))
  }

  async function copyText(text: string, id: string) {
    await navigator.clipboard.writeText(text)
    setCopiedId(id)
    window.setTimeout(() => setCopiedId(''), 1400)
  }

  function updateProfile<K extends keyof BrandProfile>(key: K, value: BrandProfile[K]) {
    setProfile((current) => ({ ...current, [key]: value }))
  }

  function updateSettings<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
    setSettings((current) => ({ ...current, [key]: value }))
  }

  function updateReview<K extends keyof ReviewInput>(key: K, value: ReviewInput[K]) {
    setReview((current) => ({ ...current, [key]: value }))
  }

  return (
    <main className="min-h-screen bg-[#f6f3ee] text-[#17211c]">
      <header className="border-b border-[#d8d3c8] bg-[#fcfaf6]/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#0e6b50] text-white">
                <Wand2 size={22} />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#b84c32]">ReviewReply Studio</p>
                <h1 className="text-2xl font-semibold text-[#17211c] sm:text-3xl">AI Google Review Responder</h1>
              </div>
            </div>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[#5f665f] sm:text-base">
              Paste reviews in, get professional on-brand replies out. Built for restaurants, clinics, hotels, and local
              service teams that need consistent reputation management without a PR hire.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <StatusPill label={settings.demoMode || !hasApiKey ? 'Demo mode' : 'Gemini live'} tone={settings.demoMode || !hasApiKey ? 'amber' : 'green'} />
            <button
              className="inline-flex items-center gap-2 rounded-lg border border-[#c7c0b4] bg-white px-4 py-2 text-sm font-semibold text-[#26302a] shadow-sm transition hover:border-[#0e6b50]"
              onClick={() => setIsSettingsOpen(true)}
              type="button"
            >
              <Settings size={17} />
              Settings
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[330px_minmax(0,1fr)_360px] lg:px-8">
        <aside className="space-y-5">
          <Panel title="Brand Voice" icon={<ShieldCheck size={18} />}>
            <div className="space-y-3">
              <TextField label="Business" value={profile.businessName} onChange={(value) => updateProfile('businessName', value)} />
              <TextField label="Industry" value={profile.industry} onChange={(value) => updateProfile('industry', value)} />
              <TextArea label="Voice" rows={3} value={profile.brandVoice} onChange={(value) => updateProfile('brandVoice', value)} />
              <TextArea label="Values" rows={3} value={profile.values} onChange={(value) => updateProfile('values', value)} />
              <TextArea label="Recovery path" rows={3} value={profile.contactPath} onChange={(value) => updateProfile('contactPath', value)} />
              <TextField label="Sign-off" value={profile.signOff} onChange={(value) => updateProfile('signOff', value)} />
              <TextField label="Default language" value={profile.defaultLanguage} onChange={(value) => updateProfile('defaultLanguage', value)} />
              <TextArea label="Banned phrases" rows={2} value={profile.bannedPhrases} onChange={(value) => updateProfile('bannedPhrases', value)} />
            </div>
          </Panel>

          <Panel title="Portfolio Edge" icon={<Sparkles size={18} />}>
            <div className="space-y-3 text-sm leading-6 text-[#4f5b55]">
              <FeatureLine>Brand memory saved locally</FeatureLine>
              <FeatureLine>Batch reply generation</FeatureLine>
              <FeatureLine>Risk and quality checks</FeatureLine>
              <FeatureLine>Copy, CSV, and JSON export</FeatureLine>
            </div>
          </Panel>
        </aside>

        <section className="space-y-5">
          <div className="rounded-xl border border-[#d8d3c8] bg-white p-2 shadow-sm">
            <div className="grid grid-cols-2 gap-2">
              <button
                className={tab === 'single' ? activeTabClass : idleTabClass}
                onClick={() => setTab('single')}
                type="button"
              >
                <Clipboard size={17} />
                Single review
              </button>
              <button className={tab === 'batch' ? activeTabClass : idleTabClass} onClick={() => setTab('batch')} type="button">
                <ClipboardList size={17} />
                Batch mode
              </button>
            </div>
          </div>

          {tab === 'single' ? (
            <Panel title="Review Composer" icon={<Star size={18} />}>
              <div className="grid gap-4 md:grid-cols-[1fr_160px]">
                <TextField label="Reviewer name" value={review.reviewerName} onChange={(value) => updateReview('reviewerName', value)} />
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-[#687169]">Rating</span>
                  <select
                    className={inputClass}
                    value={review.rating}
                    onChange={(event) => updateReview('rating', Number(event.target.value))}
                  >
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <option key={rating} value={rating}>
                        {rating} stars
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-[1fr_220px]">
                <TextArea label="Google review" rows={7} value={review.reviewText} onChange={(value) => updateReview('reviewText', value)} />
                <div className="space-y-4">
                  <TextField label="Reply language" value={review.language} onChange={(value) => updateReview('language', value)} />
                  <TextArea label="Internal context" rows={4} value={review.extraContext} onChange={(value) => updateReview('extraContext', value)} />
                </div>
              </div>
              <ActionBar
                isGenerating={isGenerating}
                primaryLabel="Generate reply"
                onGenerate={handleGenerate}
                onReset={() => setReview(defaultReview)}
              />
            </Panel>
          ) : (
            <Panel title={`Batch Queue (${batchCount})`} icon={<ClipboardList size={18} />}>
              <p className="mb-3 text-sm leading-6 text-[#5f665f]">
                One review per line. Format: reviewer | rating | review text | optional context.
              </p>
              <TextArea label="Reviews" rows={12} value={batchText} onChange={setBatchText} />
              <ActionBar
                isGenerating={isGenerating}
                primaryLabel={`Generate ${batchCount || ''} replies`.trim()}
                onGenerate={handleBatchGenerate}
                onReset={() => setBatchText(sampleReviews.map(formatBatchLine).join('\n'))}
              />
            </Panel>
          )}

          {error ? (
            <div className="flex items-start gap-3 rounded-xl border border-[#e4b6a9] bg-[#fff5f1] p-4 text-sm text-[#8f311d]">
              <AlertTriangle className="mt-0.5 shrink-0" size={18} />
              <span>{error}</span>
            </div>
          ) : null}

          <ReplyPanel activeReply={activeReply} copiedId={copiedId} onCopy={copyText} />
        </section>

        <aside className="space-y-5">
          <Panel title="Reply History" icon={<History size={18} />}>
            <div className="mb-4 grid grid-cols-2 gap-2">
              <button className={secondaryButtonClass} disabled={!history.length} onClick={() => downloadCsv(history)} type="button">
                <FileSpreadsheet size={16} />
                CSV
              </button>
              <button className={secondaryButtonClass} disabled={!history.length} onClick={() => downloadJson(history)} type="button">
                <FileJson size={16} />
                JSON
              </button>
            </div>

            <div className="max-h-[680px] space-y-3 overflow-auto pr-1">
              {history.length ? (
                history.map((reply) => (
                  <button
                    className={`w-full rounded-lg border p-3 text-left transition ${
                      activeReply?.id === reply.id
                        ? 'border-[#0e6b50] bg-[#eef8f3]'
                        : 'border-[#ddd8ce] bg-[#fcfaf6] hover:border-[#9f9687]'
                    }`}
                    key={reply.id}
                    onClick={() => setActiveReply(reply)}
                    type="button"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-[#1d2b24]">{reply.review.reviewerName || 'Unnamed'}</span>
                      <span className="rounded-full bg-white px-2 py-1 text-xs font-semibold text-[#746a5e]">{reply.review.rating} stars</span>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm leading-5 text-[#5b645e]">{reply.review.reviewText}</p>
                    <div className="mt-3 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.1em] text-[#7a7369]">
                      <span>{reply.sentiment}</span>
                      <span>{reply.qualityScore}%</span>
                    </div>
                  </button>
                ))
              ) : (
                <EmptyState text="Generated replies will appear here." />
              )}
            </div>

            {history.length ? (
              <button
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#d8d3c8] px-3 py-2 text-sm font-semibold text-[#7c2f20] transition hover:border-[#b84c32] hover:bg-[#fff5f1]"
                onClick={() => {
                  setHistory([])
                  setActiveReply(null)
                }}
                type="button"
              >
                <Trash2 size={16} />
                Clear history
              </button>
            ) : null}
          </Panel>
        </aside>
      </section>

      {isSettingsOpen ? (
        <SettingsModal
          settings={settings}
          updateSettings={updateSettings}
          close={() => setIsSettingsOpen(false)}
        />
      ) : null}
    </main>
  )
}

function ReplyPanel(props: {
  activeReply: GeneratedReply | null
  copiedId: string
  onCopy: (text: string, id: string) => Promise<void>
}) {
  const { activeReply, copiedId, onCopy } = props

  return (
    <Panel title="Generated Reply" icon={<Sparkles size={18} />}>
      {activeReply ? (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-4">
            <Metric label="Sentiment" value={activeReply.sentiment} />
            <Metric label="Urgency" value={activeReply.urgency} />
            <Metric label="Quality" value={`${activeReply.qualityScore}%`} />
            <Metric label="Source" value={activeReply.sourceMode} />
          </div>

          <ReplyCard
            title="Public Google Reply"
            text={activeReply.publicReply}
            copied={copiedId === `${activeReply.id}:public`}
            onCopy={() => onCopy(activeReply.publicReply, `${activeReply.id}:public`)}
          />

          <div className="grid gap-4 lg:grid-cols-2">
            <ReplyCard
              title="Short Version"
              text={activeReply.shortReply}
              copied={copiedId === `${activeReply.id}:short`}
              onCopy={() => onCopy(activeReply.shortReply, `${activeReply.id}:short`)}
            />
            <ReplyCard
              title="Recovery Reply"
              text={activeReply.recoveryReply || 'No recovery reply needed for this review.'}
              copied={copiedId === `${activeReply.id}:recovery`}
              onCopy={() => onCopy(activeReply.recoveryReply || activeReply.shortReply, `${activeReply.id}:recovery`)}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <InsightBox title="Topics" items={activeReply.topics} />
            <InsightBox title="Safety Notes" items={[...activeReply.safetyNotes, ...activeReply.warnings]} />
          </div>

          <div className="rounded-lg border border-[#d8d3c8] bg-[#fcfaf6] p-4">
            <h3 className="text-sm font-semibold text-[#253129]">Private follow-up</h3>
            <p className="mt-2 text-sm leading-6 text-[#53605a]">{activeReply.privateFollowUp}</p>
          </div>
        </div>
      ) : (
        <EmptyState text="Generate a reply to see copy-ready output, safety notes, and quality checks." />
      )}
    </Panel>
  )
}

function SettingsModal(props: {
  settings: AppSettings
  updateSettings: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void
  close: () => void
}) {
  const { settings, updateSettings, close } = props

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#17211c]/40 p-4">
      <div className="w-full max-w-lg rounded-xl border border-[#d8d3c8] bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#0e6b50]">
              <KeyRound size={18} />
              <h2 className="text-lg font-semibold text-[#17211c]">Gemini Settings</h2>
            </div>
            <p className="mt-2 text-sm leading-6 text-[#5f665f]">
              The API key is stored only in this browser through localStorage. Use demo mode for portfolio walkthroughs.
            </p>
          </div>
          <button className="rounded-lg px-3 py-1 text-sm font-semibold text-[#6f675c] hover:bg-[#f2eee7]" onClick={close} type="button">
            Close
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <TextField label="Gemini API key" type="password" value={settings.apiKey} onChange={(value) => updateSettings('apiKey', value)} />
          <TextField label="Model" value={settings.model} onChange={(value) => updateSettings('model', value)} />
          <label className="flex items-center justify-between gap-4 rounded-lg border border-[#d8d3c8] bg-[#fcfaf6] p-3">
            <span>
              <span className="block text-sm font-semibold text-[#26302a]">Demo mode</span>
              <span className="text-sm text-[#66706a]">Generate realistic sample replies without calling Gemini.</span>
            </span>
            <input
              checked={settings.demoMode}
              className="h-5 w-5 accent-[#0e6b50]"
              onChange={(event) => updateSettings('demoMode', event.target.checked)}
              type="checkbox"
            />
          </label>
        </div>

        <button className={`${primaryButtonClass} mt-5 w-full`} onClick={close} type="button">
          <Save size={17} />
          Save settings
        </button>
      </div>
    </div>
  )
}

function ActionBar(props: {
  isGenerating: boolean
  primaryLabel: string
  onGenerate: () => void
  onReset: () => void
}) {
  return (
    <div className="mt-5 flex flex-col gap-3 sm:flex-row">
      <button className={`${primaryButtonClass} flex-1`} disabled={props.isGenerating} onClick={props.onGenerate} type="button">
        {props.isGenerating ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
        {props.isGenerating ? 'Generating...' : props.primaryLabel}
      </button>
      <button className={secondaryButtonClass} disabled={props.isGenerating} onClick={props.onReset} type="button">
        <RotateCcw size={17} />
        Reset sample
      </button>
    </div>
  )
}

function Panel(props: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[#d8d3c8] bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center gap-2 text-[#0e6b50]">
        {props.icon}
        <h2 className="text-base font-semibold text-[#17211c]">{props.title}</h2>
      </div>
      {props.children}
    </div>
  )
}

function TextField(props: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-[#687169]">{props.label}</span>
      <input
        className={inputClass}
        type={props.type ?? 'text'}
        value={props.value}
        onChange={(event) => props.onChange(event.target.value)}
      />
    </label>
  )
}

function TextArea(props: {
  label: string
  value: string
  rows: number
  onChange: (value: string) => void
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-[#687169]">{props.label}</span>
      <textarea className={inputClass} rows={props.rows} value={props.value} onChange={(event) => props.onChange(event.target.value)} />
    </label>
  )
}

function ReplyCard(props: { title: string; text: string; copied: boolean; onCopy: () => void }) {
  return (
    <div className="rounded-lg border border-[#d8d3c8] bg-[#fcfaf6] p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-[#253129]">{props.title}</h3>
        <button className={iconButtonClass} onClick={props.onCopy} title="Copy reply" type="button">
          {props.copied ? <CheckCircle2 size={17} /> : <Copy size={17} />}
        </button>
      </div>
      <p className="whitespace-pre-wrap text-sm leading-6 text-[#3f4b44]">{props.text}</p>
    </div>
  )
}

function InsightBox(props: { title: string; items: string[] }) {
  return (
    <div className="rounded-lg border border-[#d8d3c8] bg-white p-4">
      <h3 className="text-sm font-semibold text-[#253129]">{props.title}</h3>
      <div className="mt-3 space-y-2">
        {props.items.length ? (
          props.items.map((item) => <FeatureLine key={item}>{item}</FeatureLine>)
        ) : (
          <p className="text-sm text-[#6b746e]">No issues detected.</p>
        )}
      </div>
    </div>
  )
}

function Metric(props: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#d8d3c8] bg-[#fcfaf6] p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#758078]">{props.label}</p>
      <p className="mt-1 text-sm font-semibold capitalize text-[#1c2a23]">{props.value}</p>
    </div>
  )
}

function FeatureLine(props: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <CheckCircle2 className="mt-0.5 shrink-0 text-[#0e6b50]" size={16} />
      <span>{props.children}</span>
    </div>
  )
}

function EmptyState(props: { text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-[#cfc8bb] bg-[#fcfaf6] p-8 text-center">
      <Download className="mx-auto text-[#9b9284]" size={28} />
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#6b746e]">{props.text}</p>
    </div>
  )
}

function StatusPill(props: { label: string; tone: 'amber' | 'green' }) {
  const toneClass = props.tone === 'green' ? 'border-[#a8d6c3] bg-[#edf8f3] text-[#0d6a4f]' : 'border-[#ead2a4] bg-[#fff7e8] text-[#92650f]'
  return <span className={`rounded-full border px-3 py-1 text-sm font-semibold ${toneClass}`}>{props.label}</span>
}

function parseBatch(value: string, defaultLanguage: string): ReviewInput[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [reviewerName, rating, reviewText, extraContext = ''] = line.split('|').map((part) => part.trim())
      return {
        reviewerName: reviewerName || `Reviewer ${index + 1}`,
        rating: Math.min(5, Math.max(1, Number(rating) || 3)),
        reviewText: reviewText || line,
        language: defaultLanguage,
        extraContext,
      }
    })
    .filter((item) => item.reviewText.length > 3)
}

function formatBatchLine(review: ReviewInput) {
  return `${review.reviewerName} | ${review.rating} | ${review.reviewText} | ${review.extraContext}`
}

const inputClass =
  'w-full rounded-lg border border-[#cfc8bb] bg-white px-3 py-2 text-sm text-[#243029] outline-none transition placeholder:text-[#9c9589] focus:border-[#0e6b50] focus:ring-4 focus:ring-[#0e6b50]/10'
const primaryButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-lg bg-[#0e6b50] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0a5841] disabled:opacity-60'
const secondaryButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-lg border border-[#c7c0b4] bg-white px-4 py-2.5 text-sm font-semibold text-[#26302a] shadow-sm transition hover:border-[#0e6b50] disabled:opacity-50'
const iconButtonClass =
  'inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#cfc8bb] bg-white text-[#324038] transition hover:border-[#0e6b50] hover:text-[#0e6b50]'
const activeTabClass =
  'inline-flex items-center justify-center gap-2 rounded-lg bg-[#17211c] px-4 py-2.5 text-sm font-semibold text-white'
const idleTabClass =
  'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-[#4d574f] transition hover:bg-[#f3efe8]'

export default App
