import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import { google } from 'googleapis';
import * as cheerio from 'cheerio';
import type { 
  WhatsAppMessage, 
  Lead, 
  CalendarEvent, 
  ChatbotConfig,
  KnowledgeBase,
  Product,
  ConversationContext 
} from './types';

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
export const supabase = createClient(supabaseUrl, supabaseKey);

// WhatsApp Business API
export class WhatsAppAPI {
  private token: string;
  private phoneNumberId: string;

  constructor(token: string, phoneNumberId: string) {
    this.token = token;
    this.phoneNumberId = phoneNumberId;
  }

  async sendMessage(to: string, message: string): Promise<boolean> {
    try {
      const response = await axios.post(
        `https://graph.facebook.com/v18.0/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: to,
          type: 'text',
          text: { body: message }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.status === 200;
    } catch (error) {
      console.error('Erro ao enviar mensagem WhatsApp:', error);
      return false;
    }
  }

  async sendImage(to: string, imageUrl: string, caption?: string): Promise<boolean> {
    try {
      const response = await axios.post(
        `https://graph.facebook.com/v18.0/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: to,
          type: 'image',
          image: {
            link: imageUrl,
            caption: caption
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.status === 200;
    } catch (error) {
      console.error('Erro ao enviar imagem WhatsApp:', error);
      return false;
    }
  }
}

// Google Calendar API
export class GoogleCalendarAPI {
  private calendar: any;

  constructor(credentials: any) {
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/calendar']
    });
    this.calendar = google.calendar({ version: 'v3', auth });
  }

  async createEvent(event: Omit<CalendarEvent, 'id' | 'created_at'>): Promise<string | null> {
    try {
      const response = await this.calendar.events.insert({
        calendarId: 'primary',
        requestBody: {
          summary: event.title,
          description: event.description,
          start: {
            dateTime: event.start_time.toISOString(),
            timeZone: 'America/Sao_Paulo'
          },
          end: {
            dateTime: event.end_time.toISOString(),
            timeZone: 'America/Sao_Paulo'
          }
        }
      });
      return response.data.id || null;
    } catch (error) {
      console.error('Erro ao criar evento no Google Calendar:', error);
      return null;
    }
  }
}

// Gemini AI API
export class GeminiAPI {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async processMessage(
    message: string, 
    context: ConversationContext,
    knowledgeBase: KnowledgeBase[]
  ): Promise<string> {
    try {
      // Buscar resposta no banco de conhecimento
      const relevantKnowledge = this.findRelevantKnowledge(message, knowledgeBase);
      
      const prompt = `
        Você é um assistente virtual profissional. Responda de forma natural, simpática e profissional.
        
        Contexto da conversa: ${JSON.stringify(context)}
        Conhecimento relevante: ${JSON.stringify(relevantKnowledge)}
        
        Mensagem do usuário: ${message}
        
        Regras:
        - Responda como se fosse o próprio dono do negócio
        - Seja natural, não pareça um robô
        - Se for sobre agendamento, pergunte data, hora e detalhes
        - Se for sobre produtos, ofereça informações detalhadas
        - Mantenha o tom profissional mas amigável
        
        Resposta:
      `;

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.apiKey}`,
        {
          contents: [{
            parts: [{ text: prompt }]
          }]
        }
      );

      return response.data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Erro ao processar mensagem com Gemini:', error);
      return 'Desculpe, não consegui processar sua mensagem no momento. Pode tentar novamente?';
    }
  }

  private findRelevantKnowledge(message: string, knowledgeBase: KnowledgeBase[]): KnowledgeBase[] {
    const messageWords = message.toLowerCase().split(' ');
    return knowledgeBase.filter(kb => 
      kb.keywords.some(keyword => 
        messageWords.some(word => word.includes(keyword.toLowerCase()))
      )
    ).slice(0, 3);
  }
}

// Lead Capture - Instagram
export class InstagramScraper {
  async searchProfiles(niche: string, location: string, limit: number = 50): Promise<Lead[]> {
    try {
      // Simulação de busca no Instagram (em produção, usar API oficial ou scraping)
      const leads: Lead[] = [];
      
      // Aqui você implementaria a lógica real de scraping do Instagram
      // Por questões de exemplo, retornando dados simulados
      
      for (let i = 0; i < Math.min(limit, 10); i++) {
        leads.push({
          id: `ig_${Date.now()}_${i}`,
          name: `Lead Instagram ${i + 1}`,
          instagram: `@lead_${niche}_${i + 1}`,
          source: 'instagram',
          status: 'new',
          validation_status: 'pending',
          created_at: new Date(),
          updated_at: new Date()
        });
      }
      
      return leads;
    } catch (error) {
      console.error('Erro ao buscar perfis no Instagram:', error);
      return [];
    }
  }

  async validateProfile(username: string): Promise<{
    active: boolean;
    lastPostDate?: Date;
    engagementRate?: number;
  }> {
    try {
      // Implementar validação real do perfil Instagram
      return {
        active: Math.random() > 0.3,
        lastPostDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        engagementRate: Math.random() * 10
      };
    } catch (error) {
      console.error('Erro ao validar perfil Instagram:', error);
      return { active: false };
    }
  }
}

// Lead Capture - Google Maps
export class GoogleMapsScraper {
  async searchBusinesses(query: string, location: string, limit: number = 50): Promise<Lead[]> {
    try {
      const leads: Lead[] = [];
      
      // Simulação de busca no Google Maps
      for (let i = 0; i < Math.min(limit, 10); i++) {
        leads.push({
          id: `gm_${Date.now()}_${i}`,
          name: `Empresa ${query} ${i + 1}`,
          company: `${query} Ltda ${i + 1}`,
          phone: `(11) 9${Math.floor(Math.random() * 10000)}-${Math.floor(Math.random() * 10000)}`,
          address: `Rua ${query}, ${i + 100} - ${location}`,
          source: 'google_maps',
          status: 'new',
          validation_status: 'pending',
          created_at: new Date(),
          updated_at: new Date()
        });
      }
      
      return leads;
    } catch (error) {
      console.error('Erro ao buscar empresas no Google Maps:', error);
      return [];
    }
  }
}

// CRM Integrations - Agora opcional
export class CRMIntegration {
  async syncToHubSpot(lead: Lead, apiKey: string): Promise<boolean> {
    if (!apiKey) {
      console.log('HubSpot não configurado - lead salvo apenas no sistema interno');
      return true; // Retorna true para não quebrar o fluxo
    }

    try {
      const response = await axios.post(
        'https://api.hubapi.com/crm/v3/objects/contacts',
        {
          properties: {
            firstname: lead.name.split(' ')[0],
            lastname: lead.name.split(' ').slice(1).join(' '),
            email: lead.email,
            phone: lead.phone,
            company: lead.company,
            website: lead.website,
            lifecyclestage: 'lead'
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.status === 201;
    } catch (error) {
      console.error('Erro ao sincronizar com HubSpot:', error);
      return false;
    }
  }

  async syncToPipedrive(lead: Lead, apiKey: string): Promise<boolean> {
    if (!apiKey) {
      console.log('Pipedrive não configurado - lead salvo apenas no sistema interno');
      return true; // Retorna true para não quebrar o fluxo
    }

    try {
      const response = await axios.post(
        `https://api.pipedrive.com/v1/persons?api_token=${apiKey}`,
        {
          name: lead.name,
          email: [{ value: lead.email, primary: true }],
          phone: [{ value: lead.phone, primary: true }],
          org_name: lead.company
        }
      );
      return response.status === 201;
    } catch (error) {
      console.error('Erro ao sincronizar com Pipedrive:', error);
      return false;
    }
  }

  async syncToRDStation(lead: Lead, apiKey: string): Promise<boolean> {
    if (!apiKey) {
      console.log('RD Station não configurado - lead salvo apenas no sistema interno');
      return true; // Retorna true para não quebrar o fluxo
    }

    try {
      const response = await axios.post(
        'https://api.rd.services/platform/contacts',
        {
          name: lead.name,
          email: lead.email,
          mobile_phone: lead.phone,
          company: lead.company,
          website: lead.website
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.status === 200 || response.status === 201;
    } catch (error) {
      console.error('Erro ao sincronizar com RD Station:', error);
      return false;
    }
  }

  // Método para sincronizar com todos os CRMs configurados
  async syncToAllCRMs(lead: Lead, crmConfig: ChatbotConfig['crm_integrations']): Promise<{
    hubspot: boolean;
    pipedrive: boolean;
    rd_station: boolean;
  }> {
    const results = {
      hubspot: false,
      pipedrive: false,
      rd_station: false
    };

    // Sincronizar apenas com CRMs que estão habilitados
    if (crmConfig.hubspot?.enabled && crmConfig.hubspot.api_key) {
      results.hubspot = await this.syncToHubSpot(lead, crmConfig.hubspot.api_key);
    }

    if (crmConfig.pipedrive?.enabled && crmConfig.pipedrive.api_key) {
      results.pipedrive = await this.syncToPipedrive(lead, crmConfig.pipedrive.api_key);
    }

    if (crmConfig.rd_station?.enabled && crmConfig.rd_station.api_key) {
      results.rd_station = await this.syncToRDStation(lead, crmConfig.rd_station.api_key);
    }

    return results;
  }
}

// Database Operations
export class DatabaseService {
  async saveMessage(message: WhatsAppMessage): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('whatsapp_messages')
        .insert([message]);
      return !error;
    } catch (error) {
      console.error('Erro ao salvar mensagem:', error);
      return false;
    }
  }

  async getKnowledgeBase(): Promise<KnowledgeBase[]> {
    try {
      const { data, error } = await supabase
        .from('knowledge_base')
        .select('*')
        .order('usage_count', { ascending: false });
      
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar base de conhecimento:', error);
      return [];
    }
  }

  async saveKnowledge(knowledge: Omit<KnowledgeBase, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('knowledge_base')
        .insert([{
          ...knowledge,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);
      return !error;
    } catch (error) {
      console.error('Erro ao salvar conhecimento:', error);
      return false;
    }
  }

  async saveLead(lead: Lead, syncToCRM: boolean = false, crmConfig?: ChatbotConfig['crm_integrations']): Promise<boolean> {
    try {
      // Sempre salvar no banco interno primeiro
      const { error } = await supabase
        .from('leads')
        .insert([lead]);
      
      if (error) {
        console.error('Erro ao salvar lead no banco interno:', error);
        return false;
      }

      // Se CRM estiver habilitado, sincronizar
      if (syncToCRM && crmConfig) {
        const crmIntegration = new CRMIntegration();
        const syncResults = await crmIntegration.syncToAllCRMs(lead, crmConfig);
        
        console.log('Resultados da sincronização CRM:', syncResults);
        
        // Atualizar status do lead baseado na sincronização
        const syncedToCRM = Object.values(syncResults).some(result => result);
        if (syncedToCRM) {
          await supabase
            .from('leads')
            .update({ crm_synced: true, updated_at: new Date().toISOString() })
            .eq('id', lead.id);
        }
      }

      return true;
    } catch (error) {
      console.error('Erro ao salvar lead:', error);
      return false;
    }
  }

  async getProducts(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');
      
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      return [];
    }
  }

  async getConversationContext(phone: string): Promise<ConversationContext | null> {
    try {
      const { data, error } = await supabase
        .from('conversation_contexts')
        .select('*')
        .eq('phone', phone)
        .single();
      
      return data || null;
    } catch (error) {
      return null;
    }
  }

  async updateConversationContext(context: ConversationContext): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('conversation_contexts')
        .upsert([{
          ...context,
          last_interaction: new Date().toISOString()
        }]);
      return !error;
    } catch (error) {
      console.error('Erro ao atualizar contexto:', error);
      return false;
    }
  }
}