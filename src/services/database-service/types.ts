export interface AppInfo {
  name: string
  version: string
  company: string
  storeUrl: string
  releaseDate: string
  currentVersionReleaseDate: string
}

export interface Database {
  subscribers: Record<string, number[]>
  appInfo: Record<string, AppInfo>
}
