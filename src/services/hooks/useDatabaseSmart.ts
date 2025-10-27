// Hook que SEMPRE usa IPC (banco real)
import { useProjects as useProjectsIPC, useNotifications as useNotificationsIPC, useProjectDetail as useProjectDetailIPC, useFocusDates as useFocusDatesIPC } from './useDatabaseIPC';

// FORÇAR uso do IPC sempre
export const useProjects = useProjectsIPC;
export const useNotifications = useNotificationsIPC;
export const useProjectDetail = useProjectDetailIPC;
export const useFocusDates = useFocusDatesIPC;

console.log('🔗 FORÇANDO uso de IPC (banco real)');