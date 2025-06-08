pipeline {
    agent {
        docker {
            image 'jenkins-node' // usa o container que você criou
            args '-v $PWD:/app -w /app' // monta volume e define diretório
        }
    }

    stages {
        stage('Checkout') {
            steps {
                // Clona o projeto a partir do repositório
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
            junit '**/coverage/**/junit*.xml' // se você gerar reports JUnit
        }
    }
}
