"use client";

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Rocket } from "lucide-react";

const Login = () => {
  const { session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (session) {
      navigate("/", { replace: true });
    }
  }, [session, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center items-center gap-2 mb-6">
            <Rocket className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-semibold">Acelerador</h1>
        </div>
        <div className="bg-card p-8 rounded-lg shadow-md border">
            <Auth
              supabaseClient={supabase}
              appearance={{ theme: ThemeSupa }}
              providers={[]}
              theme="light"
              localization={{
                variables: {
                  sign_in: {
                    email_label: 'Seu email',
                    password_label: 'Sua senha',
                    button_label: 'Entrar',
                    social_provider_text: 'Entrar com {{provider}}',
                    link_text: 'Já tem uma conta? Entre',
                  },
                  sign_up: {
                    email_label: 'Seu email',
                    password_label: 'Sua senha',
                    button_label: 'Cadastrar',
                    social_provider_text: 'Cadastrar com {{provider}}',
                    link_text: 'Não tem uma conta? Cadastre-se',
                  },
                  forgotten_password: {
                    email_label: 'Seu email',
                    button_label: 'Enviar instruções',
                    link_text: 'Esqueceu sua senha?',
                  },
                },
              }}
            />
        </div>
      </div>
    </div>
  );
};

export default Login;