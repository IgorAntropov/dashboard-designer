import type { components } from '@shared/api'
import { api } from '@shared/api'

export type Dashboard = components['schemas']['Dashboard']
export type DashboardCreate = components['schemas']['DashboardCreate']
export type DashboardUpdate = components['schemas']['DashboardUpdate']
export type PublishResponse = components['schemas']['PublishResponse']

export async function listDashboards(): Promise<Dashboard[]> {
  const { data, error } = await api.GET('/api/v1/dashboards')
  if (error || !data) {
    return []
  }
  return data
}

export async function createDashboard(
  payload: DashboardCreate,
): Promise<Dashboard | null> {
  const { data } = await api.POST('/api/v1/dashboards', { body: payload })
  return data ?? null
}

export async function getDashboard(id: string): Promise<Dashboard | null> {
  const { data } = await api.GET('/api/v1/dashboards/{dashboard_id}', {
    params: { path: { dashboard_id: id } },
  })
  return data ?? null
}

export interface UpdateDashboardResult {
  data: Dashboard | null
  status: number
}

export async function updateDashboard(
  id: string,
  patch: DashboardUpdate,
): Promise<UpdateDashboardResult> {
  const { data, response } = await api.PATCH('/api/v1/dashboards/{dashboard_id}', {
    params: { path: { dashboard_id: id } },
    body: patch,
  })
  return { data: data ?? null, status: response.status }
}

export async function publishDashboard(
  id: string,
  allowedDomains: string[],
): Promise<PublishResponse | null> {
  const { data } = await api.POST('/api/v1/dashboards/{dashboard_id}/publish', {
    params: { path: { dashboard_id: id } },
    body: { allowed_domains: allowedDomains },
  })
  return data ?? null
}

export type DashboardAnalytics = components['schemas']['DashboardAnalytics']

export async function getAnalytics(
  id: string,
): Promise<DashboardAnalytics | null> {
  const { data } = await api.GET('/api/v1/dashboards/{dashboard_id}/analytics', {
    params: { path: { dashboard_id: id } },
  })
  return data ?? null
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function exportDashboard(
  id: string,
): Promise<Record<string, unknown> | null> {
  const { data } = await api.POST('/api/v1/dashboards/{dashboard_id}/export', {
    params: { path: { dashboard_id: id } },
  })
  if (!data) {
    return null
  }

  let job = data
  for (let attempt = 0; attempt < 20 && job.status === 'pending'; attempt += 1) {
    await delay(300)
    const { data: polled } = await api.GET(
      '/api/v1/dashboards/exports/{job_id}',
      { params: { path: { job_id: job.id } } },
    )
    if (!polled) {
      return null
    }
    job = polled
  }

  return job.status === 'done' && job.result ? job.result : null
}

export async function deleteDashboard(id: string): Promise<void> {
  await api.DELETE('/api/v1/dashboards/{dashboard_id}', {
    params: { path: { dashboard_id: id } },
  })
}
