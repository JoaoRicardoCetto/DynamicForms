import { useStore } from '@/hooks/useStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function SubmissionsPage() {
  const { submissions, formSpecs } = useStore();

  return (
    <div className="p-8 max-w-4xl animate-fade-in">
      <h1 className="text-2xl font-bold font-display mb-1">Submissões</h1>
      <p className="text-sm text-muted-foreground mb-8">Respostas recebidas dos formulários</p>

      {submissions.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">Nenhuma submissão ainda.</p>
      ) : (
        <div className="space-y-4">
          {submissions.map(sub => {
            const fs = formSpecs.find(f => f.id === sub.formSpecId);
            return (
              <Card key={sub.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">
                      {fs?.nome || sub.formSpecId}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="text-xs">
                        {sub.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground font-mono">
                        v{sub.specVersion}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs font-mono bg-muted p-3 rounded-md overflow-auto max-h-48">
                    {JSON.stringify(sub.data, null, 2)}
                  </pre>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(sub.createdAt).toLocaleString('pt-BR')}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
