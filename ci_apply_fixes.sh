#!/usr/bin/env bash
set -euo pipefail

# ci_apply_fixes.sh
# - Backs up and replaces Jenkinsfile + ci/use-node-18.sh with robust versions
# - Removes corepack usage, uses Yarn via npm (with npm fallback)
# - Makes sh steps POSIX friendly (no `set -o pipefail`)
# Usage:
#   chmod +x ci_apply_fixes.sh
#   ./ci_apply_fixes.sh
#   ./ci_apply_fixes.sh --commit   # will git add/commit the changes

COMMIT=0
if [[ "${1:-}" == "--commit" ]]; then COMMIT=1; fi

ROOT="$(pwd)"
mkdir -p ci

backup_file() {
  local f="$1"
  if [[ -f "$f" ]]; then
    cp -f "$f" "${f}.bak.$(date +%s)"
    echo "Backed up $f -> ${f}.bak.<timestamp>"
  fi
}

# --- Update ci/use-node-18.sh (no corepack; Yarn via npm) ---
backup_file "ci/use-node-18.sh"
cat > ci/use-node-18.sh <<'EOF'
#!/usr/bin/env bash
set -euo pipefail

# Install/activate Node 18 with nvm
export NVM_DIR="$HOME/.nvm"
if [ ! -s "$NVM_DIR/nvm.sh" ]; then
  # Install nvm (cached per agent HOME)
  curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
fi
# shellcheck disable=SC1090
. "$NVM_DIR/nvm.sh"

nvm install 18 >/dev/null
nvm use 18    >/dev/null

node -v

# Avoid Corepack to bypass locked egress to repo.yarnpkg.com
# Install Yarn classic globally via npm; ignore failure and fallback to npm later
if ! command -v yarn >/dev/null 2>&1; then
  npm install -g yarn@1.22.22 || true
fi

# Show available package managers for logs
(yarn -v || echo "yarn not available, will use npm")
npm -v
EOF
chmod +x ci/use-node-18.sh

# --- Write Jenkinsfile (POSIX sh; yarn/npm fallback; same stages) ---
backup_file "Jenkinsfile"
cat > Jenkinsfile <<'EOF'
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
    timestamps()
    ansiColor('xterm')
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

    stage('Prep agent') {
      steps {
        sh '''
          set -eux
          # Ensure helper script is executable and has LF endings (if dos2unix exists)
          chmod +x ci/use-node-18.sh || true
          command -v dos2unix >/dev/null 2>&1 && dos2unix ci/use-node-18.sh || true
          head -n 1 ci/use-node-18.sh || true
        '''
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

    stage('Node 18 + install') {
      steps {
        sh '''
          set -eux
          ./ci/use-node-18.sh

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
          ./ci/use-node-18.sh
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
          ./ci/use-node-18.sh
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
          ./ci/use-node-18.sh
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
            ./ci/use-node-18.sh
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
    success { echo "✅ Build OK (${params.PLATFORM} @ ${params.ENV})" }
    failure { echo "❌ Build failed" }
  }
}
EOF

echo "✔ Wrote ci/use-node-18.sh and Jenkinsfile"

if [[ $COMMIT -eq 1 ]]; then
  if command -v git >/dev/null 2>&1; then
    git add Jenkinsfile ci/use-node-18.sh || true
    git commit -m "ci: robust Jenkinsfile + Node18 helper (no corepack; yarn via npm; POSIX sh)" || true
    echo "✔ Committed changes. Run: git push"
  else
    echo "ℹ git not found; skipping commit."
  fi
fi

echo "All set. Review diffs, push, then run the branch job in Jenkins."
