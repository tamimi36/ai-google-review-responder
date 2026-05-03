export type Sentiment = 'positive' | 'neutral' | 'negative' | 'mixed'
export type Urgency = 'low' | 'medium' | 'high'
export type ReplyMode = 'demo' | 'gemini'

export interface BrandProfile {
  businessName: string
  industry: string
  brandVoice: string
  values: string
  contactPath: string
  signOff: string
  bannedPhrases: string
  defaultLanguage: string
}

export interface ReviewInput {
  reviewerName: string
  rating: number
  reviewText: string
  language: string
  extraContext: string
}

export interface ReplyDraft {
  sentiment: Sentiment
  urgency: Urgency
  topics: string[]
  publicReply: string
  shortReply: string
  recoveryReply: string
  privateFollowUp: string
  safetyNotes: string[]
}

export interface GeneratedReply extends ReplyDraft {
  id: string
  sourceMode: ReplyMode
  createdAt: string
  review: ReviewInput
  qualityScore: number
  warnings: string[]
}

export interface AppSettings {
  apiKey: string
  model: string
  demoMode: boolean
}
