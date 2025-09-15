#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# QUICK START
#   chmod +x bootstrap_vehicle_tracking_ci.sh
#   JENKINS_USER="admin" \
#   JENKINS_TOKEN="1120f8110b46558bb58acbecb0faf16160" \
#   ./bootstrap_vehicle_tracking_ci.sh
#
# Optional (private repo):
#   GIT_CRED_KIND="userpass" GIT_CRED_ID="git-creds-vts" \
#   GIT_USERNAME="github-user" GIT_PASSWORD="ghp_..." \
#   ./bootstrap_vehicle_tracking_ci.sh
#
# Optional (webhook):
#   GH_REPO="harrington40/vehicle-tracking-system" GH_TOKEN="ghp_..." ./bootstrap_vehicle_tracking_ci.sh
#
# Notes:
# - iOS is disabled by default (set IOS_ENABLED=1 later when you have a mac agent).
# - Web deploy expects an SSH credential 'web-deploy-ssh' and an NGINX host (see DEPLOY_HOST).
# ==============================================================================

# ----- Fixed to your setup -----
JENKINS_URL="${JENKINS_URL:-https://jenkins.transtechologies.com}"
GIT_URL="${GIT_URL:-https://github.com/harrington40/vehicle-tracking-system.git}"
JOB_NAME="${JOB_NAME:-vehicle-tracking-mbp}"

# ----- Required from your shell -----
JENKINS_USER="${JENKINS_USER:-}"
JENKINS_TOKEN="${JENKINS_TOKEN:-}"

# ----- Optional: Jenkins Git credentials & labels -----
GIT_CRED_KIND="${GIT_CRED_KIND:-}"   # "userpass" or "ssh"
GIT_CRED_ID="${GIT_CRED_ID:-}"
GIT_USERNAME="${GIT_USERNAME:-}"
GIT_PASSWORD="${GIT_PASSWORD:-}"
GIT_SSH_PRIVATE_KEY="${GIT_SSH_PRIVATE_KEY:-}"
GIT_SSH_PASSPHRASE="${GIT_SSH_PASSPHRASE:-}"

ANDROID_LABEL="${ANDROID_LABEL:-linux && android}"
MAC_LABEL="${MAC_LABEL:-mac}"
IOS_ENABLED="${IOS_ENABLED:-0}"  # 0 = skip iOS until you have a macOS agent

# ----- Web deploy destinations per ENV (edit hostnames if needed) -----
# All envs deploy to the same host with different domains; change as you wish.
DEPLOY_HOST="${DEPLOY_HOST:-deploy.transtechologies.com}"
DOMAIN_TEST="${DOMAIN_TEST:-app-test.transtechologies.com}"
DOMAIN_STAGING="${DOMAIN_STAGING:-app-staging.transtechologies.com}"
DOMAIN_PROD="${DOMAIN_PROD:-app.transtechologies.com}"

# ----- Android signing creds (should already exist in Jenkins) -----
ANDROID_KEYSTORE_ID="${ANDROID_KEYSTORE_ID:-android-keystore}"
ANDROID_KEY_ALIAS_ID="${ANDROID_KEY_ALIAS_ID:-android-key-alias}"
ANDROID_KEY_PASS_ID="${ANDROID_KEY_PASS_ID:-android-key-pass}"
ANDROID_STORE_PASS_ID="${ANDROID_STORE_PASS_ID:-android-store-pass}"

# ----- Store deploy placeholders -----
# These control whether to actually attempt store uploads.
# Leave at 0 now; set to 1 later when you add credentials.
ENABLE_PLAY_DEPLOY="${ENABLE_PLAY_DEPLOY:-0}"
ENABLE_APPSTORE_DEPLOY="${ENABLE_APPSTORE_DEPLOY:-0}"

# ----- Optional GitHub webhook -----
GH_REPO="${GH_REPO:-}"   # e.g., "harrington40/vehicle-tracking-system"
GH_TOKEN="${GH_TOKEN:-}"

need() { command -v "$1" >/dev/null 2>&1 || { echo "Missing '$1'." >&2; exit 1; }; }
need curl; need sed

require_env() { [ -n "${!1:-}" ] || { echo "Env var $1 is required"; exit 1; }; }
require_env JENKINS_USER
require_env JENKINS_TOKEN

# Jenkins helpers
JAPI() { curl -fsSL -u "${JENKINS_USER}:${JENKINS_TOKEN}" -H "Content-Type:application/xml" -X "$1" "$2" "${@:3}"; }

echo "→ Scaffolding repo files…"
mkdir -p ci

# Node 18 helper
cat > ci/use-node-18.sh <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
export NVM_DIR="$HOME/.nvm"
if [ ! -s "$NVM_DIR/nvm.sh" ]; then
  curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
fi
. "$NVM_DIR/nvm.sh"
nvm install 18 >/dev/null
nvm use 18 >/dev/null
node -v
corepack enable || true
corepack prepare yarn@stable --activate || true
yarn -v || true
EOF
chmod +x ci/use-node-18.sh

# Env files
[ -f .env.test ] || cat > .env.test <<'EOF'
APP_ENV=test
APP_NAME=VTracking (Test)
API_BASE_URL=https://api-test.example.com
EOF
[ -f .env.staging ] || cat > .env.staging <<'EOF'
APP_ENV=staging
APP_NAME=VTracking (Staging)
API_BASE_URL=https://api-staging.example.com
EOF
[ -f .env.production ] || cat > .env.production <<'EOF'
APP_ENV=production
APP_NAME=VTracking
API_BASE_URL=https://api.example.com
EOF

# app.config.ts
if [ ! -f app.config.ts ]; then
cat > app.config.ts <<'EOF'
import * as fs from 'fs';
import * as path from 'path';

function loadEnv(appEnv: string) {
  const envPath = path.join(process.cwd(), `.env.${appEnv}`);
  if (fs.existsSync(envPath)) {
    const dotenv = require('dotenv');
    const dotenvExpand = require('dotenv-expand');
    const out = dotenv.config({ path: envPath });
    dotenvExpand.expand(out);
  }
}

export default () => {
  const APP_ENV = process.env.APP_ENV || 'test';
  loadEnv(APP_ENV);
  return {
    name: process.env.APP_NAME || 'VTracking',
    slug: 'vehicle-tracking-system',
    scheme: 'vtracking',
    extra: {
      APP_ENV,
      APP_NAME: process.env.APP_NAME,
      API_BASE_URL: process.env.API_BASE_URL
    },
    platforms: ['ios','android','web'],
    ios: {
      bundleIdentifier:
        APP_ENV === 'production'
          ? 'com.transtech.vtracking'
          : APP_ENV === 'staging'
          ? 'com.transtech.vtracking.staging'
          : 'com.transtech.vtracking.test'
    },
    android: {
      package:
        APP_ENV === 'production'
          ? 'com.transtech.vtracking'
          : APP_ENV === 'staging'
          ? 'com.transtech.vtracking.staging'
          : 'com.transtech.vtracking.test'
    },
    web: { bundler: 'metro', output: 'static' }
  };
};
EOF
fi

# Ensure Node engines=18.x
if grep -q '"engines"' package.json 2>/dev/null; then
  sed -i 's/"node":[^,}]*"/"node":"18.x"/' package.json || true
else
  sed -i '0,/"private": *true/s//"private": true,\n  "engines": { "node": "18.x" }/' package.json || true
fi

# Jenkinsfile with:
#  - Build Android/iOS/Web
#  - Deploy Web (active)
#  - Play/App Store deploy placeholders (skip until enabled)
cat > Jenkinsfile <<'EOF'
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
  options { timestamps(); ansiColor('xterm'); buildDiscarder(logRotator(numToKeepStr: '30')); timeout(time: 75, unit: 'MINUTES'); disableConcurrentBuilds() }
  environment {
    NODE_OPTIONS = "--max-old-space-size=4096"
    GRADLE_USER_HOME = "\${WORKSPACE}/.gradle"
    WEB_OUT = "web-dist"

    // Android signing credentials (must exist)
    ANDROID_KEYSTORE_ID   = '${ANDROID_KEYSTORE_ID}'
    ANDROID_KEY_ALIAS_ID  = '${ANDROID_KEY_ALIAS_ID}'
    ANDROID_KEY_PASS_ID   = '${ANDROID_KEY_PASS_ID}'
    ANDROID_STORE_PASS_ID = '${ANDROID_STORE_PASS_ID}'

    // Labels & toggles injected from bootstrap script
    ANDROID_LABEL = '${ANDROID_LABEL}'
    MAC_LABEL     = '${MAC_LABEL}'
    IOS_ENABLED   = '${IOS_ENABLED}'
    ENABLE_PLAY_DEPLOY    = '${ENABLE_PLAY_DEPLOY}'
    ENABLE_APPSTORE_DEPLOY= '${ENABLE_APPSTORE_DEPLOY}'
  }

  stages {
    stage('Checkout') { steps { checkout scm; sh 'git --no-pager log -1 --pretty=oneline || true' } }

    stage('Node 18 + install') {
      steps {
        sh '''
          set -e
          ./ci/use-node-18.sh
          if \$CLEAN_NODE_MODULES; then rm -rf node_modules; fi
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
      agent { label "\${ANDROID_LABEL}" }
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
            export APP_ENV="\${ENV}"

            case "\${ENV}" in
              test) FLAVOR="Test" ;;
              staging) FLAVOR="Staging" ;;
              production) FLAVOR="Production" ;;
            esac

            cd android
            mkdir -p ~/.gradle
            cat > ~/.gradle/gradle.properties <<EOF2
ORG_GRADLE_PROJECT_StorePassword=\${STORE_PASS}
ORG_GRADLE_PROJECT_KeyPassword=\${KEY_PASS}
ORG_GRADLE_PROJECT_KeyAlias=\${KEY_ALIAS}
EOF2
            cp "\${KEYSTORE_FILE}" app/release.keystore || true

            ./gradlew --no-daemon clean
            if [ "\${USE_AAB}" = "true" ]; then
              ./gradlew --no-daemon bundle\${FLAVOR}\${BUILD_TYPE}
            else
              ./gradlew --no-daemon assemble\${FLAVOR}\${BUILD_TYPE}
            fi
          '''
        }
      }
      post { always { archiveArtifacts artifacts: 'android/app/build/outputs/**', allowEmptyArchive: true } }
    }

    stage('iOS') {
      when { anyOf { expression { params.PLATFORM in ['ios','all'] && env.IOS_ENABLED == '1' } } }
      agent { label "\${MAC_LABEL}" }
      steps {
        sh '''
          set -e
          ./ci/use-node-18.sh
          export APP_ENV="\${ENV}"
          npx pod-install ios

          case "\${ENV}" in
            test) SCHEME="VTracking Test";      EXPORT="ios/exportOptions.test.plist" ;;
            staging) SCHEME="VTracking Staging"; EXPORT="ios/exportOptions.staging.plist" ;;
            production) SCHEME="VTracking";     EXPORT="ios/exportOptions.prod.plist" ;;
          esac

          mkdir -p ios/build
          xcodebuild -workspace ios/VTracking.xcworkspace \
            -scheme "\${SCHEME}" -configuration Release -sdk iphoneos \
            -archivePath ios/build/\${SCHEME}.xcarchive archive | xcpretty

          xcodebuild -exportArchive -archivePath ios/build/\${SCHEME}.xcarchive \
            -exportOptionsPlist \${EXPORT} -exportPath ios/build | xcpretty
        '''
      }
      post { always { archiveArtifacts artifacts: 'ios/build/**', allowEmptyArchive: true } }
    }

    stage('Web Build') {
      when { anyOf { expression { params.PLATFORM in ['web','all'] } } }
      steps {
        sh '''
          set -e
          ./ci/use-node-18.sh
          export APP_ENV="\${ENV}"
          npx expo export --platform web --output-dir "\${WEB_OUT}"
          echo "User-agent: *\nDisallow:" > \${WEB_OUT}/robots.txt
        '''
      }
      post { always { archiveArtifacts artifacts: '\${WEB_OUT}/**', allowEmptyArchive: true } }
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
            export APP_ENV="\${ENV}"

            case "\${ENV}" in
              test)       DOMAIN="${DOMAIN_TEST}" ;;
              staging)    DOMAIN="${DOMAIN_STAGING}" ;;
              production) DOMAIN="${DOMAIN_PROD}" ;;
            esac

            RELEASE="$(git rev-parse --short=12 HEAD)"
            TAR="site-${RELEASE}.tar.gz"
            tar -C "\${WEB_OUT}" -czf "\${TAR}" .

            rsync -e "ssh -i \${SSH_KEY} -o StrictHostKeyChecking=no" -avz "\${TAR}" \
              "\${SSH_USER}@${DEPLOY_HOST}:/tmp/"

            ssh -i "\${SSH_KEY}" -o StrictHostKeyChecking=no "\${SSH_USER}@${DEPLOY_HOST}" bash -euxo pipefail <<'EOS'
              RELEASE="${RELEASE}"
              DEPLOY_DIR="/var/www/vtracking"
              RELEASE_DIR="\${DEPLOY_DIR}/releases/\${RELEASE}"
              mkdir -p "\${DEPLOY_DIR}/releases"
              mkdir -p "\${RELEASE_DIR}"
              tar -C "\${RELEASE_DIR}" -xzf "/tmp/site-\${RELEASE}.tar.gz"
              ln -sfn "\${RELEASE_DIR}" "\${DEPLOY_DIR}/current"
              sudo nginx -t && sudo systemctl reload nginx
              rm -f "/tmp/site-\${RELEASE}.tar.gz"
EOS
            curl -fsS "https://\${DOMAIN}/health"
          '''
        }
      }
    }

    // ----------------- PLACEHOLDERS: Store deploys (skipped until enabled) -----------------

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
            // Place the real fastlane call here once enabled.
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
            // Place the real fastlane call here once enabled.
          }
        }
      }
    }
  }

  post {
    success { echo "✅ Build OK (\${params.PLATFORM} @ \${params.ENV})" }
    failure { echo "❌ Build failed" }
  }
}
EOF

echo "✔ Repo scaffolding complete."

# Jenkins credentials (optional)
if [ -n "${GIT_CRED_KIND}" ] && [ -n "${GIT_CRED_ID}" ]; then
  echo "→ Upserting Jenkins Git credentials (${GIT_CRED_KIND}, id=${GIT_CRED_ID})…"
  CRUMB=$(curl -fsSL -u "${JENKINS_USER}:${JENKINS_TOKEN}" "${JENKINS_URL}/crumbIssuer/api/json" | sed -n 's/.*"crumb":"\([^"]*\)".*/\1/p' || true)
  HDR_CRUMB=()
  [ -n "$CRUMB" ] && HDR_CRUMB=(-H "Jenkins-Crumb:${CRUMB}")

  if [ "${GIT_CRED_KIND}" = "userpass" ]; then
    cat > /tmp/creds.json <<JSON
{"": "0","credentials":{"scope":"GLOBAL","id":"${GIT_CRED_ID}","username":"${GIT_USERNAME}","password":"${GIT_PASSWORD}","description":"Git creds for ${JOB_NAME}","\$class":"UsernamePasswordCredentialsImpl"}}
JSON
    curl -fsS -u "${JENKINS_USER}:${JENKINS_TOKEN}" "${HDR_CRUMB[@]}" -X POST -H "Content-Type:application/json" \
      --data-binary @/tmp/creds.json \
      "${JENKINS_URL}/credentials/store/system/domain/_/credential/${GIT_CRED_ID}/update" \
      || curl -fsS -u "${JENKINS_USER}:${JENKINS_TOKEN}" "${HDR_CRUMB[@]}" -X POST -H "Content-Type:application/json" \
      --data-binary @/tmp/creds.json \
      "${JENKINS_URL}/credentials/store/system/domain/_/createCredentials"
    rm -f /tmp/creds.json
  elif [ "${GIT_CRED_KIND}" = "ssh" ]; then
    : "${GIT_SSH_PRIVATE_KEY:?GIT_SSH_PRIVATE_KEY required for ssh kind}"
    cat > /tmp/creds.json <<JSON
{"": "0","credentials":{"scope":"GLOBAL","id":"${GIT_CRED_ID}","description":"Git SSH key for ${JOB_NAME}","username":"git","privateKeySource":{"privateKey":"${GIT_SSH_PRIVATE_KEY}","\$class":"DirectEntryPrivateKeySource"},"passphrase":"${GIT_SSH_PASSPHRASE}","\$class":"BasicSSHUserPrivateKey"}}
JSON
    curl -fsS -u "${JENKINS_USER}:${JENKINS_TOKEN}" "${HDR_CRUMB[@]}" -X POST -H "Content-Type:application/json" \
      --data-binary @/tmp/creds.json \
      "${JENKINS_URL}/credentials/store/system/domain/_/credential/${GIT_CRED_ID}/update" \
      || curl -fsS -u "${JENKINS_USER}:${JENKINS_TOKEN}" "${HDR_CRUMB[@]}" -X POST -H "Content-Type:application/json" \
      --data-binary @/tmp/creds.json \
      "${JENKINS_URL}/credentials/store/system/domain/_/createCredentials"
    rm -f /tmp/creds.json
  else
    echo "  (Skipping creds: unknown GIT_CRED_KIND=${GIT_CRED_KIND})"
  fi
else
  echo "ℹ Skipping Jenkins Git credentials (public repo or existing creds)."
fi

# Multibranch Pipeline job
echo "→ Upserting Multibranch Pipeline job '${JOB_NAME}' at ${JENKINS_URL}…"
SCM_CRED_XML=""
[ -n "${GIT_CRED_ID}" ] && SCM_CRED_XML="<credentialsId>${GIT_CRED_ID}</credentialsId>"

cat > /tmp/mbp_config.xml <<XML
<org.jenkinsci.plugins.workflow.multibranch.WorkflowMultiBranchProject plugin="workflow-multibranch">
  <properties/>
  <sources class="jenkins.branch.MultiBranchProject\$BranchSourceList" plugin="branch-api">
    <data>
      <jenkins.branch.BranchSource>
        <source class="jenkins.plugins.git.GitSCMSource" plugin="git">
          <id>auto-${JOB_NAME}</id>
          ${SCM_CRED_XML}
          <remote>${GIT_URL}</remote>
          <traits>
            <jenkins.plugins.git.traits.BranchDiscoveryTrait/>
            <jenkins.plugins.git.traits.TagDiscoveryTrait/>
          </traits>
        </source>
        <strategy class="jenkins.branch.DefaultBranchPropertyStrategy"><properties/></strategy>
      </jenkins.branch.BranchSource>
    </data>
    <owner class="org.jenkinsci.plugins.workflow.multibranch.WorkflowMultiBranchProject" reference="../.."/>
  </sources>
  <factory class="org.jenkinsci.plugins.workflow.multibranch.WorkflowBranchProjectFactory" plugin="workflow-multibranch">
    <owner class="org.jenkinsci.plugins.workflow.multibranch.WorkflowMultiBranchProject" reference="../.."/>
    <scriptPath>Jenkinsfile</scriptPath>
  </factory>
  <orphanedItemStrategy class="com.cloudbees.hudson.plugins.folder.computed.DefaultOrphanedItemStrategy">
    <pruneDeadBranches>true</pruneDeadBranches>
    <daysToKeep>-1</daysToKeep>
    <numToKeep>30</numToKeep>
  </orphanedItemStrategy>
</org.jenkinsci.plugins.workflow.multibranch.WorkflowMultiBranchProject>
XML

if curl -fsS -u "${JENKINS_USER}:${JENKINS_TOKEN}" -o /dev/null -I "${JENKINS_URL}/job/${JOB_NAME}/api/json"; then
  JAPI POST "${JENKINS_URL}/job/${JOB_NAME}/config.xml" --data-binary @/tmp/mbp_config.xml >/dev/null
  echo "✔ Updated job '${JOB_NAME}'."
else
  JAPI POST "${JENKINS_URL}/createItem?name=${JOB_NAME}" --data-binary @/tmp/mbp_config.xml >/dev/null
  echo "✔ Created job '${JOB_NAME}'."
fi
rm -f /tmp/mbp_config.xml

# Trigger initial index/scan
curl -fsS -u "${JENKINS_USER}:${JENKINS_TOKEN}" -X POST "${JENKINS_URL}/job/${JOB_NAME}/build?delay=0sec" >/dev/null || true
echo "→ Triggered initial index/scan for '${JOB_NAME}'."

# GitHub webhook (optional)
if [ -n "${GH_REPO}" ] && [ -n "${GH_TOKEN}" ]; then
  if command -v jq >/dev/null 2>&1; then
    API="https://api.github.com/repos/${GH_REPO}/hooks"
    echo "→ Ensuring GitHub webhook → ${JENKINS_URL}/github-webhook/"
    EXIST=$(curl -fsS -H "Authorization: Bearer ${GH_TOKEN}" "${API}" | jq -r '.[] | select(.config.url=="'"${JENKINS_URL}/github-webhook/"'") | .id' || true)
    if [ -z "${EXIST}" ]; then
      curl -fsS -X POST -H "Authorization: Bearer ${GH_TOKEN}" -H "Content-Type: application/json" \
        --data "{\"name\":\"web\",\"active\":true,\"events\":[\"push\",\"pull_request\"],\"config\":{\"url\":\"${JENKINS_URL}/github-webhook/\",\"content_type\":\"json\",\"insecure_ssl\":\"0\"}}" \
        "${API}" >/dev/null
      echo "✔ Webhook created."
    else
      echo "✔ Webhook already exists (id=${EXIST})."
    fi
  else
    echo "ℹ jq not found — skipping webhook management."
  fi
else
  echo "ℹ Skipping GitHub webhook (GH_REPO/GH_TOKEN not provided)."
fi

echo "✅ Done. Open: ${JENKINS_URL}/job/${JOB_NAME}/"
