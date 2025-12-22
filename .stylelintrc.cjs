module.exports = {
  extends: [
    "stylelint-config-standard-scss",
    "stylelint-config-clean-order"
  ],
  rules: {
    "selector-pseudo-class-no-unknown": [
      true,
      {
        ignorePseudoClasses: [
          "global"
        ]
      }
    ],
    "block-no-empty": null,
    "color-function-notation": null,
    "selector-class-pattern": null,
    "no-empty-source": null
  }
};

