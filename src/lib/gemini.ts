import { GoogleGenAI, Type } from '@google/genai'
import type { BrandProfile, ReplyDraft, ReviewInput } from '../types/review'

const schema = {
  type: Type.OBJECT,
  properties: {
    sentiment: { type: Type.STRING, enum: ['positive', 'neutral', 'negative', 'mixed'] },
    urgency: { type: Type.STRING, enum: ['low', 'medium', 'high'] },
    topics: { type: Type.ARRAY, items: { type: Type.STRING } },
    publicReply: { type: Type.STRING },
    shortReply: { type: Type.STRING },
    recoveryReply: { type: Type.STRING },
    privateFollowUp: { type: Type.STRING },
    safetyNotes: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: [
    'sentiment',
    'urgency',
    'topics',
    'publicReply',
    'shortReply',
    'recoveryReply',
    'privateFollowUp',
    'safetyNotes',
  ],
}

export async function generateWithGemini(params: {
  apiKey: string
  model: string
  profile: BrandProfile
  review: ReviewInput
}): Promise<ReplyDraft> {
  const { apiKey, model, profile, review } = params

  if (!apiKey.trim()) {
    throw new Error('Add a Gemini API key or enable demo mode.')
  }

  const ai = new GoogleGenAI({ apiKey: apiKey.trim() })
  const response = await ai.models.generateContent({
    model,
    contents: buildPrompt(profile, review),
    config: {
      responseMimeType: 'application/json',
      responseSchema: schema,
      temperature: 0.45,
    },
  })

  const raw = response.text
  if (!raw) throw new Error('Gemini returned an empty response.')

  return JSON.parse(raw) as ReplyDraft
}

function buildPrompt(profile: BrandProfile, review: ReviewInput) {
  return `
You are a reputation manager writing Google Business Profile review replies.

Business profile:
- Name: ${profile.businessName}
- Industry: ${profile.industry}
- Brand voice: ${profile.brandVoice}
- Values: ${profile.values}
- Preferred contact path: ${profile.contactPath}
- Sign-off: ${profile.signOff}
- Banned phrases: ${profile.bannedPhrases}
- Default language: ${profile.defaultLanguage}

Review:
- Reviewer name: ${review.reviewerName || 'Unknown'}
- Rating: ${review.rating}/5
- Language for reply: ${review.language || profile.defaultLanguage}
- Review text: ${review.reviewText}
- Internal context, if any: ${review.extraContext || 'None'}

Return only valid JSON matching the schema.
Rules:
- Public reply must be professional, specific, concise, and on-brand.
- Never reveal private details, internal staffing issues, medical/financial data, or blame third parties.
- Never offer discounts, incentives, or ask the reviewer to remove or change a review.
- For 1-2 star reviews, acknowledge the issue, avoid defensiveness, and include the preferred contact path.
- For 4-5 star reviews, be grateful and specific without sounding generic.
- shortReply must be under 320 characters when possible.
- recoveryReply is required for negative or mixed reviews; otherwise return an empty string.
`
}
