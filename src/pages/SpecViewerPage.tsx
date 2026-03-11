import { useStore } from '@/hooks/useStore';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';

export default function SpecViewerPage() {
  const { formSpecs } = useStore();
  const published = formSpecs.filter(f => f.specJson);
  const [selectedId, setSelectedId] = useState(published[0]?.id || '');
  const selected = published.find(f => f.id === selectedId);

  return (
    <div className="p-8 max-w-4xl animate-fade-in">
      <h1 className="text-2xl font-bold font-display mb-1">Spec JSON</h1>
      <p className="text-sm text-muted-foreground mb-6">FormSpec compilado (JSON Schema incluído)</p>

      <Select value={selectedId} onValueChange={setSelectedId}>
        <SelectTrigger className="w-64 mb-4">
          <SelectValue placeholder="Selecione um FormSpec" />
        </SelectTrigger>
        <SelectContent>
          {published.map(fs => (
            <SelectItem key={fs.id} value={fs.id}>{fs.nome} (v{fs.versao})</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selected?.specJson ? (
        <Card>
          <CardContent className="pt-6">
            <pre className="text-xs font-mono bg-muted p-4 rounded-md overflow-auto max-h-[70vh] leading-relaxed">
              {JSON.stringify(selected.specJson, null, 2)}
            </pre>
          </CardContent>
        </Card>
      ) : (
        <p className="text-muted-foreground">Nenhum FormSpec compilado disponível.</p>
      )}
    </div>
  );
}
