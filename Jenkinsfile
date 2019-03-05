pipeline {
  agent {
    label 'webtask'
  }

  tools {
    nodejs '8.9.1'
  }

  environment {
    SERVICE_NAME = 'rules'
    NPM_CONFIG_CACHE = "~/.npm/${SERVICE_NAME}"
    S3_BUCKET="assets.us.auth0.com"
    S3_REGION="us-west-1"
  }

  options {
    timeout(time: 10, unit: 'MINUTES')
  }

  parameters {
    string(name: 'SlackTarget', defaultValue: '#dx-extensibility-gh', description: 'Target Slack Channel for notifications')
  }

  stages {
    stage('SharedLibs') {
      steps {
        library identifier: 'auth0-jenkins-pipelines-library@master', retriever: modernSCM(
          [$class: 'GitSCMSource',
          remote: 'git@github.com:auth0/auth0-jenkins-pipelines-library.git',
          credentialsId: 'auth0extensions-ssh-key'])
      }
    }
    stage('Build') {
      steps {
        sshagent(['auth0extensions-ssh-key']) {
          sh 'npm install'
        }
        script {
          sh 'npm run build'
        }
      }
    }
    stage('Test') {
      steps {
        script {
          try {
            sh 'npm run test'
            githubNotify context: 'jenkinsfile/auth0/tests', description: 'Tests passed', status: 'SUCCESS'
          } catch (error) {
            githubNotify context: 'jenkinsfile/auth0/tests', description: 'Tests failed', status: 'FAILURE'
            throw error
          }
        }
      }
    }
    stage('Deploy') {
      when {
        branch 'master'
      }
      steps {
        script {
          try {
            sh 'npm run deploy'
            githubNotify context: 'jenkinsfile/auth0/deploy', description: 'Deployment succeeded', status: 'SUCCESS'
          } catch (error) {
            githubNotify context: 'jenkinsfile/auth0/deploy', description: 'Deployment failed', status: 'FAILURE'
            throw error
          }
        }
      }
    }
  }

  post {
    always {
      junit allowEmptyResults: true, testResults: 'junit.xml'

      script {
        String additionalMessage = '';
        if (env.BRANCH_NAME.startsWith("PR-")) {
          additionalMessage += "\nPR: ${env.CHANGE_URL}\nTitle: ${env.CHANGE_TITLE}\nAuthor: ${env.CHANGE_AUTHOR}";
        }
        additionalMessage += "\n" + junitResultsToString('junit.xml');

        notifySlack(params.SlackTarget, additionalMessage);
      }
    }
    cleanup {
      deleteDir()
    }
  }
}
