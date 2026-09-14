# Geographic data
- `Admin2.*` — DataMeet India community, "maps/States" shapefile (MIT licence). Includes Telangana and Ladakh.
- `india_states_svg.json` — generated simplified SVG paths (see the Python snippet used: equirectangular projection lon 68–97.6 / lat 6–37.6 onto 600×660, Douglas–Peucker 0.6 px, islands < 2.5 px dropped).
- `india_states.geojson` — older GADM-derived file (geohacker/india), pre-2014 boundaries; not used.
Regenerate `src/data/india-geo.ts` after any change. Boundaries are for comparison visualisation only.
