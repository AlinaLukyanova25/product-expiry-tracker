const eslintRecommended = require('@eslint/js').configs.recommended;

module.exports = [
  {
    // Применяем базовые рекомендации ESLint
    ...eslintRecommended,
    files: ['js/**/*.js'],
    rules: {
      'semi': ['error', 'always'],
      'no-unused-vars': 'warn',
      'quotes': ['error', 'single'],
      'indent': ['error', 2]
    }
  }
];