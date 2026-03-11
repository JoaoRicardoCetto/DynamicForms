import { Campo, FormSpecMeta, Secao, Submission, TipoDado, Validacao } from './types';

// In-memory store simulating the metadata DB

const generateId = () => crypto.randomUUID().slice(0, 8);

// Default data types
const defaultTiposDado: TipoDado[] = [
  { id: '1', nome: 'text' },
  { id: '2', nome: 'number' },
  { id: '3', nome: 'date' },
  { id: '4', nome: 'select' },
  { id: '5', nome: 'checkbox' },
  { id: '6', nome: 'radio' },
  { id: '7', nome: 'textarea' },
  { id: '8', nome: 'email' },
];

class MetadataStore {
  tiposDado: TipoDado[] = [...defaultTiposDado];
  validacoes: Map<string, Validacao> = new Map();
  campos: Map<string, Campo> = new Map();
  secoes: Map<string, Secao> = new Map();
  formSpecs: Map<string, FormSpecMeta> = new Map();
  submissions: Map<string, Submission> = new Map();
  private listeners: Set<() => void> = new Set();

  subscribe(fn: () => void) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private notify() {
    this.listeners.forEach(fn => fn());
  }

  // FormSpec CRUD
  createFormSpec(nome: string, ano: number): FormSpecMeta {
    const id = generateId();
    const fs: FormSpecMeta = {
      id, nome, ano, status: 'draft', versao: '1.0.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      secoes: [],
    };
    this.formSpecs.set(id, fs);
    this.notify();
    return fs;
  }

  updateFormSpec(id: string, updates: Partial<Pick<FormSpecMeta, 'nome' | 'ano' | 'status' | 'versao' | 'specJson'>>) {
    const fs = this.formSpecs.get(id);
    if (!fs) return;
    Object.assign(fs, updates, { updatedAt: new Date().toISOString() });
    this.notify();
  }

  deleteFormSpec(id: string) {
    const fs = this.formSpecs.get(id);
    if (fs) {
      fs.secoes.forEach(sid => this.deleteSecao(sid, id));
      this.formSpecs.delete(id);
      this.notify();
    }
  }

  // Secao CRUD
  createSecao(formSpecId: string, titulo: string): Secao {
    const fs = this.formSpecs.get(formSpecId);
    if (!fs) throw new Error('FormSpec not found');
    const id = generateId();
    const secao: Secao = { id, titulo, campos: [], ordem: fs.secoes.length + 1 };
    this.secoes.set(id, secao);
    fs.secoes.push(id);
    fs.updatedAt = new Date().toISOString();
    this.notify();
    return secao;
  }

  updateSecao(id: string, updates: Partial<Pick<Secao, 'titulo' | 'ordem'>>) {
    const s = this.secoes.get(id);
    if (s) { Object.assign(s, updates); this.notify(); }
  }

  deleteSecao(id: string, formSpecId: string) {
    const fs = this.formSpecs.get(formSpecId);
    if (fs) {
      fs.secoes = fs.secoes.filter(s => s !== id);
    }
    const secao = this.secoes.get(id);
    if (secao) {
      secao.campos.forEach(cid => this.deleteCampo(cid));
    }
    this.secoes.delete(id);
    this.notify();
  }

  // Campo CRUD
  createCampo(secaoId: string, campo: Omit<Campo, 'id' | 'ordem' | 'validacoes'>): Campo {
    const secao = this.secoes.get(secaoId);
    if (!secao) throw new Error('Secao not found');
    const id = generateId();
    const c: Campo = { ...campo, id, ordem: secao.campos.length + 1, validacoes: [] };
    this.campos.set(id, c);
    secao.campos.push(id);
    this.notify();
    return c;
  }

  // Create a standalone template campo (not attached to any section)
  createTemplateCampo(campo: Omit<Campo, 'id' | 'ordem' | 'validacoes'>): Campo {
    const id = generateId();
    const c: Campo = { ...campo, id, ordem: 0, validacoes: [], isTemplate: true };
    this.campos.set(id, c);
    this.notify();
    return c;
  }

  // Create a standalone template secao (not attached to any formspec)
  createTemplateSecao(titulo: string): Secao {
    const id = generateId();
    const secao: Secao = { id, titulo, campos: [], ordem: 0, isTemplate: true };
    this.secoes.set(id, secao);
    this.notify();
    return secao;
  }

  // Add a template campo to a template secao
  addCampoToTemplateSecao(secaoId: string, campoId: string) {
    const secao = this.secoes.get(secaoId);
    if (!secao) return;
    if (!secao.campos.includes(campoId)) {
      secao.campos.push(campoId);
      this.notify();
    }
  }

  // Clone a template campo (deep copy with new ID, copying validations)
  cloneCampo(campoId: string, targetSecaoId?: string): Campo | null {
    const original = this.campos.get(campoId);
    if (!original) return null;
    const newId = generateId();
    const cloned: Campo = {
      ...original,
      id: newId,
      isTemplate: false,
      templateOriginId: original.isTemplate ? original.id : original.templateOriginId,
      validacoes: [],
    };
    this.campos.set(newId, cloned);

    // Clone validations
    for (const vid of original.validacoes) {
      const v = this.validacoes.get(vid);
      if (v) {
        const newVid = generateId();
        this.validacoes.set(newVid, { ...v, id: newVid });
        cloned.validacoes.push(newVid);
      }
    }

    // Add to target section if provided
    if (targetSecaoId) {
      const secao = this.secoes.get(targetSecaoId);
      if (secao) {
        cloned.ordem = secao.campos.length + 1;
        secao.campos.push(newId);
      }
    }

    this.notify();
    return cloned;
  }

  // Clone a template secao with all its campos into a formspec
  cloneSecaoIntoFormSpec(secaoId: string, formSpecId: string): Secao | null {
    const original = this.secoes.get(secaoId);
    const fs = this.formSpecs.get(formSpecId);
    if (!original || !fs) return null;

    const newSecaoId = generateId();
    const cloned: Secao = {
      id: newSecaoId,
      titulo: original.titulo,
      campos: [],
      ordem: fs.secoes.length + 1,
      isTemplate: false,
      templateOriginId: original.isTemplate ? original.id : original.templateOriginId,
    };
    this.secoes.set(newSecaoId, cloned);

    // Clone all campos
    for (const campoId of original.campos) {
      this.cloneCampo(campoId, newSecaoId);
    }

    fs.secoes.push(newSecaoId);
    fs.updatedAt = new Date().toISOString();
    this.notify();
    return cloned;
  }

  // Get all template campos
  getTemplateCampos(): Campo[] {
    return Array.from(this.campos.values()).filter(c => c.isTemplate);
  }

  // Get all template secoes
  getTemplateSecoes(): Secao[] {
    return Array.from(this.secoes.values()).filter(s => s.isTemplate);
  }

  updateCampo(id: string, updates: Partial<Campo>) {
    const c = this.campos.get(id);
    if (c) { Object.assign(c, updates); this.notify(); }
  }

  deleteCampo(id: string) {
    const campo = this.campos.get(id);
    if (campo) {
      campo.validacoes.forEach(vid => this.validacoes.delete(vid));
    }
    this.campos.delete(id);
    // remove from secoes
    this.secoes.forEach(s => { s.campos = s.campos.filter(c => c !== id); });
    this.notify();
  }

  // Validacao CRUD
  createValidacao(campoId: string, validacao: Omit<Validacao, 'id'>): Validacao {
    const campo = this.campos.get(campoId);
    if (!campo) throw new Error('Campo not found');
    const id = generateId();
    const v: Validacao = { ...validacao, id };
    this.validacoes.set(id, v);
    campo.validacoes.push(id);
    this.notify();
    return v;
  }

  deleteValidacao(id: string, campoId: string) {
    this.validacoes.delete(id);
    const campo = this.campos.get(campoId);
    if (campo) campo.validacoes = campo.validacoes.filter(v => v !== id);
    this.notify();
  }

  // Submissions
  createSubmission(sub: Omit<Submission, 'id' | 'createdAt'>): Submission {
    const id = generateId();
    const s: Submission = { ...sub, id, createdAt: new Date().toISOString() };
    this.submissions.set(id, s);
    this.notify();
    return s;
  }

  getSnapshot() {
    return {
      formSpecs: Array.from(this.formSpecs.values()),
      secoes: Array.from(this.secoes.values()),
      campos: Array.from(this.campos.values()),
      validacoes: Array.from(this.validacoes.values()),
      submissions: Array.from(this.submissions.values()),
      tiposDado: this.tiposDado,
    };
  }
}

export const store = new MetadataStore();

// Seed example data
const exFs = store.createFormSpec('Ficha de Acompanhamento', 2025);
const sec1 = store.createSecao(exFs.id, 'Dados Pessoais');
const c1 = store.createCampo(sec1.id, { nome: 'nome', label: 'Nome', placeholder: 'Nome completo', tipoDadoId: '1', helpText: 'Informe seu nome completo' });
store.createValidacao(c1.id, { tipoValidacao: 'required', mensagemErro: 'Nome obrigatório' });
store.createValidacao(c1.id, { tipoValidacao: 'minLength', valor: 3, mensagemErro: 'Mínimo 3 caracteres' });
const c2 = store.createCampo(sec1.id, { nome: 'email', label: 'E-mail', placeholder: 'email@exemplo.com', tipoDadoId: '8' });
store.createValidacao(c2.id, { tipoValidacao: 'required', mensagemErro: 'E-mail obrigatório' });
const c3 = store.createCampo(sec1.id, { nome: 'idade', label: 'Idade', tipoDadoId: '2' });
store.createValidacao(c3.id, { tipoValidacao: 'min', valor: 0, mensagemErro: 'Idade deve ser >= 0' });

const sec2 = store.createSecao(exFs.id, 'Informações Acadêmicas');
const c4 = store.createCampo(sec2.id, { nome: 'curso', label: 'Curso', placeholder: 'Selecione o curso', tipoDadoId: '4', atributos: { options: [{ label: 'Ciência da Computação', value: 'cc' }, { label: 'Engenharia', value: 'eng' }, { label: 'Medicina', value: 'med' }] } });
store.createValidacao(c4.id, { tipoValidacao: 'required', mensagemErro: 'Curso obrigatório' });
const c5 = store.createCampo(sec2.id, { nome: 'observacoes', label: 'Observações', placeholder: 'Alguma observação?', tipoDadoId: '7' });
