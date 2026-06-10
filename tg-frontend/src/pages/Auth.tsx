import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { forgotPassword, register, resetPassword } from "@/integrations/authApi";
import { Package } from "lucide-react";

const authSchema = z.object({
  email: z.string().email("Informe um e-mail válido"),
  password: z
    .string()
    .min(8, "A senha deve ter no mínimo 8 caracteres")
    .regex(/[A-Z]/, "A senha precisa ter ao menos uma letra maiúscula")
    .regex(/[a-z]/, "A senha precisa ter ao menos uma letra minúscula")
    .regex(/[0-9]/, "A senha precisa ter ao menos um número")
    .regex(/[^A-Za-z0-9]/, "A senha precisa ter ao menos um caractere especial"),
  companyName: z.string().min(2, "Informe o nome da empresa"),
});

function validatePasswordChecks(password: string) {
  return {
    minLength: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
}

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [resetStep, setResetStep] = useState<"request" | "confirm">("request");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const { signIn } = useAuth();
  const { toast } = useToast();

  const passwordChecks = validatePasswordChecks(newPassword);
  const isStrongPassword = Object.values(passwordChecks).every(Boolean);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      authSchema.omit({ companyName: true }).parse({ email, password });
    } catch (error: any) {
      return toast({
        title: "Erro",
        description: error.errors?.[0]?.message,
        variant: "destructive",
      });
    }

    const { error } = await signIn(email, password);
    if (error) {
      toast({
        title: "Erro ao fazer login",
        description: error?.message || "Credenciais inválidas",
        variant: "destructive",
      });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      authSchema.parse({ email, password, companyName });
    } catch (error: any) {
      return toast({
        title: "Erro",
        description: error.errors?.[0]?.message,
        variant: "destructive",
      });
    }

    try {
      await register(email, password, companyName);
      toast({
        title: "Conta criada",
        description: "Agora faça login.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao cadastrar",
        description: error?.message || "Erro ao criar conta",
        variant: "destructive",
      });
    }
  };

  const handleForgotPassword = async () => {
    try {
      z.string().email("Informe um e-mail válido").parse(forgotEmail);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.errors?.[0]?.message || "E-mail inválido",
        variant: "destructive",
      });
      return;
    }

    setForgotLoading(true);
    try {
      await forgotPassword(forgotEmail);
      toast({
        title: "Código enviado",
        description: "Se o e-mail existir, enviamos um código de 6 dígitos.",
      });
      setResetStep("confirm");
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error?.message || "Não foi possível enviar o código.",
        variant: "destructive",
      });
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!forgotEmail || !resetCode || !newPassword) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha e-mail, código e nova senha.",
        variant: "destructive",
      });
      return;
    }

    if (!isStrongPassword) {
      toast({
        title: "Senha fraca",
        description: "A senha deve atender todos os critérios.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast({
        title: "Confirmação inválida",
        description: "As senhas não conferem.",
        variant: "destructive",
      });
      return;
    }

    setForgotLoading(true);
    try {
      await resetPassword(forgotEmail, resetCode, newPassword);
      toast({
        title: "Senha redefinida",
        description: "Agora você já pode fazer login.",
      });
      setShowForgotPassword(false);
      setResetStep("request");
      setResetCode("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (error: any) {
      toast({
        title: "Erro ao redefinir",
        description: error?.message || "Código inválido ou expirado.",
        variant: "destructive",
      });
    } finally {
      setForgotLoading(false);
    }
  };

  const handleToggleForgot = () => {
    setShowForgotPassword((prev) => !prev);
    setResetStep("request");
    setResetCode("");
    setNewPassword("");
    setConfirmNewPassword("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Package className="h-8 w-8" />
          </div>
          <CardTitle>Sistema de Estoque</CardTitle>
          <CardDescription>Faça login ou crie sua conta</CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Cadastro</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <Label>Email</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>

                <div>
                  <Label>Senha</Label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <Button className="w-full" type="submit">
                  Entrar
                </Button>

                <Button type="button" variant="link" className="w-full" onClick={handleToggleForgot}>
                  {showForgotPassword ? "Cancelar" : "Esqueci minha senha"}
                </Button>

                {showForgotPassword ? (
                  <div className="rounded-md border p-3 space-y-3">
                    <Label>E-mail de recuperação</Label>
                    <Input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="seu@email.com"
                    />

                    {resetStep === "request" ? (
                      <Button
                        type="button"
                        variant="secondary"
                        className="w-full"
                        onClick={handleForgotPassword}
                        disabled={forgotLoading}
                      >
                        {forgotLoading ? "Enviando..." : "Enviar código"}
                      </Button>
                    ) : (
                      <div className="space-y-3">
                        <div>
                          <Label>Código de 6 dígitos</Label>
                          <Input
                            value={resetCode}
                            onChange={(e) => setResetCode(e.target.value)}
                            maxLength={6}
                            placeholder="123456"
                          />
                        </div>

                        <div>
                          <Label>Nova senha</Label>
                          <Input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                          />
                        </div>

                        <div>
                          <Label>Confirmar nova senha</Label>
                          <Input
                            type="password"
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                          />
                        </div>

                        <div className="rounded-md border p-2 text-xs text-muted-foreground space-y-1">
                          <p className={passwordChecks.minLength ? "text-green-600" : ""}>- 8+ caracteres</p>
                          <p className={passwordChecks.upper ? "text-green-600" : ""}>- Letra maiúscula</p>
                          <p className={passwordChecks.lower ? "text-green-600" : ""}>- Letra minúscula</p>
                          <p className={passwordChecks.number ? "text-green-600" : ""}>- Número</p>
                          <p className={passwordChecks.special ? "text-green-600" : ""}>- Especial</p>
                        </div>

                        <Button
                          type="button"
                          variant="secondary"
                          className="w-full"
                          onClick={handleResetPassword}
                          disabled={forgotLoading}
                        >
                          {forgotLoading ? "Redefinindo..." : "Redefinir senha"}
                        </Button>
                      </div>
                    )}
                  </div>
                ) : null}
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <Label>Email</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>

                <div>
                  <Label>Senha</Label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Empresa</Label>
                  <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                </div>

                <Button className="w-full" type="submit">
                  Criar Conta
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
