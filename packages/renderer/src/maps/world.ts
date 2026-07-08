export const WORLD_MAP_NAME = 'panelka-world'

export const WORLD_REGIONS = [
  'North America',
  'South America',
  'Europe',
  'Africa',
  'Asia',
  'Oceania',
] as const

export const WORLD_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 500">
  <path name="North America" fill="#d6d6da" d="M90,80 L240,60 L300,100 L270,150 L235,165 L210,200 L235,240 L215,262 L190,228 L165,258 L150,206 L140,166 L100,150 L80,110 Z" />
  <path name="South America" fill="#d6d6da" d="M235,268 L300,256 L322,300 L306,360 L276,432 L256,402 L250,342 L228,306 Z" />
  <path name="Europe" fill="#d6d6da" d="M452,94 L542,84 L562,120 L536,150 L494,162 L468,140 L448,120 Z" />
  <path name="Africa" fill="#d6d6da" d="M470,182 L592,176 L622,232 L600,302 L560,372 L520,398 L500,340 L480,272 L464,222 Z" />
  <path name="Asia" fill="#d6d6da" d="M566,70 L862,58 L912,120 L882,176 L820,192 L760,176 L700,202 L640,192 L600,162 L576,120 Z" />
  <path name="Oceania" fill="#d6d6da" d="M782,330 L882,320 L908,360 L866,396 L800,392 L770,360 Z" />
</svg>`
