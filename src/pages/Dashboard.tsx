import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { students, regularSurahs, getGradeStatus } from "@/data/students";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Users, BookOpen, Trophy, TrendingUp, CheckCircle, AlertCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

interface HafalanRecord {
  id: string;
  student_id: string;
  date: string;
  surah: string;
  ayat: string;
  score: number;
  notes: string | null;
}

interface MurajaahRecord {
  id: string;
  student_id: string;
  date: string;
  surah: string;
  status: string;
}

interface StudentProgress {
  id: string;
  name: string;
  totalRecords: number;
  averageScore: number;
  completedSurahs: number;
  lastActivity: string | null;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--gold))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

const Dashboard = () => {
  const [hafalanRecords, setHafalanRecords] = useState<HafalanRecord[]>([]);
  const [murajaahRecords, setMurajaahRecords] = useState<MurajaahRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [hafalanRes, murajaahRes] = await Promise.all([
      supabase.from("hafalan_records").select("*"),
      supabase.from("murajaah_records").select("*")
    ]);

    if (hafalanRes.data) setHafalanRecords(hafalanRes.data);
    if (murajaahRes.data) setMurajaahRecords(murajaahRes.data);
    setLoading(false);
  };

  // Calculate statistics
  const totalStudents = students.length;
  const studentsWithRecords = new Set(hafalanRecords.map(r => r.student_id)).size;
  const totalHafalanRecords = hafalanRecords.length;
  const totalMurajaahRecords = murajaahRecords.length;
  const averageScore = hafalanRecords.length > 0 
    ? Math.round(hafalanRecords.reduce((sum, r) => sum + r.score, 0) / hafalanRecords.length) 
    : 0;

  // Score distribution
  const scoreDistribution = [
    { name: "Sangat Lancar (90+)", value: hafalanRecords.filter(r => r.score >= 90).length, color: "hsl(142, 76%, 36%)" },
    { name: "Lancar (80-89)", value: hafalanRecords.filter(r => r.score >= 80 && r.score < 90).length, color: "hsl(var(--primary))" },
    { name: "Kurang Lancar (70-79)", value: hafalanRecords.filter(r => r.score >= 70 && r.score < 80).length, color: "hsl(var(--gold))" },
    { name: "Tidak Lancar (<70)", value: hafalanRecords.filter(r => r.score < 70).length, color: "hsl(0, 84%, 60%)" },
  ].filter(d => d.value > 0);

  // Surah progress
  const surahProgress = regularSurahs.map(surah => {
    const records = hafalanRecords.filter(r => r.surah === surah);
    const uniqueStudents = new Set(records.map(r => r.student_id)).size;
    return {
      surah: surah.replace("Al-", ""),
      students: uniqueStudents,
      percentage: Math.round((uniqueStudents / totalStudents) * 100)
    };
  });

  // Student progress
  const studentProgress: StudentProgress[] = students.map(student => {
    const records = hafalanRecords.filter(r => r.student_id === student.id);
    const completedSurahs = new Set(records.map(r => r.surah)).size;
    const avgScore = records.length > 0 
      ? Math.round(records.reduce((sum, r) => sum + r.score, 0) / records.length)
      : 0;
    const lastRecord = records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    
    return {
      id: student.id,
      name: student.name,
      totalRecords: records.length,
      averageScore: avgScore,
      completedSurahs,
      lastActivity: lastRecord?.date || null
    };
  }).sort((a, b) => b.averageScore - a.averageScore);

  // Top performers
  const topPerformers = studentProgress.filter(s => s.totalRecords > 0).slice(0, 5);

  if (loading) {
    return (
      <div className="min-h-screen bg-background islamic-pattern">
        <Header />
        <main className="container mx-auto px-4 py-6 max-w-6xl">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background islamic-pattern">
      <Header />
      
      <main className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Page Title */}
        <div className="flex items-center gap-2 mb-6">
          <div className="w-1 h-6 bg-primary rounded-full" />
          <h1 className="text-xl font-bold text-foreground">Dashboard Statistik</h1>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalStudents}</p>
                  <p className="text-xs text-muted-foreground">Total Siswa</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gold/10 rounded-lg">
                  <BookOpen className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalHafalanRecords}</p>
                  <p className="text-xs text-muted-foreground">Total Setoran</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Trophy className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{averageScore}</p>
                  <p className="text-xs text-muted-foreground">Rata-rata Nilai</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{studentsWithRecords}</p>
                  <p className="text-xs text-muted-foreground">Siswa Aktif</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Score Distribution Pie Chart */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Distribusi Nilai</CardTitle>
            </CardHeader>
            <CardContent>
              {scoreDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={scoreDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {scoreDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend 
                      wrapperStyle={{ fontSize: '12px' }}
                      formatter={(value) => <span className="text-foreground text-xs">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                  Belum ada data
                </div>
              )}
            </CardContent>
          </Card>

          {/* Surah Progress Bar Chart */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Progress per Surah</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={surahProgress} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <YAxis dataKey="surah" type="category" width={80} tick={{ fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [`${value}%`, 'Progress']}
                  />
                  <Bar dataKey="percentage" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Top Performers */}
        <Card className="bg-card border-border mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Trophy className="w-4 h-4 text-gold" />
              Top 5 Siswa Terbaik
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topPerformers.length > 0 ? (
              <div className="space-y-3">
                {topPerformers.map((student, index) => (
                  <div key={student.id} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-gold text-white' :
                      index === 1 ? 'bg-gray-400 text-white' :
                      index === 2 ? 'bg-amber-600 text-white' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{student.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {student.totalRecords} setoran • {student.completedSurahs} surah
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">{student.averageScore}</p>
                      <p className="text-xs text-muted-foreground">rata-rata</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-4">
                Belum ada data setoran
              </div>
            )}
          </CardContent>
        </Card>

        {/* All Students Progress */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Progress Seluruh Siswa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {studentProgress.map((student) => {
                const progressPercent = (student.completedSurahs / regularSurahs.length) * 100;
                const status = student.averageScore >= 90 ? 'sangat-lancar' :
                              student.averageScore >= 80 ? 'lancar' :
                              student.averageScore >= 70 ? 'kurang-lancar' : 'tidak-lancar';
                
                return (
                  <div key={student.id} className="p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {student.totalRecords > 0 ? (
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        )}
                        <span className="text-sm font-medium text-foreground truncate">{student.name}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {student.totalRecords > 0 && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            status === 'sangat-lancar' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                            status === 'lancar' ? 'bg-primary/10 text-primary' :
                            status === 'kurang-lancar' ? 'bg-gold/10 text-gold' :
                            'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {student.averageScore}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {student.completedSurahs}/{regularSurahs.length} surah
                        </span>
                      </div>
                    </div>
                    <Progress value={progressPercent} className="h-1.5" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
