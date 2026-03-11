import { useState } from 'react';
import { useStore } from '@/hooks/useStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Package, Layers } from 'lucide-react';
import { toast } from 'sonner';
import { Validacao, Campo } from '@/lib/types';

export default function LibraryPage() {
  return (
    <div className="p-8 max-w-4xl animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-display">Biblioteca</h1>
        <p className="text-sm text-muted-foreground">
          Campos e seções reutilizáveis para seus formulários
        </p>
      </div>

      <Tabs defaultValue="campos">
        <TabsList className="mb-4">
          <TabsTrigger value="campos" className="gap-2">
            <Package className="w-4 h-4" /> Campos
          </TabsTrigger>
          <TabsTrigger value="secoes" className="gap-2">
            <Layers className="w-4 h-4" /> Seções
          </TabsTrigger>
        </TabsList>

        <TabsContent value="campos">
          <CamposLibrary />
        </TabsContent>
        <TabsContent value="secoes">
          <SecoesLibrary />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CamposLibrary() {
  const { campos, validacoes, tiposDado, store: s } = useStore();
  const templateCampos = campos.filter(c => c.isTemplate);
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {templateCampos.length} campo(s) na biblioteca
        </p>
        <Button size="sm" className="gap-1" onClick={() => setShowCreate(true)}>
          <Plus className="w-3 h-3" /> Novo Campo
        </Button>
      </div>

      {showCreate && (
        <CreateTemplateCampoForm
          tiposDado={tiposDado}
          store={s}
          onClose={() => setShowCreate(false)}
        />
      )}

      {templateCampos.length === 0 && !showCreate && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Nenhum campo na biblioteca. Crie campos reutilizáveis para agilizar a construção de formulários.
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {templateCampos.map(campo => (
          <TemplateCampoCard
            key={campo.id}
            campo={campo}
            validacoes={validacoes}
            tiposDado={tiposDado}
            store={s}
          />
        ))}
      </div>
    </div>
  );
}

function TemplateCampoCard({ campo, validacoes, tiposDado, store: s }: {
  campo: Campo;
  validacoes: Validacao[];
  tiposDado: any[];
  store: any;
}) {
  const tipo = tiposDado.find((t: any) => t.id === campo.tipoDadoId);
  const fieldValidacoes = campo.validacoes
    .map((vid: string) => validacoes.find((v: any) => v.id === vid))
    .filter(Boolean) as Validacao[];
  const [showAddVal, setShowAddVal] = useState(false);

  return (
    <Card>
      <CardContent className="py-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="font-mono text-xs">
              {tipo?.nome || '?'}
            </Badge>
            <span className="font-semibold text-sm">{campo.label}</span>
            <span className="text-xs text-muted-foreground font-mono">{campo.nome}</span>
            {campo.placeholder && (
              <span className="text-xs text-muted-foreground">placeholder: "{campo.placeholder}"</span>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => { s.deleteCampo(campo.id); toast.success('Campo removido da biblioteca'); }}
            className="h-7 w-7 text-destructive"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {fieldValidacoes.map((v) => (
            <Badge key={v.id} variant="outline" className="text-xs gap-1 font-mono">
              {v.tipoValidacao}{v.valor !== undefined ? `(${v.valor})` : ''}
              <button
                onClick={() => s.deleteValidacao(v.id, campo.id)}
                className="ml-1 hover:text-destructive"
              >
                ×
              </button>
            </Badge>
          ))}
          {showAddVal ? (
            <AddValidationInline campoId={campo.id} store={s} onClose={() => setShowAddVal(false)} />
          ) : (
            <button
              onClick={() => setShowAddVal(true)}
              className="text-xs text-primary hover:underline"
            >
              + validação
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function SecoesLibrary() {
  const { secoes, campos, tiposDado, validacoes, store: s } = useStore();
  const templateSecoes = secoes.filter(sec => sec.isTemplate);
  const templateCampos = campos.filter(c => c.isTemplate);
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {templateSecoes.length} seção(ões) na biblioteca
        </p>
        <Button size="sm" className="gap-1" onClick={() => setShowCreate(true)}>
          <Plus className="w-3 h-3" /> Nova Seção
        </Button>
      </div>

      {showCreate && (
        <CreateTemplateSecaoForm store={s} onClose={() => setShowCreate(false)} />
      )}

      {templateSecoes.length === 0 && !showCreate && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Nenhuma seção na biblioteca. Crie seções reutilizáveis com campos pré-definidos.
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {templateSecoes.map(secao => {
          const secaoCampos = secao.campos
            .map(cid => campos.find(c => c.id === cid))
            .filter(Boolean) as Campo[];

          return (
            <Card key={secao.id}>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-base">{secao.titulo}</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    s.deleteSecao(secao.id);
                    toast.success('Seção removida da biblioteca');
                  }}
                  className="h-7 w-7 text-destructive"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-2">
                {secaoCampos.map(campo => {
                  const tipo = tiposDado.find(t => t.id === campo.tipoDadoId);
                  const fieldVals = campo.validacoes
                    .map(vid => validacoes.find(v => v.id === vid))
                    .filter(Boolean) as Validacao[];
                  return (
                    <div key={campo.id} className="flex items-center gap-3 p-2 rounded border bg-muted/30">
                      <Badge variant="secondary" className="font-mono text-xs">{tipo?.nome || '?'}</Badge>
                      <span className="text-sm font-medium">{campo.label}</span>
                      <span className="text-xs text-muted-foreground font-mono">{campo.nome}</span>
                      {fieldVals.map(v => (
                        <Badge key={v.id} variant="outline" className="text-xs font-mono">
                          {v.tipoValidacao}{v.valor !== undefined ? `(${v.valor})` : ''}
                        </Badge>
                      ))}
                    </div>
                  );
                })}

                <AddCampoToTemplateSecao
                  secaoId={secao.id}
                  templateCampos={templateCampos}
                  tiposDado={tiposDado}
                  store={s}
                />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function AddCampoToTemplateSecao({ secaoId, templateCampos, tiposDado, store: s }: any) {
  const [mode, setMode] = useState<'idle' | 'pick' | 'create'>('idle');
  const [selectedCampoId, setSelectedCampoId] = useState('');

  if (mode === 'idle') {
    return (
      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => setMode('pick')}>
          <Package className="w-3 h-3" /> Da Biblioteca
        </Button>
        <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => setMode('create')}>
          <Plus className="w-3 h-3" /> Criar Novo
        </Button>
      </div>
    );
  }

  if (mode === 'pick') {
    const available = templateCampos.filter((c: Campo) => {
      const secao = s.secoes.get(secaoId);
      return secao && !secao.campos.includes(c.id);
    });

    return (
      <div className="flex items-center gap-2 animate-fade-in">
        <Select value={selectedCampoId} onValueChange={setSelectedCampoId}>
          <SelectTrigger className="text-sm w-60">
            <SelectValue placeholder="Selecionar campo..." />
          </SelectTrigger>
          <SelectContent>
            {available.map((c: Campo) => (
              <SelectItem key={c.id} value={c.id}>{c.label} ({c.nome})</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          size="sm"
          onClick={() => {
            if (selectedCampoId) {
              s.addCampoToTemplateSecao(secaoId, selectedCampoId);
              setSelectedCampoId('');
              setMode('idle');
              toast.success('Campo adicionado à seção');
            }
          }}
        >
          Adicionar
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setMode('idle')}>Cancelar</Button>
      </div>
    );
  }

  return (
    <CreateTemplateCampoForm
      tiposDado={tiposDado}
      store={s}
      onClose={() => setMode('idle')}
      targetSecaoId={secaoId}
    />
  );
}

function CreateTemplateCampoForm({ tiposDado, store: s, onClose, targetSecaoId }: any) {
  const [nome, setNome] = useState('');
  const [label, setLabel] = useState('');
  const [tipoId, setTipoId] = useState('1');
  const [placeholder, setPlaceholder] = useState('');

  const handleAdd = () => {
    if (!nome.trim() || !label.trim()) return;
    const campo = s.createTemplateCampo({
      nome: nome.trim(),
      label: label.trim(),
      tipoDadoId: tipoId,
      placeholder: placeholder || undefined,
    });
    if (targetSecaoId) {
      s.addCampoToTemplateSecao(targetSecaoId, campo.id);
    }
    toast.success('Campo criado na biblioteca');
    onClose();
  };

  return (
    <div className="p-3 border rounded-md bg-card space-y-2 animate-fade-in">
      <p className="text-xs font-medium text-muted-foreground">Novo campo na biblioteca</p>
      <div className="grid grid-cols-2 gap-2">
        <Input placeholder="nome (slug)" value={nome} onChange={e => setNome(e.target.value)} className="text-sm" />
        <Input placeholder="Label" value={label} onChange={e => setLabel(e.target.value)} className="text-sm" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Select value={tipoId} onValueChange={setTipoId}>
          <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            {tiposDado.map((t: any) => (
              <SelectItem key={t.id} value={t.id}>{t.nome}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input placeholder="Placeholder" value={placeholder} onChange={e => setPlaceholder(e.target.value)} className="text-sm" />
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={handleAdd}>Criar</Button>
        <Button size="sm" variant="ghost" onClick={onClose}>Cancelar</Button>
      </div>
    </div>
  );
}

function CreateTemplateSecaoForm({ store: s, onClose }: any) {
  const [titulo, setTitulo] = useState('');

  const handleAdd = () => {
    if (!titulo.trim()) return;
    s.createTemplateSecao(titulo.trim());
    toast.success('Seção criada na biblioteca');
    onClose();
  };

  return (
    <div className="flex gap-2 items-center animate-fade-in">
      <Input placeholder="Título da seção" value={titulo} onChange={e => setTitulo(e.target.value)} />
      <Button onClick={handleAdd}>Criar</Button>
      <Button variant="ghost" onClick={onClose}>Cancelar</Button>
    </div>
  );
}

function AddValidationInline({ campoId, store: s, onClose }: any) {
  const [tipo, setTipo] = useState('required');
  const [valor, setValor] = useState('');
  const [msg, setMsg] = useState('');

  const handleAdd = () => {
    s.createValidacao(campoId, {
      tipoValidacao: tipo as any,
      valor: valor ? (isNaN(Number(valor)) ? valor : Number(valor)) : undefined,
      mensagemErro: msg || `Validação: ${tipo}`,
    });
    onClose();
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Select value={tipo} onValueChange={setTipo}>
        <SelectTrigger className="w-32 h-7 text-xs"><SelectValue /></SelectTrigger>
        <SelectContent>
          {['required', 'minLength', 'maxLength', 'min', 'max', 'pattern'].map(t => (
            <SelectItem key={t} value={t}>{t}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {tipo !== 'required' && (
        <Input className="w-20 h-7 text-xs" placeholder="valor" value={valor} onChange={e => setValor(e.target.value)} />
      )}
      <Input className="w-40 h-7 text-xs" placeholder="mensagem" value={msg} onChange={e => setMsg(e.target.value)} />
      <Button size="sm" className="h-7 text-xs" onClick={handleAdd}>OK</Button>
      <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={onClose}>×</Button>
    </div>
  );
}
