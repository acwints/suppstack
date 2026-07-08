#!/bin/sh
# Xcode Cloud post-clone step.
#
# The Xcode project's Swift packages (CapApp-SPM) resolve Capacitor plugins
# from node_modules/@capacitor/*, so JS dependencies must be installed before
# xcodebuild resolves package dependencies on the fresh CI clone.
set -e

export HOMEBREW_NO_AUTO_UPDATE=1
export HOMEBREW_NO_INSTALL_CLEANUP=1

if ! command -v node >/dev/null 2>&1; then
  echo "Installing Node.js via Homebrew"
  brew install node
fi

node --version
npm --version

cd "$CI_PRIMARY_REPOSITORY_PATH"
npm ci --no-audit --no-fund
