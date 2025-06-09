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
    }

    post {
        always {
            junit '**/coverage/**/junit*.xml'
        }
    }
}
