import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App'

describe("Jasper's Zoo Maps", () => {
  beforeEach(() => localStorage.clear())

  it('shows the four starter zoos in the atlas', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: /jasper's zoo maps/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: "Smithsonian's National Zoo" })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'The Maryland Zoo' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Philadelphia Zoo' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Pittsburgh Zoo & Aquarium' })).toBeInTheDocument()
  })

  it('opens a zoo and records it in the passport', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /explore smithsonian/i }))
    expect(screen.getByRole('heading', { name: "Smithsonian's National Zoo" })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Giant panda' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /mark visited/i }))
    expect(screen.getByText('1 of 4 zoos visited')).toBeInTheDocument()
  })
})
