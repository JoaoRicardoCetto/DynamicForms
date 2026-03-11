import { Link } from 'react-router-dom';
import { useStore } from '@/hooks/useStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, FileJson, Inbox, Layers } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';

export default function Dashboard() {
  const { formSpecs, submissions, store: s } = useStore();
  const [showCreate, setShowCreate] = useState(false);
  const [nome, setNome] = useState('');
  const [ano, setAno] = useState(new Date().getFullYear());

  const handleCreate = () => {
    if (!nome.trim()) return;
    s.createFormSpec(nome.trim(), ano);
    setNome('');
    setShowCreate(false);
  };

  return (
    <div className="p-8 max-w-5xl animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold font-display">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Gerencie seus FormSpecs metadata-driven</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Novo FormSpec
        </Button>
      </div>

      {showCreate && (
        <Card className="mb-6 animate-fade-in">
          <CardContent className="pt-6">
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="text-sm font-medium mb-1 block">Nome</label>
                <Input value={nome} onChange={e => setNome(e.target.value)} placeholder="Nome do formulário" />
              </div>
              <div className="w-32">
                <label className="text-sm font-medium mb-1 block">Ano</label>
                <Input type="number" value={ano} onChange={e => setAno(Number(e.target.value))} />
              </div>
              <Button onClick={handleCreate}>Criar</Button>
              <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <FileJson className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{formSpecs.length}</p>
              <p className="text-xs text-muted-foreground">FormSpecs</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-accent/10">
              <Layers className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold">{formSpecs.filter(f => f.status === 'published').length}</p>
              <p className="text-xs text-muted-foreground">Publicados</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-success/10">
              <Inbox className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{submissions.length}</p>
              <p className="text-xs text-muted-foreground">Submissões</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* FormSpec List */}
      <h2 className="text-lg font-semibold mb-4">FormSpecs</h2>
      <div className="space-y-3">
        {formSpecs.map(fs => (
          <Card key={fs.id} className="hover:shadow-md transition-shadow">
            <CardContent className="py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded bg-muted">
                  <FileJson className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-semibold">{fs.nome}</p>
                  <p className="text-xs text-muted-foreground font-mono">
                    v{fs.versao} · {fs.ano} · {fs.secoes.length} seções
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={fs.status === 'published' ? 'default' : 'secondary'}>
                  {fs.status}
                </Badge>
                <Link to={`/builder?id=${fs.id}`}>
                  <Button variant="outline" size="sm">Editar</Button>
                </Link>
                {fs.specJson && (
                  <Link to={`/preview?id=${fs.id}`}>
                    <Button variant="outline" size="sm">Preview</Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {formSpecs.length === 0 && (
          <p className="text-muted-foreground text-sm text-center py-8">Nenhum FormSpec criado ainda.</p>
        )}
      </div>
    </div>
  );
}
