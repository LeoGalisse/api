# 🚀 Configuração Completa do Jenkins para o Projeto Inatel API

Este guia fornece instruções passo a passo para configurar o Jenkins com CI/CD completo para o projeto.

## 📋 Pré-requisitos

- Docker e Docker Compose instalados
- Jenkins rodando em `http://localhost:8080`
- Senha de administrador inicial: `be56784364bd4bc087276009c768e8bd`

## 🔧 Configuração Inicial do Jenkins

### 1. Primeiro Acesso

1. Acesse `http://localhost:8080`
2. Cole a senha inicial: `be56784364bd4bc087276009c768e8bd`
3. Selecione "Install suggested plugins"
4. Crie um usuário administrador

### 2. Plugins Necessários

Instale os seguintes plugins adicionais:

- **Pipeline**: Para pipelines declarativas
- **Git**: Para integração com Git
- **NodeJS**: Para projetos Node.js
- **HTML Publisher**: Para relatórios de cobertura
- **JUnit**: Para resultados de testes
- **Blue Ocean**: Interface moderna (opcional)

**Para instalar:**
1. Vá em `Manage Jenkins` → `Manage Plugins`
2. Aba `Available plugins`
3. Procure e instale os plugins listados

### 3. Configurar Node.js

1. Vá em `Manage Jenkins` → `Tools`
2. Seção `NodeJS installations`
3. Clique em `Add NodeJS`
4. Configure:
   - **Name**: `Node 20`
   - **Version**: `NodeJS 20.x`
   - ✅ Marque "Install automatically"

## 🏗️ Criar Pipeline do Projeto

### 1. Novo Item

1. No dashboard, clique em `New Item`
2. Nome: `Inatel-API-Pipeline`
3. Selecione `Pipeline`
4. Clique `OK`

### 2. Configuração do Pipeline

Na página de configuração:

#### General
- ✅ **GitHub project**: Se estiver usando GitHub
- **Project url**: URL do seu repositório

#### Build Triggers
- ✅ **Poll SCM**: `H/5 * * * *` (verifica mudanças a cada 5 minutos)
- ✅ **GitHub hook trigger for GITScm polling** (se usando GitHub)

#### Pipeline
- **Definition**: `Pipeline script from SCM`
- **SCM**: `Git`
- **Repository URL**: URL do seu repositório
- **Credentials**: Configure se necessário
- **Branch Specifier**: `*/main` ou `*/master`
- **Script Path**: `Jenkinsfile`

### 3. Configuração de Ambiente

Adicione as seguintes variáveis de ambiente em `Manage Jenkins` → `Configure System`:

```
NODE_ENV=test
CI=true
```

## 🎯 Funcionalidades do Pipeline

### Estágios do Pipeline

1. **Checkout**: Baixa o código fonte
2. **Verificar Ambiente**: Mostra versões do Node.js e npm
3. **Instalar Dependências**: Executa `npm ci`
4. **Lint & Formatação**: Verifica padrões de código
5. **Build**: Compila o projeto
6. **Testes Unitários**: Executa testes com Vitest
7. **Testes E2E**: Executa testes end-to-end (apenas em main/develop)
8. **Security Audit**: Verifica vulnerabilidades
9. **Deployment Ready**: Cria artifacts para deploy (apenas branch main)

### Relatórios Gerados

- **Resultados de Testes**: XML no formato JUnit
- **Cobertura de Código**: Relatório HTML
- **Artifacts**: Build pronto para deployment

### Notificações

O pipeline atual fornece feedback através de:
- Console logs detalhados
- Status visual no Jenkins
- Relatórios de teste e cobertura

## 🔄 Executar Pipeline

### Manualmente
1. Acesse o projeto `Inatel-API-Pipeline`
2. Clique em `Build Now`

### Automaticamente
- O pipeline será executado automaticamente quando detectar mudanças no repositório
- Polling configurado para verificar a cada 5 minutos

## 📊 Monitoramento

### Dashboard
- Acesse o dashboard principal para ver status de todos os builds
- Use Blue Ocean para uma interface mais moderna

### Logs
- Clique em qualquer build para ver logs detalhados
- Cada estágio mostra progresso individual

### Relatórios
- **Test Results**: Resultados detalhados dos testes
- **Coverage Report**: Relatório de cobertura de código
- **Artifacts**: Downloads de builds prontos para deploy

## 🛠️ Troubleshooting

### Problemas Comuns

#### Node.js não encontrado
```bash
# No pipeline, verifique se o Node.js está configurado
stage('Setup') {
    steps {
        nodejs('Node 20') {
            sh 'node --version'
            sh 'npm --version'
        }
    }
}
```

#### Permissões Docker
Se houver problemas com Docker:
```bash
# Adicione o usuário jenkins ao grupo docker
docker exec -u root inatel-api-jenkins usermod -aG docker jenkins
docker restart inatel-api-jenkins
```

#### Falha nos Testes
- Verifique se MongoDB está rodando para testes E2E
- Confirme que todas as dependências foram instaladas
- Revise logs do console para detalhes específicos

### Comandos Úteis

```bash
# Verificar status dos containers
docker ps

# Ver logs do Jenkins
docker logs inatel-api-jenkins

# Reiniciar Jenkins
docker restart inatel-api-jenkins

# Acessar container Jenkins
docker exec -it inatel-api-jenkins bash
```

## 🚀 Próximos Passos

1. **Integração com Git**: Configure webhooks para builds automáticos
2. **Notificações**: Configure Slack/email para notificações
3. **Deploy Automático**: Adicione estágios de deployment
4. **Quality Gates**: Configure critérios de qualidade mínimos
5. **Monitoramento**: Integre com ferramentas de monitoramento

## 📝 Configurações Adicionais

### Variables de Ambiente Globais
Em `Manage Jenkins` → `Configure System` → `Global properties`:

```
NODE_ENV=test
CI=true
MONGODB_URL=mongodb://admin:password123@mongodb:27017/inatel_api_test?authSource=admin
```

### Configuração de Segurança
- Configure autenticação via GitHub/GitLab se necessário
- Defina permissões por usuário/grupo
- Configure credentials para repositórios privados

---

*Este pipeline foi configurado para fornecer CI/CD completo com qualidade de código, testes automatizados e preparação para deployment.*
