import { createBazelBuildAspectCommand } from '../../compilationDatabase';
import * as assert from 'assert';
import * as fs from 'fs';
import * as tmp from 'tmp';
import path = require('path');
import { ExecException, execFile } from 'child_process';
import { assertType } from 'vscode-common/out/types';

suite('Compilation Database', () => {

    test('createBazelBuildAspectCommand', () => {
        const repoPath = '/path/to/this/extension/compdb';
        const tmpFile = '/tmp/build-events.json';
        const buildArgs: string[] = ["--config=foo"];
        const targets: string[] = ['//app/a', '//app/b'];

        const cmd = createBazelBuildAspectCommand(
            repoPath,
            tmpFile,
            buildArgs,
            targets,
        );

        assert.deepStrictEqual([
            'build',
            '--override_repository=bazel_vscode_compdb=/path/to/this/extension/compdb',
            '--aspects=@bazel_vscode_compdb//:aspects.bzl%compilation_database_aspect',
            '--color=no',
            '--noshow_progress',
            '--noshow_loading_progress',
            '--output_groups=compdb_files,header_files',
            '--build_event_json_file=/tmp/build-events.json',
            '--config=foo',
            '//app/a',
            '//app/b',
            '&&',
            '/path/to/this/extension/compdb/postprocess.py',
            '-b',
            '/tmp/build-events.json',
            '&&',
            'rm',
            '/tmp/build-events.json',
        ], cmd);
    });

    test('postprocess.py exists', async () => {
        const extensionDevelopmentPath = path.resolve(__dirname, '../../..');
        const postprocessPy = path.join(extensionDevelopmentPath, 'compdb/postprocess.py');
        assert.ok(fs.existsSync(postprocessPy));

        // prep temp files
        const tmpDir = tmp.dirSync().name;
        const buildEventsJsonTempFile = path.join(tmpDir, 'build-events.json');
        const fooCommandsFile = path.join(tmpDir, 'foo.compile_commands.json');
        const barCommandsFile = path.join(tmpDir, 'bar.compile_commands.json');
        const compileCommandsFile = path.join(tmpDir, 'compile_commands.json');

        fs.writeFileSync(fooCommandsFile, JSON.stringify([
            {
                command: "external/local_config_cc/cc_wrapper.sh -iquote . app/a/foo.cpp",
                directory: "__EXEC_ROOT__",
                file: "app/a/foo.cpp",
            },
        ]));
        fs.writeFileSync(barCommandsFile, JSON.stringify([
            {
                command: "external/local_config_cc/cc_wrapper.sh -iquote . app/a/bar.cpp",
                directory: "__EXEC_ROOT__",
                file: "app/a/bar.cpp",
            },
        ]));

        // write fake build events as a file where every line is a JSON object
        const events = [
            JSON.stringify({
                started: {
                    workspaceDirectory: tmpDir,
                },
            }),
            JSON.stringify({
                workspaceInfo: {
                    localExecRoot: tmpDir,
                },
            }),
            JSON.stringify({
                progress: {
                    stderr: [
                        '  ' + fooCommandsFile,
                        '  ' + barCommandsFile,
                    ].join('\n'),
                },
            }),
        ];

        fs.writeFileSync(buildEventsJsonTempFile, events.join('\n'));
        const postprocessArgs = ['--build_events_json_file', buildEventsJsonTempFile];

        await new Promise<void>((resolve, reject) => {
            execFile(postprocessPy, postprocessArgs, {}, (err: ExecException | null, stdout: string | Buffer, stderr: string | Buffer) => {
                if (err) {
                    reject(err);
                    return;
                }
                console.log('OUT', stdout);
                console.log('ERR', stderr);
                resolve();
            });
        });

        assert.ok(fs.existsSync(compileCommandsFile));

        const jsonContent = fs.readFileSync(compileCommandsFile).toString()
            .split(tmpDir).join('__TMPDIR__');
        const compileCommands = JSON.parse(jsonContent);

        assert.deepStrictEqual(compileCommands,
            [
                {
                    command: 'external/local_config_cc/cc_wrapper.sh -I . app/a/foo.cpp',
                    directory: '__TMPDIR__',
                    file: 'app/a/foo.cpp'
                },
                {
                    command: 'external/local_config_cc/cc_wrapper.sh -I . app/a/bar.cpp',
                    directory: '__TMPDIR__',
                    file: 'app/a/bar.cpp'
                }
            ]
        );
    });
});
