import { useState, useMemo, useEffect, useCallback } from 'react';
import { FileSearch, Briefcase, TrendingUp, Sparkles, Linkedin, Search, Loader2, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { ResumeUpload } from '@/components/ResumeUpload';
import { ScoreCard } from '@/components/ScoreCard';
import { SkillBadges } from '@/components/SkillBadges';
import { JobCard } from '@/components/JobCard';
import { SuggestionsList } from '@/components/SuggestionsList';
import { LocationFilter } from '@/components/LocationFilter';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { analyzeResume, ResumeAnalysis } from '@/lib/resumeAnalyzer';
import { generateJobs, matchJobsToResume } from '@/lib/jobData';
import { fetchRealJobs, matchJobsToResumeSkills, RealJob } from '@/lib/jobApi';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/Navbar';
import heroBg from '@/assets/hero-bg.jpg';

const Index = () => {
  const { toast } = useToast();
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [location, setLocation] = useState('All India');
  const [jobDescription, setJobDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [realJobs, setRealJobs] = useState<RealJob[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);
  const [usingRealData, setUsingRealData] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);

  // Fallback mock jobs
  const mockJobs = useMemo(() => generateJobs(24, location), [location]);

  const loadRealJobs = useCallback(async (query?: string, loc?: string) => {
    setIsLoadingJobs(true);
    const { jobs, error } = await fetchRealJobs(query || searchQuery, loc || location);
    if (error) {
      toast({ title: 'Using simulated data', description: error, variant: 'destructive' });
      setUsingRealData(false);
    } else if (jobs.length > 0) {
      setRealJobs(jobs);
      setUsingRealData(true);
    } else {
      toast({ title: 'No jobs found', description: 'Showing simulated data instead' });
      setUsingRealData(false);
    }
    setSearchPerformed(true);
    setIsLoadingJobs(false);
  }, [searchQuery, location, toast]);



  const displayJobs = useMemo(() => {
    if (usingRealData && realJobs.length > 0) {
      if (analysis) {
        const skills = analysis.skills.map(s => s.skill);
        return matchJobsToResumeSkills(realJobs, skills);
      }
      return realJobs;
    }
    // Fallback to mock
    if (analysis) {
      const skills = analysis.skills.map(s => s.skill);
      return matchJobsToResume(mockJobs, skills);
    }
    
    return searchPerformed ? mockJobs.map(j => ({ ...j, matchScore: 0, applyLink: '' })) : [];
  }, [usingRealData, realJobs, mockJobs, analysis, searchPerformed]);

  const handleAnalyze = async (text: string) => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeResume(text, jobDescription || undefined);
      setAnalysis(result);
      if (result.matchedRoles.length > 0) {
        setSearchQuery(result.matchedRoles[0]);
        loadRealJobs(result.matchedRoles[0], location);
      }

      // ✅ Auto-save to Supabase history
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error: saveError } = await supabase
          .from('resume_history')
          .insert({
            user_id: user.id,
            resume_text: text,
            analysis_result: result,
            score: result.overallScore
          });
        
        if (saveError) {
          console.error('Error saving scan to history:', saveError);
        } else {
          console.log('Scan saved to history successfully');
        }
      }

    } catch (err) {
      console.error('Analysis failed:', err);
      toast({ title: 'Analysis failed', description: err instanceof Error ? err.message : 'Unknown error', variant: 'destructive' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSearch = () => {
    loadRealJobs(searchQuery, location);
  };

  const handleLocationChange = (newLocation: string) => {
    setLocation(newLocation);
    loadRealJobs(searchQuery, newLocation);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {/* Hero */}
      <header className="relative overflow-hidden pt-16">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        <div className="absolute inset-0 gradient-hero opacity-90" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-16 sm:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-accent" />
              <span className="text-sm font-medium text-accent tracking-wider uppercase">
                AI-Powered Analysis
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold text-primary-foreground mb-3 tracking-tight">
              Resume Analyzer & Job Matcher
            </h1>
            <p className="text-base sm:text-lg text-primary-foreground/70 max-w-2xl mx-auto">
              Upload your resume, get instant skill analysis and personalized job recommendations
              from top companies actively hiring in India
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <Badge variant="outline" className="border-accent/40 text-accent text-xs gap-1">
                <Linkedin className="w-3 h-3" /> Real-Time Jobs via JSearch
              </Badge>
              <Badge variant="outline" className="border-primary-foreground/30 text-primary-foreground/70 text-xs">
                🇮🇳 India
              </Badge>
              {usingRealData && (
                <Badge variant="outline" className="border-score-excellent/40 text-accent text-xs">
                  ✓ Live Data
                </Badge>
              )}
            </div>
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 -mt-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Panel */}
          <div className="lg:col-span-4 space-y-5">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card rounded-lg p-5 shadow-card border border-border"
            >
              <div className="flex items-center gap-2 mb-4">
                <FileSearch className="w-5 h-5 text-accent" />
                <h2 className="font-semibold text-foreground">Upload Resume</h2>
              </div>
              <ResumeUpload onTextExtracted={handleAnalyze} isAnalyzing={isAnalyzing} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card rounded-lg p-5 shadow-card border border-border"
            >
              <h3 className="text-sm font-semibold text-foreground mb-2">
                Job Description (optional)
              </h3>
              <p className="text-xs text-muted-foreground mb-3">
                Paste a job description to get a targeted match score
              </p>
              <Textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste job description here for targeted scoring..."
                className="min-h-[100px] text-sm resize-none"
              />
            </motion.div>

            {analysis && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                <SuggestionsList suggestions={analysis.suggestions} sections={analysis.sections} />
              </motion.div>
            )}
          </div>

          {/* Middle */}
          <div className="lg:col-span-3 space-y-5">
            {analysis ? (
              <>
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                  <ScoreCard score={analysis.overallScore} label="Overall Score" subtitle="Based on content, structure & skills" />
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                  <SkillBadges skills={analysis.skills} title="Detected Skills" />
                </motion.div>
                {analysis.matchedRoles.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="bg-card rounded-lg p-5 shadow-card border border-border">
                    <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-accent" /> Matched Roles
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.matchedRoles.map(role => (
                        <Badge key={role} className="bg-accent/10 text-accent border-accent/20 text-xs cursor-pointer hover:bg-accent/20"
                          onClick={() => { setSearchQuery(role); loadRealJobs(role, location); }}>
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </motion.div>
                )}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                  className="bg-card rounded-lg p-5 shadow-card border border-border">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Top Keywords</h3>
                  <div className="space-y-1.5">
                    {analysis.keywords.slice(0, 8).map((kw, i) => (
                      <div key={kw.word} className="flex items-center gap-2">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-xs font-mono text-foreground">{kw.word}</span>
                            <span className="text-[10px] text-muted-foreground">{kw.tfidfScore ? `TF-IDF: ${kw.tfidfScore}` : kw.count}</span>
                          </div>
                          <div className="w-full bg-secondary rounded-full h-1">
                            <motion.div initial={{ width: 0 }}
                              animate={{ width: `${Math.min((kw.tfidfScore || kw.count) / Math.max((analysis.keywords[0]?.tfidfScore || analysis.keywords[0]?.count || 1), 1) * 100, 100)}%` }}
                              transition={{ delay: 0.3 + i * 0.05, duration: 0.5 }}
                              className="h-full rounded-full gradient-accent" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="bg-card rounded-lg p-8 shadow-card border border-border text-center">
                <FileSearch className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Upload your resume to see analysis results</p>
              </motion.div>
            )}
          </div>

          {/* Right - Jobs */}
          <div className="lg:col-span-5 space-y-4">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
              className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-accent" />
                  <h2 className="font-semibold text-foreground">Job Recommendations</h2>
                  <Badge variant="secondary" className="text-[10px]">
                    {displayJobs.length} jobs
                  </Badge>
                  {usingRealData && (
                    <Badge variant="outline" className="text-[10px] border-score-excellent/40 score-excellent">
                      LIVE
                    </Badge>
                  )}
                </div>
                <LocationFilter value={location} onChange={handleLocationChange} />
              </div>

              {/* Search bar */}
              <div className="flex gap-2">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search jobs (e.g. software developer)"
                  className="text-sm h-9"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button size="sm" onClick={handleSearch} disabled={isLoadingJobs}
                  className="gradient-accent text-accent-foreground h-9 px-3">
                  {isLoadingJobs ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </Button>
                <Button size="sm" variant="outline" onClick={() => loadRealJobs()} disabled={isLoadingJobs} className="h-9 px-2">
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>

            <div className="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
              {isLoadingJobs ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <Loader2 className="w-8 h-8 text-accent animate-spin" />
                  <p className="text-sm text-muted-foreground">Fetching real-time jobs...</p>
                </div>
              ) : displayJobs.length > 0 ? (
                displayJobs.map((job, i) => (
                  <JobCard key={job.id} job={job} index={i} />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 gap-3 bg-card rounded-lg border border-border shadow-sm mt-4">
                  <Briefcase className="w-10 h-10 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground text-center px-4">Upload a resume or do a manual search to see live job recommendations</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
