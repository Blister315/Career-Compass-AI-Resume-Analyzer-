import { useState, useCallback } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';

interface ResumeUploadProps {
  onTextExtracted: (text: string) => void;
  isAnalyzing: boolean;
}

export function ResumeUpload({ onTextExtracted, isAnalyzing }: ResumeUploadProps) {
  const [resumeText, setResumeText] = useState('');
  const [fileName, setFileName] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback((file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setResumeText(text);
    };
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const clearFile = () => {
    setFileName('');
    setResumeText('');
  };

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
          dragOver
            ? 'border-accent bg-accent/5 scale-[1.01]'
            : 'border-border hover:border-accent/50'
        }`}
      >
        <input
          type="file"
          accept=".txt,.pdf,.doc,.docx"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
        <p className="text-sm font-medium text-foreground">
          Drop your resume here or click to upload
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Supports .txt files (paste text below for other formats)
        </p>
      </div>

      <AnimatePresence>
        {fileName && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-2 rounded-md bg-secondary p-3"
          >
            <FileText className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium flex-1 truncate">{fileName}</span>
            <button onClick={clearFile} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative">
        <Textarea
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          placeholder="Or paste your resume text here..."
          className="min-h-[160px] text-sm resize-none"
        />
      </div>

      <Button
        onClick={() => onTextExtracted(resumeText)}
        disabled={!resumeText.trim() || isAnalyzing}
        className="w-full gradient-accent text-accent-foreground hover:opacity-90 transition-opacity"
      >
        {isAnalyzing ? 'Analyzing...' : 'Analyze Resume'}
      </Button>
    </div>
  );
}
