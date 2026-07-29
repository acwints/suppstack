#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '../..');
const packageFile = path.join(projectRoot, 'ios/App/CapApp-SPM/Package.swift');
const nativeConfigFile = path.join(projectRoot, 'ios/App/App/capacitor.config.json');
const generatedResolutionFile = path.join(
  projectRoot,
  'ios/App/App.xcodeproj/project.xcworkspace/xcshareddata/swiftpm/Package.resolved'
);

await runCapacitorSync();
await restorePinnedCapacitorPackage();
await restoreCustomHealthPlugin();
await rm(generatedResolutionFile, { force: true });

console.log('iOS sync complete; restored pinned Capacitor binaries and SuppStackHealthPlugin.');

function runCapacitorSync() {
  return new Promise((resolve, reject) => {
    const child = spawn('npx', ['cap', 'sync', 'ios'], {
      cwd: projectRoot,
      stdio: 'inherit',
    });

    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Capacitor sync exited with code ${code}`));
      }
    });
  });
}

async function restorePinnedCapacitorPackage() {
  const generated = await readFile(packageFile, 'utf8');
  const replacements = [
    [
      '.package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", exact: "8.4.1")',
      '.package(name: "CapacitorBinaries", path: "../CapacitorBinaries")',
    ],
    [
      '.product(name: "Capacitor", package: "capacitor-swift-pm")',
      '.product(name: "Capacitor", package: "CapacitorBinaries")',
    ],
    [
      '.product(name: "Cordova", package: "capacitor-swift-pm")',
      '.product(name: "Cordova", package: "CapacitorBinaries")',
    ],
  ];

  let restored = generated;
  for (const [from, to] of replacements) {
    if (!restored.includes(from)) {
      throw new Error(`Capacitor generated an unexpected Package.swift; missing: ${from}`);
    }
    restored = restored.replace(from, to);
  }

  await writeFile(packageFile, restored);
}

async function restoreCustomHealthPlugin() {
  const config = JSON.parse(await readFile(nativeConfigFile, 'utf8'));
  const classList = Array.isArray(config.packageClassList) ? config.packageClassList : [];
  if (!classList.includes('SuppStackHealthPlugin')) {
    classList.push('SuppStackHealthPlugin');
  }
  config.packageClassList = classList;

  await writeFile(nativeConfigFile, `${JSON.stringify(config, null, '\t')}\n`);
}
