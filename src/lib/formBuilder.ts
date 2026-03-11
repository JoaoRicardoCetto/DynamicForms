import { store } from './store';
import { CompiledField, CompiledFormSpec, CompiledSection, CompiledValidation } from './types';

/**
 * FormBuilder — compiles metadata into a FormSpec JSON
 */
export function buildFormSpec(formSpecId: string): CompiledFormSpec {
  const fs = store.formSpecs.get(formSpecId);
  if (!fs) throw new Error(`FormSpec ${formSpecId} not found`);

  const sections: CompiledSection[] = [];
  const allFields: CompiledField[] = [];

  for (const secaoId of fs.secoes) {
    const secao = store.secoes.get(secaoId);
    if (!secao) continue;

    const fields: CompiledField[] = [];
    for (const campoId of secao.campos) {
      const campo = store.campos.get(campoId);
      if (!campo) continue;

      const tipo = store.tiposDado.find(t => t.id === campo.tipoDadoId);
      const validations: CompiledValidation[] = campo.validacoes
        .map(vid => store.validacoes.get(vid))
        .filter(Boolean)
        .map(v => ({
          type: v!.tipoValidacao,
          value: v!.valor,
          message: v!.mensagemErro,
        }));

      const field: CompiledField = {
        id: campo.id,
        name: campo.nome,
        label: campo.label,
        placeholder: campo.placeholder,
        type: tipo?.nome || 'text',
        default: campo.valorPadrao,
        helpText: campo.helpText,
        validations,
        options: (campo.atributos?.options as { label: string; value: string }[]) || undefined,
      };
      fields.push(field);
      allFields.push(field);
    }

    sections.push({
      id: secao.id,
      title: secao.titulo,
      order: secao.ordem,
      fields,
    });
  }

  sections.sort((a, b) => a.order - b.order);

  const jsonSchema = buildJsonSchema(allFields);

  const compiled: CompiledFormSpec = {
    id: fs.id,
    version: fs.versao,
    title: fs.nome,
    sections,
    jsonSchema,
  };

  // Persist
  store.updateFormSpec(fs.id, { specJson: compiled, status: 'published' });

  // Simulate event publish
  console.log(`[Event] formspec.published — id=${fs.id}, version=${fs.versao}`);

  return compiled;
}

function buildJsonSchema(fields: CompiledField[]): Record<string, unknown> {
  const properties: Record<string, Record<string, unknown>> = {};
  const required: string[] = [];

  for (const field of fields) {
    const prop: Record<string, unknown> = {};

    // Map type
    switch (field.type) {
      case 'number': prop.type = 'number'; break;
      case 'checkbox': prop.type = 'boolean'; break;
      case 'date': prop.type = 'string'; prop.format = 'date'; break;
      default: prop.type = 'string';
    }

    for (const v of field.validations) {
      switch (v.type) {
        case 'required': required.push(field.name); break;
        case 'minLength': prop.minLength = v.value; break;
        case 'maxLength': prop.maxLength = v.value; break;
        case 'min': prop.minimum = v.value; break;
        case 'max': prop.maximum = v.value; break;
        case 'pattern': prop.pattern = v.value; break;
      }
    }

    properties[field.name] = prop;
  }

  return {
    type: 'object',
    properties,
    required,
  };
}
