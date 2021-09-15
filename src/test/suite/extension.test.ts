import { ProblemMatcherTest, ProblemMatcherTestRunner } from 'bazel-stack-vscode-api/out/test/problemMatcherTestRunner';
import * as path from 'path';
import * as vscode from 'vscode';
import { markers } from 'vscode-common';

suite('Problem Matchers', () => {
	let runner: ProblemMatcherTestRunner;

	setup(() => {
		runner = ProblemMatcherTestRunner.fromPackageJson(path.join(__dirname, '..', '..', '..', 'package.json'));
	});

	const cases: ProblemMatcherTest[] = [
		{
			name: 'CppCompile',
			example: './absl/random/bernoulli_distribution.h:123:37: error: no member named \'param_type\'',
			uri: 'file:///%24%7BworkspaceRoot%7D/absl/random/bernoulli_distribution.h',
			markers: [{
				message: 'no member named \'param_type\'',
				owner: 'CppCompile',
				resource: vscode.Uri.file('./absl/random/bernoulli_distribution.h'),
				severity: markers.MarkerSeverity.Error,
				startLineNumber: 123,
				startColumn: 37,
				endLineNumber: 123,
				endColumn: 37,
			}],
		}
	];

	cases.forEach((tc) => {
		test(tc.d || tc.name, async () => runner.test(tc));
	});

});
