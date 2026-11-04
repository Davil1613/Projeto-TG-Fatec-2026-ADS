import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Check, Plus, Trash2, X } from "lucide-react";
import Layout from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { createTeamMember, deleteTeamMember, getTeam, type TeamMember } from "@/integrations/usersApi";

const permissions = [
  { feature: "Dashboard e alertas de estoque", admin: true, user: true },
  { feature: "Consultar produtos, categorias e estoque", admin: true, user: true },
  { feature: "Registrar entradas, saídas e inventário", admin: true, user: true },
  { feature: "Relatórios de movimentação", admin: true, user: true },
  { feature: "Ver preço de custo, custo em estoque e margem", admin: true, user: false },
  { feature: "Cadastrar, editar e excluir produtos e categorias", admin: true, user: false },
  { feature: "Auditoria das operações", admin: true, user: false },
  { feature: "Gerenciar equipe e assinatura", admin: true, user: false },
];

const emptyForm = { name: "", email: "", password: "" };

export default function Team() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const loadMembers = async () => {
    try {
      setMembers(await getTeam());
    } catch (error: any) {
      toast({ title: "Erro ao carregar equipe", description: error.message, variant: "destructive" });
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createTeamMember(form);
      toast({ title: "Usuário criado", description: `${form.name} já pode acessar com o e-mail informado.` });
      setForm(emptyForm);
      setIsDialogOpen(false);
      loadMembers();
    } catch (error: any) {
      toast({ title: "Erro ao criar usuário", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (member: TeamMember) => {
    try {
      await deleteTeamMember(member.id);
      toast({ title: "Usuário removido", description: member.name });
      loadMembers();
    } catch (error: any) {
      toast({ title: "Erro ao remover usuário", description: error.message, variant: "destructive" });
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Equipe</h1>
            <p className="text-muted-foreground mt-2">Usuários da sua empresa e seus níveis de acesso</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg">
                <Plus className="mr-2 h-5 w-5" />
                Novo Usuário
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo usuário da equipe</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome *</Label>
                  <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail *</Label>
                  <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha inicial *</Label>
                  <Input id="password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                  <p className="text-xs text-muted-foreground">
                    Mínimo de 8 caracteres, com maiúscula, minúscula, número e caractere especial.
                  </p>
                </div>
                <Button type="submit" disabled={saving} className="w-full">
                  {saving ? "Salvando..." : "Criar usuário"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Perfil</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.name}</TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>
                    <Badge variant={member.role === "admin" ? "default" : "secondary"}>
                      {member.role === "admin" ? "Administrador" : "Usuário"}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(new Date(member.createdAt), "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                  <TableCell className="text-right">
                    {member.role !== "admin" && member.id !== user?.id && (
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(member)} title="Remover usuário">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Permissões por perfil</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Funcionalidade</TableHead>
                  <TableHead className="text-center">Administrador</TableHead>
                  <TableHead className="text-center">Usuário</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {permissions.map((row) => (
                  <TableRow key={row.feature}>
                    <TableCell>{row.feature}</TableCell>
                    {[row.admin, row.user].map((allowed, index) => (
                      <TableCell key={index} className="text-center">
                        {allowed
                          ? <Check className="mx-auto h-4 w-4 text-success" />
                          : <X className="mx-auto h-4 w-4 text-destructive" />}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
