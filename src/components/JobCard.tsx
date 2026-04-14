import { MapPin, Clock, ExternalLink, Briefcase } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface JobCardProps {
  job: {
    id: string;
    title: string;
    company: string;
    location: string;
    type: string;
    posted: string;
    skills: string[];
    salary: string;
    logo: string;
    linkedinUrl: string;
    matchScore?: number;
    applyLink?: string;
  };
  index: number;
}

function getMatchColor(score: number) {
  if (score >= 70) return 'bg-score-excellent text-accent-foreground';
  if (score >= 40) return 'bg-score-good text-accent-foreground';
  if (score >= 20) return 'bg-score-average text-primary-foreground';
  return 'bg-secondary text-secondary-foreground';
}

export function JobCard({ job, index }: JobCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="bg-card rounded-lg p-4 shadow-card border border-border hover:shadow-elevated transition-shadow duration-300 group"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 flex items-center justify-center rounded-md bg-secondary shrink-0 overflow-hidden">
          {job.logo && job.logo.startsWith('http') ? (
            <img src={job.logo} alt={job.company} className="w-full h-full object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          ) : (
            <span className="text-lg">{job.logo || job.company.charAt(0)}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-sm text-foreground leading-tight">{job.title}</h3>
              <p className="text-sm text-muted-foreground">{job.company}</p>
            </div>
            {job.matchScore !== undefined && job.matchScore > 0 && (
              <Badge className={`shrink-0 text-xs ${getMatchColor(job.matchScore)}`}>
                {job.matchScore}% match
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {job.location}
            </span>
            <span className="flex items-center gap-1">
              <Briefcase className="w-3 h-3" /> {job.type}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> {job.posted}
            </span>
          </div>

          <div className="flex flex-wrap gap-1 mt-2.5">
            {job.skills.slice(0, 4).map(skill => (
              <Badge key={skill} variant="outline" className="text-[10px] px-1.5 py-0">
                {skill}
              </Badge>
            ))}
            {job.skills.length > 4 && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                +{job.skills.length - 4}
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between mt-3">
            <span className="text-xs font-semibold text-accent">{job.salary}</span>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs gap-1 text-muted-foreground hover:text-accent"
              asChild
            >
              <a href={job.linkedinUrl} target="_blank" rel="noopener noreferrer">
                View on LinkedIn <ExternalLink className="w-3 h-3" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
