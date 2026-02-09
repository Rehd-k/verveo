'use client';

interface LocationStepProps {
  data: any;
  updateData: (data: any) => void;
}

const LOCATIONS = [
  'Yaba',
  'Ikeja',
  'Lekki',
  'Victoria Island',
  'Surulere',
  'Ikoyi',
  'Bariga',
  'Shomolu',
  'Ajah',
  'Epe',
];

const VENUE_TYPES = [
  'Fast Food',
  'Corporate Canteens',
  'Universities',
  'Market Areas',
  'Restaurants',
  'Cafes',
  'Shopping Centers',
  'Transit Hubs',
];

export default function LocationStep({ data, updateData }: LocationStepProps) {
  const toggleLocation = (location: string) => {
    const locations = data.locations.includes(location)
      ? data.locations.filter((l: string) => l !== location)
      : [...data.locations, location];
    updateData({ locations });
  };

  const toggleVenueType = (venue: string) => {
    const venueTypes = data.venueTypes.includes(venue)
      ? data.venueTypes.filter((v: string) => v !== venue)
      : [...data.venueTypes, venue];
    updateData({ venueTypes });
  };

  // Calculate estimated reach
  const estimatedReach = data.locations.length > 0 ? data.locations.length * 2500 : 0;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-white mb-4">Select Locations</h3>
        <p className="text-white/60 mb-4">
          Choose the areas in Lagos where your ads will be displayed
        </p>
        <div className="grid grid-cols-2 gap-3">
          {LOCATIONS.map((location) => (
            <button
              key={location}
              onClick={() => toggleLocation(location)}
              className={`p-3 rounded-lg border transition-all text-left ${
                data.locations.includes(location)
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-white/10 bg-white/5 text-white hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={data.locations.includes(location)}
                  readOnly
                  className="w-4 h-4"
                />
                <span>{location}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* <div className="pt-4 border-t border-white/5">
        <h3 className="text-xl font-bold text-white mb-4">Venue Type</h3>
        <p className="text-white/60 mb-4">
          Filter by venue type for better targeting
        </p>
        <div className="grid grid-cols-2 gap-3">
          {VENUE_TYPES.map((venue) => (
            <button
              key={venue}
              onClick={() => toggleVenueType(venue)}
              className={`p-3 rounded-lg border transition-all text-left ${
                data.venueTypes.includes(venue)
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-white/10 bg-white/5 text-white hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={data.venueTypes.includes(venue)}
                  readOnly
                  className="w-4 h-4"
                />
                <span>{venue}</span>
              </div>
            </button>
          ))}
        </div>
      </div> */}

      <div className="mt-6 p-4 rounded-lg bg-primary/10 border border-primary/20">
        <p className="text-sm text-white/80">
          <span className="font-bold text-primary">Estimated Daily Reach:</span>{' '}
          {estimatedReach.toLocaleString()} people
        </p>
      </div>
    </div>
  );
}
