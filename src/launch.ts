import os from 'os';
import * as path from 'path';
import playwright from 'playwright-core';

import { DappwrightLaunchResponse, OfficialOptions } from './types';
import { getWallet, getWalletType } from './wallets/wallets';

/**
 * Launch Playwright chromium instance with wallet plugin installed
 * */
export const sessionPath = path.resolve(os.tmpdir(), 'dappwright', 'session');

export async function launch(browserName: string, options: OfficialOptions): Promise<DappwrightLaunchResponse> {
  const { headless, ...officialOptions } = options;
  const wallet = getWalletType(officialOptions.wallet);
  if (!wallet) throw new Error('Wallet not supported');

  const extensionPath = await wallet.download(officialOptions);

  const browserContext = await playwright.chromium.launchPersistentContext(
    path.join(sessionPath, officialOptions.wallet),
    {
      headless: headless ?? false,
      args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`, `--lang=en-US`],
    },
  );

  return {
    wallet: await getWallet(wallet.id, browserContext),
    browserContext,
  };
}
