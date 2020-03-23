import '@polymer/polymer/polymer-element.js';

const $_documentContainer = document.createElement('template');
$_documentContainer.innerHTML = `<dom-module id="shared-styles">
  <template>
    <style>

      :host {
        --app-primary-color: #1d9c57;
      }

      .green {
        color: var(--app-primary-color);
      }
      .orange {
        color: #e6bf78;
      }
      .red {
        opacity: 0.5;
      }

      h1 {
        font-size: 96px;
        font-weight: lighter;
        letter-spacing: -1.5px;

        margin: 16px 0;
      }
      h2 {
        font-size: 60px;
        font-weight: lighter;
        letter-spacing: -0.5px;
      }
      h3 {
        font-size: 48px;
        font-weight: normal;
        letter-spacing: 0px;
      }
      h4 {
        font-size: 34px;
        font-weight: normal;
        letter-spacing: 0.25px;
      }
      h5 {
        font-size: 24px;
        font-weight: normal;
        letter-spacing: 0px;
      }
      h6 {
        font-size: 20px;
        font-weight: 500;
        letter-spacing: 0.15px;
      }

      .subtitle {
        font-size: 16px;
        font-weight: normal;
        letter-spacing: 0.15px;
      }

      .overline {
        font-size: 10px;
        font-weight: normal;
        letter-spacing: 1.5px;
        text-transform: uppercase;
      }
    
      body {
        background: #bfbfbf;
        font-size: 16px;
        font-weight: normal;
        letter-spacing: 0.5px;
      }

      p {
        margin-top: 0;
        margin-bottom: 0.5rem;
      }
      .body2 {
        font-size: 14px;
        font-weight: normal;
        letter-spacing: 0.25px;
      }

      paper-button {
        font-size: 14px;
        font-weight: 500;
        letter-spacing: 1.25px;
        text-transform: uppercase;
      }

      .container {
        max-width: 600px;
        margin: 0 auto;
      }

      .card {
        padding: 16px;
        color: #757575;
        border-radius: 5px;
        background-color: #fff;
        box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12), 0 3px 1px -2px rgba(0, 0, 0, 0.2);
      }
      .card .title {
        font-size: 1.25rem;
        line-height: 2rem;
        font-weight: 500;
        letter-spacing: .0125em;
      }
      .card .secondary {
        font-size: .875rem;
        line-height: 1.25rem;
        font-weight: 400;
        letter-spacing: .0178571429em;
        opacity: .6;
      }
      .card p {
        font-size: .875rem;
        line-height: 1.25rem;
        font-weight: 400;
        letter-spacing: .0178571429em;
        opacity: .6;
      }

      .circle {
        display: inline-block;
        width: 64px;
        height: 64px;
        text-align: center;
        color: #555;
        border-radius: 50%;
        background: #ddd;
        font-size: 30px;
        line-height: 64px;
      }

      .w-100 {
        width: 100%;
      }

      .text-center {
        text-align: center;
      }

      .alerts {

      }
      .alerts .alert {
        padding: 8px 16px;
        border-radius: 5px;
        margin-bottom: 8px;
        color: #FFF;
      }
      .alerts .alert-danger {
        background: #9c1616;
      }
      .alerts .alert-warning {
        background: #d09c0c;
      }
      .alerts .alert-success {
        background: var(--app-primary-color);
      }
    </style>
  </template>
</dom-module>`;

document.head.appendChild($_documentContainer.content);
