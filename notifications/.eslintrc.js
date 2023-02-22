module.exports = {
    env: {
        es2021: true,
        node: true,
        mocha:true,
    },
    extends: 'eslint:recommended',
    parserOptions: {
        ecmaVersion: 13,
        sourceType: 'module',
    },
    rules: {
        indent: ['error', 4],
        'linebreak-style': ['error', 'unix'],
        quotes: ['error', 'single'],
        semi: ['error', 'always'],
        'no-unused-vars': ['error', { argsIgnorePattern: '^((req|res|next)$|_)' }],
        'eol-last': ['error', 'always'],
    },
};
