module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
  // @testing-library/react-native v14 busca internamente 'test-renderer',
  // que en el ecosistema React Native se llama 'react-test-renderer'.
  // Este alias resuelve ese mismatch sin instalar paquetes adicionales.
  moduleNameMapper: {
    '^test-renderer$': 'react-test-renderer',
    '^test-renderer/(.*)$': 'react-test-renderer/$1',
  },
  collectCoverage: true,
  collectCoverageFrom: [
    'utils/**/*.js',
    'context/**/*.{js,jsx}',
    'components/**/*.{js,jsx}',
    '!**/node_modules/**',
  ],
  coverageReporters: ['text', 'lcov', 'html'],
};
