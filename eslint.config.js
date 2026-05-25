import js from "@eslint/js"
import { defineConfig } from "rollup"
import tseslint from "typescript-eslint"

export default defineConfig([
    { ignores: ["dist/**", "coverage/**"] },
    js.configs.recommended,
    tseslint.configs.recommended,
])
