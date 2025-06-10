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

        stage('Build') {
            steps {
                echo 'Construindo o projeto...'
                sh 'npm run build'
                echo 'Build concluído com sucesso'
            }
        }

        stage('Testes Unitários') {
            steps {
                echo 'Executando testes unitários...'
                sh 'npm run test:unit'
                echo 'Testes unitários concluídos'
            }            
            post {
                always {
                    script {
                        if (fileExists('coverage/junit-results.xml')) {
                            junit 'coverage/junit-results.xml'
                        }
                    }
                    
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
    }

    post {
        always {
            echo 'Pipeline finalizado'
            
            cleanWs(cleanWhenNotBuilt: false,
                    deleteDirs: true,
                    disableDeferredWipeout: true,
                    notFailBuild: true,
                    patterns: [[pattern: 'node_modules', type: 'EXCLUDE']])
        }
        
        success {
            echo '✅ Pipeline executado com sucesso!'
        }
        
        failure {
            echo '❌ Pipeline falhou!'
        }
        
        unstable {
            echo '⚠️ Pipeline instável - alguns testes falharam'
        }
    }
}
