properties([
  parameters([
    choice(name: 'ENV', choices: ['test','staging','production'], description: 'Environment'),
    choice(name: 'PLATFORM', choices: ['android','ios','web','all'], description: 'Target'),
    choice(name: 'BUILD_TYPE', choices: ['Release','Debug'], description: 'Android build type'),
    booleanParam(name: 'USE_AAB', defaultValue: true, description: 'Android bundle (AAB) instead of APK'),
    booleanParam(name: 'CLEAN_NODE_MODULES', defaultValue: false, description: 'Clean node_modules before install')
  ])
])

pipeline {
  agent any

  options {
    timestamps()
    buildDiscarder(logRotator(numToKeepStr: '30'))
    timeout(time: 75, unit: 'MINUTES')
    disableConcurrentBuilds()
  }

  environment {
    NODE_OPTIONS = "--max-old-space-size=4096"
    GRADLE_USER_HOME = "${WORKSPACE}/.gradle"
    WEB_OUT = "web-dist"
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
        sh 'git --no-pager log -1 --pretty=oneline || true'
      }
    }

    stage('Bootstrap CI scripts') {
      steps {
        sh '''
          set -eux
          test -f ci/use-node-18.sh
          chmod +x ci/use-node-18.sh || true
          if file ci/use-node-18.sh | grep -qi "CRLF"; then
            sed -i 's/\r$//' ci/use-node-18.sh
          fi
          bash ci/use-node-18.sh
          node -v || true
          corepack enable || true
          yarn -v || true
        '''
      }
    }

    stage('Node 18 + install') {
      steps {
        sh '''
          set -e
          bash ci/use-node-18.sh
          if $CLEAN_NODE_MODULES; then rm -rf node_modules; fi
          command -v yarn >/dev/null 2>&1 || corepack enable
          yarn install --frozen-lockfile || yarn install
        '''
      }
    }

    stage('Ensure native folders (prebuild)') {
      steps {
        sh '''
          set -e
          bash ci/use-node-18.sh
          npx expo prebuild --non-interactive || true
        '''
      }
    }

    stage('Android') {
      when { anyOf { expression { params.PLATFORM in ['android','all'] } } }
      agent { label "${env.ANDROID_LABEL}" }
      steps {
        withCredentials([
          file(credentialsId: env.ANDROID_KEYSTORE_ID, variable: 'KEYSTORE_FILE'),
          string(credentialsId: env.ANDROID_KEY_ALIAS_ID,  variable: 'KEY_ALIAS'),
          string(credentialsId: env.ANDROID_KEY_PASS_ID,   variable: 'KEY_PASS'),
          string(credentialsId: env.ANDROID_STORE_PASS_ID, variable: 'STORE_PASS')
        ]) {
          sh '''
            set -e
            bash ci/use-node-18.sh
            export APP_ENV="${ENV}"
            ...
          '''
        }
      }
    }

    stage('iOS') {
      when { anyOf { expression { params.PLATFORM in ['ios','all'] && env.IOS_ENABLED == '1' } } }
      agent { label "${env.MAC_LABEL}" }
      steps {
        sh '''
          set -e
          bash ci/use-node-18.sh
          export APP_ENV="${ENV}"
          npx pod-install ios
          ...
        '''
      }
    }

    stage('Web Build') {
      when { anyOf { expression { params.PLATFORM in ['web','all'] } } }
      steps {
        sh '''
          set -e
          bash ci/use-node-18.sh
          export APP_ENV="${ENV}"
          npx expo export --platform web --output-dir "${WEB_OUT}"
          echo "User-agent: *\nDisallow:" > "${WEB_OUT}/robots.txt"
        '''
      }
    }

    stage('Deploy Web') {
      when {
        allOf {
          expression { params.PLATFORM in ['web','all'] }
          anyOf { branch 'main'; branch 'production' }
        }
      }
      steps {
        withCredentials([sshUserPrivateKey(credentialsId: 'web-deploy-ssh',
                                           keyFileVariable: 'SSH_KEY',
                                           usernameVariable: 'SSH_USER')]) {
          sh '''
            set -e
            bash ci/use-node-18.sh
            export APP_ENV="${ENV}"
            ...
          '''
        }
      }
    }

    // Deploy Android (Google Play) + Deploy iOS (App Store) left unchanged
  }

  post {
    success { echo "✅ Build OK (${params.PLATFORM} @ ${params.ENV})" }
    failure { echo "❌ Build failed" }
  }
}
