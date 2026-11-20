@Library('homelab') _

pipeline {
  agent none
  options {
    timeout(time: 10, unit: 'MINUTES')
    disableConcurrentBuilds()
  }
  parameters {
    string(name: 'REGISTRY', description: 'Harbor registry host')
    string(name: 'HARBOR_PROJECT', description: 'Harbor project name')
    string(name: 'HARBOR_CRED_ID', description: 'Jenkins credential ID for Harbor push')
  }
  environment {
    IMAGE = "${params.REGISTRY}/${params.HARBOR_PROJECT}/battle-todo"
  }
  stages {
    stage('verify') {
      agent { label 'bun' }
      stages {
        stage('install') {
          steps {
            container('bun') {
              sh 'bun install --frozen-lockfile'
            }
          }
        }
        stage('typecheck') {
          steps {
            container('bun') {
              sh 'bun run typecheck'
            }
          }
        }
        stage('lint') {
          steps {
            container('bun') {
              sh 'bun run lint'
            }
          }
        }
      }
    }
    stage('ci') {
      agent { label 'buildah' }
      stages {
        stage('resolve tag') {
          steps {
            script {
              env.TAG = (env.GIT_COMMIT ?: '').take(7) ?: 'latest'
            }
          }
        }
        stage('build image & push') {
          steps {
            container('buildah') {
              script {
                buildImage(
                  dockerFilePath: "./Dockerfile",
                  context: '.',
                  imageName: 'battle-todo',
                  tag: env.TAG,
                  registryHost: params.REGISTRY,
                  registryProject: params.HARBOR_PROJECT,
                )
              }
            }
          }
        }
      }
    }
  }
}
