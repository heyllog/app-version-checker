export enum Command {
  Start = '/start',
  Subscribe = '/subscribe',
  Unsubscribe = '/unsubscribe',
  Subscriptions = '/subscriptions',
}

export enum AppForSubscription {
  ChangeNow = 'NOW Wallet',
  Custom = 'Another app',
}

export const AppBundleId = {
  [AppForSubscription.ChangeNow]: 'io.changenow.wallet-now',
}
