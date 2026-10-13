import { test, expect } from 'claude-code/testing'
import type { CommandInfo } from 'claude-code'
import { matches, slashFilter } from './register'

test('slash filter', () => {
  expect(slashFilter('/')).toBe('')
  expect(slashFilter('/Docs:')).toBe('docs:')
  expect(slashFilter('/docs:help now')).toBe(null)
  expect(slashFilter('hello /x')).toBe(null)
  expect(slashFilter('')).toBe(null)
})

test('substring match, prefix hits first, then A to Z', () => {
  const cmd = (name: string): CommandInfo => ({ name, description: '', source: 'plugin' })
  const all = ['superpowers:brainstorming', 'bmad-brainstorming', 'brainstorm', 'review', 'Brain-dump'].map(cmd)
  expect(matches(all, 'brain').map(c => c.name)).toEqual([
    'Brain-dump',
    'brainstorm',
    'bmad-brainstorming',
    'superpowers:brainstorming',
  ])
  expect(matches(all, '').length).toBe(5)
  expect(matches(all, 'zzz').length).toBe(0)
})

test('two quick edits to "/" open the pane once', async ($, on) => {
  let opens = 0
  on('ui.open', async () => {
    opens += 1
    return { value: { isPlaced: true } } as any
  })
  on('ui.close', async () => ({ value: undefined }) as any)
  on('prompt.edit', async (_$, e) => ({ text: e.inputText, cursor: 1 }) as any)

  await Promise.all([$.prompt.edit({ origin: { kind: 'composer' }, text: '', inputText: '/', start: 0, end: 0, cursor: 0 } as any), $.prompt.edit({ origin: { kind: 'composer' }, text: '', inputText: '/', start: 0, end: 0, cursor: 0 } as any)])
  expect(opens).toBe(1)
})

test('running a slash command closes the pane', async ($, on) => {
  let open = false
  on('ui.open', async () => ((open = true), { value: { isPlaced: true } }) as any)
  on('ui.close', async () => ((open = false), { value: undefined }) as any)
  on('prompt.edit', async (_$, e) => ({ text: e.inputText, cursor: e.inputText.length }) as any)
  on('command.run', async () => ({ text: 'ran' }) as any)

  await $.prompt.edit({ origin: { kind: 'composer' }, text: '', inputText: '/brainstorming', start: 0, end: 0, cursor: 0 } as any)
  expect(open).toBe(true)
  await $.command.run({ command: 'brainstorming', args: '' } as any)
  expect(open).toBe(false)
})
