import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  REQUIRED_IOS_PLUGIN_CLASSES,
  mergePackageClassList,
  packageClassListFromSource,
} from './iosPackageClassList.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

test('a cap sync that omits PurchasesPlugin still registers it', () => {
  const discovered = [
    'AppPlugin',
    'CAPBrowserPlugin',
    'SplashScreenPlugin',
    'StatusBarPlugin',
  ];
  const merged = mergePackageClassList(discovered);
  assert.deepEqual(merged, [
    ...discovered,
    'PurchasesPlugin',
    'SuppStackHealthPlugin',
    'SuppStackAppleSignInPlugin',
  ]);
});

test('merging does not duplicate a plugin Capacitor already found', () => {
  const merged = mergePackageClassList([
    'AppPlugin',
    'PurchasesPlugin',
    'StatusBarPlugin',
  ]);
  assert.equal(merged.filter((name) => name === 'PurchasesPlugin').length, 1);
  assert.equal(merged[0], 'AppPlugin');
  assert.ok(merged.includes('SuppStackHealthPlugin'));
});

test('root capacitor config and the native shell both name PurchasesPlugin', async () => {
  const source = await readFile(path.join(root, 'capacitor.config.ts'), 'utf8');
  const native = JSON.parse(
    await readFile(path.join(root, 'ios/App/App/capacitor.config.json'), 'utf8')
  );
  const fromSource = packageClassListFromSource(source);
  for (const pluginClass of REQUIRED_IOS_PLUGIN_CLASSES) {
    assert.ok(fromSource.includes(pluginClass), `capacitor.config.ts is missing ${pluginClass}`);
  }
  assert.ok(native.packageClassList.includes('PurchasesPlugin'));
  assert.deepEqual(mergePackageClassList(fromSource), fromSource);
});
