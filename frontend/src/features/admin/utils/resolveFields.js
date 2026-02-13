export function resolveFields(fields, context = {}) {
  return fields.map((field) => {
    if (!field.optionsKey) {
      return field;
    }

    return {
      ...field,
      options: context[field.optionsKey] || []
    };
  });
}
