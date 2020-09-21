import { BuilderContext } from '@angular-devkit/architect';
import { workspaces } from '@angular-devkit/core';
import { NodeJsSyncHost } from '@angular-devkit/core/node';
import { join } from 'path';

export async function getProjectRoot(context: BuilderContext) {
  const workspaceHost = workspaces.createWorkspaceHost(new NodeJsSyncHost());
  const { workspace } = await workspaces.readWorkspace(
    context.workspaceRoot,
    workspaceHost
  );
  if (workspace.projects.get(context.target.project).root) {
    return join(
      context.workspaceRoot,
      workspace.projects.get(context.target.project).root
    );
  } else {
    context.reportStatus('Error');
    const message = `${context.target.project} does not have a root. Please define one.`;
    context.logger.error(message);
    throw new Error(message);
  }
}
