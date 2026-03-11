// ===== Metadata entities =====
export interface TipoDado {
  id: string;
  nome: string; // text, number, date, select, checkbox, radio, file, textarea, email
}

export interface Validacao {
  id: string;
  tipoValidacao: 'required' | 'minLength' | 'maxLength' | 'min' | 'max' | 'pattern' | 'custom';
  valor?: string | number;
  mensagemErro: string;
}

export interface Campo {
  id: string;
  nome: string;
  label: string;
  placeholder?: string;
  helpText?: string;
  tipoDadoId: string;
  atributos?: Record<string, unknown>; // e.g. options for select
  validacoes: string[]; // validacao IDs
  ordem: number;
  valorPadrao?: string;
  isTemplate?: boolean; // true = library item, reusable
  templateOriginId?: string; // ID of the template this was cloned from
}

export interface Secao {
  id: string;
  titulo: string;
  campos: string[]; // campo IDs
  ordem: number;
  isTemplate?: boolean; // true = library item, reusable
  templateOriginId?: string; // ID of the template this was cloned from
}

export interface FormSpecMeta {
  id: string;
  nome: string;
  ano: number;
  status: 'draft' | 'published';
  versao: string;
  createdAt: string;
  updatedAt: string;
  secoes: string[]; // secao IDs
  specJson?: CompiledFormSpec;
}

// ===== Compiled FormSpec =====
export interface CompiledValidation {
  type: string;
  value?: string | number;
  message: string;
}

export interface CompiledField {
  id: string;
  name: string;
  label: string;
  placeholder?: string;
  type: string;
  default?: string;
  helpText?: string;
  validations: CompiledValidation[];
  options?: { label: string; value: string }[];
}

export interface CompiledSection {
  id: string;
  title: string;
  order: number;
  fields: CompiledField[];
}

export interface CompiledFormSpec {
  id: string;
  version: string;
  title: string;
  sections: CompiledSection[];
  jsonSchema: Record<string, unknown>;
}

// ===== Submissions =====
export interface Submission {
  id: string;
  formSpecId: string;
  specVersion: string;
  data: Record<string, unknown>;
  meta?: Record<string, unknown>;
  status: 'submitted' | 'validated' | 'error';
  createdAt: string;
  errors?: { field: string; code: string; message: string }[];
}
