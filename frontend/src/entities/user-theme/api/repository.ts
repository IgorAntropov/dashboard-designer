import type { RenderTheme } from '@panelka/renderer'

import { api } from '@shared/api'

import type { UserTheme } from '../model/types'

interface ThemeRow {
  id: string
  name: string
  tokens: Record<string, unknown>
}

function toTheme(row: ThemeRow): UserTheme {
  return { id: row.id, name: row.name, tokens: row.tokens as unknown as RenderTheme }
}

export async function listUserThemes(): Promise<UserTheme[]> {
  const { data } = await api.GET('/api/v1/me/themes')
  return (data ?? []).map((row) => toTheme(row as ThemeRow))
}

export async function createUserTheme(
  name: string,
  tokens: RenderTheme,
): Promise<UserTheme | null> {
  const { data } = await api.POST('/api/v1/me/themes', {
    body: { name, tokens: tokens as unknown as Record<string, unknown> },
  })
  return data ? toTheme(data as ThemeRow) : null
}

export async function updateUserTheme(
  id: string,
  patch: { name?: string; tokens?: RenderTheme },
): Promise<UserTheme | null> {
  const { data } = await api.PATCH('/api/v1/me/themes/{theme_id}', {
    params: { path: { theme_id: id } },
    body: {
      name: patch.name,
      tokens: patch.tokens as unknown as Record<string, unknown> | undefined,
    },
  })
  return data ? toTheme(data as ThemeRow) : null
}

export async function deleteUserTheme(id: string): Promise<boolean> {
  const { response } = await api.DELETE('/api/v1/me/themes/{theme_id}', {
    params: { path: { theme_id: id } },
  })
  return response.ok
}
