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
    // wrap([$class: 'AnsiColorBuildWrapper', colorMapName: 'xterm'])  // <-- remove this
    buildDiscarder(logRotator(numToKeepStr: '30'))
    timeout(time: 75, unit: 'MINUTES')
    disableConcurrentBuilds()
  }

  environment {
    NODE_OPTIONS = "--max-old-space-size=4096"
    GRADLE_USER_HOME = "${WORKSPACE}/.gradle"
    WEB_OUT = "web-dist"
    // ANDROID_LABEL, MAC_LABEL, IOS_ENABLED, ENABLE_PLAY_DEPLOY, ENABLE_APPSTORE_DEPLOY, DOMAIN_TEST/STAGING/PROD, DEPLOY_HOST expected in env
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
        sh 'git --no-pager log -1 --pretty=oneline || true'
      }
    }

    stage('Node 18 + install') {
      steps {
        sh '''
          set -e
          ./ci/use-node-18.sh
          if $CLEAN_NODE_MODULES; then rm -rf node_modules; fi
          yarn install --frozen-lockfile || yarn install
        '''
      }
    }

    stage('Ensure native folders (prebuild)') {
      steps {
        sh '''
          set -e
          ./ci/use-node-18.sh
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
            ./ci/use-node-18.sh
            export APP_ENV="${ENV}"

            case "${ENV}" in
              test) FLAVOR="Test" ;;
              staging) FLAVOR="Staging" ;;
              production) FLAVOR="Production" ;;
            esac

            cd android
            mkdir -p ~/.gradle
            cat > ~/.gradle/gradle.properties <<EOF2
ORG_GRADLE_PROJECT_StorePassword=${STORE_PASS}
ORG_GRADLE_PROJECT_KeyPassword=${KEY_PASS}
ORG_GRADLE_PROJECT_KeyAlias=${KEY_ALIAS}
EOF2
            cp "${KEYSTORE_FILE}" app/release.keystore || true

            ./gradlew --no-daemon clean
            if [ "${USE_AAB}" = "true" ]; then
              ./gradlew --no-daemon bundle${FLAVOR}${BUILD_TYPE}
            else
              ./gradlew --no-daemon assemble${FLAVOR}${BUILD_TYPE}
            fi
          '''
        }
      }
      post {
        always {
          archiveArtifacts artifacts: 'android/app/build/outputs/**', allowEmptyArchive: true
        }
      }
    }

    stage('iOS') {
      when { anyOf { expression { params.PLATFORM in ['ios','all'] && env.IOS_ENABLED == '1' } } }
      agent { label "${env.MAC_LABEL}" }
      steps {
        sh '''
          set -e
          ./ci/use-node-18.sh
          export APP_ENV="${ENV}"
          npx pod-install ios

          case "${ENV}" in
            test)      SCHEME="VTracking Test";      EXPORT="ios/exportOptions.test.plist" ;;
            staging)   SCHEME="VTracking Staging";   EXPORT="ios/exportOptions.staging.plist" ;;
            production)SCHEME="VTracking";           EXPORT="ios/exportOptions.prod.plist" ;;
          esac

          mkdir -p ios/build
          xcodebuild -workspace ios/VTracking.xcworkspace \
            -scheme "${SCHEME}" -configuration Release -sdk iphoneos \
            -archivePath ios/build/${SCHEME}.xcarchive archive | xcpretty

          xcodebuild -exportArchive -archivePath ios/build/${SCHEME}.xcarchive \
            -exportOptionsPlist ${EXPORT} -exportPath ios/build | xcpretty
        '''
      }
      post {
        always {
          archiveArtifacts artifacts: 'ios/build/**', allowEmptyArchive: true
        }
      }
    }

    stage('Web Build') {
      when { anyOf { expression { params.PLATFORM in ['web','all'] } } }
      steps {
        sh '''
          set -e
          ./ci/use-node-18.sh
          export APP_ENV="${ENV}"
          npx expo export --platform web --output-dir "${WEB_OUT}"
          echo "User-agent: *\nDisallow:" > "${WEB_OUT}/robots.txt"
        '''
      }
      post {
        always {
          archiveArtifacts artifacts: "${env.WEB_OUT}/**", allowEmptyArchive: true
        }
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
            ./ci/use-node-18.sh
            export APP_ENV="${ENV}"

            case "${ENV}" in
              test)       DOMAIN="${DOMAIN_TEST}" ;;
              staging)    DOMAIN="${DOMAIN_STAGING}" ;;
              production) DOMAIN="${DOMAIN_PROD}" ;;
            esac

            RELEASE="$(git rev-parse --short=12 HEAD)"
            TAR="site-${RELEASE}.tar.gz"
            tar -C "${WEB_OUT}" -czf "${TAR}" .

            rsync -e "ssh -i ${SSH_KEY} -o StrictHostKeyChecking=no" -avz "${TAR}" \
              "${SSH_USER}@${DEPLOY_HOST}:/tmp/"

            ssh -i "${SSH_KEY}" -o StrictHostKeyChecking=no "${SSH_USER}@${DEPLOY_HOST}" bash -euxo pipefail <<EOF
              RELEASE="${RELEASE}"
              DEPLOY_DIR="/var/www/vtracking"
              RELEASE_DIR="${DEPLOY_DIR}/releases/${RELEASE}"
              mkdir -p "${DEPLOY_DIR}/releases"
              mkdir -p "${RELEASE_DIR}"
              tar -C "${RELEASE_DIR}" -xzf "/tmp/site-${RELEASE}.tar.gz"
              ln -sfn "${RELEASE_DIR}" "${DEPLOY_DIR}/current"
              sudo nginx -t && sudo systemctl reload nginx
              rm -f "/tmp/site-${RELEASE}.tar.gz"
EOF
            curl -fsS "https://${DOMAIN}/health"
          '''
        }
      }
    }

    stage('Deploy Android (Google Play)') {
      when {
        allOf {
          expression { params.PLATFORM in ['android','all'] }
          anyOf { branch 'main'; branch 'production' }
        }
      }
      steps {
        script {
          if (env.ENABLE_PLAY_DEPLOY != '1') {
            echo "Skipping Google Play deploy (ENABLE_PLAY_DEPLOY!=1). Placeholder until API/creds are provided."
          } else {
            echo "Would upload AAB to Play (enable fastlane + creds)."
          }
        }
      }
    }

    stage('Deploy iOS (App Store)') {
      when {
        allOf {
          expression { params.PLATFORM in ['ios','all'] && env.IOS_ENABLED == '1' }
          anyOf { branch 'main'; branch 'production' }
        }
      }
      steps {
        script {
          if (env.ENABLE_APPSTORE_DEPLOY != '1') {
            echo "Skipping App Store deploy (ENABLE_APPSTORE_DEPLOY!=1). Placeholder until API/creds are provided."
          } else {
            echo "Would upload IPA to App Store (enable fastlane + API key)."
          }
        }
      }
    }
  }

  post {
    success { echo "✅ Build OK (${params.PLATFORM} @ ${params.ENV})" }
    failure { echo "❌ Build failed" }
  }
}
