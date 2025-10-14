import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { NOMINATIM_CONTACT_EMAIL } from '../../config';

@Injectable({ providedIn: 'root' })
export class GeocodingService {
  private cache = new Map<string, { lat: number; lon: number }>();
  constructor(private http: HttpClient) {}

  geocodeAddress(address: string): Observable<{ lat: number; lon: number } | null> {
    const key = address.trim().toLowerCase();
    const cached = this.cache.get(key);
    if (cached) {
      return of(cached);
    }
    const isDev = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    const base = isDev ? '/geocode' : 'https://nominatim.openstreetmap.org';
    const url = `${base}/search`;
    const params = new HttpParams()
      .set('q', address)
      .set('format', 'json')
      .set('limit', '1')
      .set('addressdetails', '1')
      .set('email', NOMINATIM_CONTACT_EMAIL);
    const headers = new HttpHeaders({
      'Accept-Language': 'es',
    });
    return this.http.get<any[]>(url, { params, headers }).pipe(
      map((results) => {
        if (!results || results.length === 0) return null;
        const r = results[0];
        const lat = parseFloat(r.lat);
        const lon = parseFloat(r.lon);
        if (isNaN(lat) || isNaN(lon)) return null;
        const value = { lat, lon };
        this.cache.set(key, value);
        return value;
      }),
      catchError(() => of(null))
    );
  }
}