import { FlaskConical } from 'lucide-react';
import { Badge } from './ui/Badge';

export function SampleBadge() {
  return (
    <Badge tone="caution">
      <FlaskConical size={12} aria-hidden /> Sample data
    </Badge>
  );
}
