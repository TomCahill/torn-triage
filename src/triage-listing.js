import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import '@polymer/polymer/lib/elements/dom-repeat.js';
import '@polymer/iron-flex-layout/iron-flex-layout-classes.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/paper-item/paper-item.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-dialog/paper-dialog.js';
import './shared-styles.js';

import './ltn-ajax/ltn-ajax.js';

import { HelperMixin, Mixin } from './helpers/helper-mixin.js';

class TriageListing extends Mixin(PolymerElement).with(
  HelperMixin
) {
  static get is() { return 'triage-listing'; }
  static get template() {
    return html`
      <style is="custom-style" include="iron-flex iron-flex-alignment"></style>
      <style include="shared-styles">
        :host {
          display: block;

          padding: 10px;
        }

        paper-dialog .title {
          margin-bottom: 0;
        }

        .text-center {
          text-align: center;
        }
        .text-right {
          text-align: right;
        }

        .card[status="success"] {
          background: rgba(29, 156, 87, 0.6);
          color: #FFF;
        }
        .card[status="warning"] {
          background: #e6bf78;
        }
        .card[status="danger"] {
          // background: rgba(0,0,0,0.1);
          opacity: 0.5;
        }

        paper-button.new {
          background: rgba(0, 0, 0, 0.1);
          border: 1px dashed rgba(0, 0, 0, 0.2);
        }

        .filters {
          margin-bottom: 16px;
        }

        .big-plus {
          width: 100px;
          height: 100px;
          background: rgba(255,255,255,0.3);
          color: var(--app-primary-color);
          border-radius: 50%;
          margin: 1rem 0;
        }

        .listing {
          margin-bottom: 8px;
        }

        .chip, .chip.input {
          background: rgba(0,0,0,0.1);
          border-radius: 100px;
          overflow: hidden;
          font-size: 0.9rem;
          padding: 6px 8px 6px 12px;
          margin-bottom: 8px;
        }
        .chip paper-icon-button {
          width: 18px;
          height: 18px;
          margin-left: 8px;
          padding: 0;
        }
      </style>

      <ltn-ajax id="ajax"></ltn-ajax>

      <paper-dialog 
        opened="[[_factionDialog.opened]]"
        on-iron-overlay-closed="_closeFactionDialog">
        <h6 class="title">Add Faction</h6>
        <p>Find the TORN faction ID and enter it into here.</p>
        <paper-input
          label="Faction ID"
          value="{{_factionDialog.item.factionId}}"
          invalid="[[isSet(_factionDialog.error.factionId)]]"
          error-message="[[_factionDialog.error.factionId]]">
        </paper-input>
        <div class="buttons">
          <paper-button dialog-dismiss>Cancel</paper-button>
          <paper-button autofocus on-click="_saveFaction">Save</paper-button>
        </div>
      </paper-dialog>

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

      <div class="filters">
        <div class="layout horizontal center wrap">
          <template is="dom-repeat" items="[[appData.factions]]">
            <paper-button class="chip" on-click="_selectFaction" raised="[[equal(_selectedFaction, item.ID)]]">
              <div class="flex layout horizontal center">
                <div>[[_nameOrId(item, item.*)]]</div>
                <paper-icon-button icon="icons:cancel" on-click="_removeFaction"></paper-icon-button>
              </div>
            </paper-button>
          </template>
          <paper-icon-button icon="icons:add" on-click="_addFaction", raised></paper-icon-button>
        </div>
      </div>

      <template is="dom-if" if="[[lessThan(appData.factions.length, 1)]]">
        <div class="layout vertical center">
          <div class="overline">No Factions to watch</div>
          <div>To begin tracking you'll need to add a faction, click the plus button below to get started</div>
          <paper-icon-button class="big-plus" icon="icons:add" on-click="_addFaction", raised></paper-icon-button>
        </div>
      </template>
      <template is="dom-if" if="[[greaterThan(appData.factions.length, 0)]]">
      
        <template is="dom-if" if="[[lessThan(_listing.length, 1)]]">
          <div class="layout vertical center">
            <div class="overline">Triage is empty</div>
            <div>All patients are well and healthy</div>
          </div>
        </template>

        <template is="dom-if" if="[[greaterThan(_listing.length, 0)]]">
          <template is="dom-repeat" items="[[_listing]]">
          <div class="card listing" status$="[[item._status]]">
            <div class="layout horizontal">
              <div class="layout vertical flex" on-click="_viewProfile">
                <div class="secondary">[[item.name]] - [[item.last_action.status]] - [[item.last_action.relative]]</div>
                <div class="title">[[item.status.details]]</div>
                <div class="secondary">[[item.status.description]]</div>
              </div>
              <div class="layout vertical center-center">
                <paper-button on-click="_ignoreProfile" hidden="[[inArray(item.ID, appData.ignoredPlayers, appData.ignoredPlayers.*)]]">Ignore</paper-button>
                <paper-button on-click="_ignoreProfile" hidden="[[!inArray(item.ID, appData.ignoredPlayers, appData.ignoredPlayers.*)]]">Watch</paper-button>
              </div>
            </div>
          </div>
        </template>
      </template>
    `;
  }

  static get Constants() {
    return {
      STATUS_WEIGHTS: [
        'Online',
        'Idle',
        'Offline',
        'Disabled'
      ]
    }
  }

  static get properties() {
    return {
      appData: {
        type: Object,
        notify: true
      },
      loading: {
        type: Boolean,
        notify: true,
        value: false
      },
      lastTimeout: {
        type: Object,
        notify: true
      },
      lastRequestAt: Object,

      _selectedFaction: {
        type: Number,
        value: null
      },

      _listing: {
        type: Array,
        value: function() {
          return [];
        }
      },

      _factionDialog: {
        type: Object,
        value: function() {
          return {
            opened: false,
            item: { },
            error: { }
          }
        }
      },

      _nextTimeout: Object,
    };
  }

  ready() {
    super.ready();

    this.set('_selectedFaction', this.get('appData.factions.0.ID'));

    this._loop();
  }

  _selectFaction(ev) {
    const item = ev.model.get('item');
    this.set('_selectedFaction', item.ID);
    this.viewPath(`/${item.ID}`);
    this._restartLoop();
  }

  _loop() {
    const isDisabled = this.get('appData.requests.disabled');

    const action = () => (!isDisabled) ? this._makeRequest() : Promise.resolve();

    return action()
      .catch((err) => {
        let redirect = null;

        if (err.code && err.code === 2) {
          this.addAlert({
            type: 'danger',
            message: `Incorrect TORN API Key, Please double check you've entered the correct key`
          });
          redirect = 'settings';
        } else if (err.code && err.code === 100) {
          this.addAlert({
            type: 'danger',
            message: `You need to enter a API key before being able to make requests`
          });
          redirect = 'settings';
        } else if (err.code && err.code === 101) {
          this.addAlert({
            type: 'danger',
            message: `Please add a faction ID before making any requests`
          });
          redirect = 'listing';
        } else if (err.code && err.code === 103) {
          this.addAlert({
            type: 'danger',
            message: err.message
          });
          redirect = 'listing';
        } else if (err.message) {
          this.addAlert({
            type: 'danger',
            message: err.message
          });
        }

        if (redirect) {
          this.viewPath(`/${redirect}`);
        }

        this.set('appData.requests.disabled', true);
      })
      .then(() => {
        clearTimeout(this.get('_nextTimeout'));
        this.set('lastTimeout', new Date());
        this.set('_nextTimeout', setTimeout(() => this._loop(), this.get('appData.requests.timing')));
        this.set('loading', false);
      });
  }

  _restartLoop() {
    clearTimeout(this.get('_nextTimeout'));
    this.set('appData.requests.disabled', false);
    this._loop();
  }

  _makeRequest() {
    const ajax = this.$.ajax;
    const apiKey = this.get('appData.apiKey');
    const selectedFaction = this.get('_selectedFaction');

    if (!apiKey) {
      return Promise.reject({
        code: 100,
        message: `Missing API Key`
      });
    }
    if (!selectedFaction) {
      return Promise.reject({
        code: 101,
        message: `No selected Faction`
      });
    }

    this.set('loading', true);

    return ajax.send({
      url: `https://api.torn.com/faction/${selectedFaction}?selections=basic&key=${apiKey}`,
      method: 'GET',
      contentType: 'text/plain',
      params: {
        urq: Date.now()
      }
    })
      .then((res) => {
        const response = res.response;
        const factionIdx = this.get('appData.factions').findIndex((f) => f.ID === selectedFaction);

        if (response.ID === null) {
          this.set('_selectedFaction', null);
          return Promise.reject({
            code: `103`,
            message: `A Faction with the ID '${selectedFaction}' doesn't exist in TORN`
          });
        }

        if (response.error) {
          return Promise.reject({
            code: response.error.code,
            message: response.error.error
          });
        }

        // update faction name if it doesn't exist
        this.setIfDirty(`appData.factions.${factionIdx}.name`, response.name);

        const ignoredPlayers = this.get('appData.ignoredPlayers');

        let members = Object.entries(response.members)
          .filter(([userID, info]) => {
            if (info.status.state !== 'Hospital') return false;
            return true;
          })
          .map(([userID, info]) => {
            info.ID = userID;
            info.factionID = selectedFaction;

            if (ignoredPlayers.includes(info.ID)) {
              info.last_action.status = 'Disabled';
            }

            info.status.details = info.status.details.replace(/<[^>]*>/g, "");

            return info;
          })
          .sort((a, b) => {
            return TriageListing.Constants.STATUS_WEIGHTS.indexOf(a.last_action.status) - TriageListing.Constants.STATUS_WEIGHTS.indexOf(b.last_action.status)
          });

        // Deal with the data we need to push
        members.forEach((member) => {
          const listingIdx = this.get('_listing').findIndex((l) => l.ID === member.ID);

          member._status = 'danger';
          if (member.last_action.status === 'Online') member._status = 'success';
          if (member.last_action.status === 'Idle') member._status = 'warning';

          if (listingIdx !== -1) {
            this.set(`_listing.${listingIdx}`, member);
          } else {
            this.push('_listing', member);
          }
        });

        // Remove any members which arn't in the list anymore
        this.get('_listing')
          .filter((l) => l.factionID !== selectedFaction || members.findIndex((m) => m.ID === l.ID) === -1)
          .forEach((member) => {
            const idx = this.get('_listing').findIndex((l) => l.ID === member.ID);
            if (idx === -1) return;
            this.splice('_listing', idx, 1);
          });
      });
  }

  _nameOrId(faction) {
    if (faction.name) return faction.name;
    return faction.ID;
  }

  _viewProfile(ev) {
    const item = ev.model.get('item');
    if (!item) return;

    window.open(`https://www.torn.com/profiles.php?XID=${item.ID}#/`, '_blank');
  }
  _ignoreProfile(ev) {
    const item = ev.model.get('item');
    if (!item) return;
    
    const idx = this.get('appData.ignoredPlayers').findIndex((p) => p === item.ID);
    if (idx === -1) {
      this.push('appData.ignoredPlayers', item.ID);
      this.addAlert({
        type: 'success',
        message: `Added ${item.name} to the ignore list`
      });
    } else {
      this.splice('appData.ignoredPlayers', idx, 1);
      this.addAlert({
        type: 'success',
        message: `Removed ${item.name} from the ignore list`
      });
    }
  }

  _addFaction() {
    this.set('_factionDialog.item', {
      factionId: ''
    });
    this.set('_factionDialog.error', {
      factionId: null
    });
    this.set('_factionDialog.opened', true);
  }
  _saveFaction() {
    this.set('_factionDialog.error', {
      factionId: null
    })

    const factionValue = this.get('_factionDialog.item.factionId').trim();

    if (!factionValue || factionValue === '') {
      this.set('_factionDialog.error.factionId', 'Please provide a TORN faction ID');
      return;
    }
    if (!factionValue.match(/^[0-9]*$/)) {
      this.set('_factionDialog.error.factionId', 'Faction ID is invalid (0-9)');
      return;
    }

    this.push('appData.factions', {
      ID: factionValue
    });

    this.set('_selectedFaction', factionValue);

    this._closeFactionDialog();
    this._restartLoop();
  }
  _closeFactionDialog() {
    this.set('_factionDialog.opened', false);
  }

  _removeFaction(ev) {
    ev.stopPropagation();
    ev.preventDefault();
    const item = ev.model.get('item');
    const idx = this.get('appData.factions').findIndex((f) => f.ID === item.ID);
    const selectedFaction = this.get('_selectedFaction');
    if (idx === -1) return;

    if (selectedFaction === item.ID) {
      let newSelection = this.get('appData.factions.length') - 1;
      if (newSelection < 0) newSelction = null;
      this.set('_selectedFaction', newSelection);
    }

    this.splice('appData.factions', idx, 1);
  }
}

window.customElements.define(TriageListing.is, TriageListing);
