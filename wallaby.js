module.exports = function(wallaby) {
  const babel = wallaby.compilers.babel({
    babel: require("@babel/core")
  })
  return {
    files: [
      "package.json",
      "tsconfig.json",
      "src/**/*.ts",
      { pattern: "dist/*.js", instrument: false },
      "__tests__/*.ts",
      "__tests__/setup.js",
      "__tests__/test-pages/*",
      "__tests__/**/browser-tests-config.ts"
      // { pattern: '__tests__/**/*.test.ts', instrument: false },
    ],

    tests: ["!__tests__/browser/**/*.test.ts", "__tests__/**/*.test.ts"],

    env: {
      type: "node",
      runner: "node"
    },

    testFramework: "jest",

    preprocessors: {
      "src/**/*.js": babel,
      "__tests__/**/*.js": babel
    },

    hints: {
      ignoreCoverage: /istanbul ignore next/
    },

    debug: true
  }
}
