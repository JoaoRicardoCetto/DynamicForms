import { useSearchParams } from 'react-router-dom';
import { useStore } from '@/hooks/useStore';
import { FormSpecRenderer } from '@/components/FormSpecRenderer';

export default function PreviewPage() {
  const [searchParams] = useSearchParams();
  const fsId = searchParams.get('id');
  const { formSpecs } = useStore();

  const fs = formSpecs.find(f => f.id === fsId);

  if (!fs?.specJson) {
    return (
      <div className="p-8 animate-fade-in">
        <h1 className="text-2xl font-bold mb-2">Preview</h1>
        <p className="text-muted-foreground">
          {fsId ? 'Este FormSpec ainda não foi compilado. Vá ao Builder e clique "Compilar & Publicar".' : 'Selecione um FormSpec publicado no Dashboard.'}
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl animate-fade-in">
      <h1 className="text-2xl font-bold font-display mb-1">{fs.specJson.title}</h1>
      <p className="text-sm text-muted-foreground font-mono mb-8">v{fs.specJson.version}</p>
      <FormSpecRenderer spec={fs.specJson} />
    </div>
  );
}
