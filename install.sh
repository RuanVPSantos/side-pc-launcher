#!/bin/bash

# Script para instalar e configurar o Launcher

echo "🚀 Configurando o Launcher..."

# Obter o diretório atual (onde está o script)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ICON_SOURCE="$SCRIPT_DIR/public/world.svg"
ICON_DEST_DIR="$HOME/.local/share/icons/hicolor/scalable/apps"
ICON_DEST_PATH="$ICON_DEST_DIR/launcher.svg"
DESKTOP_FILE_DIR="$HOME/.local/share/applications"
DESKTOP_FILE_PATH="$DESKTOP_FILE_DIR/launcher.desktop"
EXECUTABLE_PATH="$SCRIPT_DIR/out/launcher-linux-x64/launcher"

# Verificar se o pnpm está instalado
if ! command -v pnpm &> /dev/null; then
    echo "❌ Erro: pnpm não está instalado"
    echo "   Instale o pnpm primeiro: npm install -g pnpm"
    exit 1
fi

# Verificar se estamos no diretório correto
if [ ! -f "$SCRIPT_DIR/package.json" ]; then
    echo "❌ Erro: package.json não encontrado"
    echo "   Execute este script no diretório raiz do projeto"
    exit 1
fi

# Instalar dependências se necessário
if [ ! -d "$SCRIPT_DIR/node_modules" ]; then
    echo "📦 Instalando dependências..."
    cd "$SCRIPT_DIR"
    pnpm install
fi

# Fazer build da aplicação se não existir
if [ ! -f "$EXECUTABLE_PATH" ]; then
    echo "🔧 Fazendo build da aplicação..."
    cd "$SCRIPT_DIR"
    pnpm run package
    
    if [ ! -f "$EXECUTABLE_PATH" ]; then
        echo "❌ Erro: Build falhou. Executável não encontrado em $EXECUTABLE_PATH"
        exit 1
    fi
fi

# Criar diretórios necessários para o ícone
mkdir -p "$ICON_DEST_DIR"
mkdir -p "$DESKTOP_FILE_DIR"

# Copiar o ícone
echo "🎨 Copiando o ícone..."
cp "$ICON_SOURCE" "$ICON_DEST_PATH"

# Criar arquivo .desktop para a aplicação compilada
echo "📝 Criando o arquivo .desktop..."
cat > "$DESKTOP_FILE_PATH" << EOF
[Desktop Entry]
Name=Launcher
Comment=Launcher Dashboard
Exec=$EXECUTABLE_PATH
Icon=launcher
Type=Application
Categories=Utility;System;
StartupWMClass=launcher
Terminal=false
Path=$SCRIPT_DIR
EOF

# Criar também um arquivo .desktop para desenvolvimento
DESKTOP_FILE_DEV_PATH="$DESKTOP_FILE_DIR/launcher-dev.desktop"
cat > "$DESKTOP_FILE_DEV_PATH" << EOF
[Desktop Entry]
Name=Launcher (Dev)
Comment=Launcher em modo desenvolvimento
Exec=bash -c "cd $SCRIPT_DIR && pnpm start"
Icon=launcher
Type=Application
Categories=Development;Utility;
StartupWMClass=launcher
Terminal=false
Path=$SCRIPT_DIR
EOF

# Atualizar o cache de ícones e a base de dados de aplicações
echo "🔄 Atualizando caches..."
gtk-update-icon-cache -f -t "$HOME/.local/share/icons/hicolor" 2>/dev/null || true
update-desktop-database "$DESKTOP_FILE_DIR" 2>/dev/null || true

# Configurar autostart no Hyprland
echo "⚙️  Configurando inicialização automática no Hyprland..."
HYPR_STARTUP_FILE="$HOME/.config/hypr/UserConfigs/Startup_Apps.conf"

if [ -f "$HYPR_STARTUP_FILE" ]; then
    echo "   Atualizando configuração de inicialização do Hyprland..."

    # Remover linhas antigas do launcher
    sed -i '/# Launcher autostart/d' "$HYPR_STARTUP_FILE"
    sed -i '/# Iniciar Launcher/d' "$HYPR_STARTUP_FILE"
    sed -i '/Added by launcher install.sh/d' "$HYPR_STARTUP_FILE"
    sed -i '/launcher.*pnpm/d' "$HYPR_STARTUP_FILE"
    sed -i '/launcher-linux-x64\/launcher/d' "$HYPR_STARTUP_FILE"

    # Adicionar nova configuração
    echo "" >> "$HYPR_STARTUP_FILE"
    echo "# Launcher autostart (added by install.sh)" >> "$HYPR_STARTUP_FILE"
    echo "exec-once = $EXECUTABLE_PATH" >> "$HYPR_STARTUP_FILE"

    echo "   ✅ Configuração de inicialização atualizada."
else
    echo "   ⚠️  Aviso: Arquivo '$HYPR_STARTUP_FILE' não encontrado."
    echo "   A inicialização automática não foi configurada."
    echo "   Você pode adicionar manualmente a linha:"
    echo "   exec-once = $EXECUTABLE_PATH"
fi

# Verificar se o MySQL está configurado
echo "🔍 Verificando configuração do banco de dados..."
if [ -f "$SCRIPT_DIR/.env" ]; then
    if grep -q "DB_PASSWORD=futureshade" "$SCRIPT_DIR/.env"; then
        echo "   ✅ Configuração do MySQL encontrada"
    else
        echo "   ⚠️  Configuração do MySQL pode estar incorreta"
        echo "   Verifique o arquivo .env com as credenciais corretas"
    fi
else
    echo "   ⚠️  Arquivo .env não encontrado"
    echo "   Certifique-se de configurar as credenciais do MySQL"
fi

echo ""
echo "✅ Launcher configurado com sucesso!"
echo ""
echo "📋 Resumo da instalação:"
echo "   🎯 Executável: $EXECUTABLE_PATH"
echo "   🖼️  Ícone: $ICON_DEST_PATH"
echo "   📱 Menu: Launcher (aplicação compilada)"
echo "   🛠️  Menu Dev: Launcher (Dev) (modo desenvolvimento)"
echo "   🚀 Autostart: Configurado no Hyprland"
echo ""
echo "🔄 Para aplicar o autostart, reinicie o Hyprland ou execute:"
echo "   hyprctl reload"
echo ""

# Perguntar se quer testar agora
read -p "🚀 Deseja testar o Launcher agora? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Iniciando Launcher..."
    "$EXECUTABLE_PATH" &
    echo "   Launcher iniciado em background"
fi

echo ""
echo "🎉 Instalação concluída! O Launcher será iniciado automaticamente na próxima reinicialização."