import { builtinModules } from "node:module";
import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import { defineConfig } from "rollup";

export default defineConfig({
  input: "src/index.ts",
  output: {
    file: "dist/index.js",
    format: "es",
  },
  external: (id) => id.startsWith("node:") || builtinModules.includes(id),
  plugins: [
    nodeResolve({ exportConditions: ["node"], preferBuiltins: true }),
    commonjs(),
    typescript({
      tsconfig: "./tsconfig.json",
      declaration: false,
      declarationMap: false,
      sourceMap: false,
      inlineSources: false,
    }),
  ],
});
