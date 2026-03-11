import { useSearchParams } from 'react-router-dom';
import { useStore } from '@/hooks/useStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { buildFormSpec } from '@/lib/formBuilder';
import { useState } from 'react';
import { Plus, Trash2, Zap, GripVertical } from 'lucide-react';
import { toast } from 'sonner';
import { Validacao } from '@/lib/types';

export default function BuilderPage() {
  const [searchParams] = useSearchParams();
  const fsId = searchParams.get('id');
  const { formSpecs, secoes, campos, validacoes, tiposDado, store: s } = useStore();
  const fs = formSpecs.find(f => f.id === fsId);

  if (!fs) {
    return (
      <div className="p-8 animate-fade-in">
        <p className="text-muted-foreground">Selecione um FormSpec no Dashboard para editar.</p>
      </div>
    );
  }

  const handleBuild = () => {
    try {
      buildFormSpec(fs.id);
      toast.success('FormSpec compilado e publicado com sucesso!');
    } catch (e: unknown) {
      toast.error(`Erro: ${e instanceof Error ? e.message : 'unknown'}`);
    }
  };

  const fsSections = fs.secoes.map(sid => secoes.find(sec => sec.id === sid)).filter(Boolean);

  return (
    <div className="p-8 max-w-4xl animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-display">{fs.nome}</h1>
          <p className="text-sm text-muted-foreground font-mono">ID: {fs.id} · v{fs.versao}</p>
        </div>
        <Button onClick={handleBuild} className="gap-2">
          <Zap className="w-4 h-4" /> Compilar & Publicar
        </Button>
      </div>

      {/* Sections */}
      <div className="space-y-6">
        {fsSections.map(secao => {
          if (!secao) return null;
          const secaoCampos = secao.campos.map(cid => campos.find(c => c.id === cid)).filter(Boolean);

          return (
            <SectionCard
              key={secao.id}
              secao={secao}
              campos={secaoCampos as any}
              validacoes={validacoes}
              tiposDado={tiposDado}
              store={s}
              formSpecId={fs.id}
            />
          );
        })}
      </div>

      <AddSectionForm formSpecId={fs.id} store={s} />
    </div>
  );
}

function SectionCard({ secao, campos, validacoes, tiposDado, store: s, formSpecId }: any) {
  const [showAddField, setShowAddField] = useState(false);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-muted-foreground" />
          <CardTitle className="text-base">{secao.titulo}</CardTitle>
          <Badge variant="secondary" className="text-xs font-mono">ordem: {secao.ordem}</Badge>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => s.deleteSecao(secao.id, formSpecId)}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {campos.map((campo: any) => (
          <FieldRow key={campo.id} campo={campo} validacoes={validacoes} tiposDado={tiposDado} store={s} />
        ))}

        {showAddField ? (
          <AddFieldForm secaoId={secao.id} tiposDado={tiposDado} store={s} onClose={() => setShowAddField(false)} />
        ) : (
          <Button variant="outline" size="sm" className="gap-1" onClick={() => setShowAddField(true)}>
            <Plus className="w-3 h-3" /> Adicionar Campo
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function FieldRow({ campo, validacoes, tiposDado, store: s }: any) {
  const tipo = tiposDado.find((t: any) => t.id === campo.tipoDadoId);
  const fieldValidacoes = campo.validacoes.map((vid: string) => validacoes.find((v: any) => v.id === vid)).filter(Boolean);
  const [showAddVal, setShowAddVal] = useState(false);

  return (
    <div className="p-3 rounded-md border bg-muted/30 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs bg-secondary px-2 py-0.5 rounded">{tipo?.nome || '?'}</span>
          <span className="font-semibold text-sm">{campo.label}</span>
          <span className="text-xs text-muted-foreground font-mono">{campo.nome}</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => s.deleteCampo(campo.id)} className="h-7 w-7 text-destructive">
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>

      {/* Validations */}
      <div className="flex flex-wrap gap-1.5">
        {fieldValidacoes.map((v: Validacao) => (
          <Badge key={v.id} variant="outline" className="text-xs gap-1 font-mono">
            {v.tipoValidacao}{v.valor !== undefined ? `(${v.valor})` : ''}
            <button onClick={() => s.deleteValidacao(v.id, campo.id)} className="ml-1 hover:text-destructive">×</button>
          </Badge>
        ))}
        {showAddVal ? (
          <AddValidationInline campoId={campo.id} store={s} onClose={() => setShowAddVal(false)} />
        ) : (
          <button onClick={() => setShowAddVal(true)} className="text-xs text-primary hover:underline">+ validação</button>
        )}
      </div>
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
        <SelectTrigger className="w-32 h-7 text-xs">
          <SelectValue />
        </SelectTrigger>
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

function AddFieldForm({ secaoId, tiposDado, store: s, onClose }: any) {
  const [nome, setNome] = useState('');
  const [label, setLabel] = useState('');
  const [tipoId, setTipoId] = useState('1');
  const [placeholder, setPlaceholder] = useState('');

  const handleAdd = () => {
    if (!nome.trim() || !label.trim()) return;
    s.createCampo(secaoId, { nome: nome.trim(), label: label.trim(), tipoDadoId: tipoId, placeholder });
    onClose();
  };

  return (
    <div className="p-3 border rounded-md bg-card space-y-2 animate-fade-in">
      <div className="grid grid-cols-2 gap-2">
        <Input placeholder="nome (slug)" value={nome} onChange={e => setNome(e.target.value)} className="text-sm" />
        <Input placeholder="Label" value={label} onChange={e => setLabel(e.target.value)} className="text-sm" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Select value={tipoId} onValueChange={setTipoId}>
          <SelectTrigger className="text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {tiposDado.map((t: any) => (
              <SelectItem key={t.id} value={t.id}>{t.nome}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input placeholder="Placeholder" value={placeholder} onChange={e => setPlaceholder(e.target.value)} className="text-sm" />
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={handleAdd}>Adicionar</Button>
        <Button size="sm" variant="ghost" onClick={onClose}>Cancelar</Button>
      </div>
    </div>
  );
}

function AddSectionForm({ formSpecId, store: s }: any) {
  const [show, setShow] = useState(false);
  const [titulo, setTitulo] = useState('');

  const handleAdd = () => {
    if (!titulo.trim()) return;
    s.createSecao(formSpecId, titulo.trim());
    setTitulo('');
    setShow(false);
  };

  return (
    <div className="mt-6">
      {show ? (
        <div className="flex gap-2 items-center animate-fade-in">
          <Input placeholder="Título da seção" value={titulo} onChange={e => setTitulo(e.target.value)} />
          <Button onClick={handleAdd}>Criar</Button>
          <Button variant="ghost" onClick={() => setShow(false)}>Cancelar</Button>
        </div>
      ) : (
        <Button variant="outline" className="gap-2" onClick={() => setShow(true)}>
          <Plus className="w-4 h-4" /> Nova Seção
        </Button>
      )}
    </div>
  );
}
