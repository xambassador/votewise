import type { UserConfig } from "@commitlint/types";

const Configuration: UserConfig = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "chore",
        "docs",
        "style",
        "refactor",
        "perf",
        "test",
        "build",
        "ci",
        "revert",
        "wip",
        "release",
        "merge",
        "deploy",
        "config",
        "security",
        "breaking",
        "upgrade",
        "downgrade",
        "lint",
        "types",
        "deps",
        "release",
        "init"
      ]
    ]
  }
};

export default Configuration;
