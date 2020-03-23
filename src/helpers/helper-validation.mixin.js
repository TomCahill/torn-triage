const HelperValidationMixin = (superclass) => class extends superclass {
  static get properties() {
    // fieldAlerts: Object
  }

  sanitise(paths, data) {
    Object.keys(paths).forEach((path) => {
      const rules = paths[path];
      if (!rules) return;

      rules.forEach((rule) => this.set(path, this._applyRule(rule, this.get(path, data)), data));
    });

    return data;
  }

  validate(paths, input) {
    const errors = {};

    Object.keys(paths).forEach((path) => {
      const camelPath = this.pathToCamel(path);
      const rules = paths[path];
      if (!rules) return;
      let value = this.get(path, input);

      const results = rules.map((rule) => this._vaildateRule(rule, value)).filter(x => x);

      if (results.length > 0) {
        // Return the first error
        errors[camelPath] = results[0];
      }
    });

    return errors;
  }

  _applyRule(rule, value) {
    if (rule === 'string') {
      if (value === undefined || value === null) value = '';
      if (typeof value !== 'string' && value.toString) value = value.toString();
      if (typeof value !== 'string') value = '';
      value = value.trim();
    }

    return value;
  }

  _vaildateRule(rule, value) {
    if (rule === 'required') {
      if (value) value = String(value).trim();
      if (!value) return 'This field is required';
    } else {
      // console.warn(`Unknown validation rule ${rule}`);
    }

    return false;
  }

}

export { HelperValidationMixin };