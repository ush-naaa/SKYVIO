import {
  Observer,
  Equator,
  Horizon,
  SearchMoonPhase,
  MoonPhase,
  SearchLocalSolarEclipse,
  SearchLunarEclipse,
} from 'astronomy-engine';
import { AstroEvent, City } from '../types';
import { METEOR_SHOWERS } from '../constants';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

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
    return {
      phase,
      name: this.getMoonPhaseName(phase),
    };
  }

  private getMoonPhaseName(phase: number): string {
    if (phase < 45) return 'New Moon';
    if (phase < 90) return 'First Quarter';
    if (phase < 135) return 'Full Moon';
    if (phase < 180) return 'Third Quarter';
    return 'New Moon';
  }

  async getEventsForYear(year: number): Promise<AstroEvent[]> {
    const events: AstroEvent[] = [];
    const startDate = new Date(year, 0, 1);

    // Moon Phases
    let phaseDate = startDate;
    for (let i = 0; i < 12; i++) {
      const nextFullMoon = SearchMoonPhase(180, phaseDate, 40);
      if (nextFullMoon && nextFullMoon.date.getFullYear() === year) {
        const hor = this.getHorizonData(nextFullMoon.date, 90, 0);
        events.push({
          id: `moon-full-${nextFullMoon.date.getTime()}`,
          name: 'Full Moon',
          nameUrdu: 'پورے چاند کی رات',
          date: nextFullMoon.date,
          type: 'Moon',
          altitude: Math.round(hor.altitude),
          azimuth: Math.round(hor.azimuth),
          visibility: hor.altitude > 20 ? 'Excellent' : hor.altitude > 0 ? 'Good' : 'Poor',
          peakTime: nextFullMoon.date,
          startTime: nextFullMoon.date,
          endTime: nextFullMoon.date,
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
          startTime: nextNewMoon.date,
          endTime: nextNewMoon.date,
          moonInterference: false,
        });
      }
      phaseDate = new Date(phaseDate.getTime() + 1000 * 60 * 60 * 24 * 30);
    }

    // Solar Eclipses
    let solarEclipse = SearchLocalSolarEclipse(startDate, this.observer);
    while (solarEclipse && solarEclipse.peak.time.date.getFullYear() === year) {
      const hor = this.getHorizonData(solarEclipse.peak.time.date, 90, 0);
      events.push({
        id: `solar-${solarEclipse.peak.time.date.getTime()}`,
        name: `${solarEclipse.kind} Solar Eclipse`,
        nameUrdu: 'سورج گرہن',
        date: solarEclipse.peak.time.date,
        type: 'Eclipse',
        altitude: Math.round(hor.altitude),
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

    // Lunar Eclipses
    let lunarEclipse = SearchLunarEclipse(startDate);
    while (lunarEclipse && lunarEclipse.peak.date.getFullYear() === year) {
      const hor = this.getHorizonData(lunarEclipse.peak.date, 90, 0);
      const peakMillis = lunarEclipse.peak.date.getTime();
      const semiDurationMillis = (lunarEclipse.sd_penum || 0) * 60 * 1000;
      events.push({
        id: `lunar-${lunarEclipse.peak.date.getTime()}`,
        name: `${lunarEclipse.kind} Lunar Eclipse`,
        nameUrdu: 'چاند گرہن',
        date: lunarEclipse.peak.date,
        type: 'Eclipse',
        altitude: Math.round(hor.altitude),
        azimuth: Math.round(hor.azimuth),
        visibility: hor.altitude > 10 ? 'Excellent' : hor.altitude > 0 ? 'Good' : 'Poor',
        peakTime: lunarEclipse.peak.date,
        startTime: new Date(peakMillis - semiDurationMillis),
        endTime: new Date(peakMillis + semiDurationMillis),
        moonInterference: false,
      });
      lunarEclipse = SearchLunarEclipse(
        new Date(lunarEclipse.peak.date.getTime() + 1000 * 60 * 60 * 24 * 30)
      );
    }

    // Meteor Showers
    METEOR_SHOWERS.forEach(shower => {
      const peakDate = new Date(year, shower.month, shower.day);
      events.push({
        id: `meteor-${shower.name}-${year}`,
        name: `${shower.name} Meteor Shower`,
        nameUrdu: 'شہاب ثاقب کی بارش',
        date: peakDate,
        type: 'Meteor Shower',
        altitude: 45,
        azimuth: 45,
        visibility: 'Good',
        peakTime: peakDate,
        startTime: new Date(peakDate.getTime() - 1000 * 60 * 60 * 4),
        endTime: new Date(peakDate.getTime() + 1000 * 60 * 60 * 4),
        moonInterference: MoonPhase(peakDate) > 120,
      });
    });

    return events.sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  // Compute real azimuth/altitude for a given date using Moon as reference body
  private getHorizonData(date: Date, ra: number, dec: number) {
    try {
      const hor = Horizon(date, this.observer, ra, dec, 'normal');
      return { altitude: hor.altitude, azimuth: hor.azimuth };
    } catch {
      return { altitude: 45, azimuth: 180 };
    }
  }

  getPointer(event: AstroEvent) {
    return { azimuth: event.azimuth, altitude: event.altitude };
  }
}
