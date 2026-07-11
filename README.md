Here it is — copy everything between the lines:

---

```
# Skyvio 🌙
### Pakistan's Sky Guide — Find astronomical events visible from your city

Skyvio is a bilingual (English/Urdu) web app that helps Pakistani astronomy enthusiasts discover upcoming sky events, check if they're visible from their city, and find exactly where to look using a live compass.

---

## The Problem

When a meteor shower, eclipse, or planetary event occurs, Pakistanis have no dedicated tool to find out:
- Will it be visible from Lahore, Karachi, or Islamabad?
- What time should I go outside?
- Which direction do I look?

Generic western astronomy apps don't account for Pakistani cities, timezones, or language. Skyvio solves this.

---

## Features

- **Sky Events Calendar** — Eclipses, meteor showers, moon phases, and planet oppositions computed for the entire year
- **Real Visibility Check** — Tap any event to fetch real altitude and compass direction for your selected Pakistani city
- **Live Compass Navigator** — Uses your phone's gyroscope to point you at the event in real time
- **8 Pakistani Cities** — Karachi, Lahore, Islamabad, Peshawar, Quetta, Multan, Faisalabad, Rawalpindi
- **Bilingual** — Full English and Urdu support with RTL layout
- **Month Grouping** — Events organized by month for easy browsing

---

## Tech Stack

| Technology | Purpose |
|---|---|
| React + TypeScript | Frontend framework |
| Vite | Build tool |
| astronomy-engine | Local orbital mechanics — computes event dates and positions |
| AstronomyAPI.com | Real-time sky position per city (altitude, azimuth) |
| DeviceOrientationEvent | Browser API for live compass heading |
| Framer Motion | Animations and compass spring physics |
| TailwindCSS | Styling |
| Vercel | Deployment |

---

## Architecture

```
Event Computation (astronomy-engine)
└── Runs locally, no API needed
└── Computes: eclipses, moon phases, meteor showers, planet oppositions

Visibility Check (AstronomyAPI)
└── Called on demand when user expands an event
└── Returns real altitude + azimuth for selected city
└── Cached per session to avoid duplicate calls

Live Navigation (DeviceOrientationEvent)
└── Native browser API — no library needed
└── Reads phone compass heading in real time
└── Needle rotates to point at event's azimuth
└── Turns green when phone is aligned
```

---

## Running Locally

```bash
# Clone the repository
git clone https://github.com/ush-naaa/SkyPak.git
cd SkyPak

# Install dependencies
npm install

# Create environment file and add your AstronomyAPI credentials
VITE_ASTRONOMY_APP_ID=your_app_id
VITE_ASTRONOMY_APP_SECRET=your_app_secret

# Start development server
npm run dev
```

Get free API credentials at [astronomyapi.com](https://astronomyapi.com)

---

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_ASTRONOMY_APP_ID` | AstronomyAPI Application ID |
| `VITE_ASTRONOMY_APP_SECRET` | AstronomyAPI Application Secret |

---

## Key Technical Decisions

**Why two astronomy data sources?**
astronomy-engine runs locally and computes event dates without API calls. AstronomyAPI handles location-specific visibility and is only called on demand when a user needs real coordinates, keeping usage within free tier limits.

**Why DeviceOrientationEvent instead of a library?**
It is a native browser API that reads the phone's actual compass hardware. No third-party dependency, works on both iOS and Android with appropriate permission handling for each platform.

**Why on-demand visibility fetching?**
Loading visibility for all events upfront would require 30+ API calls and hit rate limits. Fetching only when a user taps an event keeps the app fast and within free tier limits.

---

## Live Demo

https://skyvio.vercel.app

Best experienced on mobile — the live compass requires a phone's motion sensors.

---

## What I'd Add Next

- Push notifications for upcoming events
- Dark sky map showing best stargazing spots in Pakistan
- Planetary conjunctions and Venus/Mercury elongations
- Offline support with cached event data
- ISS pass predictions for Pakistani cities

---


---

Replace `[your-vercel-url-here]` with your actual Vercel URL once it's live. Also update the GitHub clone URL if your repo name changes from SkyPak to Skyvio.
