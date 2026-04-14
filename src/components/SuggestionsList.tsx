import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface SuggestionsListProps {
  suggestions: string[];
  sections: { name: string; found: boolean }[];
}

export function SuggestionsList({ suggestions, sections }: SuggestionsListProps) {
  return (
    <div className="bg-card rounded-lg p-5 shadow-card border border-border">
      <h3 className="text-sm font-semibold text-foreground mb-3">Resume Sections</h3>
      <div className="grid grid-cols-2 gap-1.5 mb-4">
        {sections.map((section, i) => (
          <motion.div
            key={section.name}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-1.5 text-xs"
          >
            {section.found ? (
              <CheckCircle2 className="w-3.5 h-3.5 score-excellent shrink-0" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            )}
            <span className={section.found ? 'text-foreground' : 'text-muted-foreground'}>
              {section.name.charAt(0).toUpperCase() + section.name.slice(1)}
            </span>
          </motion.div>
        ))}
      </div>

      {suggestions.length > 0 && (
        <>
          <h3 className="text-sm font-semibold text-foreground mb-2">Suggestions</h3>
          <ul className="space-y-1.5">
            {suggestions.map((suggestion, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="text-xs text-muted-foreground flex items-start gap-2"
              >
                <span className="text-score-average mt-0.5">•</span>
                {suggestion}
              </motion.li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
