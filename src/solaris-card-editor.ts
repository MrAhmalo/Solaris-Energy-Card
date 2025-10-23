import { HomeAssistant } from "custom-card-helpers";
import { css, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";

interface CardConfig {
  type: string;
  title?: string;
  entities: {
    pv_power: string;
    battery_discharge_power: string;
    battery_charge_power: string;
    grid_import_power: string;
    grid_export_power: string;
    house_consumption: string;
    battery_soc: string;
    daily_yield: string;
    daily_house_load: string;
    daily_earnings: string;
  };
}

@customElement("solaris-card-editor")
export class SolarisCardEditor extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @state() private _config!: CardConfig;

  public setConfig(config: CardConfig): void {
    // Initialize entities object if it doesn't exist
    if (!config.entities) {
      config.entities = {
        pv_power: "",
        battery_discharge_power: "",
        battery_charge_power: "",
        grid_import_power: "",
        grid_export_power: "",
        house_consumption: "",
        battery_soc: "",
        daily_yield: "",
        daily_house_load: "",
        daily_earnings: ""
      };
    }
    this._config = config;
  }

  private _valueChanged(ev: Event): void {
    const target = ev.target as HTMLInputElement;
    const entityKey = target.dataset.configValue;
    
    if (!this._config || !this.hass || !entityKey) {
      return;
    }

    const newConfig = {
      ...this._config,
      entities: {
        ...this._config.entities,
        [entityKey]: target.value
      }
    };

    const event = new CustomEvent("config-changed", {
      detail: { config: newConfig },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  private _renderEntityInput(
    key: string,
    label: string,
    helper: string
  ): TemplateResult {
    const value = this._config.entities?.[key as keyof typeof this._config.entities] || "";
    
    return html`
      <div class="entity-input-wrapper">
        <label class="entity-label">${label}</label>
        <input
          type="text"
          class="entity-input"
          .value=${value}
          data-config-value=${key}
          @input=${this._valueChanged}
          placeholder="sensor.example"
        />
        <div class="entity-helper">${helper}</div>
      </div>
    `;
  }

  protected render(): TemplateResult {
    if (!this.hass || !this._config) {
      return html``;
    }

    return html`
      <div class="card-config">
        <h3>Solaris Card Configuration</h3>
        <p class="description">
          Select the entities for your solar energy dashboard.
        </p>

        <div class="entity-section">
          <h4>Solar & Production</h4>
          ${this._renderEntityInput(
            "pv_power",
            "PV Power (W)",
            "Current power generation from solar panels"
          )}
          ${this._renderEntityInput(
            "daily_yield",
            "Daily Yield (kWh)",
            "Total energy generated today"
          )}
        </div>

        <div class="entity-section">
          <h4>Battery</h4>
          ${this._renderEntityInput(
            "battery_discharge_power",
            "Battery Discharge Power (W)",
            "Power being discharged from battery"
          )}
          ${this._renderEntityInput(
            "battery_charge_power",
            "Battery Charge Power (W)",
            "Power being charged to battery"
          )}
          ${this._renderEntityInput(
            "battery_soc",
            "Battery State of Charge (%)",
            "Current battery charge percentage"
          )}
        </div>

        <div class="entity-section">
          <h4>Grid</h4>
          ${this._renderEntityInput(
            "grid_import_power",
            "Grid Import Power (W)",
            "Power being imported from grid"
          )}
          ${this._renderEntityInput(
            "grid_export_power",
            "Grid Export Power (W)",
            "Power being exported to grid"
          )}
        </div>

        <div class="entity-section">
          <h4>House Consumption</h4>
          ${this._renderEntityInput(
            "house_consumption",
            "House Consumption (W)",
            "Current power consumption of the house"
          )}
          ${this._renderEntityInput(
            "daily_house_load",
            "Daily House Load (kWh)",
            "Total energy consumed today"
          )}
        </div>

        <div class="entity-section">
          <h4>Financial</h4>
          ${this._renderEntityInput(
            "daily_earnings",
            "Daily Earnings (€)",
            "Revenue generated today"
          )}
        </div>
      </div>
    `;
  }

  static styles = css`
    .card-config {
      padding: 16px;
    }

    h3 {
      margin-top: 0;
      color: var(--primary-text-color);
      font-size: 1.5em;
    }

    .description {
      color: var(--secondary-text-color);
      margin-bottom: 24px;
      line-height: 1.5;
    }

    .entity-section {
      margin-bottom: 24px;
      border: 1px solid var(--divider-color);
      border-radius: 8px;
      padding: 16px;
      background: var(--card-background-color);
    }

    .entity-section h4 {
      margin-top: 0;
      margin-bottom: 16px;
      color: var(--primary-text-color);
      font-size: 1.2em;
      border-bottom: 2px solid var(--success-color);
      padding-bottom: 8px;
    }

    .entity-input-wrapper {
      margin-bottom: 16px;
    }

    .entity-input-wrapper:last-child {
      margin-bottom: 0;
    }

    .entity-label {
      display: block;
      margin-bottom: 4px;
      font-weight: 500;
      color: var(--primary-text-color);
      font-size: 14px;
    }

    .entity-input {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid var(--divider-color);
      border-radius: 4px;
      background-color: var(--card-background-color);
      color: var(--primary-text-color);
      font-size: 14px;
      box-sizing: border-box;
      font-family: inherit;
    }

    .entity-input:focus {
      outline: none;
      border-color: var(--primary-color);
    }

    .entity-helper {
      margin-top: 4px;
      font-size: 12px;
      color: var(--secondary-text-color);
      line-height: 1.4;
    }
  `;
}
