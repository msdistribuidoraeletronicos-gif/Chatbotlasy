'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search, Target, MapPin, Calendar, Users, Settings, Play, Pause, BarChart3, Info } from 'lucide-react';
import type { Lead, LeadCaptureJob, ChatbotConfig } from '@/lib/types';

interface LeadCaptureProps {
  onLeadsGenerated: (leads: Lead[]) => void;
  useCRM: boolean;
  crmConfig: ChatbotConfig['crm_integrations'];
}

export default function LeadCapture({ onLeadsGenerated, useCRM, crmConfig }: LeadCaptureProps) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureSettings, setCaptureSettings] = useState({
    niche: '',
    location: '',
    source: 'instagram' as 'instagram' | 'facebook' | 'linkedin' | 'google_maps',
    dailyLimit: 50,
    businessType: 'both' as 'company' | 'individual' | 'both',
    ageRange: { min: 18, max: 65 },
    gender: 'any' as 'male' | 'female' | 'any'
  });
  const [captureJobs, setCaptureJobs] = useState<LeadCaptureJob[]>([]);
  const [todayStats, setTodayStats] = useState({
    leadsGenerated: 0,
    leadsValidated: 0,
    successRate: 0
  });

  const handleStartCapture = async () => {
    if (!captureSettings.niche || !captureSettings.location) {
      alert('Por favor, preencha o nicho e a localização');
      return;
    }

    setIsCapturing(true);
    
    try {
      // Simular processo de captação
      const newJob: LeadCaptureJob = {
        id: `job_${Date.now()}`,
        niche: captureSettings.niche,
        location: captureSettings.location,
        source: captureSettings.source,
        status: 'running',
        leads_found: 0,
        leads_validated: 0,
        started_at: new Date()
      };

      setCaptureJobs(prev => [newJob, ...prev]);

      // Simular captação de leads
      await new Promise(resolve => setTimeout(resolve, 3000));

      const mockLeads: Lead[] = [];
      const leadsToGenerate = Math.min(captureSettings.dailyLimit, 25);

      for (let i = 0; i < leadsToGenerate; i++) {
        const lead: Lead = {
          id: `lead_${Date.now()}_${i}`,
          name: `${captureSettings.niche} Lead ${i + 1}`,
          phone: `(11) 9${Math.floor(Math.random() * 10000)}-${Math.floor(Math.random() * 10000)}`,
          email: `lead${i + 1}@${captureSettings.niche.toLowerCase()}.com`,
          company: captureSettings.businessType !== 'individual' ? `${captureSettings.niche} Empresa ${i + 1}` : undefined,
          address: `${captureSettings.location}, Brasil`,
          source: captureSettings.source,
          status: 'new',
          validation_status: 'pending',
          created_at: new Date(),
          updated_at: new Date()
        };

        if (captureSettings.source === 'instagram') {
          lead.instagram = `@${captureSettings.niche.toLowerCase()}${i + 1}`;
        } else if (captureSettings.source === 'linkedin') {
          lead.linkedin = `linkedin.com/in/${captureSettings.niche.toLowerCase()}-${i + 1}`;
        }

        mockLeads.push(lead);
      }

      // Simular validação
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const validatedLeads = mockLeads.map(lead => ({
        ...lead,
        validation_status: Math.random() > 0.3 ? 'valid' : 'invalid' as 'valid' | 'invalid',
        validation_details: {
          instagram_active: captureSettings.source === 'instagram' ? Math.random() > 0.2 : undefined,
          last_post_date: captureSettings.source === 'instagram' ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) : undefined,
          engagement_rate: captureSettings.source === 'instagram' ? Math.random() * 10 : undefined,
          business_open: captureSettings.source === 'google_maps' ? Math.random() > 0.1 : undefined,
          profile_activity: ['linkedin', 'facebook'].includes(captureSettings.source) ? Math.random() > 0.2 : undefined
        }
      }));

      const validLeads = validatedLeads.filter(lead => lead.validation_status === 'valid');

      // Atualizar job
      const completedJob = {
        ...newJob,
        status: 'completed' as const,
        leads_found: mockLeads.length,
        leads_validated: validLeads.length,
        completed_at: new Date()
      };

      setCaptureJobs(prev => prev.map(job => job.id === newJob.id ? completedJob : job));
      
      // Atualizar estatísticas
      setTodayStats(prev => ({
        leadsGenerated: prev.leadsGenerated + mockLeads.length,
        leadsValidated: prev.leadsValidated + validLeads.length,
        successRate: ((prev.leadsValidated + validLeads.length) / (prev.leadsGenerated + mockLeads.length)) * 100
      }));

      onLeadsGenerated(validLeads);
      
    } catch (error) {
      console.error('Erro na captação de leads:', error);
    } finally {
      setIsCapturing(false);
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'instagram': return '📷';
      case 'facebook': return '👥';
      case 'linkedin': return '💼';
      case 'google_maps': return '🗺️';
      default: return '🔍';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getActiveCRMs = () => {
    const active = [];
    if (crmConfig.hubspot?.enabled) active.push('HubSpot');
    if (crmConfig.pipedrive?.enabled) active.push('Pipedrive');
    if (crmConfig.rd_station?.enabled) active.push('RD Station');
    return active;
  };

  return (
    <div className="space-y-6">
      {/* Status CRM */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          {useCRM ? (
            <>
              <strong>CRM Ativo:</strong> Leads serão sincronizados automaticamente com: {getActiveCRMs().join(', ') || 'Nenhum CRM configurado'}
            </>
          ) : (
            <>
              <strong>Modo sem CRM:</strong> Leads serão armazenados apenas no sistema interno. Você pode ativar a integração CRM nas configurações.
            </>
          )}
        </AlertDescription>
      </Alert>

      {/* Estatísticas do Dia */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leads Gerados Hoje</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayStats.leadsGenerated}</div>
            <p className="text-xs text-muted-foreground">
              Limite: {captureSettings.dailyLimit}/dia
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leads Validados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayStats.leadsValidated}</div>
            <p className="text-xs text-muted-foreground">
              {useCRM ? 'Sincronizados com CRM' : 'Armazenados internamente'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayStats.successRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Leads válidos/total
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="capture" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="capture">Captação de Leads</TabsTrigger>
          <TabsTrigger value="jobs">Histórico de Jobs</TabsTrigger>
        </TabsList>

        <TabsContent value="capture" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Configurar Captação de Leads
              </CardTitle>
              <CardDescription>
                Configure os parâmetros para captação automática de leads
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="niche">Nicho para Captação</Label>
                  <Input
                    id="niche"
                    placeholder="Ex: dentistas, advogados, restaurantes"
                    value={captureSettings.niche}
                    onChange={(e) => setCaptureSettings(prev => ({ ...prev, niche: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Localização</Label>
                  <Input
                    id="location"
                    placeholder="Ex: São Paulo, SP"
                    value={captureSettings.location}
                    onChange={(e) => setCaptureSettings(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="source">Fonte de Leads</Label>
                  <Select 
                    value={captureSettings.source} 
                    onValueChange={(value: any) => setCaptureSettings(prev => ({ ...prev, source: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instagram">📷 Instagram</SelectItem>
                      <SelectItem value="facebook">👥 Facebook</SelectItem>
                      <SelectItem value="linkedin">💼 LinkedIn</SelectItem>
                      <SelectItem value="google_maps">🗺️ Google Maps</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dailyLimit">Limite Diário</Label>
                  <Input
                    id="dailyLimit"
                    type="number"
                    min="1"
                    max="50"
                    value={captureSettings.dailyLimit}
                    onChange={(e) => setCaptureSettings(prev => ({ ...prev, dailyLimit: parseInt(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Filtros Avançados</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessType">Tipo de Negócio</Label>
                    <Select 
                      value={captureSettings.businessType} 
                      onValueChange={(value: any) => setCaptureSettings(prev => ({ ...prev, businessType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="company">Empresas</SelectItem>
                        <SelectItem value="individual">Pessoas Físicas</SelectItem>
                        <SelectItem value="both">Ambos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Faixa Etária</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={captureSettings.ageRange.min}
                        onChange={(e) => setCaptureSettings(prev => ({ 
                          ...prev, 
                          ageRange: { ...prev.ageRange, min: parseInt(e.target.value) }
                        }))}
                      />
                      <Input
                        type="number"
                        placeholder="Max"
                        value={captureSettings.ageRange.max}
                        onChange={(e) => setCaptureSettings(prev => ({ 
                          ...prev, 
                          ageRange: { ...prev.ageRange, max: parseInt(e.target.value) }
                        }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Gênero</Label>
                    <Select 
                      value={captureSettings.gender} 
                      onValueChange={(value: any) => setCaptureSettings(prev => ({ ...prev, gender: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Qualquer</SelectItem>
                        <SelectItem value="male">Masculino</SelectItem>
                        <SelectItem value="female">Feminino</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleStartCapture} 
                disabled={isCapturing || !captureSettings.niche || !captureSettings.location}
                className="w-full"
              >
                {isCapturing ? (
                  <>
                    <Pause className="mr-2 h-4 w-4" />
                    Capturando Leads...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Iniciar Captação
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Captações</CardTitle>
              <CardDescription>
                Acompanhe o progresso das suas captações de leads
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {captureJobs.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhuma captação realizada ainda
                  </p>
                ) : (
                  captureJobs.map((job) => (
                    <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{getSourceIcon(job.source)}</div>
                        <div>
                          <div className="font-medium">{job.niche} - {job.location}</div>
                          <div className="text-sm text-muted-foreground">
                            {job.started_at.toLocaleString('pt-BR')}
                            {useCRM && job.status === 'completed' && (
                              <span className="ml-2 text-green-600">• Sincronizado com CRM</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {job.leads_validated}/{job.leads_found} leads válidos
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {job.leads_found > 0 ? ((job.leads_validated / job.leads_found) * 100).toFixed(1) : 0}% sucesso
                          </div>
                        </div>
                        <Badge className={getStatusColor(job.status)}>
                          {job.status === 'running' ? 'Executando' : 
                           job.status === 'completed' ? 'Concluído' : 
                           job.status === 'failed' ? 'Falhou' : 'Pendente'}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}