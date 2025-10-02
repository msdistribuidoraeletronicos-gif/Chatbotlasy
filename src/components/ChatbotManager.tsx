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
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MessageCircle, 
  Bot, 
  Settings, 
  Database, 
  Calendar, 
  Users, 
  Image,
  Send,
  Brain,
  Zap,
  CheckCircle,
  XCircle,
  Clock,
  Info,
  BookOpen,
  Plus,
  Trash2,
  Edit,
  Search,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import type { 
  WhatsAppMessage, 
  KnowledgeBase, 
  Product, 
  ChatbotConfig,
  ConversationContext 
} from '@/lib/types';

interface ChatbotManagerProps {
  config: ChatbotConfig;
  onConfigUpdate: (config: ChatbotConfig) => void;
  useCRM: boolean;
  onUseCRMChange: (useCRM: boolean) => void;
}

interface KnowledgeEntry {
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

export default function ChatbotManager({ config, onConfigUpdate, useCRM, onUseCRMChange }: ChatbotManagerProps) {
  const [isActive, setIsActive] = useState(true);
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [knowledgeEntries, setKnowledgeEntries] = useState<KnowledgeEntry[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(true);
  const [stats, setStats] = useState({
    totalMessages: 0,
    activeConversations: 0,
    responseTime: 0,
    satisfactionRate: 0
  });

  // Simulação de dados iniciais
  useEffect(() => {
    // Simular mensagens recentes
    const mockMessages: WhatsAppMessage[] = [
      {
        id: '1',
        from: '+5511999999999',
        to: config.whatsapp_phone_id,
        message: 'Olá, gostaria de saber mais sobre seus produtos',
        timestamp: new Date(Date.now() - 300000),
        type: 'text',
        status: 'read'
      },
      {
        id: '2',
        from: config.whatsapp_phone_id,
        to: '+5511999999999',
        message: 'Olá! Fico feliz em ajudar. Temos diversos produtos disponíveis. Qual tipo de produto você está procurando?',
        timestamp: new Date(Date.now() - 240000),
        type: 'text',
        status: 'delivered'
      }
    ];

    // Simular base de conhecimento ampla
    const mockKnowledge: KnowledgeEntry[] = [
      {
        id: '1',
        title: 'Horários de Funcionamento',
        content: 'A empresa funciona de segunda a sexta das 8h às 18h, e aos sábados das 8h às 12h. Durante feriados nacionais, permanecemos fechados.',
        category: 'Informações Gerais',
        tags: ['horário', 'funcionamento', 'aberto', 'fechado', 'feriados'],
        source: 'manual',
        relevance_score: 0.95,
        last_used: new Date(Date.now() - 86400000),
        usage_count: 15,
        created_at: new Date(Date.now() - 2592000000),
        updated_at: new Date(Date.now() - 86400000),
        auto_update: true
      },
      {
        id: '2',
        title: 'Processo de Pedidos',
        content: 'Para fazer um pedido, o cliente pode escolher entre WhatsApp ou site. No WhatsApp, coletamos as informações do produto desejado, dados de entrega e forma de pagamento. Confirmamos todos os detalhes antes de finalizar.',
        category: 'Vendas',
        tags: ['pedido', 'comprar', 'encomendar', 'processo', 'pagamento'],
        source: 'conversation',
        relevance_score: 0.88,
        last_used: new Date(Date.now() - 3600000),
        usage_count: 23,
        created_at: new Date(Date.now() - 1296000000),
        updated_at: new Date(Date.now() - 3600000),
        auto_update: true
      },
      {
        id: '3',
        title: 'Política de Devolução',
        content: 'Aceitamos devoluções em até 30 dias após a compra, desde que o produto esteja em perfeitas condições e na embalagem original. O cliente deve entrar em contato conosco primeiro para autorizar a devolução.',
        category: 'Suporte',
        tags: ['devolução', 'troca', 'garantia', 'política', 'prazo'],
        source: 'manual',
        relevance_score: 0.82,
        last_used: new Date(Date.now() - 172800000),
        usage_count: 8,
        created_at: new Date(Date.now() - 1728000000),
        updated_at: new Date(Date.now() - 172800000),
        auto_update: false
      },
      {
        id: '4',
        title: 'Formas de Pagamento Aceitas',
        content: 'Aceitamos pagamento via PIX (desconto de 5%), cartão de crédito (até 12x), cartão de débito, boleto bancário e dinheiro para entregas locais. Para compras acima de R$ 500, oferecemos condições especiais.',
        category: 'Financeiro',
        tags: ['pagamento', 'pix', 'cartão', 'boleto', 'dinheiro', 'parcelamento'],
        source: 'imported',
        relevance_score: 0.91,
        last_used: new Date(Date.now() - 7200000),
        usage_count: 31,
        created_at: new Date(Date.now() - 2160000000),
        updated_at: new Date(Date.now() - 7200000),
        auto_update: true
      }
    ];

    // Simular produtos
    const mockProducts: Product[] = [
      {
        id: '1',
        name: 'Produto Premium',
        description: 'Nosso produto mais vendido com qualidade superior',
        price: 199.99,
        image_url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop',
        category: 'Premium',
        keywords: ['premium', 'qualidade', 'melhor'],
        created_at: new Date()
      }
    ];

    setMessages(mockMessages);
    setKnowledgeEntries(mockKnowledge);
    setProducts(mockProducts);
    setStats({
      totalMessages: 156,
      activeConversations: 8,
      responseTime: 1.2,
      satisfactionRate: 94.5
    });
  }, []);

  const handleAddKnowledge = () => {
    const newKnowledge: KnowledgeEntry = {
      id: `kb_${Date.now()}`,
      title: '',
      content: '',
      category: 'Geral',
      tags: [],
      source: 'manual',
      relevance_score: 0.5,
      last_used: null,
      usage_count: 0,
      created_at: new Date(),
      updated_at: new Date(),
      auto_update: true
    };
    setKnowledgeEntries(prev => [...prev, newKnowledge]);
  };

  const handleUpdateKnowledge = (id: string, updates: Partial<KnowledgeEntry>) => {
    setKnowledgeEntries(prev => 
      prev.map(kb => kb.id === id ? { ...kb, ...updates, updated_at: new Date() } : kb)
    );
  };

  const handleDeleteKnowledge = (id: string) => {
    setKnowledgeEntries(prev => prev.filter(kb => kb.id !== id));
  };

  const handleAutoUpdateFromConversation = () => {
    // Simular atualização automática da base de conhecimento
    const newEntry: KnowledgeEntry = {
      id: `kb_auto_${Date.now()}`,
      title: 'Informação Aprendida da Conversa',
      content: 'Nova informação capturada automaticamente de uma conversa recente com cliente.',
      category: 'Auto-Aprendizado',
      tags: ['automático', 'conversa', 'aprendizado'],
      source: 'conversation',
      relevance_score: 0.75,
      last_used: null,
      usage_count: 0,
      created_at: new Date(),
      updated_at: new Date(),
      auto_update: true
    };
    setKnowledgeEntries(prev => [...prev, newEntry]);
  };

  const filteredKnowledge = knowledgeEntries.filter(entry => {
    const matchesSearch = entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || entry.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...Array.from(new Set(knowledgeEntries.map(entry => entry.category)))];

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'manual': return <Edit className="h-4 w-4 text-blue-500" />;
      case 'conversation': return <MessageCircle className="h-4 w-4 text-green-500" />;
      case 'imported': return <BookOpen className="h-4 w-4 text-purple-500" />;
      default: return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'manual': return 'Manual';
      case 'conversation': return 'Conversa';
      case 'imported': return 'Importado';
      default: return 'Desconhecido';
    }
  };

  const handleAddProduct = () => {
    const newProduct: Product = {
      id: `prod_${Date.now()}`,
      name: '',
      description: '',
      category: 'Geral',
      keywords: [],
      created_at: new Date()
    };
    setProducts(prev => [...prev, newProduct]);
  };

  const handleUpdateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev => 
      prev.map(prod => prod.id === id ? { ...prod, ...updates } : prod)
    );
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(prev => prev.filter(prod => prod.id !== id));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'read': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Status e Controles Principais */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Bot className="h-6 w-6" />
            <h2 className="text-2xl font-bold">Chatbot WhatsApp</h2>
          </div>
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "Ativo" : "Inativo"}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="bot-active">Bot Ativo</Label>
          <Switch
            id="bot-active"
            checked={isActive}
            onCheckedChange={setIsActive}
          />
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mensagens Hoje</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMessages}</div>
            <p className="text-xs text-muted-foreground">+12% desde ontem</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversas Ativas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeConversations}</div>
            <p className="text-xs text-muted-foreground">Aguardando resposta</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Resposta</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.responseTime}s</div>
            <p className="text-xs text-muted-foreground">Tempo médio</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfação</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.satisfactionRate}%</div>
            <p className="text-xs text-muted-foreground">Avaliação positiva</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="messages" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="messages">Mensagens</TabsTrigger>
          <TabsTrigger value="knowledge">Base de Conhecimento</TabsTrigger>
          <TabsTrigger value="products">Produtos</TabsTrigger>
          <TabsTrigger value="config">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="messages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Mensagens Recentes
              </CardTitle>
              <CardDescription>
                Últimas conversas do chatbot
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">
                          {message.from === config.whatsapp_phone_id ? 'Bot' : message.from}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {message.timestamp.toLocaleString('pt-BR')}
                        </span>
                        {getStatusIcon(message.status)}
                      </div>
                      <p className="text-sm">{message.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="knowledge" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Base de Conhecimento Inteligente
                  </CardTitle>
                  <CardDescription>
                    Fonte ampla de conhecimento que se atualiza automaticamente
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={handleAutoUpdateFromConversation}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Simular Auto-Update
                  </Button>
                  <Button onClick={handleAddKnowledge}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Conhecimento
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Controles de Auto-Update */}
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100">Auto-Aprendizado Ativo</h3>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      O bot aprende automaticamente com as conversas e atualiza a base de conhecimento
                    </p>
                  </div>
                  <Switch
                    checked={autoUpdateEnabled}
                    onCheckedChange={setAutoUpdateEnabled}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-semibold text-blue-900 dark:text-blue-100">
                      {knowledgeEntries.filter(e => e.source === 'conversation').length}
                    </div>
                    <div className="text-blue-700 dark:text-blue-300">Aprendidos</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-blue-900 dark:text-blue-100">
                      {knowledgeEntries.filter(e => e.auto_update).length}
                    </div>
                    <div className="text-blue-700 dark:text-blue-300">Auto-Update</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-blue-900 dark:text-blue-100">
                      {knowledgeEntries.reduce((sum, e) => sum + e.usage_count, 0)}
                    </div>
                    <div className="text-blue-700 dark:text-blue-300">Total Usos</div>
                  </div>
                </div>
              </div>

              {/* Filtros e Busca */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar na base de conhecimento..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filtrar por categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category === 'all' ? 'Todas as Categorias' : category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Lista de Conhecimentos */}
              <div className="space-y-4">
                {filteredKnowledge.map((entry) => (
                  <div key={entry.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Input
                            value={entry.title}
                            onChange={(e) => handleUpdateKnowledge(entry.id, { title: e.target.value })}
                            placeholder="Título do conhecimento..."
                            className="font-semibold"
                          />
                          <div className="flex items-center gap-1">
                            {getSourceIcon(entry.source)}
                            <Badge variant="outline" className="text-xs">
                              {getSourceLabel(entry.source)}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                          <div className="space-y-2">
                            <Label>Categoria</Label>
                            <Select 
                              value={entry.category} 
                              onValueChange={(value) => handleUpdateKnowledge(entry.id, { category: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Geral">Geral</SelectItem>
                                <SelectItem value="Vendas">Vendas</SelectItem>
                                <SelectItem value="Suporte">Suporte</SelectItem>
                                <SelectItem value="Informações Gerais">Informações Gerais</SelectItem>
                                <SelectItem value="Financeiro">Financeiro</SelectItem>
                                <SelectItem value="Auto-Aprendizado">Auto-Aprendizado</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Relevância: {(entry.relevance_score * 100).toFixed(0)}%</Label>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div 
                                  className="bg-blue-500 h-2 rounded-full transition-all"
                                  style={{ width: `${entry.relevance_score * 100}%` }}
                                />
                              </div>
                              <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Conteúdo</Label>
                      <Textarea
                        value={entry.content}
                        onChange={(e) => handleUpdateKnowledge(entry.id, { content: e.target.value })}
                        placeholder="Conteúdo do conhecimento..."
                        rows={4}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Tags (separadas por vírgula)</Label>
                      <Input
                        value={entry.tags.join(', ')}
                        onChange={(e) => handleUpdateKnowledge(entry.id, { 
                          tags: e.target.value.split(',').map(k => k.trim()).filter(k => k) 
                        })}
                        placeholder="tag1, tag2, tag3"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Usado {entry.usage_count} vezes</span>
                        {entry.last_used && (
                          <span>Último uso: {entry.last_used.toLocaleDateString('pt-BR')}</span>
                        )}
                        <div className="flex items-center gap-1">
                          <Switch
                            checked={entry.auto_update}
                            onCheckedChange={(checked) => handleUpdateKnowledge(entry.id, { auto_update: checked })}
                            size="sm"
                          />
                          <span className="text-xs">Auto-Update</span>
                        </div>
                      </div>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteKnowledge(entry.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {filteredKnowledge.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum conhecimento encontrado com os filtros aplicados.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Image className="h-5 w-5" />
                    Produtos
                  </CardTitle>
                  <CardDescription>
                    Gerencie os produtos que o bot pode apresentar
                  </CardDescription>
                </div>
                <Button onClick={handleAddProduct}>
                  Adicionar Produto
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {products.map((product) => (
                  <div key={product.id} className="p-4 border rounded-lg space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Nome do Produto</Label>
                        <Input
                          value={product.name}
                          onChange={(e) => handleUpdateProduct(product.id, { name: e.target.value })}
                          placeholder="Nome do produto..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Preço (R$)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={product.price || ''}
                          onChange={(e) => handleUpdateProduct(product.id, { price: parseFloat(e.target.value) })}
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Descrição</Label>
                      <Textarea
                        value={product.description}
                        onChange={(e) => handleUpdateProduct(product.id, { description: e.target.value })}
                        placeholder="Descrição do produto..."
                        rows={2}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>URL da Imagem</Label>
                        <Input
                          value={product.image_url || ''}
                          onChange={(e) => handleUpdateProduct(product.id, { image_url: e.target.value })}
                          placeholder="https://exemplo.com/imagem.jpg"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Categoria</Label>
                        <Input
                          value={product.category}
                          onChange={(e) => handleUpdateProduct(product.id, { category: e.target.value })}
                          placeholder="Categoria do produto..."
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Palavras-chave (separadas por vírgula)</Label>
                      <Input
                        value={product.keywords.join(', ')}
                        onChange={(e) => handleUpdateProduct(product.id, { 
                          keywords: e.target.value.split(',').map(k => k.trim()).filter(k => k) 
                        })}
                        placeholder="palavra1, palavra2, palavra3"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      {product.image_url && (
                        <img 
                          src={product.image_url} 
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        Excluir
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurações do Bot
              </CardTitle>
              <CardDescription>
                Configure a personalidade e comportamento do chatbot
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome do Bot</Label>
                  <Input
                    value={config.bot_personality.name}
                    onChange={(e) => onConfigUpdate({
                      ...config,
                      bot_personality: { ...config.bot_personality, name: e.target.value }
                    })}
                    placeholder="Nome do seu bot..."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Tom de Voz</Label>
                  <Select 
                    value={config.bot_personality.tone} 
                    onValueChange={(value: any) => onConfigUpdate({
                      ...config,
                      bot_personality: { ...config.bot_personality, tone: value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="formal">Formal</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="friendly">Amigável</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Estilo de Resposta</Label>
                <Textarea
                  value={config.bot_personality.response_style}
                  onChange={(e) => onConfigUpdate({
                    ...config,
                    bot_personality: { ...config.bot_personality, response_style: e.target.value }
                  })}
                  placeholder="Descreva como o bot deve responder..."
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Limite Diário de Leads</Label>
                <Input
                  type="number"
                  value={config.lead_capture_settings.daily_limit}
                  onChange={(e) => onConfigUpdate({
                    ...config,
                    lead_capture_settings: { 
                      ...config.lead_capture_settings, 
                      daily_limit: parseInt(e.target.value) 
                    }
                  })}
                />
              </div>

              {/* Seção CRM */}
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold">Integração com CRM</h3>
                    <p className="text-sm text-muted-foreground">
                      Configure integrações com CRMs para sincronizar leads automaticamente
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="use-crm-config">Usar CRM</Label>
                    <Switch
                      id="use-crm-config"
                      checked={useCRM}
                      onCheckedChange={onUseCRMChange}
                    />
                  </div>
                </div>

                {useCRM ? (
                  <div className="space-y-4">
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Configure pelo menos um CRM para sincronizar seus leads automaticamente.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>HubSpot API Key</Label>
                        <Input
                          type="password"
                          placeholder="Chave API HubSpot"
                          value={config.crm_integrations.hubspot?.api_key || ''}
                          onChange={(e) => onConfigUpdate({
                            ...config,
                            crm_integrations: {
                              ...config.crm_integrations,
                              hubspot: { api_key: e.target.value, enabled: !!e.target.value }
                            }
                          })}
                        />
                        {config.crm_integrations.hubspot?.enabled && (
                          <Badge variant="default" className="text-xs">Ativo</Badge>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Pipedrive API Key</Label>
                        <Input
                          type="password"
                          placeholder="Chave API Pipedrive"
                          value={config.crm_integrations.pipedrive?.api_key || ''}
                          onChange={(e) => onConfigUpdate({
                            ...config,
                            crm_integrations: {
                              ...config.crm_integrations,
                              pipedrive: { api_key: e.target.value, enabled: !!e.target.value }
                            }
                          })}
                        />
                        {config.crm_integrations.pipedrive?.enabled && (
                          <Badge variant="default" className="text-xs">Ativo</Badge>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label>RD Station API Key</Label>
                        <Input
                          type="password"
                          placeholder="Chave API RD Station"
                          value={config.crm_integrations.rd_station?.api_key || ''}
                          onChange={(e) => onConfigUpdate({
                            ...config,
                            crm_integrations: {
                              ...config.crm_integrations,
                              rd_station: { api_key: e.target.value, enabled: !!e.target.value }
                            }
                          })}
                        />
                        {config.crm_integrations.rd_station?.enabled && (
                          <Badge variant="default" className="text-xs">Ativo</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Modo sem CRM:</strong> Os leads serão armazenados apenas no sistema interno. 
                      Você pode ativar a integração com CRM a qualquer momento.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}