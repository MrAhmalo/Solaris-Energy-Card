import { HomeAssistant } from "custom-card-helpers";
import { css, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import batteryImage from "./assets/battery.png";
import houseDay from "./assets/house_day.png";
import houseNight from "./assets/house_night.png";
import inverterImage from "./assets/inverter.png";
import "./solaris-card-editor";

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

  // Render function
  protected render(): TemplateResult {
    // Return empty card if no config or entities are not configured
    if (!this._config || !this._config.entities || !this.hass) {
      return html`
        <ha-card>
          <div class="card-content" style="padding: 16px; text-align: center;">
            <p>Please configure the card entities.</p>
          </div>
        </ha-card>
      `;
    }

    // Check if at least one entity is configured
    const hasEntities = Object.values(this._config.entities).some(entity => entity && entity.trim() !== "");
    if (!hasEntities) {
      return html`
        <ha-card>
          <div class="card-content" style="padding: 16px; text-align: center;">
            <p>Please configure the card entities.</p>
          </div>
        </ha-card>
      `;
    }

    // Safely get entity states with fallbacks
    const getEntityValue = (entityId: string): number => {
      if (!entityId || !this.hass.states[entityId]) {
        return 0;
      }
      const value = parseFloat(this.hass.states[entityId].state.replace(",", "."));
      return isNaN(value) ? 0 : value;
    };

    const pvPower = getEntityValue(this._config.entities.pv_power);
    const batteryDischargePower = getEntityValue(this._config.entities.battery_discharge_power);
    const batteryChargePower = getEntityValue(this._config.entities.battery_charge_power);
    const gridImportPower = getEntityValue(this._config.entities.grid_import_power);
    const gridExportPower = getEntityValue(this._config.entities.grid_export_power);
    const houseConsumption = getEntityValue(this._config.entities.house_consumption);
    const batterySoc = getEntityValue(this._config.entities.battery_soc);
    const dailyYield = getEntityValue(this._config.entities.daily_yield);
    const dailyHouseLoad = getEntityValue(this._config.entities.daily_house_load);
    const dailyEarnings = getEntityValue(this._config.entities.daily_earnings);

    const batteryPower = batteryDischargePower - batteryChargePower;
    const gridPower = gridImportPower - gridExportPower;
    const houseImage = (this.hass.themes as any).darkMode
      ? houseNight
      : houseDay;

    // Energy glow logic
    const pvFlowActive = pvPower > 10;
    const houseFlowActive = houseConsumption > 10;
    const batteryFlowDirection =
      batteryPower > 10
        ? "discharging"
        : batteryPower < -10
        ? "charging"
        : "idle";
    const gridFlowDirection =
      gridPower > 10 ? "importing" : gridPower < -10 ? "exporting" : "idle";

    // Inverter output power (PV + battery discharge)
    const inverterOutputPower = pvPower + (batteryFlowDirection === "discharging" ? batteryPower : 0);

    // Check if inverter is supplying power
    const isInverterSupplyingPower = inverterOutputPower > 10;

    // Check if grid is supplying house
    const isGridSupplyingHouse = gridFlowDirection === "importing";

    // Check if exporting to grid
    const isExportingToGrid = gridFlowDirection === "exporting";

    // Flow animation classes
    const pvFlowClass = pvFlowActive ? "flow-active" : "";
    const batteryFlowClass =
      batteryFlowDirection !== "idle"
        ? `flow-active ${
            batteryFlowDirection === "charging" ? "flow-reverse" : ""
          }`
        : "";
    
    // Inverter to junction flow
    const inverterToJunctionFlowClass = isInverterSupplyingPower ? "flow-active" : "";
    
    // Junction to house flow
    const junctionToHouseFlowClass = houseFlowActive && isInverterSupplyingPower ? "flow-active" : "";
    
    // Junction to grid flow (export)
    const junctionToGridFlowClass = isExportingToGrid ? "flow-active" : "";
    
    // Grid to house flow (import)
    const gridToHouseFlowClass = isGridSupplyingHouse && houseFlowActive ? "flow-active" : "";
      

    return html`
      <ha-card>
        <div class="card-content">
          <div class="pv-circle">
            <span class="value" style="font-size: 2em;"
              >${(pvPower / 1000).toFixed(2).replace(".", ",")}<span
                class="unit"
              >
                kW</span
              ></span
            >
            <span
              class="label"
              style="color: var(--success-color); font-weight: bold;"
              >PV<ha-icon icon="mdi:chevron-right"></ha-icon
            ></span>
          </div>

          <div class="house-area">
            <img src="${houseImage}" alt="House-Visualisation" />
            <div class="flow-container">
              <img class="inverter-img" src="${inverterImage}" />
              <img class="battery-img" src="${batteryImage}" />
              <div class="battery-soc">
                <ha-icon icon="mdi:lightning-bolt"></ha-icon> ${batterySoc}%
              </div>

              <svg
                class="flow-svg"
                viewBox="0 0 300 220"
                preserveAspectRatio="xMidYMid meet"
              >
                <!-- Static cable paths -->
                <path class="cable-path" d="M 121 35 L 121 148" /> <!-- PV to inverter -->
                <path class="cable-path" d="M 83 145 L 118 145" /> <!-- Battery to inverter -->
                <path class="cable-path" d="M 118 145 L 195 145" /> <!-- Inverter to house -->
                <path class="cable-path" d="M 150 145 L 150 213" /> <!-- Junction to grid -->

                <!-- Animated flows -->
                <g> <!-- 1. PV to inverter -->
                  <path class="flow-pulse ${pvFlowClass}" d="M 121 35 L 121 148" />
                </g>
                <g> <!-- 2. Battery to inverter -->
                  <path class="flow-pulse ${batteryFlowClass}" d="M 83 145 L 118 145" />
                </g>
                <g> <!-- 3. Inverter to junction -->
                  <path class="flow-pulse ${inverterToJunctionFlowClass}" d="M 118 145 L 150 145" />
                </g>
                <g> <!-- 4. Junction to house -->
                  <path class="flow-pulse ${junctionToHouseFlowClass}" d="M 150 145 L 195 145" />
                </g>
                <g> <!-- 5. Grid to house (import) -->
                  <path class="flow-pulse ${gridToHouseFlowClass}" d="M 150 213 L 150 145 L 210 145" />
                </g>
                <g> <!-- 6. Junction to grid (export) -->
                  <path class="flow-pulse ${junctionToGridFlowClass}" d="M 150 145 L 150 213" />
                </g>
              </svg>
            </div>
          </div>
          <div class="bottom-row">
            <div class="item">
              <span class="value"
                >${(Math.abs(batteryPower) / 1000)
                  .toFixed(2)
                  .replace(".", ",")}<span class="unit"> kW</span></span
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
                >${(Math.abs(gridPower) / 1000)
                  .toFixed(2)
                  .replace(".", ",")}<span class="unit"> kW</span></span
              >
              <span class="label">Netz</span>
            </div>
            <div class="item">
              <span class="value"
                >${(houseConsumption / 1000).toFixed(2).replace(".", ",")}<span
                  class="unit"
                >
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
                  <ha-icon
                    icon="mdi:home-lightning-bolt-outline"
                    style="color: #FE5700;"
                  ></ha-icon>
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

  // Register the card editor
  public static getConfigElement() {
    return document.createElement("solaris-card-editor");
  }

  // Stub config for the card picker
  public static getStubConfig() {
    return {
      type: "custom:solaris-card",
      entities: {
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
      }
    };
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
      margin-bottom: 0px;
      z-index: 0;
      width: 100%;
      max-width: 400px;
      position: relative;
    }

    .house-area img {
      width: 100%;
      height: auto;
      display: block;
      margin: 0 auto;
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

    .flow-container {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }

    .inverter-img {
      position: absolute;
      left: 38%;
      top: 60%;
      width: 8% !important;
      z-index: 10;
    }
    .battery-img {
      position: absolute;
      left: 19%;
      top: 60%;
      width: 12% !important;
    }

    .battery-soc {
      position: absolute;
      left: 19.5%;
      top: 49%;
      font-size: 0.85em;
      font-weight: bold;
      color: var(--primary-text-color);
      background-color: rgba(
        var(--rgb-card-background-color, 255, 255, 255),
        0.7
      );
      padding: 4px 6px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      gap: 3px;
      line-height: 1;
    }
    .battery-soc ha-icon {
      --mdc-icon-size: 14px;
    }

    .flow-svg {
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
    }

    .cable-path {
      fill: none;
      stroke: var(--success-color);
      stroke-opacity: 0.3;
      stroke-width: 4;
      stroke-linecap: round;
    }

    .flow-pulse {
      fill: none;
      stroke: white;
      stroke-width: 4;
      stroke-linecap: round;
      stroke-dasharray: 10 200;
      opacity: 0;
    }

    .flow-pulse.flow-active {
      opacity: 0.7;
      animation: flow 3s linear infinite;
    }

    .flow-pulse.flow-reverse {
      animation-direction: reverse;
    }

    @keyframes flow {
      from {
        stroke-dashoffset: 0;
      }
      to {
        stroke-dashoffset: -210;
      }
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

// Register the card in the window object for Home Assistant
(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: "solaris-card",
  name: "Solaris Energy Card",
  description: "A modern and fluent energy dashboard card for solar systems",
  preview: true,
  documentationURL: "https://github.com/MrAhmalo/Solaris-Energy-Card",
});
