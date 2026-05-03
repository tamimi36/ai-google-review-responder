import type { AppSettings, BrandProfile, ReviewInput } from '../types/review'

export const defaultProfile: BrandProfile = {
  businessName: 'Cedar Table',
  industry: 'restaurant',
  brandVoice: 'Warm, accountable, concise, polished, never defensive',
  values: 'Hospitality, freshness, fast service, respect for every guest',
  contactPath: 'Please contact our manager through Google messages so we can make this right.',
  signOff: 'The Cedar Table team',
  bannedPhrases: 'sorry you feel that way, obviously, discount, free meal, as you know',
  defaultLanguage: 'English',
}

export const defaultReview: ReviewInput = {
  reviewerName: 'Maya',
  rating: 2,
  reviewText:
    'The food was good but our table waited almost 40 minutes and nobody checked on us. I expected better.',
  language: 'English',
  extraContext: 'Saturday dinner service was short-staffed.',
}

export const defaultSettings: AppSettings = {
  apiKey: '',
  model: 'gemini-2.5-flash',
  demoMode: true,
}

export const sampleReviews = [
  {
    reviewerName: 'Omar',
    rating: 5,
    reviewText: 'Amazing staff and the room was spotless. Check-in took less than two minutes.',
    language: 'English',
    extraContext: '',
  },
  {
    reviewerName: 'Lina',
    rating: 3,
    reviewText: 'The dentist was kind, but I waited a long time after my appointment time.',
    language: 'English',
    extraContext: 'Clinic had an emergency case that morning.',
  },
  {
    reviewerName: 'Sam',
    rating: 1,
    reviewText: 'Nobody answered the phone and my order arrived cold. Very disappointed.',
    language: 'English',
    extraContext: 'Delivery partner delay. Do not mention partner by name.',
  },
]
