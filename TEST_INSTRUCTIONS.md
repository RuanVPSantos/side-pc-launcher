# Instruções de Teste - Correção de updatedAt

## Pré-requisitos
- MySQL rodando e acessível
- Variáveis de ambiente configuradas (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME)
- Aplicação compilada e pronta para rodar

## Passos para Testar

### 1. Limpar Banco de Dados (Opcional)
Se quiser testar com um banco limpo:
```bash
mysql -u root -p launcher -e "DROP DATABASE launcher; CREATE DATABASE launcher;"
```

### 2. Iniciar a Aplicação
```bash
npm start
```

### 3. Verificar Logs de Migração
Procure pelos logs que indicam:
```
✅ Migration 000_create_projects_table completed
✅ Migration 000_create_technologies_table completed
✅ Migration 000_create_notifications_table completed
✅ Migration 000_create_date_focus_table completed
✅ Migration 001_create_recurring_templates completed
✅ Migration 001_create_event_reminders completed
✅ Migration 002_create_project_tables completed
✅ Migration 003_fix_projects_timestamps completed
✅ Migration 003_fix_event_reminders_updatedAt completed
```

### 4. Testar Criação de Projeto
Na interface da aplicação:
1. Clique em "Novo Projeto"
2. Preencha o nome e descrição
3. Clique em "Criar"

**Resultado esperado:** Projeto criado com sucesso sem erro de `updatedAt`

### 5. Verificar Banco de Dados
```sql
-- Verificar estrutura da tabela projects
DESCRIBE projects;

-- Verificar se o projeto foi criado
SELECT * FROM projects;

-- Verificar timestamps
SELECT id, name, createdAt, updatedAt FROM projects;
```

**Resultado esperado:**
- Campo `updatedAt` com valor padrão `CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`
- Todos os projetos têm `createdAt` e `updatedAt` preenchidos

### 6. Testar Atualização de Projeto
1. Edite um projeto existente
2. Mude o nome ou descrição
3. Salve as mudanças

**Resultado esperado:** Campo `updatedAt` é atualizado automaticamente

### 7. Testar Outras Operações
- Adicionar comentário
- Adicionar link
- Adicionar pasta
- Criar notificação
- Criar focus date

**Resultado esperado:** Todas as operações funcionam sem erro de timestamps

## Verificação de Migrações Executadas
```sql
SELECT * FROM schema_migrations ORDER BY executed_at;
```

## Troubleshooting

### Erro: "Field 'updatedAt' doesn't have a default value"
- Verifique se as migrações foram executadas
- Limpe a tabela `schema_migrations` e reinicie a aplicação
- Verifique os logs para erros de migração

### Erro: "Table doesn't exist"
- Verifique se o banco de dados foi criado
- Verifique as credenciais do banco de dados
- Verifique os logs de inicialização

### Migrações não executadas
- Verifique se há erros nos logs
- Verifique a conexão com o banco de dados
- Verifique se o usuário do banco tem permissões de CREATE TABLE

## Rollback (Se Necessário)
Se precisar reverter as mudanças:
```sql
-- Limpar tabela de migrações
TRUNCATE TABLE schema_migrations;

-- Deletar tabelas (cuidado!)
DROP TABLE IF EXISTS event_reminders;
DROP TABLE IF EXISTS recurring_notification_templates;
DROP TABLE IF EXISTS project_folders;
DROP TABLE IF EXISTS project_links;
DROP TABLE IF EXISTS project_comments;
DROP TABLE IF EXISTS date_focus;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS project_technologies;
DROP TABLE IF EXISTS technologies;
DROP TABLE IF EXISTS projects;
```

Depois reinicie a aplicação para recriar as tabelas.
