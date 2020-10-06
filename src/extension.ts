import { registerProblemMatchers } from 'bazel-stack-vscode-api';
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	registerProblemMatchers(context);
}

export function deactivate() {}
