module.exports = {
    env: {
        es2021: true,
        node: true,
        mocha: true,
    },
    extends: "eslint:recommended",
    parserOptions: {
        ecmaVersion: 13,
        sourceType: "module",
    },
    rules: {
        // set all rules to off by default
        "no-console": "off",
        "no-debugger": "off",
        "no-unused-vars": "off",
        "no-undef": "off",
        "no-empty": "off",
        "no-prototype-builtins": "off",
        "no-useless-escape": "off",
        "no-constant-condition": "off",
        "no-async-promise-executor": "off",
        "no-unsafe-optional-chaining": "off",
        "no-unsafe-negation": "off",
        "no-unsafe-return": "off",
        "no-useless-catch": "off",
    },
};
