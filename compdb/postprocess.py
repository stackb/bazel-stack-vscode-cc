#!/usr/bin/python3

# Copyright 2021 GRAIL, Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

"""Generates a compile_commands.json file at $(bazel info workspace) for
libclang based tools.

Derived from
https://github.com/grailbio/bazel-compilation-database/blob/08d706d3cf7daf3d529a26ca76d75da1a3eae6c0/generate.py
"""

import argparse
import json
import os
import pathlib
import subprocess
import tempfile


if __name__ == "__main__":
    ##
    ## Setup Args
    ##
    parser = argparse.ArgumentParser()
    parser.add_argument("-s", "--source_dir", default=False, action="store_true",
                        help="use the original source directory instead of bazel execroot")
    parser.add_argument("-b", "--build_events_json_file",
                        help="build events json file from the compilation aspect")
    args = parser.parse_args()

    ##
    ## Parse Build Events
    ##
    print("Gathering output files...")

    local_exec_root = '__EXEC_ROOT__'
    workspace_directory = '__WORKSPACE__'
    bazel_stderr = []
    with open(args.build_events_json_file, 'r') as f:
        for line in f:
            event = json.loads(line)
            if 'started' in event:
                workspace_directory = event['started']['workspaceDirectory']
                print("Workspace Directory:", workspace_directory)
            elif 'progress' in event:
                if 'stderr' in event['progress']:                  
                    bazel_stderr.extend(event['progress']['stderr'].splitlines())
            elif 'workspaceInfo' in event:
                local_exec_root = event['workspaceInfo']['localExecRoot']
                print('Execution Root:', local_exec_root)

    compile_command_json_db_files = []
    for line in bazel_stderr:
        if line.endswith('.compile_commands.json'):
            compile_command_json_db_files.append(line.strip())

    ##
    ## Collect/Fix/Merge Compilation Databases
    ##
    print("Preparing compilation database...")

    db_entries = []
    for db in compile_command_json_db_files:
            with open(db, 'r') as f:
                db_entries.extend(json.load(f))

    def fix_db_entry(db_entry):
        if 'directory' in db_entry and db_entry['directory'] == '__EXEC_ROOT__':
            db_entry['directory'] = bazel_workspace if args.source_dir else local_exec_root
        # TODO: research better if this is advantageous
        # if 'file' in db_entry and db_entry['file'].startswith(bazel_bin):
        #     db_entry['file'] = db_entry['file'][len(bazel_bin)+1:]
        if 'command' in db_entry:
            command = db_entry['command']
            if command:
                command = command.replace('-isysroot __BAZEL_XCODE_SDKROOT__', '')
                # -iquote seems to misbehave with vscode
                command = command.replace('-iquote', '-I')
                db_entry['command'] = command
        return db_entry
    db_entries = list(map(fix_db_entry, db_entries))

    compdb_file = os.path.join(workspace_directory, "compile_commands.json")

    with open(compdb_file, 'w') as outdb:
        json.dump(db_entries, outdb, indent=2)

    print("DONE", compdb_file)

    ##
    ## Colophon
    ##
    if args.source_dir:
        link_name = os.path.join(bazel_workspace, 'external')
        try:
            os.remove(link_name)
        except FileNotFoundError:
            pass
        # This is for libclang to help find source files from external repositories.
        os.symlink(os.path.join(local_exec_root, 'external'),
                   link_name,
                   target_is_directory=True)
