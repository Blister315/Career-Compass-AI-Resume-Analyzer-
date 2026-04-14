import { MapPin } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { INDIAN_CITIES } from '@/lib/jobData';

interface LocationFilterProps {
  value: string;
  onChange: (city: string) => void;
}

export function LocationFilter({ value, onChange }: LocationFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <MapPin className="w-4 h-4 text-accent shrink-0" />
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[180px] h-9 text-sm">
          <SelectValue placeholder="Select location" />
        </SelectTrigger>
        <SelectContent>
          {INDIAN_CITIES.map(city => (
            <SelectItem key={city} value={city} className="text-sm">
              {city}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
