pipeline {
    agent any

    stages {
        stage('npm install') {
            steps {
                sh 'npm install'
            }
        }
        stage('build') {
            steps {
                sh 'npm run build'
            }
        }
        stage('undeploy') {
            steps {
                sh 'rm -rf /var/www/4bit/*'
            }
        }
        stage('deploy') {
            steps {
                sh 'cp -R dist/* /var/www/4bit/'
            }
        }
    }
}