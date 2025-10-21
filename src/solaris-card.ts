import { HomeAssistant } from "custom-card-helpers";
import { css, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";

// Card configs
interface CardConfig {
  type: string;
  title?: string;
  entities: {
    pv_power: string; // PV Power entity
    battery_discharge_power: string; // Discharging power entity
    battery_charge_power: string; // Charging power entity
    grid_import_power: string; // Importing power entity
    grid_export_power: string; // Exporting power entity
    house_consumption: string; // House consumption entity
    battery_soc: string; // Battery SOC entity
    daily_yield: string; // Daily yield entity
    daily_house_load: string; // Daily house load entity
    daily_earnings: string; // Daily earnings entity
  };
}

// Card class definition
@customElement("solaris-card")
export class SolarisCard extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @state() private _config!: CardConfig;

  // Configuration setter
  public setConfig(config: CardConfig): void {
    if (!config) {
      throw new Error("Invalid configuration");
    }
    this._config = config;
  }

  // Render function
  protected render(): TemplateResult {
    if (!this.hass || !this._config.entities) {
      return html`<ha-card>Keine Entitäten konfiguriert.</ha-card>`;
    }

    // Fetch entity states
    const pvPower =
      parseFloat(this.hass.states[this._config.entities.pv_power].state.replace(",", ".")) || 0;
    const batteryDischargePower =
      parseFloat(
        this.hass.states[this._config.entities.battery_discharge_power].state.replace(",", ".")
      ) || 0;
    const batteryChargePower =
      parseFloat(
        this.hass.states[this._config.entities.battery_charge_power].state.replace(",", ".")
      ) || 0;
    const gridImportPower =
      parseFloat(
        this.hass.states[this._config.entities.grid_import_power].state.replace(",", ".")
      ) || 0;
    const gridExportPower =
      parseFloat(
        this.hass.states[this._config.entities.grid_export_power].state.replace(",", ".")
      ) || 0;
    const houseConsumption =
      parseFloat(
        this.hass.states[this._config.entities.house_consumption].state.replace(",", ".")
      ) || 0;
    const batterySoc =
      parseFloat(this.hass.states[this._config.entities.battery_soc].state.replace(",", ".")) ||
      0;
    const dailyYield =
      parseFloat(this.hass.states[this._config.entities.daily_yield].state.replace(",", ".")) ||
      0;
    const dailyHouseLoad =
      parseFloat(
        this.hass.states[this._config.entities.daily_house_load].state.replace(",", ".")
      ) || 0;
    const dailyEarnings =
      parseFloat(
        this.hass.states[this._config.entities.daily_earnings].state.replace(",", ".")
      ) || 0;

    // Calculate net values for display
    const batteryPower = batteryDischargePower - batteryChargePower;
    const gridPower = gridImportPower - gridExportPower;

    const houseImage = (this.hass.themes as any).darkMode
      ? "http://192.168.178.99:8080/dist/house_night.png"
      : "http://192.168.178.99:8080/dist/house_day.png";

    return html`
      <ha-card>
        <div class="card-content">
          <div class="pv-circle">
            <span class="value" style="font-size: 2em;"
              >${(pvPower / 1000).toFixed(2).replace(".", ",")}<span class="unit"> kW</span></span
            >
            <span
              class="label"
              style="color: var(--success-color); font-weight: bold;"
              >PV<ha-icon icon="mdi:chevron-right"></ha-icon
            ></span>
          </div>

          <div class="house-area">
            <img
              src="${houseImage}"
              alt="House-Visualisation"
            />
          </div>

          <div class="bottom-row">
            <div class="item">
              <span class="value"
                >${(Math.abs(batteryPower) / 1000).toFixed(2).replace(".", ",")}<span
                  class="unit"
                >
                  kW</span
                ></span
              >
              <span
                class="label"
                style="font-weight: bold; color: var(--success-color);"
              >
                Batterie<ha-icon icon="mdi:chevron-right"></ha-icon>
              </span>
            </div>
            <div class="item">
              <span class="value"
                >${(Math.abs(gridPower) / 1000).toFixed(2).replace(".", ",")}<span class="unit">
                  kW</span
                ></span
              >
              <span class="label">Netz</span>
            </div>
            <div class="item">
              <span class="value"
                >${(houseConsumption / 1000).toFixed(2).replace(".", ",")}<span class="unit">
                  kW</span
                ></span
              >
              <span class="label">Verbrauch</span>
            </div>
          </div>

          <div class="stats-container">
            <div class="stats-header">
              <span class="stats-title">Statistik</span>
              <ha-icon icon="mdi:chevron-right"></ha-icon>
            </div>
            <div class="stats-body">
              <div class="stats-item">
                <div
                  class="stats-icon-container"
                  style="background-color: rgba(76, 175, 80, 0.1);"
                >
                  <ha-icon icon="mdi:flash" style="color: #4CAF50;"></ha-icon>
                </div>
                <div class="stats-text">
                  <span class="stats-value"
                    >${dailyYield.toFixed(2).replace(".", ",")}
                    <span class="stats-unit">kWh</span></span
                  >
                  <span class="stats-label">Heutiger Energieertrag</span>
                </div>
              </div>
              <div class="stats-item">
                <div
                  class="stats-icon-container"
                  style="background-color: rgba(254, 87, 0, 0.1);"
                >
                  <ha-icon icon="mdi:home-lightning-bolt-outline" style="color: #FE5700;"></ha-icon>
                </div>
                <div class="stats-text">
                  <span class="stats-value"
                    >${dailyHouseLoad.toFixed(2).replace(".", ",")}
                    <span class="stats-unit">kWh</span></span
                  >
                  <span class="stats-label">Heutiger Stromverbrauch</span>
                </div>
              </div>
              <div class="stats-item">
                <div
                  class="stats-icon-container"
                  style="background-color: rgba(255, 193, 7, 0.1);"
                >
                  <ha-icon
                    icon="mdi:currency-eur"
                    style="color: #FFC107;"
                  ></ha-icon>
                </div>
                <div class="stats-text">
                  <span class="stats-value"
                    >€${dailyEarnings.toFixed(2).replace(".", ",")}</span
                  >
                  <span class="stats-label">Heutiger Umsatz</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ha-card>
    `;
  }

  // Define card size for Home Assistant layout
  public getCardSize(): number {
    return 5;
  }

  // Define card appearance
  static styles = css`
    :host {
      --stat-icon-size: 38px;
    }
    ha-card {
      background: none;
      box-shadow: none;
      border-width: 0;
    }
    .card-content {
      padding: 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 24px;
    }

    .pv-circle {
      box-shadow: 0 0 0 8px rgba(var(--rgb-success-color, 76, 175, 80), 0.3),
        inset 0 0 0 3px var(--success-color);
      border-radius: 50%;
      background-color: var(--card-background-color);
      width: 140px;
      height: 140px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: relative;
      z-index: 1;
      margin-top: 20px;
    }

    .pv-circle .label {
      margin-left: 8px;
    }

    .house-area {
      margin-top: -70px;
      margin-bottom: -10px;
      z-index: 0;
    }
    .house-area img {
      width: 100%;
      height: auto;
      display: block;
      margin: 0 auto;
      position: relative;
      left: 50%;
      transform: translateX(-50%);
    }
    .value {
      font-size: 1.7em;
      font-weight: 500;
    }
    .value > .unit {
      font-size: 0.65em !important;
      font-weight: normal;
      color: var(--secondary-text-color);
    }
    .label {
      font-size: 1.3em;
      color: var(--secondary-text-color);
    }

    .bottom-row {
      display: flex;
      width: 100%;
      justify-content: space-between;
      gap: clamp(16px, 5vw, 40px);
    }
    .item {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      border: 2px solid var(--divider-color);
      border-radius: 14px;
      padding: 5px 0px 5px 12px;
      flex: 1;
      box-sizing: border-box;
    }
    .bottom-row .item:first-child {
      border-color: var(--success-color);
    }

    .item .label {
      font-size: 1em;
      margin-top: -6px;
    }
    .item .value .unit {
      font-size: 0.5em;
    }

    .title {
      font-size: 1.2em;
      font-weight: bold;
      color: var(--primary-text-color);
      text-align: left;
    }

    .stats-container {
      width: 100%;
      background-color: var(--ha-card-background, var(--card-background-color));
      border-radius: 18px;
      padding: 12px 16px;
      box-sizing: border-box;
      //border: 1px solid var(--divider-color);
    }
    .stats-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .stats-title {
      font-size: 1.2em;
      font-weight: bold;
    }
    .stats-header ha-icon {
      color: var(--secondary-text-color);
    }
    .stats-body {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .stats-item {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .stats-icon-container {
      width: var(--stat-icon-size);
      height: var(--stat-icon-size);
      border-radius: 10px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .stats-icon-container ha-icon {
      --mdc-icon-size: calc(var(--stat-icon-size) * 0.6);
    }
    .stats-text {
      display: flex;
      flex-direction: column;
    }
    .stats-value {
      font-size: 1.4em;
      font-weight: 500;
    }
    .stats-unit {
      font-size: 0.7em;
      font-weight: normal;
      color: var(--secondary-text-color);
    }
    .stats-label {
      font-size: 1em;
      color: var(--secondary-text-color);
      margin-top: -8px;
    }
  `;
}