#!/bin/bash

# Script para configurar o Launcher para iniciar com o sistema usando systemd

echo "🚀 Configurando Launcher para iniciar com o sistema usando systemd..."

# Obter o diretório atual (onde está o script)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LAUNCHER_PATH="$SCRIPT_DIR/out/launcher-linux-x64/launcher"
SERVICE_DIR="$HOME/.config/systemd/user"
SERVICE_FILE="$SERVICE_DIR/launcher.service"

# Verificar se o executável existe
if [ ! -f "$LAUNCHER_PATH" ]; then
    echo "❌ Erro: Executável não encontrado em $LAUNCHER_PATH"
    echo "   Execute 'pnpm run package' primeiro!"
    exit 1
fi

# Criar diretório systemd se não existir
mkdir -p "$SERVICE_DIR"

# Criar arquivo .service
cat > "$SERVICE_FILE" << EOF
[Unit]
Description=Launcher Application
After=default.target

[Service]
Type=simple
ExecStart=$LAUNCHER_PATH
WorkingDirectory=$(dirname "$LAUNCHER_PATH")
Restart=on-failure
RestartSec=5

[Install]
WantedBy=default.target
EOF

# Recarregar o systemd user daemon, habilitar e iniciar o serviço
systemctl --user daemon-reload
systemctl --user enable launcher.service
systemctl --user start launcher.service

echo "✅ Launcher configurado para iniciar automaticamente com systemd!"
echo ""
echo "🔧 Para gerenciar o serviço:"
echo "   - Iniciar: systemctl --user start launcher.service"
echo "   - Parar: systemctl --user stop launcher.service"
echo "   - Status: systemctl --user status launcher.service"
echo "   - Desabilitar: systemctl --user disable launcher.service"
echo ""
echo "❌ Para remover o autostart:"
echo "   systemctl --user disable launcher.service"
echo "   rm $SERVICE_FILE"