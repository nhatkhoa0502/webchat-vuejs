module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    "plugin:vue/vue3-essential",
    "eslint:recommended",
    "plugin:prettier/recommended",
  ],
  parserOptions: {
    parser: "@babel/eslint-parser",
  },
  globals: {
    defineProps: "readonly",
    defineEmits: "readonly",
    defineExpose: "readonly",
    withDefaults: "readonly",
  },
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
    "linebreak-style": "off", // Tắt kiểm tra kiểu dòng kết thúc
    "prettier/prettier": ["error", { endOfLine: "auto" }], // Cấu hình Prettier bỏ qua lỗi end-of-line
  },
};
