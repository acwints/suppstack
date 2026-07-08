#!/bin/sh
# Xcode Cloud pre-build step.
#
# Stamps the app's build number (CFBundleVersion, via CURRENT_PROJECT_VERSION)
# with Xcode Cloud's CI_BUILD_NUMBER — a plain integer that increments by one
# for every build of the workflow. No timestamps, no manual bumps.
#
# Xcode Cloud runs any executable named ci_pre_xcodebuild.sh found in a
# ci_scripts directory next to the Xcode project.
set -e

if [ -z "${CI_BUILD_NUMBER:-}" ]; then
  echo "CI_BUILD_NUMBER is not set (not running in Xcode Cloud); leaving build number unchanged."
  exit 0
fi

PBXPROJ="$CI_PRIMARY_REPOSITORY_PATH/ios/App/App.xcodeproj/project.pbxproj"

echo "Setting CURRENT_PROJECT_VERSION to $CI_BUILD_NUMBER"
sed -i '' -E "s/CURRENT_PROJECT_VERSION = [0-9]+;/CURRENT_PROJECT_VERSION = $CI_BUILD_NUMBER;/g" "$PBXPROJ"

grep -n "CURRENT_PROJECT_VERSION" "$PBXPROJ"
