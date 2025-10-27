import { db } from '../database';

export class ProjectRepository {
    static async getAll() {
        const projects = await db.query('SELECT * FROM projects ORDER BY updatedAt DESC');

        // Para cada projeto, buscar suas tecnologias
        for (const project of projects) {
            const technologies = await db.query(`
                SELECT t.name, t.id 
                FROM technologies t 
                INNER JOIN project_technologies pt ON t.id = pt.technologyId 
                WHERE pt.projectId = ?
            `, [project.id]);

            // Formatar para manter compatibilidade com o formato do Prisma
            project.technologies = technologies.map((tech: any) => ({
                technology: { name: tech.name, id: tech.id }
            }));
        }

        return projects;
    }

    static async getById(id: number) {
        const project = await db.queryOne('SELECT * FROM projects WHERE id = ?', [id]);

        if (project) {
            // Buscar tecnologias
            const technologies = await db.query(`
                SELECT t.name, t.id 
                FROM technologies t 
                INNER JOIN project_technologies pt ON t.id = pt.technologyId 
                WHERE pt.projectId = ?
            `, [id]);

            project.technologies = technologies.map((tech: any) => ({
                technology: { name: tech.name, id: tech.id }
            }));

            // Buscar comentários
            project.comments = await db.query(
                'SELECT * FROM project_comments WHERE projectId = ? ORDER BY createdAt DESC',
                [id]
            );

            // Buscar links
            project.links = await db.query(
                'SELECT * FROM project_links WHERE projectId = ? ORDER BY createdAt DESC',
                [id]
            );

            // Buscar pastas
            project.folders = await db.query(
                'SELECT * FROM project_folders WHERE projectId = ? ORDER BY createdAt DESC',
                [id]
            );

            // Buscar períodos de foco (DateFocus)
            const focusDates = await db.query(
                'SELECT * FROM date_focus WHERE projectId = ? ORDER BY startDate ASC',
                [id]
            );

            console.log(`📅 Focus dates encontradas para projeto ${id}:`, focusDates.length);

            // Converter strings de data para objetos Date
            project.focusDates = focusDates.map((focusDate: any) => ({
                ...focusDate,
                startDate: new Date(focusDate.startDate),
                endDate: new Date(focusDate.endDate)
            }));

            console.log(`📅 focusDates processadas para projeto ${id}:`, project.focusDates.length);
        }

        return project;
    }

    static async create(name: string, description?: string, progress?: number, technologies?: string[]) {
        const result = await db.query(
            'INSERT INTO projects (name, description, status, progress) VALUES (?, ?, ?, ?)',
            [name, description || '', 'active', progress || 0]
        );

        // Obter o ID do projeto criado
        const projectId = result.insertId;

        // Adicionar tecnologias se fornecidas
        if (technologies && technologies.length > 0 && projectId) {
            for (const techName of technologies) {
                try {
                    // Verificar se tecnologia existe, se não criar
                    let tech = await db.queryOne(
                        'SELECT id FROM technologies WHERE name = ?',
                        [techName]
                    );

                    if (!tech) {
                        const techResult = await db.query(
                            'INSERT INTO technologies (name) VALUES (?)',
                            [techName]
                        );
                        tech = { id: techResult.insertId };
                    }

                    // Adicionar relação projeto-tecnologia
                    await db.query(
                        'INSERT INTO project_technologies (projectId, technologyId) VALUES (?, ?)',
                        [projectId, tech.id]
                    );
                } catch (error: any) {
                    // Ignorar erro se tecnologia já foi adicionada
                    if (error.code !== 'ER_DUP_ENTRY') {
                        console.error(`Erro ao adicionar tecnologia ${techName}:`, error);
                    }
                }
            }
        }

        return result;
    }

    static async update(id: number, data: any) {
        const updateFields = [];
        const values = [];

        if (data.name !== undefined) {
            updateFields.push('name = ?');
            values.push(data.name);
        }
        if (data.description !== undefined) {
            updateFields.push('description = ?');
            values.push(data.description);
        }
        if (data.progress !== undefined) {
            updateFields.push('progress = ?');
            values.push(data.progress);
        }
        if (data.status !== undefined) {
            updateFields.push('status = ?');
            values.push(data.status);
        }
        if (data.githubUrl !== undefined) {
            updateFields.push('githubUrl = ?');
            values.push(data.githubUrl);
        }

        if (updateFields.length === 0) {
            return { affectedRows: 0 };
        }

        updateFields.push('updatedAt = CURRENT_TIMESTAMP(3)');
        values.push(id);

        const query = `UPDATE projects SET ${updateFields.join(', ')} WHERE id = ?`;
        return await db.query(query, values);
    }

    static async delete(id: number) {
        return await db.query('DELETE FROM projects WHERE id = ?', [id]);
    }
}