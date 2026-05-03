import type { BrandProfile, ReplyDraft, ReviewInput } from '../types/review'

export function createDemoReply(profile: BrandProfile, review: ReviewInput): ReplyDraft {
  const isNegative = review.rating <= 2
  const isPositive = review.rating >= 4
  const name = review.reviewerName || 'there'
  const topic = review.reviewText.toLowerCase().includes('wait') ? 'wait time' : 'service experience'

  if (isPositive) {
    return {
      sentiment: 'positive',
      urgency: 'low',
      topics: ['staff', 'experience', 'speed'],
      publicReply: `Thank you, ${name}. We are glad the experience reflected the standard ${profile.businessName} works toward every day. We will share your kind words with the team and hope to welcome you back soon.\n\n${profile.signOff}`,
      shortReply: `Thank you, ${name}. We are glad you had a smooth experience with ${profile.businessName} and hope to welcome you back soon.\n\n${profile.signOff}`,
      recoveryReply: '',
      privateFollowUp: 'No private follow-up needed unless the guest asks a question.',
      safetyNotes: ['Positive, concise, and avoids incentives.'],
    }
  }

  return {
    sentiment: isNegative ? 'negative' : 'mixed',
    urgency: isNegative ? 'high' : 'medium',
    topics: [topic, 'communication', 'guest recovery'],
    publicReply: `Thank you for telling us about this, ${name}. We are glad part of the experience worked, but the delay and lack of check-in were not the level of care we aim to provide at ${profile.businessName}. We have shared this with our team so we can tighten the handoff during busy periods. ${profile.contactPath}\n\n${profile.signOff}`,
    shortReply: `Thank you for the honest feedback, ${name}. The wait and missed check-in were not the experience we want for our guests. ${profile.contactPath}\n\n${profile.signOff}`,
    recoveryReply: `${name}, thank you for bringing this to our attention. We take this seriously and would like to understand what happened so we can address it properly. ${profile.contactPath}`,
    privateFollowUp:
      'Ask for the visit date/time, acknowledge the frustration, and offer to route the issue to the manager. Do not ask the guest to remove the review.',
    safetyNotes: ['Acknowledges the issue without arguing.', 'Avoids blaming staff or third parties.', 'Includes a recovery path.'],
  }
}
