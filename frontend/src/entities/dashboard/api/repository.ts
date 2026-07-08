import type { components } from '@shared/api'
import { api } from '@shared/api'

export type Dashboard = components['schemas']['Dashboard']
export type DashboardCreate = components['schemas']['DashboardCreate']

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

export async function deleteDashboard(id: string): Promise<void> {
  await api.DELETE('/api/v1/dashboards/{dashboard_id}', {
    params: { path: { dashboard_id: id } },
  })
}
