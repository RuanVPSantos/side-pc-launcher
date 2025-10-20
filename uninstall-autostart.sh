#!/bin/bash

# Script para remover o Launcher do autostart

DESKTOP_FILE="$HOME/.config/autostart/launcher.desktop"

if [ -f "$DESKTOP_FILE" ]; then
    rm "$DESKTOP_FILE"
    echo "✅ Launcher removido do autostart!"
    echo "📁 Arquivo removido: $DESKTOP_FILE"
else
    echo "ℹ️  Launcher não está configurado para autostart"
fi
