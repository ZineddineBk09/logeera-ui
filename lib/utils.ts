import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const extractCoordinates = (originGeom = ''): { lat: number; lng: number } => {
  const [lng, lat] = originGeom
    .split('POINT(')[1]
    .split(')')[0]
    .split(' ')
    .map(Number);
  console.log('lng', lng, 'lat', lat);
  return { lat: lat || 0, lng: lng || 0 } as { lat: number; lng: number };
};
