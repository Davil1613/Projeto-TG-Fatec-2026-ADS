import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  ArrowLeftRight,
  BarChart3,
  ClipboardCheck,
  CreditCard,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Package,
  Sun,
  Tags,
  Users,
  Warehouse,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTitle } from "./ui/sheet";
import { useTheme } from "next-themes";
import stockproIcon from "@/assets/stockpro-icon.png";
import TrialBanner from "./TrialBanner";
import { useUserRole } from "@/hooks/useUserRole";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Produtos", href: "/produtos", icon: Package },
  { name: "Categorias", href: "/categorias", icon: Tags },
  { name: "Movimentações", href: "/movimentacoes", icon: ArrowLeftRight },
  { name: "Estoque", href: "/estoque", icon: Warehouse },
  { name: "Inventário", href: "/inventario", icon: ClipboardCheck },
  { name: "Relatórios", href: "/relatorios", icon: BarChart3 },
  { name: "Auditoria", href: "/auditoria", icon: History, adminOnly: true },
  { name: "Equipe", href: "/equipe", icon: Users, adminOnly: true },
  { name: "Assinatura", href: "/assinatura", icon: CreditCard, adminOnly: true },
];

interface LayoutProps {
  children: React.ReactNode;
}

function Brand() {
  return (
    <div className="flex items-center gap-2">
      <img src={stockproIcon} alt="StockPro" className="h-8 w-8" />
      <div>
        <h1 className="text-xl font-bold text-foreground">StockPro</h1>
        <p className="text-xs text-muted-foreground">Controle de Estoque</p>
      </div>
    </div>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { isAdmin } = useUserRole();
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b border-border px-6">
        <Brand />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {navigation.filter((item) => isAdmin || !item.adminOnly).map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border space-y-2">
        <div className="px-3 pb-2">
          <p className="text-sm font-medium text-foreground truncate">{user?.name || user?.email}</p>
          <p className="text-xs text-muted-foreground">{isAdmin ? "Administrador" : "Usuário"}</p>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-accent-foreground hover:bg-accent"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5 mr-3" />
          ) : (
            <Moon className="h-5 w-5 mr-3" />
          )}
          {theme === "dark" ? "Tema Claro" : "Tema Escuro"}
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-accent-foreground hover:bg-accent"
          onClick={signOut}
        >
          <LogOut className="h-5 w-5 mr-3" />
          Sair
        </Button>
      </div>
    </div>
  );
}

export default function Layout({ children }: LayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div
        className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url(${stockproIcon})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "calc(50% + 128px) center",
          backgroundSize: "50%",
        }}
      />

      <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 bg-card/95 backdrop-blur-sm border-r border-border md:block">
        <SidebarContent />
      </aside>

      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-card/95 px-4 backdrop-blur-sm md:hidden">
        <Brand />
        <Button variant="ghost" size="icon" aria-label="Abrir menu" onClick={() => setMenuOpen(true)}>
          <Menu className="h-6 w-6" />
        </Button>
      </header>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
          <SidebarContent onNavigate={() => setMenuOpen(false)} />
        </SheetContent>
      </Sheet>

      <main className="relative z-10 md:pl-64">
        <div className="container mx-auto p-4 md:p-8">
          <TrialBanner />
          {children}
        </div>
      </main>
    </div>
  );
}
