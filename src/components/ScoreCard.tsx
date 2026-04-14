import { motion } from 'framer-motion';

interface ScoreCardProps {
  score: number;
  label: string;
  subtitle?: string;
}

function getScoreColor(score: number) {
  if (score >= 80) return { text: 'score-excellent', bg: 'bg-score-excellent' };
  if (score >= 60) return { text: 'score-good', bg: 'bg-score-good' };
  if (score >= 40) return { text: 'score-average', bg: 'bg-score-average' };
  return { text: 'score-low', bg: 'bg-score-low' };
}

export function ScoreCard({ score, label, subtitle }: ScoreCardProps) {
  const colors = getScoreColor(score);

  return (
    <div className="bg-card rounded-lg p-5 shadow-card border border-border">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
          className={`text-3xl font-bold ${colors.text}`}
        >
          {score}
        </motion.span>
      </div>
      <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
          className={`h-full rounded-full ${colors.bg}`}
        />
      </div>
    </div>
  );
}
