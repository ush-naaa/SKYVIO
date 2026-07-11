# Skyvio 🌙
### Pakistan's Sky Guide — Find astronomical events visible from your city

Skyvio is a bilingual (English/Urdu) web app that helps Pakistani astronomy enthusiasts discover upcoming sky events, check if they're visible from their city, and find exactly where to look using a live compass.

---

## ✨ The Problem

When a meteor shower, eclipse, or planetary event occurs, Pakistanis have no dedicated tool to find out:

- Will it be visible from Lahore, Karachi, or Islamabad?
- What time should I go outside?
- Which direction do I look?

Generic western astronomy apps don't account for Pakistani cities, time zones, or language. Skyvio solves this.

---

## 🚀 Features

- 🌠 **Sky Events Calendar** — Eclipses, meteor showers, moon phases, and planet oppositions computed for the entire year
- 📍 **Real Visibility Check** — Tap any event to fetch real altitude and compass direction for your selected Pakistani city
- 🧭 **Live Compass Navigator** — Uses your phone's gyroscope to point you at the event in real time
- 🇵🇰 **8 Pakistani Cities** — Karachi, Lahore, Islamabad, Peshawar, Quetta, Multan, Faisalabad, Rawalpindi
- 🌐 **Bilingual** — Full English and Urdu support with RTL layout
- 📅 **Month Grouping** — Events organized by month for easy browsing

---

## 🛠 Tech Stack

| Technology | Purpose |
|------------|---------|
| React + TypeScript | Frontend framework |
| Vite | Build tool |
| astronomy-engine | Local orbital mechanics — computes event dates and positions |
| AstronomyAPI | Real-time sky position per city (altitude, azimuth) |
| DeviceOrientationEvent | Browser API for live compass heading |
| Framer Motion | Animations and compass spring physics |
| Tailwind CSS | Styling |
| Vercel | Deployment |

---

## 🏗 Architecture

```text
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

## 💻 Running Locally

```bash
git clone https://github.com/ush-naaa/SkyPak.git
cd SkyPak
npm install
npm run dev
```

Create a `.env` file in the project root:

```env
VITE_ASTRONOMY_APP_ID=your_app_id
VITE_ASTRONOMY_APP_SECRET=your_app_secret
```

Get free API credentials from **AstronomyAPI**.

---

## 💡 Key Technical Decisions

### Why two astronomy data sources?

`astronomy-engine` runs completely locally and computes astronomical events without making API calls.

`AstronomyAPI` is only used when the user requests visibility information for a specific event. This keeps API usage comfortably within the free tier while still providing accurate, location-specific results.

### Why DeviceOrientationEvent instead of a library?

`DeviceOrientationEvent` is a native browser API that reads the phone's built-in compass hardware. Using the browser API eliminates unnecessary dependencies while supporting both Android and iOS (with their respective permission flows).

### Why fetch visibility on demand?

Fetching visibility data for every event at startup would require dozens of API requests and significantly slow down the app.

Instead, Skyvio requests data only when a user expands an event, reducing API usage and improving performance.

---

## 📱 Live Demo

**Coming soon:** *your-vercel-url-here*

> Best experienced on mobile — the live compass requires your phone's motion sensors.

---

## 🌌 Future Improvements

- 🔔 Push notifications for upcoming astronomical events
- 🗺 Dark-sky map showing the best stargazing spots across Pakistan
- 🪐 Planetary conjunctions and Venus/Mercury elongations
- 📦 Offline support with cached event data
- 🛰 ISS pass predictions for Pakistani cities

---

## 🌙 About the Developer

Made with curiosity, too many late-night debugging sessions, and a love for looking up at the sky.

**Ushna Saad**  
Software Engineering Student • AI/ML Enthusiast • Full-Stack Developer

GitHub: https://github.com/ush-naaa

*"The universe is huge. This project just helps you find where to look." ✨
