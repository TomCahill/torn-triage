class MixinBuilder {
  constructor(superclass) {
    this.superclass = superclass;
  }

  with(...mixins) {
    return mixins.reduce((c, mixin) => mixin(c), this.superclass);
  }
}
const Mixin = (superclass) => new MixinBuilder(superclass);

const HelperMixin = (superclass) => class extends superclass {
  static get properties() {
  }

  setIfDirty(path, value) {
    if (this.get(path) !== value) {
      this.set(path, value);
      return true;
    }

    return false;
  }

  viewPath(path) {
    this.dispatchEvent(new CustomEvent('view-path', {
      detail: path,
      bubbles: true,
      composed: true
    }));
  }

  addAlert(alert) {
    this.dispatchEvent(new CustomEvent('add-alert', {
      detail: alert,
      bubbles: true,
      composed: true
    }));
  }
  removeAlert(ev) {
    const item = ev.model.get('item');
    this.dispatchEvent(new CustomEvent('remove-alert', {
      detail: item,
      bubbles: true,
      composed: true
    }));
  }

  isSet(value) {
    return (typeof value === 'undefined' || value === null) === false;
  }
  equal(left, right) {
    return left === right;
  }
  lessThan(left, right) {
    return left < right;
  }
  greaterThan(left, right) {
    return left > right;
  }
  inArray(left, right) {
    return right.includes(left);
  }

  pathToCamel(str) {
    return str.replace(/^.|\../g, function(letter, index) {
      return index == 0 ? letter.toLowerCase() : letter.substr(1).toUpperCase();
    });
  }
}

export {
  Mixin,
  HelperMixin
}
export default HelperMixin;