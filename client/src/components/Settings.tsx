
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Switch } from './ui/switch';
import { Label } from './ui/label';

interface SettingsProps {
  onSave: (settings: any) => void;
}

export default function Settings({ onSave }: SettingsProps) {
  const [eventSettings, setEventSettings] = useState({
    eventName: 'Scoring System',
    eventDate: '',
    useRounds: false,
    anonymousJudging: false,
    scoreScale: {
      min: 1,
      max: 10,
      decimals: 2
    }
  });

  const [criteria, setCriteria] = useState([
    { name: 'Project Design', weight: 20, enabled: true },
    { name: 'Functionality', weight: 20, enabled: true },
    { name: 'Presentation', weight: 20, enabled: true },
    { name: 'Web Design', weight: 20, enabled: true },
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
        </TabsList>

        <TabsContent value="event">
          <Card>
            <CardHeader>
              <CardTitle>Event Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Event Name</Label>
                <Input 
                  value={eventSettings.eventName}
                  onChange={(e) => setEventSettings({...eventSettings, eventName: e.target.value})}
                />
              </div>
              <div>
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* Add other tab contents */}
      </Tabs>
    </div>
  );
}
