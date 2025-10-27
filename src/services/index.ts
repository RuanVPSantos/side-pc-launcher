// Exportar todos os services
export { projectService } from './projectService';
export { notificationService } from './notificationService';
export { systemService } from './systemService';
export { weatherService } from './weatherService';
export { settingsService } from './settingsService';

// Exportar tipos
export type {
    ProjectWithTechnologies,
    CreateProjectData,
    UpdateProjectData
} from './projectService';

export type {
    CreateNotificationData,
    UpdateNotificationData
} from './notificationService';

export type {
    CreateSystemMetricData
} from './systemService';

export type {
    CreateWeatherData
} from './weatherService';