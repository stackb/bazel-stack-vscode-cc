import { registerProblemMatchers } from 'bazel-stack-vscode-api';
import * as vscode from 'vscode';
import { CompilationDatabase } from './compilationDatabase';
import { Container } from './container';

export function activate(context: vscode.ExtensionContext) {
	Container.initialize(context);
	registerProblemMatchers(context);
	context.subscriptions.push(new CompilationDatabase());
}

export function deactivate() { }
