# Migration Fix Summary - updatedAt Default Values

## Problema
Erro ao criar projetos: `Field 'updatedAt' doesn't have a default value`
- Código: `ER_NO_DEFAULT_FOR_FIELD`
- Mensagem: "Field 'updatedAt' doesn't have a default value"

## Solução Implementada
Adicionadas migrações para garantir que todos os campos `createdAt` e `updatedAt` tenham valores padrão em todas as tabelas.

## Tabelas Corrigidas

### 1. **projects** (Criação)
- `createdAt DATETIME DEFAULT CURRENT_TIMESTAMP`
- `updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`

### 2. **technologies** (Criação)
- `createdAt DATETIME DEFAULT CURRENT_TIMESTAMP`

### 3. **project_technologies** (Criação)
- Sem timestamps (tabela de relacionamento)

### 4. **notifications** (Criação)
- `createdAt DATETIME DEFAULT CURRENT_TIMESTAMP`
- `updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`

### 5. **date_focus** (Criação)
- `createdAt DATETIME DEFAULT CURRENT_TIMESTAMP`

### 6. **recurring_notification_templates** (Criação)
- `createdAt DATETIME DEFAULT CURRENT_TIMESTAMP`
- `updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`

### 7. **event_reminders** (Criação + Fix)
- `createdAt DATETIME DEFAULT CURRENT_TIMESTAMP`
- `updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP` (adicionado)

### 8. **project_comments** (Criação + Fix)
- `createdAt DATETIME DEFAULT CURRENT_TIMESTAMP`
- `updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP` (adicionado)

### 9. **project_links** (Criação + Fix)
- `createdAt DATETIME DEFAULT CURRENT_TIMESTAMP`
- `updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP` (adicionado)

### 10. **project_folders** (Criação + Fix)
- `createdAt DATETIME DEFAULT CURRENT_TIMESTAMP`
- `updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP` (adicionado)
- `name VARCHAR(255) DEFAULT 'Pasta'` (adicionado)

## Migrações Adicionadas

1. **000_create_projects_table** - Cria tabela projects com defaults
2. **000_create_technologies_table** - Cria tabela technologies
3. **000_create_project_technologies_table** - Cria tabela de relacionamento
4. **000_create_notifications_table** - Cria tabela notifications com defaults
5. **000_create_date_focus_table** - Cria tabela date_focus
6. **001_extend_notifications_table** - Adiciona isPaused
7. **001_add_source_columns** - Adiciona sourceType e sourceId
8. **001_add_notification_indexes** - Adiciona índices
9. **001_create_recurring_templates** - Cria recurring_notification_templates com defaults
10. **001_create_event_reminders** - Cria event_reminders com defaults
11. **001_update_source_type_enum** - Atualiza enum
12. **002_create_project_tables** - Cria project_comments, project_links, project_folders com defaults
13. **002_fix_project_tables_updatedAt** - Adiciona updatedAt se não existir
14. **003_add_project_folders_name** - Adiciona coluna name em project_folders
15. **003_fix_projects_timestamps** - Garante defaults em projects
16. **003_fix_event_reminders_updatedAt** - Adiciona updatedAt em event_reminders se não existir

## Como Aplicar

As migrações serão executadas automaticamente quando o banco de dados for inicializado. O sistema de migrações verifica quais já foram executadas e pula as duplicadas.

### Arquivo Modificado
- `/src/data/migrations/MigrationService.ts`

## Resultado Esperado
✅ Projetos podem ser criados sem erro de `updatedAt`
✅ Todos os registros terão timestamps automáticos
✅ Atualizações automáticas do campo `updatedAt` ao modificar registros
