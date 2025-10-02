'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { 
  Bot, 
  MessageCircle, 
  Users, 
  Target, 
  Calendar, 
  Settings, 
  Smartphone,
  Database,
  Zap,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Info
} from 'lucide-react';
import ChatbotManager from '@/components/ChatbotManager';
import LeadCapture from '@/components/LeadCapture';
import type { ChatbotConfig, Lead } from '@/lib/types';

export default function WhatsAppChatbotApp() {
  const [isConfigured, setIsConfigured] = useState(false);
  const [useCRM, setUseCRM] = useState(false);
  const [config, setConfig] = useState<ChatbotConfig>({
    id: '1',
    whatsapp_token: '',
    whatsapp_phone_id: '',
    gemini_api_key: '',
    crm_integrations: {
      hubspot: { api_key: '', enabled: false },
      pipedrive: { api_key: '', enabled: false },
      rd_station: { api_key: '', enabled: false }
    },
    lead_capture_settings: {
      daily_limit: 50,
      niches: [],
      locations: [],
      sources: ['instagram', 'facebook', 'linkedin', 'google_maps'],
      filters: {
        business_type: 'both',
        age_range: { min: 18, max: 65 },
        gender: 'any'
      }
    },
    bot_personality: {
      name: 'Assistente Virtual',
      tone: 'friendly',
      language: 'pt-BR',
      response_style: 'Responda de forma natural, simpática e profissional. Sempre ajude o cliente da melhor forma possível.'
    }
  });
  
  const [leads, setLeads] = useState<Lead[]>([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalLeads: 0,
    activeConversations: 0,
    messagesProcessed: 0,
    conversionRate: 0,
    scheduledMeetings: 0
  });

  // Verificar configuração inicial
  useEffect(() => {
    const hasBasicConfig = config.whatsapp_token && config.whatsapp_phone_id && config.gemini_api_key;
    setIsConfigured(hasBasicConfig);
  }, [config]);

  // Atualizar estatísticas quando leads mudarem
  useEffect(() => {
    setDashboardStats(prev => ({
      ...prev,
      totalLeads: leads.length,
      conversionRate: leads.length > 0 ? (leads.filter(l => l.status === 'converted').length / leads.length) * 100 : 0
    }));
  }, [leads]);

  const handleConfigUpdate = (newConfig: ChatbotConfig) => {
    setConfig(newConfig);
  };

  const handleLeadsGenerated = (newLeads: Lead[]) => {
    setLeads(prev => [...newLeads, ...prev]);
  };

  const handleQuickSetup = () => {
    // Configuração rápida para demonstração
    setConfig(prev => ({
      ...prev,
      whatsapp_token: 'demo_token_' + Date.now(),
      whatsapp_phone_id: 'demo_phone_' + Date.now(),
      gemini_api_key: 'demo_gemini_' + Date.now()
    }));
    
    setDashboardStats({
      totalLeads: 47,
      activeConversations: 8,
      messagesProcessed: 234,
      conversionRate: 23.4,
      scheduledMeetings: 12
    });
  };

  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Bot className="h-12 w-12 text-blue-600" />
              <h1 className="text-4xl font-bold text-gray-900">Chatbot WhatsApp Business</h1>
            </div>
            <p className="text-xl text-gray-600">
              Sistema completo de automação para WhatsApp com IA, captação de leads e integração CRM opcional
            </p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuração Inicial
              </CardTitle>
              <CardDescription>
                Configure as integrações necessárias para começar a usar o chatbot
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Importante:</strong> Este é um sistema completo que requer configurações de APIs externas. 
                  Para demonstração, você pode usar a configuração rápida abaixo.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">WhatsApp Business API</h3>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="whatsapp-token">Token de Acesso</Label>
                      <Input
                        id="whatsapp-token"
                        type="password"
                        placeholder="Seu token do WhatsApp Business"
                        value={config.whatsapp_token}
                        onChange={(e) => setConfig(prev => ({ ...prev, whatsapp_token: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone-id">ID do Número de Telefone</Label>
                      <Input
                        id="phone-id"
                        placeholder="ID do seu número WhatsApp"
                        value={config.whatsapp_phone_id}
                        onChange={(e) => setConfig(prev => ({ ...prev, whatsapp_phone_id: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Inteligência Artificial</h3>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="gemini-key">Chave API Gemini</Label>
                      <Input
                        id="gemini-key"
                        type="password"
                        placeholder="Sua chave da API Gemini"
                        value={config.gemini_api_key}
                        onChange={(e) => setConfig(prev => ({ ...prev, gemini_api_key: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Seção CRM Opcional */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold">Integração com CRM</h3>
                    <p className="text-sm text-muted-foreground">
                      Opcional - Conecte com seu CRM para sincronizar leads automaticamente
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="use-crm">Usar CRM</Label>
                    <Switch
                      id="use-crm"
                      checked={useCRM}
                      onCheckedChange={setUseCRM}
                    />
                  </div>
                </div>

                {useCRM && (
                  <>
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Configure pelo menos um CRM para sincronizar seus leads automaticamente. 
                        Você pode adicionar mais integrações depois.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="hubspot-key">HubSpot API Key</Label>
                        <Input
                          id="hubspot-key"
                          type="password"
                          placeholder="Chave API HubSpot (opcional)"
                          value={config.crm_integrations.hubspot?.api_key || ''}
                          onChange={(e) => setConfig(prev => ({
                            ...prev,
                            crm_integrations: {
                              ...prev.crm_integrations,
                              hubspot: { api_key: e.target.value, enabled: !!e.target.value }
                            }
                          }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="pipedrive-key">Pipedrive API Key</Label>
                        <Input
                          id="pipedrive-key"
                          type="password"
                          placeholder="Chave API Pipedrive (opcional)"
                          value={config.crm_integrations.pipedrive?.api_key || ''}
                          onChange={(e) => setConfig(prev => ({
                            ...prev,
                            crm_integrations: {
                              ...prev.crm_integrations,
                              pipedrive: { api_key: e.target.value, enabled: !!e.target.value }
                            }
                          }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="rd-key">RD Station API Key</Label>
                        <Input
                          id="rd-key"
                          type="password"
                          placeholder="Chave API RD Station (opcional)"
                          value={config.crm_integrations.rd_station?.api_key || ''}
                          onChange={(e) => setConfig(prev => ({
                            ...prev,
                            crm_integrations: {
                              ...prev.crm_integrations,
                              rd_station: { api_key: e.target.value, enabled: !!e.target.value }
                            }
                          }))}
                        />
                      </div>
                    </div>
                  </>
                )}

                {!useCRM && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Modo sem CRM:</strong> Os leads serão armazenados apenas no sistema interno. 
                      Você pode ativar a integração com CRM a qualquer momento nas configurações.
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="flex gap-4">
                <Button 
                  onClick={handleQuickSetup}
                  className="flex-1"
                  variant="outline"
                >
                  <Zap className="mr-2 h-4 w-4" />
                  Configuração Rápida (Demo)
                </Button>
                <Button 
                  onClick={() => setIsConfigured(true)}
                  disabled={!config.whatsapp_token || !config.whatsapp_phone_id || !config.gemini_api_key}
                  className="flex-1"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Iniciar Chatbot
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Funcionalidades do Sistema */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-blue-600" />
                  WhatsApp Integration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• API oficial WhatsApp Business</li>
                  <li>• Mesmo número do usuário</li>
                  <li>• Envio de texto e imagens</li>
                  <li>• Respostas automáticas inteligentes</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-green-600" />
                  Base de Conhecimento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Banco dinâmico e editável</li>
                  <li>• Auto-aprendizado</li>
                  <li>• Categorização inteligente</li>
                  <li>• Análise de palavras-chave</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-600" />
                  Captação de Leads
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• 50 leads/dia automático</li>
                  <li>• Instagram, Facebook, LinkedIn</li>
                  <li>• Google Maps integration</li>
                  <li>• Validação automática</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-orange-600" />
                  Google Agenda
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Agendamento automático</li>
                  <li>• Sincronização em tempo real</li>
                  <li>• Lembretes automáticos</li>
                  <li>• Gestão de compromissos</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-red-600" />
                  CRM Integration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• <strong>Opcional:</strong> HubSpot, Pipedrive, RD Station</li>
                  <li>• Sincronização automática</li>
                  <li>• Funciona sem CRM também</li>
                  <li>• Armazenamento interno seguro</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-indigo-600" />
                  IA Avançada
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Gemini AI integration</li>
                  <li>• Linguagem natural</li>
                  <li>• Contexto de conversação</li>
                  <li>• Personalidade customizável</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Smartphone className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Chatbot WhatsApp</h1>
              <p className="text-gray-600">Sistema completo de automação e captação de leads</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="default" className="bg-green-500">
              <CheckCircle className="mr-1 h-3 w-3" />
              Sistema Ativo
            </Badge>
            {!useCRM && (
              <Badge variant="outline">
                Sem CRM
              </Badge>
            )}
          </div>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.totalLeads}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                +12% este mês
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversas Ativas</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.activeConversations}</div>
              <p className="text-xs text-muted-foreground">Em andamento</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mensagens</CardTitle>
              <Bot className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.messagesProcessed}</div>
              <p className="text-xs text-muted-foreground">Processadas hoje</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa Conversão</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.conversionRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Leads → Clientes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reuniões</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.scheduledMeetings}</div>
              <p className="text-xs text-muted-foreground">Agendadas</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="chatbot" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="chatbot">Gerenciar Chatbot</TabsTrigger>
            <TabsTrigger value="leads">Captação de Leads</TabsTrigger>
            <TabsTrigger value="analytics">Relatórios</TabsTrigger>
          </TabsList>

          <TabsContent value="chatbot" className="mt-6">
            <ChatbotManager 
              config={config} 
              onConfigUpdate={handleConfigUpdate}
              useCRM={useCRM}
              onUseCRMChange={setUseCRM}
            />
          </TabsContent>

          <TabsContent value="leads" className="mt-6">
            <LeadCapture 
              onLeadsGenerated={handleLeadsGenerated} 
              useCRM={useCRM}
              crmConfig={config.crm_integrations}
            />
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Relatórios e Analytics
                </CardTitle>
                <CardDescription>
                  Análise detalhada do desempenho do chatbot
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Leads Recentes</h3>
                    <div className="space-y-2">
                      {leads.slice(0, 5).map((lead) => (
                        <div key={lead.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <div className="font-medium">{lead.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {lead.source} • {lead.created_at.toLocaleDateString('pt-BR')}
                            </div>
                          </div>
                          <Badge variant={lead.validation_status === 'valid' ? 'default' : 'secondary'}>
                            {lead.validation_status === 'valid' ? 'Válido' : 'Pendente'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Métricas de Performance</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span>Tempo médio de resposta</span>
                        <span className="font-medium">1.2s</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Taxa de satisfação</span>
                        <span className="font-medium">94.5%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Leads validados hoje</span>
                        <span className="font-medium">{leads.filter(l => l.validation_status === 'valid').length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Conversas resolvidas</span>
                        <span className="font-medium">87%</span>
                      </div>
                      {useCRM && (
                        <div className="flex justify-between items-center">
                          <span>Leads sincronizados CRM</span>
                          <span className="font-medium">{Math.floor(leads.length * 0.85)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}