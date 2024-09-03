import { z } from '@botpress/sdk'
import * as bp from '.botpress'
type ValueOf<T> = T[keyof T]
export type ActionArgs = Parameters<ValueOf<bp.IntegrationProps['actions']>>[0]


export interface ApifyActorResponse {
  items: Record<string | number, unknown>[];
  defaultDatasetId: string;
}

export interface ActorRun {
  id: string
  actId: string
  defaultDatasetId: string
}

export const apifyWebhookEventSchema = z.object({
  userId: z.string(),
  createdAt: z.string().url(),
  eventType: z.string(),
  eventData: z.array(z.any()),
  resource: z.array(z.any())
})
