import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { SkillMatch } from '@/lib/resumeAnalyzer';

interface SkillBadgesProps {
  skills: SkillMatch[];
  title: string;
}

export function SkillBadges({ skills, title }: SkillBadgesProps) {
  const techSkills = skills.filter(s => s.category === 'technical');
  const softSkills = skills.filter(s => s.category === 'soft');

  return (
    <div className="bg-card rounded-lg p-5 shadow-card border border-border">
      <h3 className="text-sm font-semibold text-foreground mb-4">{title}</h3>
      
      {techSkills.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Technical</p>
          <div className="flex flex-wrap gap-1.5">
            {techSkills.map((skill, i) => (
              <motion.div
                key={skill.skill}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
              >
                <Badge variant="secondary" className="text-xs font-medium bg-accent/10 text-accent border-accent/20">
                  {skill.skill}
                </Badge>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {softSkills.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Soft Skills</p>
          <div className="flex flex-wrap gap-1.5">
            {softSkills.map((skill, i) => (
              <motion.div
                key={skill.skill}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 + 0.2 }}
              >
                <Badge variant="outline" className="text-xs font-medium">
                  {skill.skill}
                </Badge>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {skills.length === 0 && (
        <p className="text-sm text-muted-foreground">No skills detected yet</p>
      )}
    </div>
  );
}
