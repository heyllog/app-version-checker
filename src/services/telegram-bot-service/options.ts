export enum Command {
  start = '/start',
  subscribe = '/subscribe',
  unsubscribe = '/unsubscribe',
}

export enum AppForSubscription {
  ChangeNow = 'NOW Wallet',
  Custom = 'Another app',
}

export const AppBundleId = {
  [AppForSubscription.ChangeNow]: 'io.changenow.wallet-now',
}
