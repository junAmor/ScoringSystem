
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface SettingsProps {
  onSave: (settings: any) => void;
}

export default function Settings({ onSave }: SettingsProps) {
  const { toast } = useToast();
  const [adminSettings, setAdminSettings] = useState({
    username: 'admin',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [scoringRules, setScoringRules] = useState({
    minScore: 1,
    maxScore: 100,
    decimals: 2,
    scale: '1-100'
  });

  const [criteria, setCriteria] = useState([
    { name: 'Project Design', weight: 25, enabled: true },
    { name: 'Functionality', weight: 30, enabled: true },
    { name: 'Presentation', weight: 15, enabled: true },
    { name: 'Web Design', weight: 10, enabled: true },
    { name: 'Impact', weight: 20, enabled: true }
  ]);

  const handleExport = () => {
    const settings = {
      criteria,
      scoringRules,
      adminSettings: { username: adminSettings.username }
    };
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'scoring-system-settings.json';
    a.click();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const settings = JSON.parse(e.target?.result as string);
          if (settings.criteria) setCriteria(settings.criteria);
          if (settings.scoringRules) setScoringRules(settings.scoringRules);
          toast({
            title: "Settings imported successfully",
            description: "All settings have been updated.",
          });
        } catch (error) {
          toast({
            title: "Error importing settings",
            description: "Invalid settings file format.",
            variant: "destructive"
          });
        }
      };
      reader.readAsText(file);
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all scores and settings? This cannot be undone.')) {
      // Reset scores in the database
      fetch('/api/scores/reset', { method: 'POST' })
        .then(() => {
          toast({
            title: "Reset successful",
            description: "All scores and settings have been reset.",
          });
        })
        .catch(() => {
          toast({
            title: "Error",
            description: "Failed to reset scores and settings.",
            variant: "destructive"
          });
        });
    }
  };

  const validateCriteriaWeights = () => {
    const totalWeight = criteria.reduce((sum, c) => sum + (c.enabled ? c.weight : 0), 0);
    return Math.abs(totalWeight - 100) < 0.01; // Allow for floating point imprecision
  };

  const handleCriteriaChange = (index: number, field: string, value: any) => {
    const newCriteria = [...criteria];
    newCriteria[index] = { ...newCriteria[index], [field]: value };
    setCriteria(newCriteria);
  };

  const handleSaveAdmin = () => {
    if (adminSettings.newPassword !== adminSettings.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords don't match",
        variant: "destructive"
      });
      return;
    }
    // Save admin settings to backend
    // Add your API call here
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <Tabs defaultValue="criteria">
        <TabsList className="mb-4">
          <TabsTrigger value="criteria">Criteria</TabsTrigger>
          <TabsTrigger value="scoring">Scoring Rules</TabsTrigger>
          <TabsTrigger value="admin">Admin Settings</TabsTrigger>
          <TabsTrigger value="backup">Backup & Reset</TabsTrigger>
        </TabsList>

        <TabsContent value="criteria">
          <Card>
            <CardHeader>
              <CardTitle>Scoring Criteria</CardTitle>
            </CardHeader>
            <CardContent>
              {!validateCriteriaWeights() && (
                <div className="text-red-500 mb-4">
                  Total weights must equal 100%
                </div>
              )}
              {criteria.map((criterion, index) => (
                <div key={index} className="flex items-center space-x-4 mb-4">
                  <Input 
                    value={criterion.name}
                    onChange={(e) => handleCriteriaChange(index, 'name', e.target.value)}
                    className="w-[200px]"
                  />
                  <div className="flex-1 flex items-center space-x-2">
                    <Slider 
                      value={[criterion.weight]}
                      min={0}
                      max={100}
                      step={1}
                      className="flex-1"
                      onValueChange={([value]) => handleCriteriaChange(index, 'weight', value)}
                    />
                    <span className="w-12 text-right">{criterion.weight}%</span>
                  </div>
                  <Switch 
                    checked={criterion.enabled}
                    onCheckedChange={(checked) => handleCriteriaChange(index, 'enabled', checked)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scoring">
          <Card>
            <CardHeader>
              <CardTitle>Scoring Rules</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Minimum Score</Label>
                  <Input 
                    type="number"
                    value={scoringRules.minScore}
                    onChange={(e) => setScoringRules(prev => ({...prev, minScore: parseInt(e.target.value)}))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Maximum Score</Label>
                  <Input 
                    type="number"
                    value={scoringRules.maxScore}
                    onChange={(e) => setScoringRules(prev => ({...prev, maxScore: parseInt(e.target.value)}))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Decimal Places</Label>
                  <Input 
                    type="number"
                    min={0}
                    max={3}
                    value={scoringRules.decimals}
                    onChange={(e) => setScoringRules(prev => ({...prev, decimals: parseInt(e.target.value)}))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admin">
          <Card>
            <CardHeader>
              <CardTitle>Admin Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Username</Label>
                <Input 
                  value={adminSettings.username}
                  onChange={(e) => setAdminSettings(prev => ({...prev, username: e.target.value}))}
                />
              </div>
              <div className="space-y-2">
                <Label>Current Password</Label>
                <Input 
                  type="password"
                  value={adminSettings.currentPassword}
                  onChange={(e) => setAdminSettings(prev => ({...prev, currentPassword: e.target.value}))}
                />
              </div>
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input 
                  type="password"
                  value={adminSettings.newPassword}
                  onChange={(e) => setAdminSettings(prev => ({...prev, newPassword: e.target.value}))}
                />
              </div>
              <div className="space-y-2">
                <Label>Confirm New Password</Label>
                <Input 
                  type="password"
                  value={adminSettings.confirmPassword}
                  onChange={(e) => setAdminSettings(prev => ({...prev, confirmPassword: e.target.value}))}
                />
              </div>
              <Button onClick={handleSaveAdmin} className="w-full">Save Admin Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup">
          <Card>
            <CardHeader>
              <CardTitle>Backup & Reset</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-4">
                <Button onClick={handleExport}>Export Settings</Button>
                <div>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="hidden"
                    id="import-settings"
                  />
                  <Button onClick={() => document.getElementById('import-settings')?.click()}>
                    Import Settings
                  </Button>
                </div>
              </div>
              <Button variant="destructive" onClick={handleReset}>
                Reset All Scores and Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="mt-4 flex justify-end">
        <Button onClick={() => onSave({ criteria, scoringRules })}>
          Save All Settings
        </Button>
      </div>
    </div>
  );
}
