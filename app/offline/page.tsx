export const dynamic = "force-static";

export default function OfflinePage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6 text-center">
      <div>
        <h1 className="text-2xl font-semibold mb-2">Você está offline</h1>
        <p className="text-muted-foreground mb-4">
          Sem conexão no momento. Algumas funcionalidades podem não estar
          disponíveis.
        </p>
        <p className="text-sm text-muted-foreground">
          Assim que a conexão for restabelecida, o conteúdo será atualizado
          automaticamente.
        </p>
      </div>
    </main>
  );
}
