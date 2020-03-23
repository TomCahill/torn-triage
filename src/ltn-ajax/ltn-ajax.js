import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import '@polymer/iron-ajax/iron-ajax.js';

class LTNAjax extends PolymerElement {
  static get is() { return 'ltn-ajax'; }

  static get template() {
    return html`
      <style>
        :host{
          display: none;
        }
      </style>

      <iron-ajax
        id="ironAjax",
        url="[[url]]",
        params="[[params]]",
        headers="[[headers]]",
        method="[[method]]",
        content-type="[[contentType]]",
        body="[[body]]",
        handleAs="[[handleAs]]",
        loading="{{loading}}",
        last-response="{{lastResponse}}",
        last-error="{{lastError}}",
        on-response="__ironAjaxResponce",
        on-error="__ironAjaxError">
      </iron-ajax>
    `;
  }

  static get properties() {
    return {
      url: {
        type: String
      },
      params: {
        type: Object,
        value: function() {
          return {};
        }
      },
      method: {
        type: String,
        value: 'GET'
      },
      headers: {
        type: Object,
        value: function() {
          return {};
        }
      },
      contentType: {
        type: String,
        value: null
      },
      body: {
        type: Object,
        value: null
      },
      handleAs: {
        type: String,
        value: 'json'
      },
      loading: {
        type: Boolean,
        notify: true,
        readOnly: true
      },
      lastResponse: {
        type: Object,
        notify: true,
        readOnly: true
      },
      lastError: {
        type: Object,
        notify: true,
        readOnly: true
      },

      __lastPromise: {
        type: Object,
        value: () => {
          return Promise.resolve();
        }
      },
      __promiseQueue: {
        type: Array,
        value: function() {
          return [];
        }
      },

      __ironAjaxResponceCallback: {
        type: Object
      },
      __ironAjaxErrorCallback: {
        type: Object
      }
    };
  }

  send(requestObject) {
    return this.__queueRequest(requestObject);
  }

  __queueRequest(requestObject) {
    const promiseQueue = this.get('__promiseQueue');
    const request = () => this.__processRequest(requestObject);

    let lastQueuePromise = Promise.resolve();

    if (promiseQueue.length > 0) {
      lastQueuePromise = promiseQueue[promiseQueue.length - 1];
    }

    const promise = new Promise((resolve, reject) => {
      return lastQueuePromise.finally(() => {
        return request().then(resolve).catch(reject);
      });
    });

    promiseQueue.push(promise);

    return promise;
  }

  __processRequest(requestObject) {
    const promiseQueue = this.get('__promiseQueue');
    const ironAjax = this.$.ironAjax;

    return new Promise((resolve, reject) => {
      this.__resetPropertyDefaults();

      if (requestObject.url) this.set('url', requestObject.url);
      if (requestObject.params) this.set('params', requestObject.params);
      if (requestObject.method) this.set('method', requestObject.method);
      if (requestObject.headers) this.set('headers', requestObject.headers);
      if (requestObject.contentType) this.set('contentType', requestObject.contentType);
      if (requestObject.body) this.set('body', requestObject.body);
      if (requestObject.handleAs) this.set('handleAs', requestObject.handleAs);

      this.set('__ironAjaxResponceCallback', resolve);
      this.set('__ironAjaxErrorCallback', reject);

      ironAjax.generateRequest();
    });
  }

  __resetPropertyDefaults() {
    this.set('url', null);
    this.set('params', {});
    this.set('method', 'GET');
    this.set('headers', {});
    this.set('contentType', null);
    this.set('body', null);
    this.set('handleAs', 'json');

    this.set('__ironAjaxResponceCallback', null);
    this.set('__ironAjaxErrorCallback', null);
  }

  __ironAjaxResponce(ev) {
    const callback = this.get('__ironAjaxResponceCallback');
    if (callback) callback(ev.detail);
  }

  __ironAjaxError(ev) {
    const callback = this.get('__ironAjaxErrorCallback');
    ev.detail.response = ev.detail.request.response;
    if (callback) callback(ev.detail);
  }
}
window.customElements.define(LTNAjax.is, LTNAjax);