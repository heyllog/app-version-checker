export interface Database {
  subscribers?: Record<string, number[]>
  appVersions?: Record<string, string>
}
