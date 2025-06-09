pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Instalar dependências') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Rodar testes unitários') {
            steps {
                sh 'npm run test:unit'
            }
        }
        stage('Debug JUnit XML') {
            steps {
                sh 'ls -la coverage'
                sh 'cat coverage/junit-results.xml || echo "Arquivo não encontrado"'
            }
        }
    }

    post {
        always {
            junit 'coverage/junit-results.xml'
        }
    }
}
