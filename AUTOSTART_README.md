# Configuração de Autostart no Fedora (Hyprland)

## ✅ Status Atual

O Launcher está **configurado para iniciar automaticamente** com o Hyprland!

## 📁 Localização

O arquivo de autostart do Hyprland está em:
```
~/.config/hypr/UserConfigs/Startup_Apps.conf
```

Linha adicionada:
```bash
exec-once = /home/ruan/Projetos/pessoais/ativos/launcher/out/launcher-linux-x64/launcher
```

## 🔧 Como Funciona

O Hyprland lê o arquivo `Startup_Apps.conf` e executa todos os comandos `exec-once` ao iniciar a sessão gráfica.

## 🚀 Configuração Manual

### Adicionar ao Hyprland
Edite o arquivo:
```bash
nano ~/.config/hypr/UserConfigs/Startup_Apps.conf
```

Adicione a linha:
```bash
exec-once = /home/ruan/Projetos/pessoais/ativos/launcher/out/launcher-linux-x64/launcher
```

### Remover do Hyprland
Comente ou remova a linha do arquivo `Startup_Apps.conf`:
```bash
# exec-once = /home/ruan/Projetos/pessoais/ativos/launcher/out/launcher-linux-x64/launcher
```

## 🎛️ Recarregar Configuração

Após editar o arquivo, recarregue o Hyprland:
```bash
hyprctl reload
```

Ou faça logout e login novamente.

## 🧪 Testar

### Verificar se está configurado
```bash
grep launcher ~/.config/hypr/UserConfigs/Startup_Apps.conf
```

### Testar manualmente
```bash
./out/launcher-linux-x64/launcher
```

### Verificar se está rodando
```bash
pgrep -f launcher
```

## ❌ Desabilitar Temporariamente

Comente a linha no arquivo `Startup_Apps.conf`:
```bash
# exec-once = /home/ruan/Projetos/pessoais/ativos/launcher/out/launcher-linux-x64/launcher
```

E recarregue o Hyprland ou faça logout/login.

## 🔄 Atualizar Após Rebuild

Se você fizer um novo build (`pnpm run package`), o caminho já está correto no `Startup_Apps.conf`.

Se você mover o projeto, atualize o caminho no arquivo:
```bash
nano ~/.config/hypr/UserConfigs/Startup_Apps.conf
```

## 🐛 Solução de Problemas

### Launcher não inicia automaticamente

1. **Verificar se está configurado:**
   ```bash
   grep launcher ~/.config/hypr/UserConfigs/Startup_Apps.conf
   ```

2. **Verificar se o executável existe:**
   ```bash
   ls -l /home/ruan/Projetos/pessoais/ativos/launcher/out/launcher-linux-x64/launcher
   ```

3. **Testar executável manualmente:**
   ```bash
   /home/ruan/Projetos/pessoais/ativos/launcher/out/launcher-linux-x64/launcher
   ```

4. **Ver logs do Hyprland:**
   ```bash
   journalctl --user -b | grep -i hyprland
   ```

5. **Verificar processos:**
   ```bash
   pgrep -af launcher
   ```

### Múltiplas instâncias

Se o launcher abrir várias vezes, verifique se não há duplicatas:
```bash
grep -n launcher ~/.config/hypr/UserConfigs/Startup_Apps.conf
```

Ou se há configuração no systemd:
```bash
systemctl --user status launcher.service
```

## 📝 Notas

- O launcher inicia **após o Hyprland carregar** (exec-once)
- Se você mover o projeto, atualize o caminho no `Startup_Apps.conf`
- O autostart funciona apenas para o usuário atual
- O `exec-once` garante que o launcher inicie apenas uma vez por sessão

## ⚠️ Importante

- **Não use systemd user service** para aplicações GUI no Hyprland
- O Hyprland gerencia melhor o autostart de aplicações gráficas
- Se você tinha o serviço systemd habilitado, desabilite-o:
  ```bash
  systemctl --user disable launcher.service
  systemctl --user stop launcher.service
  ```
