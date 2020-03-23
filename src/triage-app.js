import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { setPassiveTouchGestures, setRootPath } from '@polymer/polymer/lib/utils/settings.js';
import { timeOut } from '@polymer/polymer/lib/utils/async.js';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce.js';
import { afterNextRender } from '@polymer/polymer/lib/utils/render-status.js';
import '@polymer/polymer/lib/elements/dom-if.js';

import '@polymer/app-layout/app-drawer/app-drawer.js';
import '@polymer/app-layout/app-drawer-layout/app-drawer-layout.js';
import '@polymer/app-layout/app-header/app-header.js';
import '@polymer/app-layout/app-header-layout/app-header-layout.js';
import '@polymer/app-layout/app-scroll-effects/app-scroll-effects.js';
import '@polymer/app-layout/app-toolbar/app-toolbar.js';
import '@polymer/app-route/app-location.js';
import '@polymer/app-route/app-route.js';
import '@polymer/iron-icon/iron-icon.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/iron-icons/image-icons.js';
import '@polymer/iron-pages/iron-pages.js';
import '@polymer/iron-selector/iron-selector.js';
import '@polymer/iron-flex-layout/iron-flex-layout-classes.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-progress/paper-progress.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import './shared-styles.js';

import { HelperMixin, Mixin } from './helpers/helper-mixin.js';

// Gesture events like tap and track generated from touch will not be
// preventable, allowing for better scrolling performance.
setPassiveTouchGestures(true);

// Set Polymer's root path to the same value we passed to our service worker
// in `index.html`.
setRootPath(TriageAppGlobals.rootPath);

class TriageApp extends Mixin(PolymerElement).with(
  HelperMixin
) {
  static get is() { return 'triage-app'; }
  static get template() {
    return html`
      <style is="custom-style" include="iron-flex iron-flex-alignment"></style>
      <style include="shared-styles">
        :host {
          --app-primary-color: #4285f4;
          --app-secondary-color: black;

          display: block;
          height: 100vh;
        }

        app-header {
          color: #fff;
          background: linear-gradient(0deg, #121212, #424242);
        }
        app-header .title {

        }
        app-header .title iron-icon {
          margin-right: 8px;
        }
        app-header paper-icon-button {
          --paper-icon-button-ink-color: white;
        }
        app-header paper-progress {
          width: 100%;
        }
      </style>

      <app-location route="{{route}}" url-space-regex="^[[rootPath]]">
      </app-location>

      <app-header-layout has-scrolling-region="">
        <app-header slot="header" fixed="" condenses="" reveals="" effects="waterfall">
          <app-toolbar>
            <div class="layout horizontal center w-100">
              <div class="flex">
                <paper-button class="title" on-click="_viewHome">
                  <iron-icon icon="image:healing"></iron-icon>
                  Torn Triage
                </paper-button>
              </div>
              <paper-icon-button hidden="[[appData.requests.disabled]]" icon="icons:cloud" on-click="_toggleRequests"></paper-icon-button>
              <paper-icon-button hidden="[[!appData.requests.disabled]]" icon="icons:cloud-off" on-click="_toggleRequests"></paper-icon-button>
              <paper-icon-button icon="icons:settings" on-click="_viewSettings"></paper-icon-button>
            </div>
          </app-toolbar>
          <paper-progress
            indeterminate="[[loading]]"
            value="[[_progress]]"
            max="[[appData.requests.timing]]"></paper-progress>
        </app-header>

        <iron-pages selected="[[page]]" attr-for-selected="name" role="main">
          <triage-settings
            name="settings"
            alerts="[[alerts]]"
            app-data="{{appData}}">
          </triage-settings>
          <triage-listing
            name="listing"
            alerts="[[alerts]]"
            app-data="{{appData}}"
            loading="{{loading}}"
            last-timeout="{{lastTimeout}}"
          ></triage-listing>
        </iron-pages>
      </app-header-layout>
    `;
  }

  static get properties() {
    return {
      page: {
        type: String,
        reflectToAttribute: true,
        observer: '_pageChanged'
      },
      appData: {
        type: Object,
        notify: true,
        value: function() {
          return {
            apiKey: null,
            requests: {
              disabled: true,
              timingIdx: 0,
              timing: 2000
            },
            factions: [],
            ignoredPlayers: []
          }
        }
      },

      alerts: {
        type: Array,
        notify: true,
        value: function() {
          return [];
        }
      },

      loading: Boolean,
      lastTimeout: Object,

      appInit: {
        type: Boolean,
        value: false
      },

      route: Object,
      routes: {
        type: Object,
        value: function() {
          return {
            context: null,
          }
        }
      },

      _progress: {
        type: Number
      },
      _progressUpdate: {
        type: Object
      },
      _progressUpdatePeriod: {
        type: Number,
        value: 1000
      },

      _views: {
        type: Array,
        value: function() {
          return [
            'settings'
          ];
        }
      }
    };
  }

  static get observers() {
    return [
      '_routePageChanged(route, appInit)',
      '_appDataChanged(appData.*)'
    ];
  }

  ready() {
    super.ready();

    afterNextRender(this, () => {

      window.addEventListener('view-path', ev => this._viewPath(ev));
      window.addEventListener('add-alert', ev => this._addAlert(ev));
      window.addEventListener('remove-alert', ev => this._removeAlert(ev));

      const state = localStorage.getItem('state');
      if (state) {
        const data = JSON.parse(state);
        this.set('appData', data);
      }

      this.set('appInit', true);
      
      this._update();
    });
  }

  _update() {
    this._progressUpdate = Debouncer.debounce(this._progressUpdate, timeOut.after(this._progressUpdatePeriod), () => {
      let progress = 0;

      if (!this.get('appData.requests.disabled')) {
        const lastTimeout = (this.get('lastTimeout')) ? this.get('lastTimeout').getTime() : Date.getTime();
        const timeout = this.get('appData.requests.timing');
        const target = lastTimeout + timeout;

        progress = timeout - (target - new Date().getTime());
      }

      this.set('_progress', progress);

      this._update();
    });
  }

  _toggleRequests() {
    this.set('appData.requests.disabled', !this.get('appData.requests.disabled'));
  }

  _appDataChanged(cr) {
    const paths = cr.path.split('.');
    if (paths.length < 2) return;

    // Commit the state
    localStorage.setItem('state', JSON.stringify(this.get('appData')));
  }

  _addAlert(ev) {
    const detail = ev.detail;
    this.push('alerts', detail);
  }
  _removeAlert(ev) {
    const detail = ev.detail;
    const alertIdx = this.get('alerts').findIndex((a) => a === detail);
    this.splice('alerts', alertIdx, 1);
  }

  _viewHome() {
    if (!this.get('appData.apiKey')) {
      return this.viewPath('/settings');
    }

    this.viewPath('/');
  }
  _viewSettings() {
    if (this.get('page') === 'settings' && this.get('appData.apiKey')) {
      return this.viewPath('/');
    }

    this.viewPath('/settings');
  }

  _viewPath(ev) {
    const path = ev.detail || ev;
    window.history.pushState({}, null, path);
    window.dispatchEvent(new CustomEvent('location-changed'));
  }

  _routePageChanged() {
    const appInit = this.get('appInit');
    const apiKey  = this.get('appData.apiKey');
    const views   = this.get('_views');
    const routes  = this.get('routes');
    const paths   = this.get('route.path').split('/').filter(n => n);

    if (!appInit) return;

    const _updates = {
      routes: {}
    };
    Object.keys(routes).forEach((key, idx) => {
      if (paths[idx]) {
        _updates.routes[key] = paths[idx];
      } else {
        _updates.routes[key] = false;
      }
    });
    this.setProperties(_updates);

    const context = this.get('routes.context');

    if (!apiKey && context !== 'settings') {
      // Redirect
      console.log('Redirect');
      this._viewPath('/settings');
      return;
    }

    if (views.includes(context)) {
      this.set('page', context);
    } else {
      this.set('page', 'listing');
    }
  }
  _pageChanged(page) {
    switch (page) {
      case 'settings':
        import('./triage-settings.js');
        break;
      case 'listing':
        import('./triage-listing.js');
        break;
    }
  }
}

window.customElements.define(TriageApp.is, TriageApp);
