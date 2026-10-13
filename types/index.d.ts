export type SlashFilter = string | null

declare module 'claude-code' {
  interface PluginState {
    'skills-az': { filter: SlashFilter }
  }
}
