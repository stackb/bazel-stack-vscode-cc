# bazel-stack-vscode-cc 

Additional support for [rules_go](https://github.com/bazelbuild/rules_go) in
conjunction with [bazel-stack-vscode](https://marketplace.visualstudio.com/items?itemName=StackBuild.bazel-stack-vscode)

> NOTE: this extension currently depends on an unreleased version of
> `bazel-stack-vscode`.  This won't work for you just yet!

## Features

Problem matcher for rules_go actions:

- [GoCompilePkg](https://github.com/bazelbuild/rules_go/blob/440d3abcfcd691f6a374bbbc7f3f6a6acfc6f6e2/go/private/actions/compilepkg.bzl#L131)
- [GoTestGenTest](https://github.com/bazelbuild/rules_go/blob/384d2909c7be2c19fc878c7caa4bcb5ad367d535/go/private/rules/test.bzl#L115)

### 1.0.0

Initial release.