# bazel-stack-vscode-cc 

Additional support for [rules_cc](https://github.com/bazelbuild/rules_cc) in
conjunction with [bazel-stack-vscode](https://marketplace.visualstudio.com/items?itemName=StackBuild.bazel-stack-vscode)

## Features

### Clang Compilation Database

This extension provides a command `Bazel/C++: Generate Compilation Database`
(`bsv.cc.compdb.generate`) that produces a file
`${workspaceDirectory}/compile_commmands.json` that assists with Intellisense
for Bazel/C++ repositories.

To setup, edit your workspace settings (search for `bsv.cc.compdb.targets`) and
configure a list of bazel labels for the `cc_binary` or `cc_library` targets
you'd like to be indexed.  The tool will then produce a command set for the
transitive closure of those top-level targets.

This can be added to your `.vscode/settings.json` and checked-in to VCS as
follows:

```json
{
    ...
    "bsv.cc.compdb.targets": [
        "//app/foo:foo_binary",
        "//app/bar:bar_binary",
        "//app/baz:baz_binary",
    ]
}
```

Works best in conjuction with
<https://marketplace.visualstudio.com/items?itemName=llvm-vs-code-extensions.vscode-clangd>.

This feature was derived from <https://github.com/grailbio/bazel-compilation-database>.
