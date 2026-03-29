import path from 'path';
import { createReadStream } from 'fs';
import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import axios from 'axios';
import NodeFormData from 'form-data';
import type { IncomingMessage } from 'http';

jest.setTimeout(180000);

jest.mock('@utils/constants', () => {
  const actual = jest.requireActual('@utils/constants');
  return {
    ...actual,
    API_BASE_URL: 'http://127.0.0.1:5000/api/v1',
  };
});

const tokenState: { accessToken: string | null; refreshToken: string | null } = {
  accessToken: null,
  refreshToken: null,
};

jest.mock('@utils/tokenStorage', () => ({
  tokenStorage: {
    saveTokens: async (accessToken: string, refreshToken: string) => {
      tokenState.accessToken = accessToken;
      tokenState.refreshToken = refreshToken;
    },
    getAccessToken: async () => tokenState.accessToken,
    getRefreshToken: async () => tokenState.refreshToken,
    clearTokens: async () => {
      tokenState.accessToken = null;
      tokenState.refreshToken = null;
    },
  },
}));

import { authApi } from '@api/auth.api';
import { startupApi } from '@api/startup.api';
import { professionalApi } from '@api/professional.api';
import { requestApi } from '@api/request.api';
import { chatApi } from '@api/chat.api';
import { adminApi } from '@api/admin.api';
import { tokenStorage } from '@utils/tokenStorage';

type AuthPayload = {
  accessToken: string;
  refreshToken: string;
  user: { id?: string; _id?: string };
};

const BACKEND_ROOT = path.resolve(__dirname, '../../VouchBackend');
const PDF_PATH = 'D:\\Project\\CodeBase\\Saqib130.pdf';
const DOC_FALLBACK_PATH = path.resolve(__dirname, '../../VouchBackend/API_REFERENCE.md');
const HEALTH_URL = 'http://127.0.0.1:5000/health';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const isBackendUp = async () => {
  try {
    const response = await axios.get(HEALTH_URL, { timeout: 1500 });
    return response.status === 200;
  } catch {
    return false;
  }
};

const waitForBackend = async (timeoutMs: number) => {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    if (await isBackendUp()) {
      return;
    }
    await sleep(1000);
  }
  throw new Error('Backend did not become healthy within timeout');
};

const getUserId = (user: { id?: string; _id?: string }) => user.id ?? user._id ?? '';

/** Submit multipart form via form-data's native Node.js .submit() to bypass axios adapter issues. */
const submitNodeForm = (
  nodeForm: NodeFormData,
  urlPath: string,
  token: string,
): Promise<{ success: boolean; message?: string; data: { _id?: string } }> =>
  new Promise((resolve, reject) => {
    nodeForm.submit(
      {
        host: '127.0.0.1',
        port: 5000,
        path: urlPath,
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      },
      (err: Error | null, res: IncomingMessage) => {
        if (err) { reject(err); return; }
        let body = '';
        res.on('data', (chunk: Buffer) => { body += chunk.toString(); });
        res.on('end', () => {
          try { resolve(JSON.parse(body)); } catch { reject(new Error(`Non-JSON response: ${body}`)); }
        });
      },
    );
  });

describe('fullstack e2e: frontend API clients with live backend', () => {
  let backendProcess: ChildProcessWithoutNullStreams | null = null;
  let startedByTest = false;

  beforeAll(async () => {
    if (await isBackendUp()) {
      return;
    }

    backendProcess = spawn('npm', ['run', 'dev'], {
      cwd: BACKEND_ROOT,
      shell: true,
      env: {
        ...process.env,
        PORT: '5000',
      },
      stdio: 'pipe',
    });

    backendProcess.stdout.on('data', () => {
      // Keep stream drained to avoid process blocking on large output.
    });

    backendProcess.stderr.on('data', () => {
      // Keep stream drained to avoid process blocking on large output.
    });

    startedByTest = true;
    await waitForBackend(90000);
  });

  afterAll(async () => {
    await tokenStorage.clearTokens();

    if (startedByTest && backendProcess?.pid) {
      if (process.platform === 'win32') {
        spawn('taskkill', ['/pid', `${backendProcess.pid}`, '/t', '/f'], {
          shell: true,
          stdio: 'ignore',
        });
      } else if (!backendProcess.killed) {
        backendProcess.kill('SIGTERM');
      }
    }
  });

  test('startup and professional can complete request and messaging flow', async () => {
    const stamp = `${Date.now()}`;
    const password = 'Test1234';
    const startupEmail = `startup.e2e.${stamp}@test.com`;
    const professionalEmail = `lawyer.e2e.${stamp}@test.com`;
    let currentStep = 'init';

    const runStep = async <T>(name: string, operation: () => Promise<T>) => {
      currentStep = name;
      return operation();
    };

    try {
      const startupRegister = await runStep('register startup', () =>
        authApi.register({
          name: `Startup ${stamp}`,
          email: startupEmail,
          password,
          role: 'STARTUP',
        }),
      );
      expect(startupRegister.data.success).toBe(true);

      const professionalRegister = await runStep('register professional', () =>
        authApi.register({
          name: `Lawyer ${stamp}`,
          email: professionalEmail,
          password,
          role: 'LAWYER',
        }),
      );
      expect(professionalRegister.data.success).toBe(true);

      const startupLogin = await runStep('login startup', () =>
        authApi.login({ email: startupEmail, password }),
      );
      const startupAuth = startupLogin.data.data as AuthPayload;
      await tokenStorage.saveTokens(startupAuth.accessToken, startupAuth.refreshToken);

      const me = await runStep('auth me startup', () => authApi.me());
      expect(me.data.success).toBe(true);

      const startupUserId = getUserId(startupAuth.user);
      expect(startupUserId.length).toBeGreaterThan(0);

      const startupProfile = await runStep('upsert startup profile', () =>
        startupApi.upsertProfile({
          companyName: `Tech ${stamp}`,
          industry: 'SaaS',
          city: 'Mumbai',
          description: 'Need legal support for trademark and contracts.',
        }),
      );
      expect(startupProfile.data.success).toBe(true);

      const professionalLogin = await runStep('login professional', () =>
        authApi.login({ email: professionalEmail, password }),
      );
      const professionalAuth = professionalLogin.data.data as AuthPayload;
      const professionalUserId = getUserId(professionalAuth.user);
      expect(professionalUserId.length).toBeGreaterThan(0);

      await tokenStorage.saveTokens(professionalAuth.accessToken, professionalAuth.refreshToken);

      const professionalProfile = await runStep('upsert professional profile', () =>
        professionalApi.upsertProfile({
          fullName: `Lawyer ${stamp}`,
          professionType: 'LAWYER',
          city: 'Mumbai',
          experienceYears: 5,
          specializations: ['TRADEMARK'],
          licenseNumber: `LIC-${stamp}`,
          feeRange: '10k-30k',
        }),
      );
      expect(professionalProfile.data.success).toBe(true);

      // Use form-data package for proper Node.js multipart upload
      const { existsSync } = require('fs');
      const docFilePath = existsSync(PDF_PATH) ? PDF_PATH : DOC_FALLBACK_PATH;
      const docMime = docFilePath.endsWith('.pdf') ? 'application/pdf' : 'application/pdf';
      const nodeForm = new NodeFormData();
      nodeForm.append('docs', createReadStream(docFilePath), {
        filename: 'proof.pdf',
        contentType: docMime,
      });

      const verification = await runStep('submit verification', () =>
        submitNodeForm(
          nodeForm,
          '/api/v1/professional/verification/submit',
          professionalAuth.accessToken,
        ),
      );
      expect(verification.success).toBe(true);
      const verificationId = verification.data._id;
      expect(verificationId).toBeTruthy();

      const adminLogin = await runStep('login admin', () =>
        authApi.login({ email: 'admin@vouch.app', password: 'Admin@1234' }),
      );
      const adminAuth = adminLogin.data.data as AuthPayload;
      await tokenStorage.saveTokens(adminAuth.accessToken, adminAuth.refreshToken);

      const approve = await runStep('approve verification', () => adminApi.approve(verificationId!));
      expect(approve.data.success).toBe(true);

      await tokenStorage.saveTokens(startupAuth.accessToken, startupAuth.refreshToken);

      const startupProfileGet = await runStep('get startup profile', () =>
        startupApi.getProfile(startupUserId),
      );
      expect(startupProfileGet.data.success).toBe(true);

      const professionalProfileGet = await runStep('get professional profile', () =>
        professionalApi.getProfile(professionalUserId),
      );
      expect(professionalProfileGet.data.success).toBe(true);

      const directory = await runStep('list professional directory', () =>
        professionalApi.listDirectory({
          city: 'Mumbai',
          type: 'LAWYER',
          verified: false,
          page: 1,
          limit: 10,
        }),
      );
      expect(directory.data.success).toBe(true);

      const createRequest = await runStep('create request', () =>
        requestApi.create({
          category: 'TRADEMARK',
          description: 'Need urgent trademark filing support for our startup.',
          city: 'Mumbai',
          budgetRange: '10k-30k',
        }),
      );
      expect(createRequest.data.success).toBe(true);

      const requestId = createRequest.data.data._id;
      expect(requestId).toBeTruthy();

      await tokenStorage.saveTokens(professionalAuth.accessToken, professionalAuth.refreshToken);

      const openRequests = await runStep('list open requests', () =>
        requestApi.open({ city: 'Mumbai', category: 'TRADEMARK' }),
      );
      expect(openRequests.data.success).toBe(true);

      const acceptRequest = await runStep('accept request', () => requestApi.accept(requestId));
      expect(acceptRequest.data.success).toBe(true);

      await tokenStorage.saveTokens(startupAuth.accessToken, startupAuth.refreshToken);

      const chat = await runStep('get chat by request', () => chatApi.getByRequest(requestId));
      expect(chat.data.success).toBe(true);

      const chatId = chat.data.data._id;
      expect(chatId).toBeTruthy();

      const messages = await runStep('get messages', () => chatApi.getMessages(chatId));
      expect(messages.data.success).toBe(true);

      const send = await runStep('send message', () =>
        chatApi.sendMessage(chatId, `E2E hello ${stamp}`),
      );
      expect(send.data.success).toBe(true);

      const close = await runStep('close request', () => requestApi.close(requestId));
      expect(close.data.success).toBe(true);
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { status?: number; data?: unknown };
        message?: string;
      };

      throw new Error(
        `Step failed: ${currentStep}. Status: ${axiosError.response?.status ?? 'n/a'}. ` +
          `Response: ${JSON.stringify(axiosError.response?.data ?? axiosError.message ?? error)}`,
      );
    }
  });
});
