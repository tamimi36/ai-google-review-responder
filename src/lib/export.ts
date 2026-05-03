import type { GeneratedReply } from '../types/review'

export function downloadCsv(replies: GeneratedReply[]) {
  const rows = [
    ['created_at', 'reviewer', 'rating', 'sentiment', 'urgency', 'reply'],
    ...replies.map((reply) => [
      reply.createdAt,
      reply.review.reviewerName,
      String(reply.review.rating),
      reply.sentiment,
      reply.urgency,
      reply.publicReply.replace(/\n/g, ' '),
    ]),
  ]
  const csv = rows
    .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','))
    .join('\n')
  downloadBlob(csv, 'review-replies.csv', 'text/csv;charset=utf-8')
}

export function downloadJson(replies: GeneratedReply[]) {
  downloadBlob(JSON.stringify(replies, null, 2), 'review-replies.json', 'application/json')
}

function downloadBlob(content: string, filename: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
