import * as vscode from 'vscode';
import path = require('path');

export class Container {
    private static _context: vscode.ExtensionContext;

    static initialize(context: vscode.ExtensionContext) {
        Container._context = context;
    }

    public static get context(): vscode.ExtensionContext {
        return Container._context;
    }

    static get workspace(): vscode.Memento {
        return Container._context.workspaceState;
    }

    static get workspaceFolderFsPath(): string | undefined {
        const folders = vscode.workspace.workspaceFolders;
        if (!folders) {
            return undefined;
        }
        if (!folders.length) {
            return undefined;
        }
        return folders[0].uri.fsPath;
    }

    static file(...names: string[]): vscode.Uri {
        return vscode.Uri.file(path.join(Container._context.extensionPath, ...names));
    }

}
