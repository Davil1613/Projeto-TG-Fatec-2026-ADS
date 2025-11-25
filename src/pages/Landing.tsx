import { ArrowRight, CheckCircle, BarChart3, Package, Shield, Zap, Users, Clock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import stockproIcon from "@/assets/stockpro-icon.png";
import dashboardPreview from "@/assets/dashboard-preview.png";

// Configuração editável
const CONFIG = {
  productName: "STOCKPRO",
  price: "R$50/mês",
  trialDays: "7 dias",
  checkoutUrl: "https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=3e61f1af5985402f89e1ddb1a13c5da9",
  hero: {
    title: "Gerencie Seu Estoque de Forma Automática e Profissional",
    subtitle: "O STOCKPRO te dá controle completo do seu estoque, produtos, vendas e relatórios — tudo sem complicação.",
    cta: "Começar teste grátis de 7 dias",
    badge: "7 DIAS GRÁTIS"
  },
  benefits: [
    {
      icon: BarChart3,
      title: "Controle total do estoque",
      description: "Visão completa de entradas, saídas e saldo em tempo real"
    },
    {
      icon: Zap,
      title: "Registro rápido de produtos",
      description: "Cadastre produtos em segundos com interface intuitiva"
    },
    {
      icon: Package,
      title: "Atualização automática",
      description: "Entradas e saídas atualizadas automaticamente"
    },
    {
      icon: Shield,
      title: "Acesso seguro e individual",
      description: "Cada empresa tem seus dados isolados e protegidos"
    }
  ],
  howItWorks: [
    { step: "1", title: "Criar conta", description: "Cadastro rápido e sem burocracia" },
    { step: "2", title: "Testar 7 dias grátis", description: "Use todas as funcionalidades sem pagar" },
    { step: "3", title: "Acessar painel exclusivo", description: "Dashboard completo e intuitivo" },
    { step: "4", title: "Assinar e continuar", description: "Após o teste, assine por R$50/mês" }
  ],
  testimonials: [
    {
      name: "Carlos Silva",
      company: "Distribuidora São Paulo",
      text: "Antes eu perdia horas com planilhas. Agora controlo tudo em minutos!",
      rating: 5
    },
    {
      name: "Marina Costa",
      company: "Loja Maria Imports",
      text: "Interface simples e intuitiva. Minha equipe aprendeu a usar no primeiro dia.",
      rating: 5
    },
    {
      name: "Roberto Almeida",
      company: "Atacado Premium",
      text: "O melhor investimento que fiz! Economizo tempo e tenho controle total.",
      rating: 5
    },
    {
      name: "Fernanda Oliveira",
      company: "Comércio Estrela",
      text: "Acabaram os erros de estoque! Agora sei exatamente o que tenho em tempo real.",
      rating: 5
    },
    {
      name: "João Santos",
      company: "Mercado Central",
      text: "Sistema completo e fácil de usar. Vale cada centavo da mensalidade!",
      rating: 5
    }
  ],
  plan: {
    name: "Plano Único",
    price: "R$50/mês",
    trial: "7 dias de teste GRÁTIS",
    features: [
      "7 dias de teste grátis",
      "Acesso total ao sistema",
      "Atualizações automáticas",
      "Dashboard completo",
      "Estoque ilimitado",
      "Relatórios avançados",
      "Múltiplos usuários"
    ]
  }
};

export default function Landing() {
  const navigate = useNavigate();
  
  const handleCTA = () => {
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header/Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={stockproIcon} alt="STOCKPRO" className="h-10 w-10" />
              <h2 className="text-xl font-bold text-foreground">{CONFIG.productName}</h2>
            </div>
            
            <div className="flex items-center gap-3">
              <Link to="/auth">
                <Button variant="ghost">
                  Login
                </Button>
              </Link>
              <Link to="/auth">
                <Button>
                  Criar Conta
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/5 border-b border-border pt-20">
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url(${stockproIcon})`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            backgroundSize: "40%"
          }}
        />
        
        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-8 animate-fade-in">
            <img src={stockproIcon} alt="STOCKPRO" className="h-20 w-20 md:h-24 md:w-24" />
            
            <div className="inline-block">
              <span className="bg-primary/20 text-primary px-6 py-2 rounded-full text-sm font-bold border-2 border-primary animate-pulse">
                {CONFIG.hero.badge}
              </span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
              {CONFIG.hero.title}
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
              {CONFIG.hero.subtitle}
            </p>
            
            <Button 
              size="lg" 
              className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all hover:scale-105"
              onClick={handleCTA}
            >
              {CONFIG.hero.cta}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <p className="text-sm text-muted-foreground">
              ✓ Teste grátis por 7 dias • ✓ Sem cartão de crédito • ✓ Cancele quando quiser
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 md:py-24 bg-card/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">
            Por que escolher o STOCKPRO?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {CONFIG.benefits.map((benefit, index) => (
              <Card 
                key={index} 
                className="border-border hover:border-primary/50 transition-all hover:shadow-lg hover:scale-105 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6 text-center space-y-4">
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <benefit.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg text-foreground">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-4">
            Como funciona?
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Em apenas 4 passos simples você está pronto para gerenciar seu estoque
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {CONFIG.howItWorks.map((step, index) => (
              <div key={index} className="relative text-center animate-fade-in" style={{ animationDelay: `${index * 150}ms` }}>
                <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center text-2xl font-bold text-primary-foreground mb-4 shadow-lg">
                  {step.step}
                </div>
                <h3 className="font-bold text-lg text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
                
                {index < CONFIG.howItWorks.length - 1 && (
                  <ArrowRight className="hidden lg:block absolute top-8 -right-4 h-6 w-6 text-muted-foreground/30" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Showcase */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-accent/5 to-primary/5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Dashboard completo e intuitivo
              </h2>
              <p className="text-lg text-muted-foreground">
                Visualize todos os dados importantes do seu estoque em uma única tela. Produtos, movimentações, alertas de estoque baixo e relatórios detalhados.
              </p>
              
              <ul className="space-y-3">
                {[
                  "Listagem completa de produtos com fotos",
                  "Controle de entradas e saídas em tempo real",
                  "Alertas automáticos de estoque baixo",
                  "Relatórios de vendas e movimentações",
                  "Categorização inteligente",
                  "Histórico completo de operações"
                ].map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-foreground">
                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <Card className="border-border shadow-2xl overflow-hidden">
              <CardContent className="p-0">
                <img 
                  src={dashboardPreview} 
                  alt="Interface do Dashboard STOCKPRO" 
                  className="w-full h-auto object-cover"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 md:py-24 bg-card/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-4">
            O que nossos clientes dizem
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Empresas de todos os tamanhos confiam no STOCKPRO
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {CONFIG.testimonials.map((testimonial, index) => (
              <Card key={index} className="border-border hover:shadow-lg transition-all animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                <CardContent className="p-6 space-y-4">
                  <div className="flex gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-warning text-warning" />
                    ))}
                  </div>
                  
                  <p className="text-foreground italic">"{testimonial.text}"</p>
                  
                  <div className="flex items-center gap-3 pt-4 border-t border-border">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.company}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary/10 via-background to-accent/5">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-4">
            Plano simples e transparente
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Sem taxas ocultas, sem surpresas. Apenas uma assinatura mensal com tudo incluído.
          </p>
          
          <Card className="max-w-md mx-auto border-2 border-primary shadow-2xl">
            <CardContent className="p-8 space-y-6">
              <div className="text-center">
                <div className="inline-block bg-primary/10 text-primary px-4 py-1 rounded-full text-sm font-bold mb-3">
                  {CONFIG.plan.trial}
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">{CONFIG.plan.name}</h3>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-5xl font-bold text-primary">{CONFIG.plan.price}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">após o período de teste</p>
                <p className="text-xs text-muted-foreground">Sem fidelidade • Cancele quando quiser</p>
              </div>
              
              <ul className="space-y-3">
                {CONFIG.plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3 text-foreground">
                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button 
                size="lg" 
                className="w-full text-lg py-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all hover:scale-105"
                onClick={handleCTA}
              >
                Começar teste grátis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Comece agora e use por 7 dias gratuitamente
              </p>
              
              <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span>Seguro</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Garantia</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center space-y-6">
            <div className="flex items-center gap-3">
              <img src={stockproIcon} alt="STOCKPRO" className="h-10 w-10" />
              <h3 className="text-2xl font-bold text-foreground">{CONFIG.productName}</h3>
            </div>
            
            <div className="flex flex-wrap gap-6 justify-center text-sm">
              <Link to="/auth" className="text-muted-foreground hover:text-primary transition-colors">
                Login
              </Link>
              <Link to="/auth" className="text-muted-foreground hover:text-primary transition-colors">
                Criar Conta
              </Link>
              <button onClick={handleCTA} className="text-muted-foreground hover:text-primary transition-colors">
                Assinar
              </button>
            </div>
            
            <p className="text-sm text-muted-foreground text-center">
              Sistema em nuvem seguro – Todos os direitos reservados © 2025 {CONFIG.productName}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
