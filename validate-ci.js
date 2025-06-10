#!/usr/bin/env node

/**
 * Script de validação do ambiente de CI/CD
 * Verifica se todos os componentes estão funcionando corretamente
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

const COLORS = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function executeCommand(command, description) {
  try {
    log(`\n🔍 ${description}...`, 'blue');
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    log(`✅ ${description} - OK`, 'green');
    return { success: true, output };
  } catch (error) {
    log(`❌ ${description} - ERRO: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

function checkFile(filePath, description) {
  const exists = existsSync(filePath);
  if (exists) {
    log(`✅ ${description} - OK`, 'green');
  } else {
    log(`❌ ${description} - Arquivo não encontrado`, 'red');
  }
  return exists;
}

async function main() {
  log('🚀 Validação do Ambiente de CI/CD - Inatel API', 'blue');
  log('=' .repeat(50), 'blue');

  let errors = 0;

  log('\n📁 Verificando arquivos de configuração:', 'yellow');
  
  const files = [
    ['Jenkinsfile', 'Arquivo de pipeline Jenkins'],
    ['docker-compose.yml', 'Configuração Docker Compose'],
    ['Dockerfile.jenkins', 'Dockerfile do Jenkins'],
    ['package.json', 'Configuração do projeto'],
    ['vitest.config.ts', 'Configuração do Vitest'],
    ['.env', 'Variáveis de ambiente (opcional)']
  ];

  files.forEach(([file, desc]) => {
    if (!checkFile(file, desc)) {
      if (file !== '.env') errors++;
    }
  });

  log('\n🛠️ Verificando ferramentas:', 'yellow');
  
  const nodeResult = executeCommand('node --version', 'Node.js instalado');
  if (!nodeResult.success) errors++;

  const pnpmResult = executeCommand('pnpm --version', 'pnpm instalado');
  if (!pnpmResult.success) errors++;

  const dockerResult = executeCommand('docker --version', 'Docker instalado');
  if (!dockerResult.success) errors++;

  const dockerComposeResult = executeCommand('docker-compose --version', 'Docker Compose instalado');
  if (!dockerComposeResult.success) errors++;

  log('\n📦 Verificando dependências:', 'yellow');
  
  const installResult = executeCommand('pnpm i', 'Instalação de dependências');
  if (!installResult.success) errors++;

  log('\n🧪 Executando testes:', 'yellow');
  
  const testResult = executeCommand('pnpm run test:unit', 'Testes unitários');
  if (!testResult.success) errors++;

  const junitExists = checkFile(join('coverage', 'junit-results.xml'), 'Relatório JUnit gerado');
  if (!junitExists) errors++;
  log('\n🏗️ Verificando build:', 'yellow');
  
  try {
    if (existsSync('dist')) {
      log('🧹 Limpando diretório dist...', 'blue');
      execSync('rmdir /s /q dist', { encoding: 'utf8', stdio: 'pipe' });
    }
  } catch (error) {
    log('⚠️  Aviso: Não foi possível limpar o diretório dist automaticamente', 'yellow');
  }
  
  const buildResult = executeCommand('pnpm run build', 'Build do projeto');
  if (!buildResult.success) errors++;

  log('\n🐳 Verificando containers Docker:', 'yellow');
  
  const containersResult = executeCommand('docker ps --format "table {{.Names}}\\t{{.Status}}"', 'Containers em execução');
  if (containersResult.success) {
    log('Containers ativos:', 'blue');
    console.log(containersResult.output);
  }

  // Resumo final
  log('\n' + '=' .repeat(50), 'blue');
  
  if (errors === 0) {
    log('🎉 SUCESSO! Ambiente de CI/CD está configurado corretamente!', 'green');
    log('\nPróximos passos:', 'blue');
    log('1. Acesse Jenkins em http://localhost:8080', 'blue');
    log('2. Use a senha: be56784364bd4bc087276009c768e8bd', 'blue');
    log('3. Configure o pipeline do projeto', 'blue');
    log('4. Execute o pipeline para validar tudo está funcionando', 'blue');
  } else {
    log(`❌ ATENÇÃO! Encontrados ${errors} erro(s) na configuração.`, 'red');
    log('Por favor, corrija os problemas antes de continuar.', 'yellow');
  }

  process.exit(errors > 0 ? 1 : 0);
}

main().catch(console.error);
