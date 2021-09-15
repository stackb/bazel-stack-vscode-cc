import { createBazelBuildAspectCommand } from "../../compilation_database";
import * as assert from 'assert';

suite('Compilation Database', () => {

    test('createBazelBuildAspectCommand', () => {
        const repoPath = '/path/to/this/extension/compdb';
        const tmpFile = '/tmp/build-events.json';
        const buildArgs: string[] = [];
        const targets: string[] = [];

        const cmd = createBazelBuildAspectCommand(
            repoPath,
            tmpFile,
            buildArgs,
            targets,
        );

        assert.deepStrictEqual([
            "build",
            "--override_repository=bazel_vscode_compdb=/path/to/this/extension/compdb",
            "--aspects=@bazel_vscode_compdb//:aspects.bzl%compilation_database_aspect",
            "--color=no",
            "--noshow_progress",
            "--noshow_loading_progress",
            "--output_groups=compdb_files,header_files",
            "--build_event_json_file=/tmp/build-events.json",
            "&&",
            "/path/to/this/extension/compdb/postprocess.py",
            "-b",
            "/tmp/build-events.json",
            "&&",
            "rm",
            "/tmp/build-events.json",
        ], cmd);
    });

});
