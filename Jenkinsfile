pipeline {
    agent any

    environment {
        NODE_ENV = 'test'
        CI = 'true'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                echo 'Código fonte baixado com sucesso'
            }
        }

        stage('Verificar Ambiente') {
            steps {
                sh '''
                    echo "Verificando versões..."
                    node --version
                    npm --version
                    echo "Listando arquivos do projeto..."
                    ls -la
                '''
            }
        }

        stage('Instalar Dependências') {
            steps {
                echo 'Instalando dependências do projeto...'
                sh 'npm ci'
                echo 'Dependências instaladas com sucesso'
            }
        }

        stage('Lint & Formatação') {
            steps {
                echo 'Verificando padrões de código...'
                sh 'npm run lint'
                echo 'Verificação de lint concluída'
            }
        }

        stage('Build') {
            steps {
                echo 'Construindo o projeto...'
                sh 'npm run build'
                echo 'Build concluído com sucesso'
            }
        }        stage('Testes Unitários') {
            steps {
                echo 'Executando testes unitários...'
                sh 'npm run test:unit'
                echo 'Testes unitários concluídos'
            }
            post {
                always {
                    // Publicar resultados dos testes
                    publishTestResults testResultsPattern: 'coverage/junit-results.xml'
                    
                    // Arquivar relatórios de cobertura se existirem
                    script {
                        if (fileExists('coverage/index.html')) {
                            publishHTML([
                                allowMissing: false,
                                alwaysLinkToLastBuild: true,
                                keepAll: true,
                                reportDir: 'coverage',
                                reportFiles: 'index.html',
                                reportName: 'Coverage Report'
                            ])
                        }
                    }
                }
            }
        }

        stage('Testes E2E') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                    changeRequest()
                }
            }
            steps {
                echo 'Executando testes end-to-end...'
                sh '''
                    echo "Iniciando banco de dados para testes..."
                    npm run docker:up:test
                    sleep 10
                    echo "Executando testes E2E..."
                    npm run test:e2e || true
                    echo "Parando containers de teste..."
                    npm run docker:down
                '''
            }
        }

        stage('Security Audit') {
            steps {
                echo 'Verificando vulnerabilidades de segurança...'
                sh '''
                    npm audit --audit-level high || echo "Audit encontrou algumas vulnerabilidades"
                '''
            }
        }

        stage('Deployment Ready') {
            when {
                branch 'main'
            }
            steps {
                echo 'Projeto pronto para deployment!'
                sh '''
                    echo "Criando artifact de build..."
                    tar -czf build-artifact.tar.gz dist/ package.json package-lock.json
                    ls -la build-artifact.tar.gz
                '''
                archiveArtifacts artifacts: 'build-artifact.tar.gz', fingerprint: true
            }
        }
    }

    post {
        always {
            echo 'Pipeline finalizado'
            
            // Limpar workspace se necessário
            cleanWs(cleanWhenNotBuilt: false,
                    deleteDirs: true,
                    disableDeferredWipeout: true,
                    notFailBuild: true,
                    patterns: [[pattern: 'node_modules', type: 'EXCLUDE']])
        }
        
        success {
            echo '✅ Pipeline executado com sucesso!'
            // Aqui você pode adicionar notificações (Slack, email, etc.)
        }
        
        failure {
            echo '❌ Pipeline falhou!'
            // Aqui você pode adicionar notificações de falha
        }
        
        unstable {
            echo '⚠️ Pipeline instável - alguns testes falharam'
        }
    }
}
