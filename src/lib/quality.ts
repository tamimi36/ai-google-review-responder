import type { BrandProfile, ReplyDraft, ReviewInput } from '../types/review'

const riskyTerms = ['guarantee', 'free', 'discount', 'lawsuit', 'fault', 'liar']

export function scoreReply(reply: ReplyDraft, profile: BrandProfile, review: ReviewInput) {
  const warnings: string[] = []
  const text = reply.publicReply.trim()
  const lower = text.toLowerCase()
  const banned = profile.bannedPhrases
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)

  if (text.length > 700) warnings.push('Public reply is long for Google. Consider the short version.')
  if (review.rating <= 2 && !/(contact|message|call|email|reach)/i.test(text)) {
    warnings.push('Negative review has no clear recovery path.')
  }
  if (riskyTerms.some((term) => lower.includes(term))) {
    warnings.push('Reply may include incentive, blame, or legal-risk language.')
  }
  if (banned.some((phrase) => lower.includes(phrase))) {
    warnings.push('Reply includes one of the brand banned phrases.')
  }
  if (/(medical record|diagnosis|credit card|address|phone number)/i.test(text)) {
    warnings.push('Reply may expose private customer details.')
  }

  const qualityScore = Math.max(68, 100 - warnings.length * 9 - Math.max(0, text.length - 520) / 30)

  return {
    qualityScore: Math.round(qualityScore),
    warnings,
  }
}
