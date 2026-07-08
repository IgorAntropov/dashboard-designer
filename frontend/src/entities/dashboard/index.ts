export {
  createDashboard,
  deleteDashboard,
  getDashboard,
  listDashboards,
  updateDashboard,
} from './api/repository'
export type {
  Dashboard,
  DashboardCreate,
  DashboardUpdate,
} from './api/repository'
export { default as DashboardCard } from './ui/DashboardCard.vue'
