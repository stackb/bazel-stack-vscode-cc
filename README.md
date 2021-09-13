# bazel-stack-vscode-cc 

Additional support for [rules_cc](https://github.com/bazelbuild/rules_cc) in
conjunction with [bazel-stack-vscode](https://marketplace.visualstudio.com/items?itemName=StackBuild.bazel-stack-vscode)

## Features

### Clang Compilation Database

This extension provides a command `Bazel/C++: Generate Compilation Database`
(`bsv.cc.compdb.generate`) that produces a file
`${workspaceDIrectory}/compile_commmands.json`.

To setup, edit your workspace settings (search for `bsv.cc.compdb.targets`) and
configure a list of bazel labels for the `cc_binary` or `cc_library` targets
you'd like to be indexed.  The tool will then produce a command set for the
transitive closure of those top-level targets.

Works best in conjuction with <https://marketplace.visualstudio.com/items?itemName=llvm-vs-code-extensions.vscode-clangd>.
