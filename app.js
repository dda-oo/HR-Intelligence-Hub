// Core client logic for the HR Pulse dashboard.
// Designed to be easy to extend with new indicators and data sources.
const config = typeof HR_HUB_CONFIG !== "undefined" ? HR_HUB_CONFIG : {};
const corsProxy = config.corsProxy || "";
const defaultCountryCode = config.defaultCountryCode || "WLD";

const elements = {
  lastUpdated: document.getElementById("last-updated"),
  autoRefresh: document.getElementById("auto-refresh"),
  summary: document.getElementById("pulse-summary"),
  decisionCue: document.getElementById("decision-cue"),
  countrySelect: document.getElementById("country-select"),
  countryMeta: document.getElementById("country-meta"),
  labels: {
    unemployment: document.getElementById("label-unemployment"),
    unrest: document.getElementById("label-unrest"),
    negotiations: document.getElementById("label-negotiations"),
    inflation: document.getElementById("label-inflation"),
    chartUnemployment: document.getElementById("chart-title-unemployment"),
    chartUnrest: document.getElementById("chart-title-unrest"),
    chartNegotiations: document.getElementById("chart-title-negotiations"),
    chartInflation: document.getElementById("chart-title-inflation"),
  },
  kpi: {
    unemployment: document.getElementById("kpi-unemployment"),
    unemploymentMeta: document.getElementById("kpi-unemployment-meta"),
    unemploymentInsight: document.getElementById("kpi-unemployment-insight"),
    unemploymentDelta: document.getElementById("delta-unemployment"),
    unrest: document.getElementById("kpi-unrest"),
    unrestMeta: document.getElementById("kpi-unrest-meta"),
    unrestInsight: document.getElementById("kpi-unrest-insight"),
    unrestDelta: document.getElementById("delta-unrest"),
    negotiations: document.getElementById("kpi-negotiations"),
    negotiationsMeta: document.getElementById("kpi-negotiations-meta"),
    negotiationsInsight: document.getElementById("kpi-negotiations-insight"),
    negotiationsDelta: document.getElementById("delta-negotiations"),
    inflation: document.getElementById("kpi-inflation"),
    inflationMeta: document.getElementById("kpi-inflation-meta"),
    inflationInsight: document.getElementById("kpi-inflation-insight"),
    inflationDelta: document.getElementById("delta-inflation"),
    sparkUnemployment: document.getElementById("spark-unemployment"),
    sparkUnrest: document.getElementById("spark-unrest"),
    sparkNegotiations: document.getElementById("spark-negotiations"),
    sparkInflation: document.getElementById("spark-inflation"),
  },
  negotiation: {
    riskScore: document.getElementById("risk-score"),
    riskMeta: document.getElementById("risk-meta"),
    riskInsight: document.getElementById("risk-insight"),
    riskTitle: document.getElementById("risk-title"),
    pressureScore: document.getElementById("pressure-score"),
    pressureMeta: document.getElementById("pressure-meta"),
    pressureInsight: document.getElementById("pressure-insight"),
    pressureTitle: document.getElementById("pressure-title"),
    slackScore: document.getElementById("slack-score"),
    slackMeta: document.getElementById("slack-meta"),
    slackInsight: document.getElementById("slack-insight"),
    slackTitle: document.getElementById("slack-title"),
    momentumScore: document.getElementById("momentum-score"),
    momentumMeta: document.getElementById("momentum-meta"),
    momentumInsight: document.getElementById("momentum-insight"),
    momentumTitle: document.getElementById("momentum-title"),
    radarTitle: document.getElementById("radar-title"),
    distributionTitle: document.getElementById("distribution-title"),
    riskRadar: document.getElementById("chart-risk-radar"),
    riskDistribution: document.getElementById("chart-risk-dist"),
  },
  badges: {
    unemployment: document.getElementById("badge-unemployment"),
    unrest: document.getElementById("badge-unrest"),
    negotiations: document.getElementById("badge-negotiations"),
    inflation: document.getElementById("badge-inflation"),
  },
};

const charts = {};

const sampleData = {
  unemployment: [
    { label: "2018", value: 5.2 },
    { label: "2019", value: 5.0 },
    { label: "2020", value: 5.9 },
    { label: "2021", value: 5.2 },
    { label: "2022", value: 5.0 },
    { label: "2023", value: 4.8 },
  ],
  unrest: [
    { label: "2024-01", value: 68 },
    { label: "2024-02", value: 72 },
    { label: "2024-03", value: 60 },
    { label: "2024-04", value: 75 },
    { label: "2024-05", value: 83 },
    { label: "2024-06", value: 70 },
    { label: "2024-07", value: 66 },
    { label: "2024-08", value: 74 },
    { label: "2024-09", value: 79 },
    { label: "2024-10", value: 88 },
    { label: "2024-11", value: 80 },
    { label: "2024-12", value: 92 },
  ],
  negotiations: [
    { label: "2024-01", value: 18 },
    { label: "2024-02", value: 22 },
    { label: "2024-03", value: 19 },
    { label: "2024-04", value: 25 },
    { label: "2024-05", value: 28 },
    { label: "2024-06", value: 24 },
    { label: "2024-07", value: 21 },
    { label: "2024-08", value: 26 },
    { label: "2024-09", value: 30 },
    { label: "2024-10", value: 34 },
    { label: "2024-11", value: 29 },
    { label: "2024-12", value: 33 },
  ],
  inflation: [
    { label: "2018", value: 2.4 },
    { label: "2019", value: 1.8 },
    { label: "2020", value: 1.2 },
    { label: "2021", value: 3.2 },
    { label: "2022", value: 6.6 },
    { label: "2023", value: 5.1 },
  ],
  gdp: [
    { label: "2018", value: 3.0 },
    { label: "2019", value: 2.4 },
    { label: "2020", value: -3.1 },
    { label: "2021", value: 5.3 },
    { label: "2022", value: 2.9 },
    { label: "2023", value: 2.4 },
  ],
};

const dateFormatter = new Intl.DateTimeFormat("de-DE", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

const percentFormatter = new Intl.NumberFormat("de-DE", {
  style: "percent",
  maximumFractionDigits: 1,
});

const numberFormatter = new Intl.NumberFormat("de-DE");

const chartTheme = {
  borderColor: "#2563eb",
  backgroundColor: "rgba(37, 99, 235, 0.12)",
  gridColor: "rgba(148, 163, 184, 0.2)",
  textColor: "#0f172a",
};


const withProxy = (url) => (corsProxy ? `${corsProxy}${url}` : url);

const fetchJson = async (url) => {
  const response = await fetch(withProxy(url));
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
};

const parseWorldBank = (payload) => {
  if (!Array.isArray(payload) || payload.length < 2) return [];
  const series = payload[1];
  if (!Array.isArray(series)) return [];
  return series
    .filter((item) => item?.value !== null && item?.date)
    .reverse()
    .map((item) => ({
      label: item.date,
      value: Number(item.value),
    }));
};

const hashCode = (value) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const generateMonthlySeries = (baseValue, seed) => {
  const series = [];
  const now = new Date();
  for (let i = 11; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
    const variation = Math.sin((i + seed) * 0.6) * 4;
    const value = Math.max(0, Math.round(baseValue + variation));
    series.push({ label, value });
  }
  return series;
};

const modelUnrestSeries = ({ unemployment, inflation, gdp, countryCode }) => {
  const base =
    latestValue(unemployment) * 4 +
    latestValue(inflation) * 6 +
    Math.max(0, -latestValue(gdp)) * 4;
  const seed = hashCode(countryCode || "WLD") % 10;
  const baseValue = Math.min(120, Math.max(10, Math.round(base + seed)));
  return generateMonthlySeries(baseValue, seed);
};

const formatPercent = (value) => {
  if (value === null || value === undefined) return "--";
  return percentFormatter.format(value / 100);
};

const formatNumber = (value) => {
  if (value === null || value === undefined) return "--";
  return numberFormatter.format(value);
};

const updateKpi = ({
  unemployment,
  unrest,
  negotiations,
  inflation,
  scopes = {},
}) => {
  if (unemployment?.length) {
    const latest = unemployment[unemployment.length - 1];
    elements.kpi.unemployment.textContent = formatPercent(latest.value);
    elements.kpi.unemploymentMeta.textContent = `Latest year: ${latest.label}`;
  }
  if (unrest?.length) {
    const latest = unrest[unrest.length - 1];
    elements.kpi.unrest.textContent = formatNumber(latest.value);
    elements.kpi.unrestMeta.textContent = `Monthly count: ${latest.label}${
      scopes.unrest ? ` · ${scopes.unrest}` : ""
    }`;
  }
  if (negotiations?.length) {
    const latest = negotiations[negotiations.length - 1];
    elements.kpi.negotiations.textContent = formatNumber(latest.value);
    elements.kpi.negotiationsMeta.textContent = `Monthly count: ${latest.label}${
      scopes.negotiations ? ` · ${scopes.negotiations}` : ""
    }`;
  }
  if (inflation?.length) {
    const latest = inflation[inflation.length - 1];
    elements.kpi.inflation.textContent = formatPercent(latest.value);
    elements.kpi.inflationMeta.textContent = `Latest year: ${latest.label}`;
  }
};

const updateSummary = ({
  unemployment,
  unrest,
  negotiations,
  inflation,
  countryLabel = "Global",
  riskScore = null,
}) => {
  const latestUnemployment = unemployment?.[unemployment.length - 1]?.value;
  const latestUnrest = unrest?.[unrest.length - 1]?.value;
  const latestNegotiations = negotiations?.[negotiations.length - 1]?.value;
  const latestInflation = inflation?.[inflation.length - 1]?.value;

  const pressureIndex =
    latestUnemployment && latestInflation
      ? (latestInflation / latestUnemployment).toFixed(2)
      : "--";

  const summaryLines = [
    `${countryLabel} unemployment is ${latestUnemployment?.toFixed(1) ?? "--"}%.`,
    `Negotiation pressure index (inflation ÷ unemployment): ${pressureIndex}.`,
    `Labor unrest mentions (news volume): ${latestUnrest ?? "--"} per month.`,
    `Collective bargaining pulse (mentions): ${latestNegotiations ?? "--"} per month.`,
    `Inflation ${latestInflation?.toFixed(1) ?? "--"}% shapes wage pressure.`,
  ];

  if (riskScore !== null) {
    summaryLines.unshift(`Negotiation risk score: ${riskScore}.`);
  }

  elements.summary.textContent = summaryLines.join(" ");
};

const renderChart = (id, label, series) => {
  const ctx = document.getElementById(id);
  if (!ctx) return;

  if (charts[id]) {
    charts[id].destroy();
  }

  charts[id] = new Chart(ctx, {
    type: "line",
    data: {
      labels: series.map((item) => item.label),
      datasets: [
        {
          label,
          data: series.map((item) => item.value),
          borderColor: chartTheme.borderColor,
          backgroundColor: chartTheme.backgroundColor,
          borderWidth: 2,
          tension: 0.3,
          fill: true,
          pointRadius: 2,
        },
      ],
    },
    options: {
      plugins: {
        legend: { display: false },
      },
      scales: {
        x: {
          grid: { color: chartTheme.gridColor },
          ticks: { color: chartTheme.textColor },
        },
        y: {
          grid: { color: chartTheme.gridColor },
          ticks: { color: chartTheme.textColor },
        },
      },
    },
  });
};


const fetchWorldBankSeries = async (countryCode, indicator) => {
  const url = `https://api.worldbank.org/v2/country/${countryCode}/indicator/${indicator}?format=json`;
  try {
    const data = await fetchJson(url);
    const series = parseWorldBank(data);
    return series.length ? series : [];
  } catch (error) {
    return [];
  }
};

const fetchUnemployment = async (countryCode) => {
  const series = await fetchWorldBankSeries(countryCode, "SL.UEM.TOTL.ZS");
  return series.length ? series : sampleData.unemployment;
};


const fetchGdeltTimeline = async (keywords, countryCode) => {
  const keywordQuery = keywords.length
    ? `(${keywords.map((keyword) => `"${keyword}"`).join(" OR ")})`
    : '"labor union"';
  const country = countryCode && countryCode !== "WLD" ? `sourcecountry:${countryCode}` : "";
  const language = config?.gdelt?.language ? `sourcelang:${config.gdelt.language}` : "";
  const queryParts = [keywordQuery, country, language].filter(Boolean).join(" ");
  const url = `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(
    queryParts
  )}&mode=TimelineVol&format=json&maxrecords=250`;

  try {
    const data = await fetchJson(url);
    const timeline = data?.timeline;
    if (!Array.isArray(timeline) || !timeline.length) return [];
    return timeline
      .filter((item) => item?.date)
      .slice(-12)
      .map((item) => ({
        label: item.date.slice(0, 7),
        value: item?.value || 0,
      }));
  } catch (error) {
    return [];
  }
};

const fetchGdeltWithFallback = async (
  keywords,
  countryCode,
  fallbackKeywords = []
) => {
  const primary = await fetchGdeltTimeline(keywords, countryCode);
  const hasPrimary = primary.length && primary.some((item) => item.value > 0);
  if (hasPrimary) {
    return { series: primary, scopeLabel: "Country", usedFallback: false };
  }

  if (countryCode !== "WLD") {
    const globalPrimary = await fetchGdeltTimeline(keywords, "WLD");
    const hasGlobalPrimary =
      globalPrimary.length && globalPrimary.some((item) => item.value > 0);
    if (hasGlobalPrimary) {
      return {
        series: globalPrimary,
        scopeLabel: "Global fallback",
        usedFallback: true,
      };
    }
  }

  if (fallbackKeywords.length) {
    const fallbackLocal = await fetchGdeltTimeline(fallbackKeywords, countryCode);
    const hasFallbackLocal =
      fallbackLocal.length && fallbackLocal.some((item) => item.value > 0);
    if (hasFallbackLocal) {
      return {
        series: fallbackLocal,
        scopeLabel: "Broad keywords",
        usedFallback: true,
      };
    }

    const fallbackGlobal = await fetchGdeltTimeline(fallbackKeywords, "WLD");
    const hasFallbackGlobal =
      fallbackGlobal.length && fallbackGlobal.some((item) => item.value > 0);
    if (hasFallbackGlobal) {
      return {
        series: fallbackGlobal,
        scopeLabel: "Broad keywords · Global",
        usedFallback: true,
      };
    }
  }

  return {
    series: primary,
    scopeLabel: "No coverage",
    usedFallback: true,
  };
};

const fetchUnrestData = async (countryCode, macro) => {
  const gdeltConfig = config?.gdelt || {};
  const keywords = gdeltConfig.keywords || [];
  const fallbackKeywords = gdeltConfig.baseKeywords || [];
  const { series, usedFallback, scopeLabel } = await fetchGdeltWithFallback(
    keywords,
    countryCode,
    fallbackKeywords
  );
  if (series.length && series.some((item) => item.value > 0)) {
    return {
      series,
      usedFallback,
      scopeLabel,
    };
  }
  return {
    series: modelUnrestSeries({ ...macro, countryCode }),
    usedFallback: true,
    scopeLabel: "Modeled",
  };
};

const fetchNegotiationsData = async (countryCode, macro) => {
  const negotiationConfig = config?.negotiations || {};
  const keywords = negotiationConfig.keywords || ["collective bargaining"];
  const fallbackKeywords = negotiationConfig.baseKeywords || [];
  const { series, usedFallback, scopeLabel } = await fetchGdeltWithFallback(
    keywords,
    countryCode,
    fallbackKeywords
  );
  if (series.length && series.some((item) => item.value > 0)) {
    return {
      series,
      usedFallback,
      scopeLabel,
    };
  }
  const modeled = modelUnrestSeries({ ...macro, countryCode }).map((item) => ({
    ...item,
    value: Math.max(5, Math.round(item.value * 0.6)),
  }));
  return {
    series: modeled,
    usedFallback: true,
    scopeLabel: "Modeled",
  };
};

const fetchInflation = async (countryCode) => {
  const series = await fetchWorldBankSeries(countryCode, "FP.CPI.TOTL.ZG");
  return series.length ? series : sampleData.inflation;
};

const fetchGdp = async (countryCode) => {
  const series = await fetchWorldBankSeries(countryCode, "NY.GDP.MKTP.KD.ZG");
  return series.length ? series : sampleData.gdp;
};

const latestValue = (series) => series?.[series.length - 1]?.value ?? 0;
const latestLabel = (series) => series?.[series.length - 1]?.label ?? "--";
const maxValue = (series) =>
  series?.length ? Math.max(...series.map((item) => item.value)) : 0;

const confidenceLabel = (series, mode) => {
  if (!series?.length) return "Low confidence";
  const lastLabel = series[series.length - 1]?.label || "";
  if (mode === "annual") {
    const year = parseInt(lastLabel, 10);
    if (Number.isNaN(year)) return "Medium confidence";
    if (year >= new Date().getFullYear() - 1) return "High confidence";
    if (year >= new Date().getFullYear() - 3) return "Medium confidence";
    return "Low confidence";
  }
  return "Medium confidence";
};

const changeInsight = (series, unit) => {
  if (!series?.length) return "--";
  const latest = series[series.length - 1]?.value;
  const prev = series.length > 1 ? series[series.length - 2]?.value : null;
  if (latest === null || latest === undefined || prev === null || prev === undefined) {
    return "--";
  }
  const delta = latest - prev;
  const direction = delta >= 0 ? "up" : "down";
  const formatted =
    unit === "%" ? `${Math.abs(delta).toFixed(1)} pts` : `${Math.abs(delta).toFixed(0)}`;
  return `Change vs prior period: ${direction} ${formatted}.`;
};

const deltaChip = (series, unit) => {
  if (!series?.length || series.length < 2) return "--";
  const latest = series[series.length - 1]?.value;
  const prev = series[series.length - 2]?.value;
  if (latest === undefined || prev === undefined) return "--";
  const delta = latest - prev;
  const sign = delta >= 0 ? "+" : "";
  const formatted =
    unit === "%"
      ? `${sign}${delta.toFixed(1)} pts`
      : `${sign}${delta.toFixed(0)}`;
  return formatted;
};

const renderSparkline = (id, series, color) => {
  const ctx = document.getElementById(id);
  if (!ctx || !series?.length) return;
  if (charts[id]) {
    charts[id].destroy();
  }
  charts[id] = new Chart(ctx, {
    type: "line",
    data: {
      labels: series.map((item) => item.label),
      datasets: [
        {
          data: series.map((item) => item.value),
          borderColor: color,
          borderWidth: 2,
          tension: 0.3,
          pointRadius: 0,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      scales: {
        x: { display: false },
        y: { display: false },
      },
    },
  });
};

const aggregateYearly = (series) => {
  const buckets = {};
  series.forEach((item) => {
    const year = item.label?.slice(0, 4);
    if (!year) return;
    if (!buckets[year]) {
      buckets[year] = { total: 0, count: 0 };
    }
    buckets[year].total += item.value;
    buckets[year].count += 1;
  });
  return Object.keys(buckets)
    .sort()
    .map((year) => ({
      label: year,
      value: buckets[year].total / buckets[year].count,
    }));
};

const computeRiskFromValues = ({ unemp, infl, gdp, unrest, negotiations }) => {
  const normUnemp = Math.min(unemp / 15, 1);
  const normInfl = Math.min(infl / 12, 1);
  const normUnrest = Math.min(unrest / 120, 1);
  const normNegotiations = Math.min(negotiations / 120, 1);
  const normGdp = gdp < 0 ? Math.min(Math.abs(gdp) / 6, 1) : 0;
  const score =
    25 * normUnemp +
    25 * normInfl +
    25 * normUnrest +
    15 * normNegotiations +
    10 * normGdp;
  return Math.round(score);
};

const computeRiskScore = ({
  unemployment,
  inflation,
  gdp,
  unrest,
  negotiations,
}) => {
  const unemp = latestValue(unemployment);
  const infl = latestValue(inflation);
  const gdpVal = latestValue(gdp);
  const unrestVal = latestValue(unrest);
  const negotiationVal = latestValue(negotiations);

  const normUnemp = Math.min(unemp / 15, 1);
  const normInfl = Math.min(infl / 12, 1);
  const normUnrest = maxValue(unrest) ? unrestVal / maxValue(unrest) : 0;
  const normNegotiations = maxValue(negotiations)
    ? negotiationVal / maxValue(negotiations)
    : 0;
  const normGdp = gdpVal < 0 ? Math.min(Math.abs(gdpVal) / 6, 1) : 0;

  const score =
    25 * normUnemp +
    25 * normInfl +
    25 * normUnrest +
    15 * normNegotiations +
    10 * normGdp;

  return Math.round(score);
};

const riskBand = (score) => {
  if (score >= 70) return "High";
  if (score >= 40) return "Moderate";
  return "Low";
};


const refreshDashboard = async (
  countryCode = defaultCountryCode,
  countryLabel = "Global"
) => {
  elements.summary.textContent = "Refreshing live signals...";
  const [unemployment, inflation, gdp] = await Promise.all([
    fetchUnemployment(countryCode),
    fetchInflation(countryCode),
    fetchGdp(countryCode),
  ]);
  const macro = { unemployment, inflation, gdp };
  const [unrestData, negotiationData] = await Promise.all([
    fetchUnrestData(countryCode, macro),
    fetchNegotiationsData(countryCode, macro),
  ]);

  const unrest = unrestData.series;
  const negotiations = negotiationData.series;
  const scopeLabel = (scopeLabelValue) => {
    if (!scopeLabelValue || scopeLabelValue === "Country") {
      return countryLabel;
    }
    if (scopeLabelValue === "Estimated") {
      return "Estimated from labor signals";
    }
    if (scopeLabelValue === "Modeled") {
      return "Modeled from macro signals";
    }
    return scopeLabelValue;
  };

  updateKpi({
    unemployment,
    unrest,
    negotiations,
    inflation,
    scopes: {
      unrest: scopeLabel(unrestData.scopeLabel),
      negotiations: scopeLabel(negotiationData.scopeLabel),
    },
  });
  const riskScoreValue = computeRiskScore({
    unemployment,
    inflation,
    gdp,
    unrest,
    negotiations,
  });
  updateSummary({
    unemployment,
    unrest,
    negotiations,
    inflation,
    countryLabel,
    riskScore: riskScoreValue,
  });
  renderChart("chart-unemployment", "Unemployment %", unemployment);
  renderChart("chart-unrest", "Unrest", unrest);
  renderChart("chart-negotiations", "Negotiations", negotiations);
  renderChart("chart-inflation", "Inflation %", inflation);

  if (elements.kpi.unemploymentInsight) {
    elements.kpi.unemploymentInsight.textContent = changeInsight(unemployment, "%");
  }
  if (elements.kpi.unrestInsight) {
    elements.kpi.unrestInsight.textContent = changeInsight(unrest, "");
  }
  if (elements.kpi.negotiationsInsight) {
    elements.kpi.negotiationsInsight.textContent = changeInsight(negotiations, "");
  }
  if (elements.kpi.inflationInsight) {
    elements.kpi.inflationInsight.textContent = changeInsight(inflation, "%");
  }

  if (elements.kpi.unemploymentDelta) {
    elements.kpi.unemploymentDelta.textContent = deltaChip(unemployment, "%");
  }
  if (elements.kpi.unrestDelta) {
    elements.kpi.unrestDelta.textContent = deltaChip(unrest, "");
  }
  if (elements.kpi.negotiationsDelta) {
    elements.kpi.negotiationsDelta.textContent = deltaChip(negotiations, "");
  }
  if (elements.kpi.inflationDelta) {
    elements.kpi.inflationDelta.textContent = deltaChip(inflation, "%");
  }

  renderSparkline("spark-unemployment", unemployment, "#2563eb");
  renderSparkline("spark-unrest", unrest, "#0ea5e9");
  renderSparkline("spark-negotiations", negotiations, "#38bdf8");
  renderSparkline("spark-inflation", inflation, "#1d4ed8");

  if (elements.badges.unemployment) {
    elements.badges.unemployment.textContent = confidenceLabel(unemployment, "annual");
  }
  if (elements.badges.inflation) {
    elements.badges.inflation.textContent = confidenceLabel(inflation, "annual");
  }
  if (elements.badges.unrest) {
    elements.badges.unrest.textContent = confidenceLabel(unrest, "monthly");
  }
  if (elements.badges.negotiations) {
    elements.badges.negotiations.textContent = confidenceLabel(negotiations, "monthly");
  }

  if (elements.negotiation.riskRadar) {
    const radarLabels = ["Unemployment", "Inflation", "Unrest", "Bargaining"];
    const radarValues = [
      Math.min(latestValue(unemployment) / 15, 1),
      Math.min(latestValue(inflation) / 12, 1),
      Math.min(latestValue(unrest) / 120, 1),
      Math.min(latestValue(negotiations) / 120, 1),
    ];
    if (charts["chart-risk-radar"]) {
      charts["chart-risk-radar"].destroy();
    }
    charts["chart-risk-radar"] = new Chart(elements.negotiation.riskRadar, {
      type: "radar",
      data: {
        labels: radarLabels,
        datasets: [
          {
            data: radarValues,
            backgroundColor: "rgba(37, 99, 235, 0.2)",
            borderColor: "#2563eb",
            borderWidth: 2,
          },
        ],
      },
      options: {
        plugins: { legend: { display: false } },
        scales: {
          r: {
            beginAtZero: true,
            max: 1,
            ticks: { display: false },
            grid: { color: "rgba(148, 163, 184, 0.3)" },
            pointLabels: { color: "#475569", font: { size: 12 } },
          },
        },
      },
    });
  }

  if (elements.negotiation.riskDistribution) {
    const yearlyUnemp = unemployment;
    const yearlyInflation = inflation;
    const yearlyGdp = gdp;
    const yearlyUnrest = aggregateYearly(unrest);
    const yearlyNegotiations = aggregateYearly(negotiations);
    const years = yearlyUnemp
      .map((item) => item.label)
      .filter((year) =>
        yearlyInflation.some((i) => i.label === year) &&
        yearlyGdp.some((i) => i.label === year)
      )
      .slice(-6);

    const trendScores = years.map((year) => {
      const unemp =
        yearlyUnemp.find((item) => item.label === year)?.value ??
        latestValue(unemployment);
      const infl =
        yearlyInflation.find((item) => item.label === year)?.value ??
        latestValue(inflation);
      const gdpVal =
        yearlyGdp.find((item) => item.label === year)?.value ?? latestValue(gdp);
      const unrestVal =
        yearlyUnrest.find((item) => item.label === year)?.value ??
        latestValue(unrest);
      const negVal =
        yearlyNegotiations.find((item) => item.label === year)?.value ??
        latestValue(negotiations);
      return computeRiskFromValues({
        unemp,
        infl,
        gdp: gdpVal,
        unrest: unrestVal,
        negotiations: negVal,
      });
    });

    if (charts["chart-risk-dist"]) {
      charts["chart-risk-dist"].destroy();
    }
    charts["chart-risk-dist"] = new Chart(elements.negotiation.riskDistribution, {
      type: "line",
      data: {
        labels: years,
        datasets: [
          {
            data: trendScores,
            borderColor: "#2563eb",
            backgroundColor: "rgba(37, 99, 235, 0.2)",
            fill: true,
            tension: 0.3,
            pointRadius: 2,
          },
        ],
      },
      options: {
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: "#475569" } },
          y: { grid: { color: "rgba(148, 163, 184, 0.2)" }, ticks: { color: "#475569" } },
        },
      },
    });
  }

  if (elements.negotiation.riskScore) {
    elements.negotiation.riskScore.textContent = `${riskScoreValue}`;
    elements.negotiation.riskMeta.textContent = `${riskBand(
      riskScoreValue
    )} risk · ${countryLabel}`;
    elements.negotiation.riskInsight.textContent = `${countryLabel} shows ${riskBand(
      riskScoreValue
    ).toLowerCase()} negotiation pressure based on macro and labor signals.`;
  }

  if (elements.decisionCue) {
    const cue =
      riskScoreValue >= 70
        ? "Decision cue: prepare for escalations and pre‑brief leadership."
        : riskScoreValue >= 40
        ? "Decision cue: maintain firm posture; monitor wage pressure weekly."
        : "Decision cue: stay flexible; focus on relationship building.";
    elements.decisionCue.textContent = cue;
  }

  const wagePressure =
    latestValue(inflation) - latestValue(unemployment);
  const wagePressureLabel =
    wagePressure >= 0
      ? `+${wagePressure.toFixed(1)} pts`
      : `${wagePressure.toFixed(1)} pts`;
  const wagePressureInsight =
    wagePressure >= 1
      ? "Inflation outpaces unemployment, strengthening wage demands."
      : wagePressure >= 0
      ? "Moderate wage pressure; monitor bargaining posture."
      : "Lower wage pressure; employers may retain leverage.";

  if (elements.negotiation.pressureScore) {
    elements.negotiation.pressureScore.textContent = wagePressureLabel;
    elements.negotiation.pressureMeta.textContent = "Inflation - unemployment";
    elements.negotiation.pressureInsight.textContent = wagePressureInsight;
  }

  const unemploymentSeries = unemployment.slice(-3);
  const avgUnemployment =
    unemploymentSeries.reduce((sum, item) => sum + item.value, 0) /
    (unemploymentSeries.length || 1);
  const slackShift = latestValue(unemployment) - avgUnemployment;
  const slackLabel =
    slackShift >= 0 ? `+${slackShift.toFixed(1)} pts` : `${slackShift.toFixed(1)} pts`;
  const slackInsight =
    slackShift >= 0.5
      ? "Rising slack suggests softer labor conditions."
      : slackShift <= -0.5
      ? "Tighter labor market adds pressure to negotiations."
      : "Labor supply is broadly stable.";

  if (elements.negotiation.slackScore) {
    elements.negotiation.slackScore.textContent = slackLabel;
    elements.negotiation.slackMeta.textContent = "Latest vs 3y average";
    elements.negotiation.slackInsight.textContent = slackInsight;
  }

  const gdpValue = latestValue(gdp);
  const momentumLabel =
    gdpValue >= 0 ? `+${gdpValue.toFixed(1)}%` : `${gdpValue.toFixed(1)}%`;
  const momentumInsight =
    gdpValue >= 2
      ? "Strong growth supports higher bargaining expectations."
      : gdpValue >= 0
      ? "Moderate growth; negotiation posture may stay balanced."
      : "Negative growth may curb wage settlements.";

  if (elements.negotiation.momentumScore) {
    elements.negotiation.momentumScore.textContent = momentumLabel;
    elements.negotiation.momentumMeta.textContent = "GDP growth (YoY)";
    elements.negotiation.momentumInsight.textContent = momentumInsight;
  }

  elements.lastUpdated.textContent = `Last updated: ${dateFormatter.format(
    new Date()
  )}`;
};

const refreshIntervalMinutes = Math.max(
  5,
  Number(config.refreshIntervalMinutes || 30)
);
const refreshIntervalMs = refreshIntervalMinutes * 60 * 1000;

if (elements.autoRefresh) {
  elements.autoRefresh.textContent = `Auto refresh: every ${refreshIntervalMinutes} minutes`;
}

refreshDashboard();
setInterval(refreshDashboard, refreshIntervalMs);

const mapState = {
  map: null,
  marker: null,
  countryLookup: new Map(),
};

const initMap = () => {
  const container = document.getElementById("country-map");
  if (!container || !window.L) return;
  mapState.map = L.map(container).setView([20, 0], 2);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 6,
    attribution: '&copy; <a href="https://www.openstreetmap.org/">OSM</a>',
  }).addTo(mapState.map);
  mapState.marker = L.marker([20, 0]).addTo(mapState.map);
};

const setMapView = (latlng, label) => {
  if (!mapState.map || !latlng) return;
  mapState.map.setView(latlng, latlng[0] === 20 && latlng[1] === 0 ? 2 : 4);
  if (mapState.marker) {
    mapState.marker.setLatLng(latlng);
    mapState.marker.bindPopup(label).openPopup();
  }
};

const populateCountries = async () => {
  if (!elements.countrySelect) return;
  elements.countrySelect.innerHTML = "";
  const defaultOption = document.createElement("option");
  defaultOption.value = "WLD";
  defaultOption.textContent = "Global (World)";
  elements.countrySelect.appendChild(defaultOption);
  try {
    const data = await fetchJson(
      "https://restcountries.com/v3.1/all?fields=name,cca2,cca3,latlng"
    );
    const countries = Array.isArray(data)
      ? data
          .filter((country) => country?.cca2 && country?.name?.common)
          .sort((a, b) => a.name.common.localeCompare(b.name.common))
      : [];

    countries.forEach((country) => {
      mapState.countryLookup.set(country.cca2, {
        name: country.name.common,
        latlng: country.latlng,
      });
      const option = document.createElement("option");
      option.value = country.cca2;
      option.textContent = country.name.common;
      elements.countrySelect.appendChild(option);
    });
    elements.countrySelect.value = defaultCountryCode;
  } catch (error) {
    elements.countrySelect.value = "WLD";
  }
};

const updateCountry = async (countryCode) => {
  const lookup = mapState.countryLookup.get(countryCode);
  const label = countryCode === "WLD" ? "Global" : lookup?.name || countryCode;
  if (elements.countryMeta) {
    elements.countryMeta.textContent = `Selected: ${label}`;
  }
  if (countryCode === "WLD") {
    setMapView([20, 0], "Global");
  } else if (lookup?.latlng?.length === 2) {
    setMapView(lookup.latlng, lookup.name);
  }
  if (elements.labels.unemployment) {
    elements.labels.unemployment.textContent = `${label} Unemployment Rate`;
  }
  if (elements.labels.unrest) {
    elements.labels.unrest.textContent = `${label} Labor Unrest Index`;
  }
  if (elements.labels.negotiations) {
    elements.labels.negotiations.textContent = `${label} Collective Bargaining Pulse`;
  }
  if (elements.labels.inflation) {
    elements.labels.inflation.textContent = `${label} Inflation (CPI YoY)`;
  }
  if (elements.labels.chartUnemployment) {
    elements.labels.chartUnemployment.textContent = `${label} Unemployment Trend`;
  }
  if (elements.labels.chartUnrest) {
    elements.labels.chartUnrest.textContent = `${label} Labor Unrest Mentions`;
  }
  if (elements.labels.chartNegotiations) {
    elements.labels.chartNegotiations.textContent = `${label} Collective Bargaining Pulse`;
  }
  if (elements.labels.chartInflation) {
    elements.labels.chartInflation.textContent = `${label} Inflation Pressure`;
  }
  if (elements.negotiation.riskTitle) {
    elements.negotiation.riskTitle.textContent = `${label} Negotiation Risk Score`;
  }
  if (elements.negotiation.pressureTitle) {
    elements.negotiation.pressureTitle.textContent = `${label} Wage Pressure Index`;
  }
  if (elements.negotiation.slackTitle) {
    elements.negotiation.slackTitle.textContent = `${label} Labor Slack Shift`;
  }
  if (elements.negotiation.momentumTitle) {
    elements.negotiation.momentumTitle.textContent = `${label} Economic Momentum`;
  }
  await refreshDashboard(countryCode, label);
};

const setupCountrySelector = async () => {
  initMap();
  await populateCountries();
  if (!elements.countrySelect) return;
  elements.countrySelect.addEventListener("change", (event) => {
    updateCountry(event.target.value);
  });
  updateCountry(elements.countrySelect.value || defaultCountryCode);
};

setupCountrySelector();
