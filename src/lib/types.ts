// Tipos para o sistema de chatbot WhatsApp

export interface WhatsAppMessage {
  id: string;
  from: string;
  to: string;
  message: string;
  timestamp: Date;
  type: 'text' | 'image' | 'document' | 'audio';
  status: 'sent' | 'delivered' | 'read' | 'failed';
}

export interface KnowledgeBase {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  source: 'manual' | 'conversation' | 'imported';
  relevance_score: number;
  last_used: Date | null;
  usage_count: number;
  created_at: Date;
  updated_at: Date;
  auto_update: boolean;
}

export interface Lead {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  instagram?: string;
  linkedin?: string;
  facebook?: string;
  company?: string;
  address?: string;
  website?: string;
  source: 'instagram' | 'facebook' | 'linkedin' | 'google_maps';
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'invalid';
  validation_status: 'pending' | 'valid' | 'invalid';
  validation_details?: {
    instagram_active?: boolean;
    last_post_date?: Date;
    engagement_rate?: number;
    business_open?: boolean;
    profile_activity?: boolean;
  };
  created_at: Date;
  updated_at: Date;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price?: number;
  image_url?: string;
  category: string;
  keywords: string[];
  created_at: Date;
}

export interface ChatbotConfig {
  id: string;
  whatsapp_token: string;
  whatsapp_phone_id: string;
  google_calendar_credentials?: string;
  gemini_api_key: string;
  crm_integrations: {
    hubspot?: { api_key: string; enabled: boolean };
    pipedrive?: { api_key: string; enabled: boolean };
    rd_station?: { api_key: string; enabled: boolean };
  };
  lead_capture_settings: {
    daily_limit: number;
    niches: string[];
    locations: string[];
    sources: ('instagram' | 'facebook' | 'linkedin' | 'google_maps')[];
    filters: {
      business_type?: 'company' | 'individual' | 'both';
      age_range?: { min: number; max: number };
      gender?: 'male' | 'female' | 'any';
    };
  };
  bot_personality: {
    name: string;
    tone: 'formal' | 'casual' | 'friendly';
    language: string;
    response_style: string;
  };
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start_time: Date;
  end_time: Date;
  attendee_phone: string;
  attendee_name?: string;
  created_at: Date;
}

export interface CRMContact {
  id: string;
  lead_id: string;
  crm_type: 'hubspot' | 'pipedrive' | 'rd_station';
  crm_contact_id: string;
  sync_status: 'pending' | 'synced' | 'error';
  last_sync: Date;
  error_message?: string;
}

export interface LeadCaptureJob {
  id: string;
  niche: string;
  location: string;
  source: 'instagram' | 'facebook' | 'linkedin' | 'google_maps';
  status: 'pending' | 'running' | 'completed' | 'failed';
  leads_found: number;
  leads_validated: number;
  started_at: Date;
  completed_at?: Date;
  error_message?: string;
}

export interface ConversationContext {
  phone: string;
  current_topic?: string;
  awaiting_response?: string;
  user_data?: {
    name?: string;
    email?: string;
    company?: string;
    interests?: string[];
  };
  conversation_history: {
    message: string;
    sender: 'user' | 'bot';
    timestamp: Date;
  }[];
  last_interaction: Date;
}