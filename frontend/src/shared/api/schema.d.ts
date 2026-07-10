export interface paths {
  '/api/v1/health': {
    parameters: { query?: never; header?: never; path?: never; cookie?: never }
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
    parameters: { query?: never; header?: never; path?: never; cookie?: never }
    get: operations['version_api_v1_version_get']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/auth/register': {
    parameters: { query?: never; header?: never; path?: never; cookie?: never }
    get?: never
    put?: never
    post: operations['register_api_v1_auth_register_post']
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/auth/login': {
    parameters: { query?: never; header?: never; path?: never; cookie?: never }
    get?: never
    put?: never
    post: operations['login_api_v1_auth_login_post']
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/auth/refresh': {
    parameters: { query?: never; header?: never; path?: never; cookie?: never }
    get?: never
    put?: never
    post: operations['refresh_api_v1_auth_refresh_post']
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/me': {
    parameters: { query?: never; header?: never; path?: never; cookie?: never }
    get: operations['me_api_v1_me_get']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch: operations['update_me_api_v1_me_patch']
    trace?: never
  }
  '/api/v1/me/subscription': {
    parameters: { query?: never; header?: never; path?: never; cookie?: never }
    get?: never
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch: operations['update_subscription_api_v1_me_subscription_patch']
    trace?: never
  }
  '/api/v1/auth/change-password': {
    parameters: { query?: never; header?: never; path?: never; cookie?: never }
    get?: never
    put?: never
    post: operations['change_password_api_v1_auth_change_password_post']
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/dashboards': {
    parameters: { query?: never; header?: never; path?: never; cookie?: never }
    get: operations['list_dashboards_api_v1_dashboards_get']
    put?: never
    post: operations['create_dashboard_api_v1_dashboards_post']
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/dashboards/{dashboard_id}/export': {
    parameters: { query?: never; header?: never; path?: never; cookie?: never }
    get?: never
    put?: never
    post: operations['export_dashboard_api_v1_dashboards__dashboard_id__export_post']
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/dashboards/{dashboard_id}/analytics': {
    parameters: { query?: never; header?: never; path?: never; cookie?: never }
    get: operations['dashboard_analytics_api_v1_dashboards__dashboard_id__analytics_get']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/dashboards/{dashboard_id}/publish': {
    parameters: { query?: never; header?: never; path?: never; cookie?: never }
    get?: never
    put?: never
    post: operations['publish_dashboard_api_v1_dashboards__dashboard_id__publish_post']
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/v1/dashboards/{dashboard_id}': {
    parameters: { query?: never; header?: never; path?: never; cookie?: never }
    get: operations['get_dashboard_api_v1_dashboards__dashboard_id__get']
    put?: never
    post?: never
    delete: operations['delete_dashboard_api_v1_dashboards__dashboard_id__delete']
    options?: never
    head?: never
    patch: operations['update_dashboard_api_v1_dashboards__dashboard_id__patch']
    trace?: never
  }
}

export type webhooks = Record<string, never>

export interface components {
  schemas: {
    SubscriptionTier: 'free' | 'pro' | 'unlimited'
    UserOut: {
      id: string
      email: string
      display_name: string
      subscription_tier: components['schemas']['SubscriptionTier']
    }
    TokenPair: {
      access_token: string
      refresh_token: string
      token_type: string
    }
    RegisterRequest: {
      email: string
      password: string
      display_name: string
    }
    LoginRequest: {
      email: string
      password: string
    }
    RefreshRequest: {
      refresh_token: string
    }
    UserUpdate: {
      display_name: string
    }
    ChangePasswordRequest: {
      current_password: string
      new_password: string
    }
    SubscriptionUpdate: {
      tier: components['schemas']['SubscriptionTier']
    }
    Dashboard: {
      id: string
      title: string
      slug: string
      theme_key: string
      theme_tokens?: { [key: string]: unknown } | null
      layout: { [key: string]: unknown }
      data_bindings: { [key: string]: unknown }
      data_source: { [key: string]: unknown }
      status: 'draft' | 'published'
      created_at: string
      updated_at: string
    }
    DashboardCreate: {
      title: string
      theme_key?: string
      layout?: { [key: string]: unknown }
      data_bindings?: { [key: string]: unknown }
      data_source?: { [key: string]: unknown }
    }
    DashboardUpdate: {
      title?: string | null
      theme_key?: string | null
      theme_tokens?: { [key: string]: unknown } | null
      layout?: { [key: string]: unknown } | null
      data_bindings?: { [key: string]: unknown } | null
      data_source?: { [key: string]: unknown } | null
      status?: 'draft' | 'published' | null
    }
    PublishRequest: {
      allowed_domains?: string[]
    }
    PublishResponse: {
      token: string
      ingest_key: string
      allowed_domains: string[]
      status: 'draft' | 'published'
    }
    DayCount: { day: string; count: number }
    DashboardAnalytics: {
      total: number
      days: components['schemas']['DayCount'][]
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
    parameters: { query?: never; header?: never; path?: never; cookie?: never }
    requestBody?: never
    responses: {
      200: {
        headers: { [name: string]: unknown }
        content: { 'application/json': { [key: string]: string } }
      }
    }
  }
  version_api_v1_version_get: {
    parameters: { query?: never; header?: never; path?: never; cookie?: never }
    requestBody?: never
    responses: {
      200: {
        headers: { [name: string]: unknown }
        content: { 'application/json': { [key: string]: string } }
      }
    }
  }
  register_api_v1_auth_register_post: {
    parameters: { query?: never; header?: never; path?: never; cookie?: never }
    requestBody: {
      content: { 'application/json': components['schemas']['RegisterRequest'] }
    }
    responses: {
      201: {
        headers: { [name: string]: unknown }
        content: { 'application/json': components['schemas']['UserOut'] }
      }
    }
  }
  login_api_v1_auth_login_post: {
    parameters: { query?: never; header?: never; path?: never; cookie?: never }
    requestBody: {
      content: { 'application/json': components['schemas']['LoginRequest'] }
    }
    responses: {
      200: {
        headers: { [name: string]: unknown }
        content: { 'application/json': components['schemas']['TokenPair'] }
      }
    }
  }
  refresh_api_v1_auth_refresh_post: {
    parameters: { query?: never; header?: never; path?: never; cookie?: never }
    requestBody: {
      content: { 'application/json': components['schemas']['RefreshRequest'] }
    }
    responses: {
      200: {
        headers: { [name: string]: unknown }
        content: { 'application/json': components['schemas']['TokenPair'] }
      }
    }
  }
  me_api_v1_me_get: {
    parameters: { query?: never; header?: never; path?: never; cookie?: never }
    requestBody?: never
    responses: {
      200: {
        headers: { [name: string]: unknown }
        content: { 'application/json': components['schemas']['UserOut'] }
      }
    }
  }
  update_me_api_v1_me_patch: {
    parameters: { query?: never; header?: never; path?: never; cookie?: never }
    requestBody: {
      content: { 'application/json': components['schemas']['UserUpdate'] }
    }
    responses: {
      200: {
        headers: { [name: string]: unknown }
        content: { 'application/json': components['schemas']['UserOut'] }
      }
    }
  }
  update_subscription_api_v1_me_subscription_patch: {
    parameters: { query?: never; header?: never; path?: never; cookie?: never }
    requestBody: {
      content: { 'application/json': components['schemas']['SubscriptionUpdate'] }
    }
    responses: {
      200: {
        headers: { [name: string]: unknown }
        content: { 'application/json': components['schemas']['UserOut'] }
      }
    }
  }
  change_password_api_v1_auth_change_password_post: {
    parameters: { query?: never; header?: never; path?: never; cookie?: never }
    requestBody: {
      content: {
        'application/json': components['schemas']['ChangePasswordRequest']
      }
    }
    responses: {
      204: {
        headers: { [name: string]: unknown }
        content?: never
      }
    }
  }
  list_dashboards_api_v1_dashboards_get: {
    parameters: { query?: never; header?: never; path?: never; cookie?: never }
    requestBody?: never
    responses: {
      200: {
        headers: { [name: string]: unknown }
        content: {
          'application/json': components['schemas']['Dashboard'][]
        }
      }
    }
  }
  create_dashboard_api_v1_dashboards_post: {
    parameters: { query?: never; header?: never; path?: never; cookie?: never }
    requestBody: {
      content: { 'application/json': components['schemas']['DashboardCreate'] }
    }
    responses: {
      201: {
        headers: { [name: string]: unknown }
        content: { 'application/json': components['schemas']['Dashboard'] }
      }
    }
  }
  get_dashboard_api_v1_dashboards__dashboard_id__get: {
    parameters: {
      query?: never
      header?: never
      path: { dashboard_id: string }
      cookie?: never
    }
    requestBody?: never
    responses: {
      200: {
        headers: { [name: string]: unknown }
        content: { 'application/json': components['schemas']['Dashboard'] }
      }
    }
  }
  export_dashboard_api_v1_dashboards__dashboard_id__export_post: {
    parameters: {
      query?: never
      header?: never
      path: { dashboard_id: string }
      cookie?: never
    }
    requestBody?: never
    responses: {
      200: {
        headers: { [name: string]: unknown }
        content: { 'application/json': { [key: string]: unknown } }
      }
    }
  }
  dashboard_analytics_api_v1_dashboards__dashboard_id__analytics_get: {
    parameters: {
      query?: never
      header?: never
      path: { dashboard_id: string }
      cookie?: never
    }
    requestBody?: never
    responses: {
      200: {
        headers: { [name: string]: unknown }
        content: {
          'application/json': components['schemas']['DashboardAnalytics']
        }
      }
    }
  }
  publish_dashboard_api_v1_dashboards__dashboard_id__publish_post: {
    parameters: {
      query?: never
      header?: never
      path: { dashboard_id: string }
      cookie?: never
    }
    requestBody: {
      content: { 'application/json': components['schemas']['PublishRequest'] }
    }
    responses: {
      200: {
        headers: { [name: string]: unknown }
        content: { 'application/json': components['schemas']['PublishResponse'] }
      }
    }
  }
  update_dashboard_api_v1_dashboards__dashboard_id__patch: {
    parameters: {
      query?: never
      header?: never
      path: { dashboard_id: string }
      cookie?: never
    }
    requestBody: {
      content: { 'application/json': components['schemas']['DashboardUpdate'] }
    }
    responses: {
      200: {
        headers: { [name: string]: unknown }
        content: { 'application/json': components['schemas']['Dashboard'] }
      }
    }
  }
  delete_dashboard_api_v1_dashboards__dashboard_id__delete: {
    parameters: {
      query?: never
      header?: never
      path: { dashboard_id: string }
      cookie?: never
    }
    requestBody?: never
    responses: {
      204: {
        headers: { [name: string]: unknown }
        content?: never
      }
    }
  }
}
