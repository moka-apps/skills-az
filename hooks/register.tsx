import { atom, read, update } from 'claude-code'
import type { CommandInfo, EngineInterface, Register } from 'claude-code'

import type { SlashFilter } from '../types'

const PANE = 'skills-az'
const TITLE = 'Skills A-Z'
// null = prompt is not a slash command; '' = just "/" typed
const filter = atom({ plugin: 'skills-az', key: 'filter' } as const, null as SlashFilter)

export const slashFilter = (text: string): string | null =>
  /^\/\S*$/.test(text) ? text.slice(1).toLowerCase() : null

// Substring match so "/brain" finds "superpowers:brainstorming"; prefix hits sort first.
export const matches = (all: readonly CommandInfo[], f: string): CommandInfo[] =>
  all
    .map(c => ({ c, at: c.name.toLowerCase().indexOf(f) }))
    .filter(m => m.at >= 0)
    .sort(
      (a, b) =>
        Number(a.at > 0) - Number(b.at > 0) ||
        a.c.name.localeCompare(b.c.name, undefined, { sensitivity: 'base' }),
    )
    .map(m => m.c)

let hinted = false
// The command list, read when the pane first draws and dropped when it closes.
let listed: CommandInfo[] | null = null

// Open on a fresh "/", close when the prompt stops being a slash command. Driven by the
// filter's transitions in $.state, so a hand-closed pane reopens next time and a reload
// does not leave it stuck.
async function sync($: EngineInterface, text: string) {
  const f = slashFilter(text)
  // Check and write in one update, so two quick edits cannot both see the old value.
  let prev: SlashFilter = f
  await update($, filter, p => ((prev = p), f))
  if (f === prev) return
  if (f !== null && prev === null) {
    const opened = await $.ui.open({ id: PANE, title: TITLE })
    if (!opened.isPlaced && !hinted) {
      hinted = true
      $.ui.toast('skills-az: terminal too narrow for the pane; run /skills-az once or widen it')
    }
  } else if (f === null) {
    await $.ui.close({ id: PANE })
    listed = null
  }
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'skills-az', description: 'Open the Skills A-Z pane' })
    return next(e)
  })

  // A slash command never reaches prompt.submit and the box clearing is no prompt.edit,
  // so close here. Opened at the person's request, the pane seats at any width.
  on('command.run', async ($, e, next) => {
    await sync($, '').catch(() => {})
    if (e.command !== 'skills-az') return next(e)
    await $.ui.open({ id: PANE, title: TITLE })
    return { text: 'Skills A-Z pane opened.' }
  })

  on('prompt.edit', async ($, e, next) => {
    const box = await next(e)
    await sync($, box.text).catch(() => {})
    return box
  })

  on('prompt.submit', async ($, e, next) => {
    // Awaited so the close lands before /skills-az's own open.
    await sync($, '').catch(() => {})
    return next(e)
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text } = $.ui.resolve(e)
    const f = (await read($, filter)) ?? ''
    const all = (listed ??= await $.command.list())
    const rows = matches(all, f)
    const room = Math.max(1, (e.viewport?.rows ?? 24) - 3)

    return (
      <Box flexDirection="column">
        <Text dimColor>{rows.length} of {all.length} match /{f}</Text>
        {rows.slice(0, room).map(c => (
          <Text key={c.name} wrap="truncate-end">
            <Text bold>/{c.name}</Text> <Text dimColor>{c.description}</Text>
          </Text>
        ))}
        {rows.length > room && <Text dimColor>… {rows.length - room} more, keep typing</Text>}
      </Box>
    )
  })
}
