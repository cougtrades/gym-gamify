import { getFeatureRequests } from '@/lib/feedback'
import { FeedbackClient } from './feedback-client'

export const dynamic = 'force-dynamic'

export default async function FeedbackPage() {
  const requests = await getFeatureRequests()

  return <FeedbackClient initialRequests={requests} />
}
