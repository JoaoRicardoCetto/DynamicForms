import { useState } from 'react';
import { CompiledFormSpec, CompiledField } from '@/lib/types';
import { validateSubmission } from '@/lib/validationService';
import { store } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2 } from 'lucide-react';

interface Props {
  spec: CompiledFormSpec;
}

export function FormSpecRenderer({ spec }: Props) {
  const [data, setData] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const setValue = (name: string, value: unknown) => {
    setData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateSubmission(data, spec);
    if (!result.valid) {
      const errMap: Record<string, string> = {};
      result.errors.forEach(err => { errMap[err.field] = err.message; });
      setErrors(errMap);
      toast.error(`${result.errors.length} erro(s) de validação`);
      return;
    }

    store.createSubmission({
      formSpecId: spec.id,
      specVersion: spec.version,
      data,
      status: 'submitted',
    });
    setSubmitted(true);
    toast.success('Formulário enviado com sucesso!');
  };

  if (submitted) {
    return (
      <Card className="text-center py-12 animate-fade-in">
        <CardContent className="flex flex-col items-center gap-4">
          <div className="p-4 rounded-full bg-success/10">
            <CheckCircle2 className="w-10 h-10 text-success" />
          </div>
          <h2 className="text-xl font-bold">Enviado com sucesso!</h2>
          <p className="text-muted-foreground text-sm">Sua resposta foi registrada.</p>
          <Button variant="outline" onClick={() => { setSubmitted(false); setData({}); }}>
            Enviar outra resposta
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {spec.sections.map(section => (
        <Card key={section.id}>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              {section.title}
              <Badge variant="secondary" className="text-xs font-mono font-normal">
                {section.fields.length} campos
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {section.fields.map(field => (
              <FieldComponent
                key={field.id}
                field={field}
                value={data[field.name]}
                error={errors[field.name]}
                onChange={(v) => setValue(field.name, v)}
              />
            ))}
          </CardContent>
        </Card>
      ))}
      <Button type="submit" size="lg" className="w-full">
        Enviar
      </Button>
    </form>
  );
}

function FieldComponent({ field, value, error, onChange }: {
  field: CompiledField;
  value: unknown;
  error?: string;
  onChange: (v: unknown) => void;
}) {
  const isRequired = field.validations.some(v => v.type === 'required');

  return (
    <div className="space-y-1.5">
      <Label className="flex items-center gap-1">
        {field.label}
        {isRequired && <span className="text-destructive">*</span>}
      </Label>

      {field.type === 'text' || field.type === 'email' ? (
        <Input
          type={field.type === 'email' ? 'email' : 'text'}
          placeholder={field.placeholder}
          value={(value as string) || ''}
          onChange={e => onChange(e.target.value)}
          className={error ? 'border-destructive' : ''}
        />
      ) : field.type === 'number' ? (
        <Input
          type="number"
          placeholder={field.placeholder}
          value={value !== undefined ? String(value) : ''}
          onChange={e => onChange(e.target.value ? Number(e.target.value) : undefined)}
          className={error ? 'border-destructive' : ''}
        />
      ) : field.type === 'textarea' ? (
        <Textarea
          placeholder={field.placeholder}
          value={(value as string) || ''}
          onChange={e => onChange(e.target.value)}
          className={error ? 'border-destructive' : ''}
        />
      ) : field.type === 'date' ? (
        <Input
          type="date"
          value={(value as string) || ''}
          onChange={e => onChange(e.target.value)}
          className={error ? 'border-destructive' : ''}
        />
      ) : field.type === 'select' ? (
        <Select value={(value as string) || ''} onValueChange={v => onChange(v)}>
          <SelectTrigger className={error ? 'border-destructive' : ''}>
            <SelectValue placeholder={field.placeholder || 'Selecione...'} />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : field.type === 'checkbox' ? (
        <div className="flex items-center gap-2">
          <Checkbox
            checked={!!value}
            onCheckedChange={checked => onChange(!!checked)}
          />
          <span className="text-sm text-muted-foreground">{field.placeholder || field.label}</span>
        </div>
      ) : (
        <Input
          placeholder={field.placeholder}
          value={(value as string) || ''}
          onChange={e => onChange(e.target.value)}
          className={error ? 'border-destructive' : ''}
        />
      )}

      {field.helpText && !error && (
        <p className="text-xs text-muted-foreground">{field.helpText}</p>
      )}
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}
