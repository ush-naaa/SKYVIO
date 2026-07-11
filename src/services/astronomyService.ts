import {
  Observer,
  Horizon,
  SearchMoonPhase,
  MoonPhase,
  SearchLocalSolarEclipse,
  SearchLunarEclipse,
  SearchRelativeLongitude,
  Body,
  Equator,
} from 'astronomy-engine';
import { AstroEvent, City } from '../types';
import { METEOR_SHOWERS } from '../constants';

export class AstronomyService {
  private observer: Observer;
  private city: City;

  constructor(city: City) {
    this.city = city;
    this.observer = new Observer(city.lat, city.lng, 0);
  }

  getCurrentMoonPhase() {
    const date = new Date();
    const phase = MoonPhase(date);
    return { phase, name: this.getMoonPhaseName(phase) };
  }

  private getMoonPhaseName(phase: number): string {
    if (phase < 45) return 'New Moon';
    if (phase < 90) return 'First Quarter';
    if (phase < 135) return 'Full Moon';
    if (phase < 180) return 'Third Quarter';
    return 'New Moon';
  }

  private getHorizonData(date: Date, ra: number, dec: number) {
    try {
      const hor = Horizon(date, this.observer, ra, dec, 'normal');
      return { altitude: hor.altitude, azimuth: hor.azimuth };
    } catch {
      return { altitude: 45, azimuth: 180 };
    }
  }

  private getPlanetHorizon(date: Date, body: Body) {
    try {
      const eq = Equator(body, date, this.observer, true, true);
      const hor = Horizon(date, this.observer, eq.ra, eq.dec, 'normal');
      return { altitude: hor.altitude, azimuth: hor.azimuth };
    } catch {
      return { altitude: 30, azimuth: 180 };
    }
  }

  async getEventsForYear(year: number): Promise<AstroEvent[]> {
    const events: AstroEvent[] = [];
    const startDate = new Date(year, 0, 1);

    // --- Moon Phases ---
    let phaseDate = startDate;
    for (let i = 0; i < 13; i++) {
      const nextFullMoon = SearchMoonPhase(180, phaseDate, 40);
      if (nextFullMoon && nextFullMoon.date.getFullYear() === year) {
        const hor = this.getHorizonData(nextFullMoon.date, 90, 0);
        events.push({
          id: `moon-full-${nextFullMoon.date.getTime()}`,
          name: 'Full Moon',
          nameUrdu: 'پورے چاند کی رات',
          date: nextFullMoon.date,
          type: 'Moon',
          altitude: Math.round(Math.abs(hor.altitude)),
          azimuth: Math.round(hor.azimuth),
          visibility: 'Excellent',
          peakTime: nextFullMoon.date,
          startTime: new Date(nextFullMoon.date.getTime() - 1000 * 60 * 60 * 2),
          endTime: new Date(nextFullMoon.date.getTime() + 1000 * 60 * 60 * 2),
          moonInterference: false,
        });
      }
      const nextNewMoon = SearchMoonPhase(0, phaseDate, 40);
      if (nextNewMoon && nextNewMoon.date.getFullYear() === year) {
        events.push({
          id: `moon-new-${nextNewMoon.date.getTime()}`,
          name: 'New Moon',
          nameUrdu: 'نیا چاند',
          date: nextNewMoon.date,
          type: 'Moon',
          altitude: 0,
          azimuth: 0,
          visibility: 'Excellent',
          peakTime: nextNewMoon.date,
          startTime: new Date(nextNewMoon.date.getTime() - 1000 * 60 * 60 * 2),
          endTime: new Date(nextNewMoon.date.getTime() + 1000 * 60 * 60 * 2),
          moonInterference: false,
        });
      }
      phaseDate = new Date(phaseDate.getTime() + 1000 * 60 * 60 * 24 * 29);
    }

    // --- Solar Eclipses ---
    try {
      let solarEclipse = SearchLocalSolarEclipse(startDate, this.observer);
      while (solarEclipse && solarEclipse.peak.time.date.getFullYear() === year) {
        const hor = this.getPlanetHorizon(solarEclipse.peak.time.date, Body.Sun);
        events.push({
          id: `solar-${solarEclipse.peak.time.date.getTime()}`,
          name: `${solarEclipse.kind} Solar Eclipse`,
          nameUrdu: 'سورج گرہن',
          date: solarEclipse.peak.time.date,
          type: 'Eclipse',
          altitude: Math.round(Math.abs(hor.altitude)),
          azimuth: Math.round(hor.azimuth),
          visibility: hor.altitude > 10 ? 'Excellent' : hor.altitude > 0 ? 'Good' : 'Poor',
          peakTime: solarEclipse.peak.time.date,
          startTime: solarEclipse.partial_begin.time.date || solarEclipse.peak.time.date,
          endTime: solarEclipse.partial_end.time.date || solarEclipse.peak.time.date,
          moonInterference: false,
        });
        solarEclipse = SearchLocalSolarEclipse(
          new Date(solarEclipse.peak.time.date.getTime() + 1000 * 60 * 60 * 24 * 30),
          this.observer
        );
      }
    } catch {}

    // --- Lunar Eclipses ---
    try {
      let lunarEclipse = SearchLunarEclipse(startDate);
      while (lunarEclipse && lunarEclipse.peak.date.getFullYear() === year) {
        const hor = this.getPlanetHorizon(lunarEclipse.peak.date, Body.Moon);
        const peakMs = lunarEclipse.peak.date.getTime();
        const semiMs = (lunarEclipse.sd_penum || 0) * 60 * 1000;
        events.push({
          id: `lunar-${lunarEclipse.peak.date.getTime()}`,
          name: `${lunarEclipse.kind} Lunar Eclipse`,
          nameUrdu: 'چاند گرہن',
          date: lunarEclipse.peak.date,
          type: 'Eclipse',
          altitude: Math.round(Math.abs(hor.altitude)),
          azimuth: Math.round(hor.azimuth),
          visibility: hor.altitude > 10 ? 'Excellent' : hor.altitude > 0 ? 'Good' : 'Poor',
          peakTime: lunarEclipse.peak.date,
          startTime: new Date(peakMs - semiMs),
          endTime: new Date(peakMs + semiMs),
          moonInterference: false,
        });
        lunarEclipse = SearchLunarEclipse(
          new Date(lunarEclipse.peak.date.getTime() + 1000 * 60 * 60 * 24 * 30)
        );
      }
    } catch {}

    // --- Meteor Showers ---
    METEOR_SHOWERS.forEach(shower => {
      const peakDate = new Date(year, shower.month, shower.day, 22, 0, 0);
      const quality = shower.zhr >= 100 ? 'Excellent' : shower.zhr >= 30 ? 'Good' : 'Poor';
      events.push({
        id: `meteor-${shower.name}-${year}`,
        name: `${shower.name} Meteor Shower`,
        nameUrdu: 'شہاب ثاقب کی بارش',
        date: peakDate,
        type: 'Meteor Shower',
        altitude: 45,
        azimuth: 45,
        visibility: quality,
        peakTime: peakDate,
        startTime: new Date(peakDate.getTime() - 1000 * 60 * 60 * 4),
        endTime: new Date(peakDate.getTime() + 1000 * 60 * 60 * 4),
        moonInterference: MoonPhase(peakDate) > 120,
      });
    });

    // --- Planet Oppositions (when planets are closest/brightest) ---
    const planets = [
      { body: Body.Mars, name: 'Mars at Opposition', nameUrdu: 'مریخ کا قرب', bodyId: Body.Mars },
      { body: Body.Jupiter, name: 'Jupiter at Opposition', nameUrdu: 'مشتری کا قرب', bodyId: Body.Jupiter },
      { body: Body.Saturn, name: 'Saturn at Opposition', nameUrdu: 'زحل کا قرب', bodyId: Body.Saturn },
    ];

    for (const planet of planets) {
      try {
        let searchDate = startDate;
        for (let attempt = 0; attempt < 1; attempt++) {
          const opposition = SearchRelativeLongitude(planet.body, 180, searchDate);
          if (opposition && opposition.date.getFullYear() === year) {
            const hor = this.getPlanetHorizon(opposition.date, planet.body);
            const peakTime = new Date(opposition.date);
            peakTime.setHours(22, 0, 0, 0);
            events.push({
              id: `opposition-${planet.name}-${opposition.date.getTime()}`,
              name: planet.name,
              nameUrdu: planet.nameUrdu,
              date: opposition.date,
              type: 'Planet',
              altitude: Math.round(Math.abs(hor.altitude)),
              azimuth: Math.round(hor.azimuth),
              visibility: 'Excellent',
              peakTime,
              startTime: new Date(peakTime.getTime() - 1000 * 60 * 60 * 3),
              endTime: new Date(peakTime.getTime() + 1000 * 60 * 60 * 3),
              moonInterference: MoonPhase(opposition.date) > 120,
            });
          }
          searchDate = new Date(opposition ? opposition.date.getTime() + 1000 * 60 * 60 * 24 * 30 : searchDate.getTime() + 1000 * 60 * 60 * 24 * 400);
        }
      } catch {}
    }

    const uniqueEvents = Array.from(new Map(events.map(e => [e.id, e])).values());
    return uniqueEvents.sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  getPointer(event: AstroEvent) {
    return { azimuth: event.azimuth, altitude: event.altitude };
  }
}
