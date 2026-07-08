export {
  createDashboard,
  deleteDashboard,
  getDashboard,
  listDashboards,
} from './api/repository'
export type { Dashboard, DashboardCreate } from './api/repository'
export { default as DashboardCard } from './ui/DashboardCard.vue'
