import { ConsumptionDataPoint, TemperatureTelemetryPoint } from '@/types';

export class InfluxDbMockService {
  /**
   * Generates 24-hour chronological ingredient consumption data
   * simulating realistic luxury restaurant rushes.
   */
  public get24HourConsumptionData(): ConsumptionDataPoint[] {
    const hours: ConsumptionDataPoint[] = [];
    const currentHour = 21; // simulating 21:00 current time

    for (let i = 23; i >= 0; i--) {
      const h = (currentHour - i + 24) % 24;
      const hourStr = `${h.toString().padStart(2, '0')}:00`;

      let shift: ConsumptionDataPoint['serviceShift'] = 'Late Prep';
      let factor = 0.2; // base night factor

      if (h >= 6 && h < 11) {
        shift = 'Breakfast';
        factor = 0.55;
      } else if (h >= 11 && h < 15) {
        shift = 'Lunch Service';
        factor = 1.35; // lunch rush
      } else if (h >= 15 && h < 18) {
        shift = 'Late Prep';
        factor = 0.75; // dinner prep
      } else if (h >= 18 && h <= 22) {
        shift = 'Dinner Service';
        factor = 2.45; // Michelin grand tasting dinner rush peak!
      } else if (h === 23 || h < 6) {
        shift = 'Late Prep';
        factor = 0.15; // overnight cold rest
      }

      // Add controlled natural noise
      const veg = Number((factor * 6.8 + Math.sin(h * 0.7) * 1.5 + 2.0).toFixed(1));
      const meat = Number((factor * 5.2 + Math.cos(h * 0.8) * 1.2 + 1.5).toFixed(1));
      const dairy = Number((factor * 4.1 + Math.sin(h * 0.5) * 1.0 + 1.2).toFixed(1));
      const seafood = Number((factor * 3.4 + Math.cos(h * 0.6) * 0.8 + 0.9).toFixed(1));
      const luxury = Number((factor * 1.2 + (h >= 19 && h <= 21 ? 1.8 : 0.2)).toFixed(2));
      const total = Number((veg + meat + dairy + seafood + luxury).toFixed(1));

      hours.push({
        timestamp: `2026-10-16T${hourStr}:00Z`,
        timeLabel: hourStr,
        vegetables: veg,
        meat,
        dairy,
        seafood,
        luxury,
        total,
        serviceShift: shift,
      });
    }

    return hours;
  }

  /**
   * Generates time-series for specific vegetable & luxury items
   * to showcase detailed peak hourly usage during dinner service.
   */
  public getSpecificItemTrends(days: number = 7) {
    const points = [];
    const today = new Date();

    for (let d = days - 1; d >= 0; d--) {
      const date = new Date(today);
      date.setDate(today.getDate() - d);
      const dateLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      // Peak dinner rush vs lunch breakdown
      points.push({
        date: dateLabel,
        heirloomTomatoes: Number((16 + Math.random() * 8 + (d === 0 ? 5 : 0)).toFixed(1)),
        chanterelles: Number((4.5 + Math.random() * 3.0).toFixed(1)),
        blackTruffles: Number((1.2 + Math.random() * 0.8 + (d === 0 ? 0.4 : 0)).toFixed(2)),
        wagyuTenderloin: Number((8.5 + Math.random() * 4.0).toFixed(1)),
        normandyButter: Number((14.0 + Math.random() * 5.0).toFixed(1)),
        heavyCream: Number((18.0 + Math.random() * 6.0).toFixed(1)),
      });
    }

    return points;
  }

  /**
   * Cold storage temperature telemetry (InfluxDB measurements)
   */
  public getColdStorageTelemetry24H(): TemperatureTelemetryPoint[] {
    const points: TemperatureTelemetryPoint[] = [];
    const currentHour = 21;

    for (let i = 23; i >= 0; i--) {
      const h = (currentHour - i + 24) % 24;
      const hourStr = `${h.toString().padStart(2, '0')}:00`;

      // Simulating realistic compressor oscillations & defrost cycles
      const isDefrost = h === 16; // 16:00 defrost cycle
      const freezer = isDefrost ? -17.8 : Number((-20.4 + Math.sin(i) * 0.4).toFixed(1));
      const meat = Number((1.7 + Math.sin(i * 0.6) * 0.25).toFixed(1));
      const seafood = Number((-2.0 + Math.cos(i * 0.8) * 0.2).toFixed(1));
      const pastry = Number((14.1 + Math.sin(i * 0.4) * 0.3).toFixed(1));

      points.push({
        timestamp: `2026-10-16T${hourStr}:00Z`,
        timeLabel: hourStr,
        walkInFreezer: freezer,
        meatChiller: meat,
        seafoodCryo: seafood,
        pastryVault: pastry,
      });
    }

    return points;
  }

  /**
   * Station-wise yield vs kitchen trimming waste
   */
  public getStationWasteTelemetry() {
    return [
      { station: 'Garde Manger', preparedKg: 42.5, trimWasteKg: 3.2, yieldPct: 92.5 },
      { station: 'Sauté & Rotisserie', preparedKg: 58.0, trimWasteKg: 2.8, yieldPct: 95.2 },
      { station: 'Poissonier (Fish)', preparedKg: 31.4, trimWasteKg: 4.1, yieldPct: 86.9 },
      { station: 'Pastry & Bakery', preparedKg: 28.6, trimWasteKg: 1.1, yieldPct: 96.1 },
      { station: 'Entremetier (Veg)', preparedKg: 49.2, trimWasteKg: 4.8, yieldPct: 90.2 },
    ];
  }

  /**
   * Generates authentic Flux query string for InfluxDB integration demo
   */
  public generateFluxQuery(metric: 'consumption' | 'cold_storage' | 'waste', timeframe: string = '24h'): string {
    if (metric === 'consumption') {
      return `// InfluxDB 2.x / 3.x Flux Engine
from(bucket: "etoile-culinary-metrics")
  |> range(start: -${timeframe})
  |> filter(fn: (r) => r["_measurement"] == "ingredient_consumption")
  |> filter(fn: (r) => r["kitchen_zone"] == "main_brigade")
  |> filter(fn: (r) => r["category"] =~ /Vegetables|Meat|Dairy|Seafood|Luxury/)
  |> aggregateWindow(every: 1h, fn: sum, createEmpty: false)
  |> map(fn: (r) => ({ r with _value: math.round(x: r._value * 100.0) / 100.0 }))
  |> yield(name: "hourly_consumption_kg")`;
    }

    if (metric === 'cold_storage') {
      return `// InfluxDB IoT Telemetry Flux Engine
from(bucket: "etoile-iot-sensors")
  |> range(start: -${timeframe})
  |> filter(fn: (r) => r["_measurement"] == "cold_storage_telemetry")
  |> filter(fn: (r) => r["sensor_model"] == "HACCP-CryoGuard-Pro")
  |> filter(fn: (r) => r["_field"] == "temperature_celsius" or r["_field"] == "humidity_pct")
  |> aggregateWindow(every: 15m, fn: mean, createEmpty: false)
  |> yield(name: "temperature_log_celsius")`;
    }

    return `// InfluxDB Yield vs Food Waste Query
from(bucket: "etoile-waste-analytics")
  |> range(start: -7d)
  |> filter(fn: (r) => r["_measurement"] == "culinary_yield")
  |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
  |> map(fn: (r) => ({ r with yield_rate: (r.prepared_kg - r.waste_kg) / r.prepared_kg * 100.0 }))
  |> yield(name: "yield_rate_pct")`;
  }
}

export const influxDbService = new InfluxDbMockService();
