/**
 * Script para criar usuário de teste necessário para os testes
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "http://127.0.0.1:54321";
const supabaseServiceKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

async function createTestUser() {
  // Cliente admin para criar usuários
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  console.log("🔧 Criando usuário de teste...");

  try {
    // Criar usuário de teste
    const { data: userData, error: userError } =
      await supabaseAdmin.auth.admin.createUser({
        email: "test@example.com",
        password: "testpassword123",
        email_confirm: true,
        user_metadata: {
          full_name: "Test User",
          role: "user",
        },
      });

    if (userError) {
      if (userError.message.includes("already registered")) {
        console.log("✅ Usuário de teste já existe");
        return;
      }
      throw userError;
    }

    console.log("✅ Usuário de teste criado:", userData.user?.email);

    // Criar entrada na tabela users se necessário
    const { error: profileError } = await supabaseAdmin.from("users").upsert({
      id: userData.user!.id,
      email: userData.user!.email!,
      full_name: "Test User",
      digest_time: "09:00",
      timezone: "UTC",
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (profileError) {
      console.log("⚠️ Erro ao criar perfil:", profileError.message);
    } else {
      console.log("✅ Perfil de usuário criado");
    }
  } catch (error) {
    console.error("❌ Erro ao criar usuário de teste:", error);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  createTestUser().then(() => {
    console.log("🎉 Configuração de teste concluída");
    process.exit(0);
  });
}

export { createTestUser };
