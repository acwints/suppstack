import { execFileSync } from 'node:child_process';

const requestedDevice = process.argv[2];
const { devices } = JSON.parse(
  execFileSync('xcrun', ['simctl', 'list', 'devices', 'booted', '--json'], { encoding: 'utf8' })
);
const booted = Object.values(devices).flat().filter((device) => device.state === 'Booted');
const matches = requestedDevice
  ? booted.filter((device) => device.name === requestedDevice || device.udid === requestedDevice)
  : booted.length === 1
    ? booted
    : booted.filter((device) => device.name === 'iPhone 18 Pro Max');

if (matches.length !== 1) {
  console.error('Boot an iOS simulator and run npm run ios:run -- "<device name or UDID>".');
  process.exit(1);
}

const { name, udid } = matches[0];
const derivedData = `ios/DerivedData/${udid}`;
const app = `${derivedData}/Build/Products/Debug-iphonesimulator/App.app`;
const run = (command, args) => execFileSync(command, args, { stdio: 'inherit' });

console.log(`Building SuppStack for ${name}`);
run('npm', ['run', 'ios:sync']);
run('xcodebuild', [
  '-project', 'ios/App/App.xcodeproj',
  '-scheme', 'App',
  '-configuration', 'Debug',
  '-destination', `id=${udid}`,
  '-derivedDataPath', derivedData,
  'build',
]);
run('xcrun', ['simctl', 'install', udid, app]);
run('xcrun', ['simctl', 'launch', '--terminate-running-process', udid, 'app.suppstack']);
