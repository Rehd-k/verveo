import { cities } from '../../app/(protected)/dashboard/cities';

export const RETAILER_CITIES = [...new Set(cities.map((city) => city.name))].sort();
