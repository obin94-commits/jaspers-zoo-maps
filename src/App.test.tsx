import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App'

describe("Jasper's Zoo Maps", () => {
  beforeEach(() => localStorage.clear())

  it('opens as a full-screen 3D zoo explorer instead of an information homepage', () => {
    render(<App />)

    expect(screen.getByRole('main', { name: /interactive 3d zoo globe/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /jasper's zoo maps/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reset globe view/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /flatten to 2d|tilt to 3d/i })).toBeInTheDocument()
    expect(screen.getByRole('searchbox', { name: /search zoos/i })).toBeInTheDocument()
  })

  it('keeps the map present while a zoo opens in an explorer drawer', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /fly to smithsonian's national zoo/i }))

    expect(screen.getByRole('main', { name: /interactive 3d zoo globe/i })).toBeInTheDocument()
    expect(screen.getByRole('dialog', { name: /smithsonian's national zoo explorer/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: "Smithsonian's National Zoo" })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Giant panda' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /mark visited/i }))
    expect(screen.getByText('1 of 4 zoos visited')).toBeInTheDocument()
  })

  it('filters the map rail and can open the passport as an overlay', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByRole('searchbox', { name: /search zoos/i }), 'Philadelphia')
    expect(screen.getByRole('button', { name: /fly to philadelphia zoo/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /fly to the maryland zoo/i })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /open passport/i }))
    expect(screen.getByRole('dialog', { name: /zoo passport/i })).toBeInTheDocument()
  })
})
