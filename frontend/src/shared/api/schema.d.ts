export interface paths {
  '/api/v1/health': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get: operations['health_api_v1_health_get']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/version': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get: operations['version_api_v1_version_get']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/dashboards': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get: operations['list_dashboards_api_v1_dashboards_get']
    put?: never
    post: operations['create_dashboard_api_v1_dashboards_post']
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/dashboards/{dashboard_id}': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    post?: never
    delete: operations['delete_dashboard_api_v1_dashboards__dashboard_id__delete']
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
}

export type webhooks = Record<string, never>

export interface components {
  schemas: {
    Dashboard: {
      id: string
      title: string
      slug: string
      theme_key: string
      layout: {
        [key: string]: unknown
      }
      data_bindings: {
        [key: string]: unknown
      }
      data_source: {
        [key: string]: unknown
      }
      status: 'draft' | 'published'
      created_at: string
      updated_at: string
    }
    DashboardCreate: {
      title: string
      theme_key?: string
      layout?: {
        [key: string]: unknown
      }
      data_bindings?: {
        [key: string]: unknown
      }
      data_source?: {
        [key: string]: unknown
      }
    }
  }
  responses: never
  parameters: never
  requestBodies: never
  headers: never
  pathItems: never
}

export type $defs = Record<string, never>

export interface operations {
  health_api_v1_health_get: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            [key: string]: string
          }
        }
      }
    }
  }
  version_api_v1_version_get: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            [key: string]: string
          }
        }
      }
    }
  }
  list_dashboards_api_v1_dashboards_get: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['Dashboard'][]
        }
      }
    }
  }
  create_dashboard_api_v1_dashboards_post: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['DashboardCreate']
      }
    }
    responses: {
      201: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['Dashboard']
        }
      }
    }
  }
  delete_dashboard_api_v1_dashboards__dashboard_id__delete: {
    parameters: {
      query?: never
      header?: never
      path: {
        dashboard_id: string
      }
      cookie?: never
    }
    requestBody?: never
    responses: {
      204: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
}
