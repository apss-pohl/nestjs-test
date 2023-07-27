module.exports = {
  extends: [
    'stylelint-config-recommended-scss',
    'stylelint-config-prettier-scss',
    'stylelint-config-recommended-vue', // add overrides for .Vue files
    'stylelint-config-prettier', // turn off any rules that conflict with Prettier
  ],
};
