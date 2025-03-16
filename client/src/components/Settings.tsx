
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";

interface SettingsProps {
  onSave: (settings: any) => void;
}

export default function Settings({ onSave }: SettingsProps) {
  const [eventSettings, setEventSettings] = useState({
    eventName: 'Arduino Innovation Challenge',
    eventDate: '',
    useRounds: false,
    anonymousJudging: false,
    scoreScale: {
      min: 1,
      max: 100,
      decimals: 2
    },
    language: 'en',
    timezone: 'UTC',
    theme: 'light'
  });

  const [criteria, setCriteria] = useState([
    { name: 'Project Design', weight: 25, enabled: true },
    { name: 'Functionality', weight: 30, enabled: true },
    { name: 'Presentation', weight: 15, enabled: true },
    { name: 'Web Design', weight: 10, enabled: true },
    { name: 'Impact', weight: 20, enabled: true }
  ]);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <Tabs defaultValue="event">
        <TabsList className="mb-4">
          <TabsTrigger value="event">Event Settings</TabsTrigger>
          <TabsTrigger value="criteria">Criteria</TabsTrigger>
          <TabsTrigger value="scoring">Scoring Rules</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="backup">Backup & Reset</TabsTrigger>
        </TabsList>

        <TabsContent value="event">
          <Card>
            <CardHeader>
              <CardTitle>Event Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Event Name</Label>
                <Input 
                  value={eventSettings.eventName}
                  onChange={(e) => setEventSettings({...eventSettings, eventName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Event Date</Label>
                <Input 
                  type="date"
                  value={eventSettings.eventDate}
                  onChange={(e) => setEventSettings({...eventSettings, eventDate: e.target.value})}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  checked={eventSettings.useRounds}
                  onCheckedChange={(checked) => setEventSettings({...eventSettings, useRounds: checked})}
                />
                <Label>Enable Rounds</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  checked={eventSettings.anonymousJudging}
                  onCheckedChange={(checked) => setEventSettings({...eventSettings, anonymousJudging: checked})}
                />
                <Label>Anonymous Judging</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="criteria">
          <Card>
            <CardHeader>
              <CardTitle>Scoring Criteria</CardTitle>
            </CardHeader>
            <CardContent>
              {criteria.map((criterion, index) => (
                <div key={index} className="flex items-center space-x-4 mb-4">
                  <Input 
                    value={criterion.name}
                    onChange={(e) => {
                      const newCriteria = [...criteria];
                      newCriteria[index].name = e.target.value;
                      setCriteria(newCriteria);
                    }}
                  />
                  <Slider 
                    value={[criterion.weight]}
                    min={0}
                    max={100}
                    step={5}
                    className="w-[200px]"
                    onValueChange={(value) => {
                      const newCriteria = [...criteria];
                      newCriteria[index].weight = value[0];
                      setCriteria(newCriteria);
                    }}
                  />
                  <Switch 
                    checked={criterion.enabled}
                    onCheckedChange={(checked) => {
                      const newCriteria = [...criteria];
                      newCriteria[index].enabled = checked;
                      setCriteria(newCriteria);
                    }}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Add other tabs content here */}
      </Tabs>
      
      <div className="mt-4 flex justify-end">
        <Button onClick={() => onSave({ eventSettings, criteria })}>
          Save Settings
        </Button>
      </div>
    </div>
  );
}
