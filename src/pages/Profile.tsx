import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  User, 
  Mail, 
  Briefcase, 
  History, 
  Calendar,
  ChevronRight,
  TrendingUp,
  Loader2,
  Trash2,
  Save,
  Clock,
  Eye,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch Profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      
      setProfile(profileData);

      // Fetch History
      const { data: historyData } = await supabase
        .from("resume_history")
        .select("*")
        .order("created_at", { ascending: false });
      
      setHistory(historyData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
        role: profile.role,
      })
      .eq("id", profile.id);

    if (error) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Profile updated",
        description: "Your changes have been saved successfully.",
      });
    }
    setSaving(false);
  };

  const deleteHistoryItem = async (id: string) => {
    const { error } = await supabase
      .from("resume_history")
      .delete()
      .eq("id", id);
    
    if (error) {
      toast({ title: "Delete failed", variant: "destructive" });
    } else {
      setHistory(history.filter(item => item.id !== id));
      toast({ title: "Scan removed from history" });
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 space-y-8">
        <Skeleton className="h-12 w-1/3" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Skeleton className="h-[400px] lg:col-span-1" />
          <Skeleton className="h-[600px] lg:col-span-2" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-24 min-h-screen">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-8"
      >
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">My Dashboard</h1>
          <p className="text-muted-foreground">Manage your profile and track your career progression</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Profile Info */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-border shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-accent" /> Account Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs text-muted-foreground uppercase tracking-widest">Email Address</Label>
                  <div className="flex items-center gap-2 text-foreground font-medium p-2 bg-muted/50 rounded-md border border-border/50">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    {profile?.email}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    value={profile?.full_name || ""} 
                    onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                    placeholder="Enter your name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Current Status</Label>
                  <Select 
                    value={profile?.role || "Student"} 
                    onValueChange={(val) => setProfile({...profile, role: val})}
                  >
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Student">Student</SelectItem>
                      <SelectItem value="Employed">Employed</SelectItem>
                      <SelectItem value="Unemployed">Unemployed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  onClick={handleUpdateProfile} 
                  disabled={saving} 
                  className="w-full gradient-accent text-accent-foreground mt-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Changes
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border bg-accent/5 overflow-hidden">
               <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                     <div className="p-2 bg-accent/10 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-accent" />
                     </div>
                     <Badge variant="outline" className="text-accent border-accent/20">Pro Member</Badge>
                  </div>
                  <h3 className="font-bold text-lg mb-1">Career Insights</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    You've analyzed {history.length} resumes. Your average score is{" "}
                    <span className="text-accent font-bold">
                      {history.length > 0 
                        ? Math.round(history.reduce((acc, curr) => acc + (curr.score || 0), 0) / history.length) 
                        : 0}%
                    </span>.
                  </p>
               </CardContent>
            </Card>
          </div>

          {/* Right: History */}
          <div className="lg:col-span-8">
            <Card className="border-border shadow-md h-full min-h-[500px]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-1">
                   <CardTitle className="flex items-center gap-2">
                     <History className="w-5 h-5 text-accent" /> Analysis History
                   </CardTitle>
                   <CardDescription>View and manage your previous resume scans</CardDescription>
                </div>
                {history.length > 0 && (
                  <Badge variant="secondary" className="font-mono">{history.length} total</Badge>
                )}
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[550px] pr-4">
                  {history.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                        <Clock className="w-8 h-8 text-muted-foreground/30" />
                      </div>
                      <p className="text-muted-foreground font-medium">No resume history found</p>
                      <p className="text-xs text-muted-foreground mt-1">Uploaded resumes will appear here for quick access</p>
                      <Button variant="outline" className="mt-6" asChild>
                         <a href="/">Upload your first resume</a>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4 py-2">
                      {history.map((record, index) => (
                        <motion.div 
                          key={record.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="group relative flex items-center justify-between p-4 rounded-xl border border-border hover:border-accent/40 hover:bg-accent/5 transition-all"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 flex items-center justify-center rounded-full font-bold text-sm
                              ${(record.score || 0) >= 80 ? 'bg-score-excellent/10 text-score-excellent' : 
                                (record.score || 0) >= 60 ? 'bg-score-good/10 text-score-good' : 'bg-score-average/10 text-score-average'}`}
                            >
                              {record.score}%
                            </div>
                            <div>
                              <h4 className="font-semibold text-sm group-hover:text-accent transition-colors">
                                Resume Analysis #{history.length - index}
                              </h4>
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                <Calendar className="w-3 h-3" />
                                {new Date(record.created_at).toLocaleDateString()} at {new Date(record.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* View Report Dialog */}
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="secondary" size="sm" className="gap-2" onClick={() => setSelectedRecord(record)}>
                                   <Eye className="w-4 h-4" /> View Report
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle className="text-2xl flex items-center gap-2">
                                    <FileText className="text-accent" /> Analysis Report
                                  </DialogTitle>
                                  <DialogDescription>
                                    Scan performed on {new Date(record.created_at).toLocaleString()}
                                  </DialogDescription>
                                </DialogHeader>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                                  <div className="md:col-span-1 space-y-4">
                                    <Card className="bg-accent/5 border-accent/20">
                                      <CardContent className="pt-6 text-center">
                                        <div className="text-4xl font-extrabold text-accent mb-1">{record.score}%</div>
                                        <div className="text-xs uppercase tracking-tighter text-muted-foreground">Overall Score</div>
                                      </CardContent>
                                    </Card>
                                    
                                    <div className="space-y-2">
                                      <h5 className="font-bold text-sm">Target Roles</h5>
                                      <div className="flex flex-wrap gap-1.5">
                                        {record.analysis_result?.matchedRoles?.map((role: string) => (
                                          <Badge key={role} variant="outline" className="text-[10px]">{role}</Badge>
                                        ))}
                                      </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                       <h5 className="font-bold text-sm">Key Skills Found</h5>
                                       <div className="flex flex-wrap gap-1">
                                         {record.analysis_result?.skills?.filter((s:any) => s.found).slice(0, 10).map((s:any) => (
                                           <Badge key={s.skill} className="text-[9px] bg-accent/10 text-accent border-0">{s.skill}</Badge>
                                         ))}
                                       </div>
                                    </div>
                                  </div>

                                  <div className="md:col-span-2 space-y-4">
                                    <div className="space-y-2">
                                      <h5 className="font-bold text-sm">Original Resume Text</h5>
                                      <ScrollArea className="h-64 rounded-md border p-4 bg-muted/30">
                                        <pre className="text-[11px] whitespace-pre-wrap font-mono opacity-80">
                                          {record.resume_text}
                                        </pre>
                                      </ScrollArea>
                                    </div>

                                    <div className="space-y-2">
                                      <h5 className="font-bold text-sm">Top Suggestions</h5>
                                      <ul className="space-y-1.5">
                                        {record.analysis_result?.suggestions?.slice(0, 4).map((s:string, i:number) => (
                                          <li key={i} className="text-xs flex items-start gap-2 bg-muted/50 p-2 rounded-md">
                                            <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                                            {s}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>

                            {/* Delete Confirmation */}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 transition-all">
                                   <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete this analysis record from your history. This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => deleteHistoryItem(record.id)}
                                    className="bg-red-500 hover:bg-red-600 focus:ring-red-500"
                                  >
                                    Delete Record
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
