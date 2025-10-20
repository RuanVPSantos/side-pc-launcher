# Configuração do Launcher

## 📁 Localização dos Arquivos

Ao executar o launcher pela primeira vez, os seguintes arquivos e pastas serão criados automaticamente em:

```
~/.config/launcher/
├── config.txt           ← Arquivo de configuração
└── carousel-images/     ← Pasta para imagens do carrossel
```

## ⚙️ Arquivo config.txt

O arquivo `config.txt` contém todas as configurações do launcher. Você pode editá-lo com qualquer editor de texto.

### Formato

```
# Linhas começando com # são comentários

# Configurações de Localização (para o clima)
LATITUDE=-15.8288597
LONGITUDE=-48.1306207
CITY=Ceilândia
COUNTRY=Brazil

# Configurações do Carrossel
CAROUSEL_INTERVAL=10
```

### Parâmetros Disponíveis

| Parâmetro | Descrição | Exemplo |
|-----------|-----------|---------|
| `LATITUDE` | Latitude da sua localização | `-15.8288597` |
| `LONGITUDE` | Longitude da sua localização | `-48.1306207` |
| `CITY` | Nome da cidade | `Ceilândia` |
| `COUNTRY` | Nome do país | `Brazil` |
| `CAROUSEL_INTERVAL` | Intervalo de troca de imagens (segundos) | `10` |

## 🖼️ Imagens do Carrossel

Para adicionar suas próprias imagens ao carrossel:

1. Copie suas imagens para: `~/.config/launcher/carousel-images/`
2. Formatos suportados: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`
3. Reinicie o launcher

### Exemplo

```bash
# Copiar imagens
cp minhas-fotos/* ~/.config/launcher/carousel-images/

# Abrir a pasta
xdg-open ~/.config/launcher/carousel-images/
```

## 🔄 Como Aplicar Mudanças

Após editar o `config.txt` ou adicionar imagens:

1. Feche o launcher
2. Reabra o launcher
3. As novas configurações serão carregadas automaticamente

## 📝 Exemplo Completo

```
# Configuração para São Paulo
LATITUDE=-23.5505
LONGITUDE=-46.6333
CITY=São Paulo
COUNTRY=Brazil

# Trocar imagens a cada 15 segundos
CAROUSEL_INTERVAL=15
```

## 🛠️ Solução de Problemas

### Config não está sendo carregado

1. Verifique se o arquivo está em: `~/.config/launcher/config.txt`
2. Verifique se não há erros de sintaxe (cada linha deve ser `CHAVE=VALOR`)
3. Reinicie o launcher

### Imagens não aparecem

1. Verifique se as imagens estão em: `~/.config/launcher/carousel-images/`
2. Verifique se os formatos são suportados
3. Verifique as permissões dos arquivos

### Restaurar configuração padrão

Delete o arquivo `config.txt` e reinicie o launcher. Um novo arquivo com valores padrão será criado automaticamente.

```bash
rm ~/.config/launcher/config.txt
```
