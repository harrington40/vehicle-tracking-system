properties([
  parameters([
    choice(name: 'ENV', choices: ['test','staging','production'], description: 'Environment'),
    choice(name: 'PLATFORM', choices: ['android','ios','web','all'], description: 'Target to build/deploy'),
    choice(name: 'BUILD_TYPE', choices: ['Release','Debug'], description: 'Android build type'),
    booleanParam(name: 'USE_AAB', defaultValue: true, description: 'Android: AAB (true) or APK (false)'),
    booleanParam(name: 'CLEAN_NODE_MODULES', defaultValue: false, description: 'Remove node_modules before install')
  ])
])

pipeline {
  agent any
  options {
    buildDiscarder(logRotator(numToKeepStr: '30'))
    timeout(time: 75, unit: 'MINUTES')
    disableConcurrentBuilds()
  }
  environment {
    NODE_OPTIONS         = "--max-old-space-size=4096"
    GRADLE_USER_HOME     = "${WORKSPACE}/.gradle"
    WEB_OUT              = "web-dist"

    // Android signing credentials (create these IDs in Jenkins if you haven't yet)
    ANDROID_KEYSTORE_ID  = 'android-keystore'
    ANDROID_KEY_ALIAS_ID = 'android-key-alias'
    ANDROID_KEY_PASS_ID  = 'android-key-pass'
    ANDROID_STORE_PASS_ID= 'android-store-pass'

    // Agent labels (change to match your infra)
    ANDROID_LABEL = 'linux && android'
    MAC_LABEL     = 'mac'

    // Toggles
    IOS_ENABLED            = '0'  // flip to '1' when you have a macOS agent & signing set up
    ENABLE_PLAY_DEPLOY     = '0'  // placeholders off for now
    ENABLE_APPSTORE_DEPLOY = '0'
  }

  stages {
    stage('Echo params') {
      steps {
        echo "ENV=${params.ENV} PLATFORM=${params.PLATFORM} BUILD_TYPE=${params.BUILD_TYPE}"
      }
    }

    stage('Checkout') {
      steps {
        checkout scm
        sh '''
          set -eux
          git --no-pager log -1 --pretty=oneline || true
        '''
      }
    }

    stage('Node 18 Setup') {
      steps {
        sh '''
          set -eux
          # Check what's in the ci/ directory
          ls -la ci/ || true
          
          # If the script exists, try to make it executable and run it
          if [ -f "ci/use-node-18.sh" ]; then
            echo "Found use-node-18.sh script, making it executable..."
            chmod +x ci/use-node-18.sh
            # Try to execute it directly
            ./ci/use-node-18.sh || echo "Script execution failed, continuing with manual setup..."
          fi
          
          # Manual Node.js setup as fallback
          if ! command -v node >/dev/null 2>&1 || ! node --version | grep -q "v18"; then
            echo "Setting up Node.js 18 manually..."
            # Install Node.js 18 using nvm, fnm, or direct download
            curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash || true
            export NVM_DIR="$HOME/.nvm"
            [ -s "$NVM_DIR/nvm.sh" ] && \\. "$NVM_DIR/nvm.sh"
            nvm install 18 || true
            nvm use 18 || true
          fi
          
          echo "Node.js version:"
          node --version || true
          echo "npm version:"
          npm --version || true
        '''
      }
    }

    stage('Install dependencies') {
      steps {
        sh '''
          set -eux
          # Prefer yarn if present with yarn.lock, else npm
          if command -v yarn >/dev/null 2>&1 && [ -f yarn.lock ]; then
            if [ "${CLEAN_NODE_MODULES:-false}" = "true" ]; then rm -rf node_modules; fi
            yarn install --frozen-lockfile || yarn install
          else
            if [ -f package-lock.json ]; then
              npm ci || npm install
            else
              npm install
            fi
          fi
        '''
      }
    }

    stage('Ensure native folders (prebuild)') {
      steps {
        sh '''
          set -eux
          npx expo --version || npx --yes @expo/cli --version
          # Safe if already generated; helps first-time builds
          npx expo prebuild --non-interactive || true
        '''
      }
    }

    stage('Android') {
      when { anyOf { expression { params.PLATFORM in ['android','all'] } } }
      agent { label "${ANDROID_LABEL}" }
      steps {
        withCredentials([
          file(credentialsId: env.ANDROID_KEYSTORE_ID, variable: 'KEYSTORE_FILE'),
          string(credentialsId: env.ANDROID_KEY_ALIAS_ID,  variable: 'KEY_ALIAS'),
          string(credentialsId: env.ANDROID_KEY_PASS_ID,   variable: 'KEY_PASS'),
          string(credentialsId: env.ANDROID_STORE_PASS_ID, variable: 'STORE_PASS')
        ]) {
          sh '''
            set -eux
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

            ls -l app/build/outputs/{apk,bundle}/** || true
          '''
        }
      }
      post {
        always { archiveArtifacts artifacts: 'android/app/build/outputs/**', allowEmptyArchive: true }
      }
    }

    stage('iOS') {
      when { anyOf { expression { params.PLATFORM in ['ios','all'] && env.IOS_ENABLED == '1' } } }
      agent { label "${MAC_LABEL}" }
      steps {
        sh '''
          set -eux
          export APP_ENV="${ENV}"
          npx pod-install ios

          case "${ENV}" in
            test) SCHEME="VTracking Test";      EXPORT="ios/exportOptions.test.plist" ;;
            staging) SCHEME="VTracking Staging"; EXPORT="ios/exportOptions.staging.plist" ;;
            production) SCHEME="VTracking";     EXPORT="ios/exportOptions.prod.plist" ;;
          esac

          mkdir -p ios/build
          xcodebuild -workspace ios/VTracking.xcworkspace \
            -scheme "${SCHEME}" -configuration Release -sdk iphoneos \
            -archivePath ios/build/${SCHEME}.xcarchive archive | xcpretty || true

          xcodebuild -exportArchive \
            -archivePath ios/build/${SCHEME}.xcarchive \
            -exportOptionsPlist ${EXPORT} \
            -exportPath ios/build | xcpretty || true

          ls -l ios/build || true
        '''
      }
      post {
        always { archiveArtifacts artifacts: 'ios/build/**', allowEmptyArchive: true }
      }
    }

    stage('Web Build') {
      when { anyOf { expression { params.PLATFORM in ['web','all'] } } }
      steps {
        sh '''
          set -eux
          export APP_ENV="${ENV}"
          npx expo export --platform web --output-dir "${WEB_OUT}"
          printf "User-agent: *\\nDisallow:\\n" > ${WEB_OUT}/robots.txt
          ls -la ${WEB_OUT} || true
        '''
      }
      post {
        always { archiveArtifacts artifacts: '${WEB_OUT}/**', allowEmptyArchive: true }
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
            set -eux
            export APP_ENV="${ENV}"

            case "${ENV}" in
              test)       DOMAIN="app-test.transtechologies.com" ;;
              staging)    DOMAIN="app-staging.transtechologies.com" ;;
              production) DOMAIN="app.transtechologies.com" ;;
            esac

            RELEASE="$(git rev-parse --short=12 HEAD)"
            TAR="site-${RELEASE}.tar.gz"
            tar -C "${WEB_OUT}" -czf "${TAR}" .

            DEPLOY_HOST="deploy.transtechologies.com"
            rsync -e "ssh -i ${SSH_KEY} -o StrictHostKeyChecking=no" -avz "${TAR}" \
              "${SSH_USER}@${DEPLOY_HOST}:/tmp/"

            ssh -i "${SSH_KEY}" -o StrictHostKeyChecking=no "${SSH_USER}@${DEPLOY_HOST}" bash -s <<'EOS'
              set -eux
              RELEASE="'${RELEASE}'"
              DEPLOY_DIR="/var/www/vtracking"
              RELEASE_DIR="${DEPLOY_DIR}/releases/${RELEASE}"
              mkdir -p "${DEPLOY_DIR}/releases" "${RELEASE_DIR}"
              tar -C "${RELEASE_DIR}" -xzf "/tmp/site-${RELEASE}.tar.gz"
              ln -sfn "${RELEASE_DIR}" "${DEPLOY_DIR}/current"
              sudo nginx -t && sudo systemctl reload nginx
              rm -f "/tmp/site-${RELEASE}.tar.gz"
EOS

            curl -fsS "https://${DOMAIN}/health" || echo "Health probe failed (site may be warming)"
          '''
        }
      }
    }

    // Placeholders (store deploys disabled for now)
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
            echo "Skipping Google Play deploy (placeholder; set ENABLE_PLAY_DEPLOY=1 when ready)."
          } else {
            echo "TODO: fastlane supply here"
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
            echo "Skipping App Store deploy (placeholder; set ENABLE_APPSTORE_DEPLOY=1 when ready)."
          } else {
            echo "TODO: fastlane deliver here"
          }
        }
      }
    }
  }

  post {
    success { 
      echo "✅ Build OK (${params.PLATFORM} @ ${params.ENV})"
    }
    failure { 
      echo "❌ Build failed"
    }
  }
}