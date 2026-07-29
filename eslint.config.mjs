import { defineConfig, globalIgnores } from 'eslint/config';
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';

const eslintConfig = defineConfig([
  ...nextCoreWebVitals,
  {
    // This app intentionally synchronizes browser/native state and async data
    // inside effects. Keep that established pattern while the React 19 upgrade
    // is isolated from broader state-management refactors.
    rules: {
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  globalIgnores([
    'node_modules/**',
    '.next/**',
    '.vercel/**',
    'out/**',
    'build/**',
    'ios/App/App/public/**',
    'ios/App/CapacitorBinaries/**',
    'ios/DerivedData/**',
    'ios/DerivedData.nosync/**',
    'next-env.d.ts',
  ]),
]);

export default eslintConfig;
