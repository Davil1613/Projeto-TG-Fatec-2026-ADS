import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Package, 
  ArrowLeftRight, 
  Warehouse, 
  BarChart3,
  LogOut,
  Moon,
  Sun
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "./ui/button";
import { useTheme } from "next-themes";
import stockproIcon from "@/assets/stockpro-icon.png";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Produtos", href: "/produtos", icon: Package },
  { name: "Categorias", href: "/categorias", icon: Package },
  { name: "Movimentações", href: "/movimentacoes", icon: ArrowLeftRight },
  { name: "Estoque", href: "/estoque", icon: Warehouse },
  { name: "Relatórios", href: "/relatorios", icon: BarChart3 },
];

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { signOut } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background icon */}
      <div 
        className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url(${stockproIcon})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "calc(50% + 128px) center",
          backgroundSize: "50%"
        }}
      />
      
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-card/95 backdrop-blur-sm border-r border-border">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center gap-2 border-b border-border px-6">
            <img src={stockproIcon} alt="StockPro" className="h-8 w-8" />
            <div>
              <h1 className="text-xl font-bold text-foreground">StockPro</h1>
              <p className="text-xs text-muted-foreground">Controle de Estoque</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Theme toggle and Logout */}
          <div className="p-4 border-t border-border space-y-2">
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
      </aside>

      {/* Main content */}
      <main className="pl-64 relative z-10">
        <div className="container mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
