#!/bin/bash

# Script para desinstalar o Launcher

echo "🗑️ Desinstalando o Launcher..."

ICON_DEST_PATH="$HOME/.local/share/icons/hicolor/scalable/apps/launcher.svg"
DESKTOP_FILE_PATH="$HOME/.local/share/applications/launcher.desktop"

# Remover o ícone
if [ -f "$ICON_DEST_PATH" ]; then
    echo "🎨 Removendo o ícone..."
    rm "$ICON_DEST_PATH"
fi

# Remover arquivo .desktop
if [ -f "$DESKTOP_FILE_PATH" ]; then
    echo "📝 Removendo o arquivo .desktop..."
    rm "$DESKTOP_FILE_PATH"
fi

# Atualizar o cache de ícones e a base de dados de aplicações
echo "🔄 Atualizando caches..."
gtk-update-icon-cache -f -t "$HOME/.local/share/icons/hicolor" 2>/dev/null || true
update-desktop-database "$HOME/.local/share/applications" 2>/dev/null || true

echo "✅ Launcher desinstalado com sucesso!"
echo "   O projeto ainda está disponível no diretório atual"
echo "   Para executar: pnpm start"