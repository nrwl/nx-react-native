import { of } from 'rxjs';
import { MockBuilderContext } from '@nrwl/workspace/testing';

import { getMockContext } from '../../utils/testing';
import { isPackagerRunning } from './lib/is-packager-running';
import { startAsync } from './start.impl';

jest.mock('./lib/start-async');
jest.mock('./lib/is-packager-running');

jest.mock('../../utils/ensure-node-modules-symlink', () => ({
  ensureNodeModulesSymlink: () => {
    // nothing
  },
}));

jest.mock('../../utils/get-project-root', () => ({
  getProjectRoot: () => of('/root/app'),
}));

describe('Start JS Bundler', () => {
  let context: MockBuilderContext;
  let mockStartAsync: jest.MockedFunction<typeof startAsync>;
  let mockIsPackagerRunning: jest.MockedFunction<typeof isPackagerRunning>;

  beforeEach(async () => {
    jest.clearAllMocks();

    context = await getMockContext();
    context.getProjectMetadata = jest
      .fn()
      .mockReturnValue({ sourceRoot: '/root/app/src' });

    context.getTargetOptions = jest.fn().mockReturnValue({});

    mockStartAsync = startAsync as jest.MockedFunction<typeof startAsync>;
    mockIsPackagerRunning = isPackagerRunning as jest.MockedFunction<
      typeof isPackagerRunning
    >;
  });

  it('should notify with `baseHref` when packager is running', (done) => {
    mockStartAsync.mockImplementation(
      () =>
        new Promise(() => {
          /* don't complete */
        })
    );

    const statusCheckResultSequence = [
      'not_running',
      'not_running',
      'not_running',
      'unrecognized',
      'unrecognized',
      'running',
    ].map((x) => Promise.resolve(x)) as ReturnType<typeof isPackagerRunning>[];
    let callNum = 0;
    mockIsPackagerRunning.mockImplementation(() => {
      return statusCheckResultSequence[callNum++];
    });

    const sub = run({ host: 'localhost', port: 5000 }, context).subscribe(
      (result) => {
        expect(result).toEqual({
          baseUrl: 'http://localhost:5000',
          success: true,
        });

        expect(mockStartAsync).toHaveBeenCalledWith('/root', '/root/app', {
          host: 'localhost',
          port: 5000,
        });

        sub.unsubscribe();
        done();
      }
    );
  }, 10000);
});
