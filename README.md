# Jasper's Zoo Maps

A mobile-first 3D zoo globe and family exploration prototype centered on Woodbine, Maryland.

## Live site

https://obin94-commits.github.io/jaspers-zoo-maps/

## Included

- Full-screen MapLibre globe with free pan, zoom, rotation, pitch, terrain, and fly-to camera moves
- OpenFreeMap/OpenStreetMap basemap with progressive 3D terrain and building detail
- Four fully mapped starter zoos:
  - Smithsonian's National Zoo
  - The Maryland Zoo in Baltimore
  - Philadelphia Zoo
  - Pittsburgh Zoo & Aquarium
- Search by zoo, city, animal, or habitat
- Map-first zoo detail drawers and mobile bottom sheets instead of separate information pages
- Original interactive habitat maps for each zoo
- Persistent visited and wish-list tracking with `localStorage`
- Family zoo passport and collectible visit stamps
- Driving directions from Woodbine through live Google Maps links
- Official zoo links for current hours, tickets, and animal lists
- Responsive desktop and phone layouts

## Run locally

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:5173`.

## Quality gates

```bash
npm test
npm run lint
npm run build
```

Pushes to `main` run the same tests and production build before deploying to GitHub Pages.

## Product boundary

This is a family-planning prototype, not an authoritative operational source. Travel times are approximate. Hours, access, ticketing, exhibits, and animal availability should be verified through each zoo's official site before traveling.

The habitat maps are original simplified illustrations; they do not reproduce proprietary zoo maps. Map tiles and geographic data retain their provider attribution in the map interface.
