import { ProjectRepository } from '../data/repositories/ProjectRepository';
import type { ProjectWithTechnologies } from '../data/models/types';

// Re-exportar tipos para uso em outros módulos
export type { ProjectWithTechnologies } from '../data/models/types';

export interface CreateProjectData {
    name: string;
    description: string;
    status: 'active' | 'completed' | 'paused';
    progress?: number;
    technologies: string[];
}

export interface UpdateProjectData {
    name?: string;
    description?: string;
    status?: 'active' | 'completed' | 'paused';
    progress?: number;
    technologies?: string[];
}

class ProjectService {
    // Buscar todos os projetos com tecnologias
    async getAllProjects(): Promise<ProjectWithTechnologies[]> {
        return await ProjectRepository.getAll();
    }

    // Buscar projeto por ID
    async getProjectById(id: number): Promise<ProjectWithTechnologies | null> {
        return await ProjectRepository.getById(id);
    }

    // Criar novo projeto
    async createProject(data: CreateProjectData): Promise<any> {
        return await ProjectRepository.create(data.name, data.description);
    }

    // Atualizar projeto
    async updateProject(id: number, data: UpdateProjectData): Promise<any> {
        return await ProjectRepository.update(id, data);
    }

    // Deletar projeto
    async deleteProject(id: number): Promise<void> {
        await ProjectRepository.delete(id);
    }

    // Buscar projetos por status
    async getProjectsByStatus(status: 'active' | 'completed' | 'paused'): Promise<ProjectWithTechnologies[]> {
        const allProjects = await ProjectRepository.getAll();
        return allProjects.filter((project: ProjectWithTechnologies) => project.status === status);
    }

    // Estatísticas dos projetos (simplificado)
    async getProjectStats() {
        const allProjects = await ProjectRepository.getAll();
        const total = allProjects.length;
        const active = allProjects.filter((p: ProjectWithTechnologies) => p.status === 'active').length;
        const completed = allProjects.filter((p: ProjectWithTechnologies) => p.status === 'completed').length;
        const paused = allProjects.filter((p: ProjectWithTechnologies) => p.status === 'paused').length;

        return {
            total,
            active,
            completed,
            paused
        };
    }
}

export const projectService = new ProjectService();