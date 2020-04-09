import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import '@polymer/iron-flex-layout/iron-flex-layout-classes.js';
import '@polymer/iron-icon/iron-icon.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/iron-icons/image-icons.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/paper-slider/paper-slider.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-button/paper-button.js';
import './shared-styles.js';

import { HelperMixin, Mixin } from './helpers/helper-mixin.js';
import { HelperValidationMixin } from './helpers/helper-validation.mixin.js';

class TriageSettings extends Mixin(PolymerElement).with(
  HelperMixin,
  HelperValidationMixin
) {
  static get is() { return 'triage-settings'; }
  static get template() {
    return html`
      <style is="custom-style" include="iron-flex iron-flex-alignment"></style>
      <style include="shared-styles">
        :host {
          display: block;

          padding: 10px;
        }

        paper-button.blue {
          background: #4285f4;
          color: #FFF;
        }

        paper-slider {
          width: 100%;
        }

        .info {
          margin-bottom: 16px;
        }
        .info iron-icon {
          width: 155px;
          height: 155px;
        }
        .info .title {
          color: var(--app-primary-color);
          font-size: 3rem;
          line-height: 3rem;
          text-transform: uppercase;
        }
        .info .subtitle {
          font-size: 1.25rem;
          line-height: 2rem;
          margin-bottom: 0.5rem;
        }
        .info .desc {
          font-size: 0.9rem;
        }

        .section {
          margin: 1rem 0;
        }

      </style>

      <template is="dom-if" if="[[greaterThan(alerts.length, 0)]]">
        <div class="alerts">
          <template is="dom-repeat" items="[[alerts]]">
            <div class$="alert alert-[[item.type]] layout horizontal center">
              <div class="flex">[[item.message]]</div>
              <paper-icon-button icon="icons:cancel" on-click="removeAlert"></paper-icon-button>
            </div>
          </template>
        </div>
      </template>
      
      <div class="layout horizontal center w-100 text-center">
        <div class="info flex">
          <iron-icon icon="image:healing"></iron-icon>
          <div class="title">Torn Triage</div>
          <div class="subtitle">v1.0.1</div>
          <div class="body2">This project was built with ❤️ and is Open Source on <a href="https://github.com/TomCahill/torn-triage">Github</a>.<br/>Currently maintaned by <a href="https://www.torn.com/profiles.php?XID=294020#/" target="_BLANK">Cardinal_Fang [294020]</a></div>
        </div>
      </div>
      <div class="card container">
        <div class="section">
          <p class="overline">Instructions</p>
          <div class="body2">Welcome to Torn Triage, this tool is used to help you identify those who are in need of a revive on a per faction basis.</div>
          <div class="body2">Triage will also colour code the listings so you can quickly know if they need reviving asap, The following colours are used:</div>
          <ul>
            <li class="green">Online - Revive ASAP</li>
            <li class="orange">Idle - Check if they're activity is less than 5 minutes</li>
            <li class="red">Offline - Don't revive</li>
          </ul>
        </div>
        <div class="section">
          <p class="overline">Torn API Key</p>
          <div class="body2">You'll need to enter your torn API key to allow the application to fetch users on your behalf, <a href="https://www.torn.com/preferences.php#tab=api" target="_BLANK">Click here</a> to get your Torn API key.</div>
          <paper-input label="Torn API Key" value="{{item.apiKey}}" error-message="[[_errors.apiKey]]", invalid="[[isSet(_errors.apiKey)]]"></paper-input>
        </div>
        <div class="section">
          <p class="overline">Requests per minute</p>
          <div class="body2">Use the slider to change how fast the app should update, bare in mind if you make to many requests Torn may block your API key for an amount of time.</div>
          <div class="caption">A request every [[_timingLabel]] seconds</div>
          <paper-slider
            value="[[item.timingIdx]]"
            min="0"
            max="4"
            max-markers="4"
            step="1"
            pin
            snaps
            immediate-value="{{item.timingIdx}}"
          ></paper-slider>
        </div>
        <div class="layout horizontal center">
          <div class="flex"></div>
          <paper-button raised class="blue" on-click="_validate">Save</paper-button>
        </div>
      </div>
    `;
  }

  static get properties() {
    return {
      item: {
        type: Object,
        computed: '_computeItem(appData.apiKey, appData.requests.timingIdx)'
      },
      _errors: Object,
      appData: {
        type: Object,
        notify: true
      },

      _timing: {
        type: Array,
        value: function() {
          return [
            2000,
            5000,
            10000,
            30000,
            60000
          ]
        }
      },

      _timingLabel: {
        type: String,
        computed: '_computeTimingLabel(item.timingIdx)'
      }
    }
  }

  _computeItem() {
    return {
      apiKey: this.get('appData.apiKey'),
      timingIdx: this.get('appData.requests.timingIdx')
    };
  }

  _validate() {
    const item = this.get('item');
    const paths = {
      'apiKey': [ 'required', 'string' ],
      'timingIdx': [ 'int' ]
    };

    const data = this.sanitise(paths, item);
    const errors = this.validate(paths, data);

    this.set('_errors', errors);

    if (Object.keys(errors).length) return;

    if (this.setIfDirty('appData.apiKey', data.apiKey)) {
      console.log('API key has been updated');
    }
    
    const timing = this.get(`_timing.${data.timingIdx}`);
    if (this.setIfDirty('appData.requests.timingIdx', data.timingIdx)) {
      console.log('RPS has been updated');
    }
    if (this.setIfDirty('appData.requests.timing', timing)) {
      console.log('RPS has been updated');
    }

    this.viewPath('/');
  }

  _computeTimingLabel() {
    const timingIdx = this.get('item.timingIdx');
    const timing = this.get(`_timing.${timingIdx}`);
    return `${timing / 1000}`;
  }
}

window.customElements.define(TriageSettings.is, TriageSettings);
