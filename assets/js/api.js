// ================================
// 🌍 CONFIG API (Open-Meteo)
// ================================
const GEO_URL = "https://geocoding-api.open-meteo.com/v1/search";
const WEATHER_URL = "https://api.open-meteo.com/v1/forecast";

// ================================
// 🔎 FUNÇÃO PRINCIPAL
// ================================
async function buscarClima(cidadeParam) {
 const cidade = cidadeParam;

if (!cidade) {
  throw new Error("Digite o nome de uma cidade");
}

 if (typeof document !== "undefined") {
  mostrarLoading(true);
  esconderErro();
  esconderResultado();
}

  try {
    // 1️⃣ GEOLOCALIZAÇÃO
    const geoRes = await fetch(`${GEO_URL}?name=${cidade}&count=1&language=pt&format=json`);

    if (!geoRes.ok) throw new Error("Erro na API de localização.");

    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
      throw new Error("Cidade não encontrada.");
    }

    const { latitude, longitude, name, country, elevation } = geoData.results[0];

    // 2️⃣ CLIMA
    const weatherRes = await fetch(
      `${WEATHER_URL}?latitude=${latitude}&longitude=${longitude}&current_weather=true`
    );

    if (!weatherRes.ok) throw new Error("Erro na API de clima.");

    const weatherData = await weatherRes.json();

    if (!weatherData.current_weather) {
      throw new Error("Dados climáticos indisponíveis.");
    }

    const clima = weatherData.current_weather;

    // 3️⃣ ATUALIZAÇÃO
if (typeof document !== "undefined") {
  atualizarTela({
    cidade: `${name}, ${country}`,
    temperatura: clima.temperature,
    vento: clima.windspeed,
    direcao: getDirecaoCardinal(clima.winddirection),
    elevation: elevation,
    horario: clima.time,
    weathercode: clima.weathercode,
    isDay: clima.is_day
  });
}

} catch (error) {
  if (typeof document !== "undefined") {
    mostrarErro(error.message || "Erro inesperado.");
  }
  throw error; // 🔥 MUITO IMPORTANTE
} finally {
  if (typeof document !== "undefined") {
    mostrarLoading(false);
  }
}
} 

// ================================
// 🧭 DIREÇÃO DO VENTO
// ================================
function getDirecaoCardinal(grau) {
  const direcoes = ["N", "NE", "L", "SE", "S", "SO", "O", "NO"];
  return direcoes[Math.round(grau / 45) % 8];
}

// ================================
// 🎨 ATUALIZAR TELA
// ================================
function atualizarTela(data) {
  document.getElementById("cityName").textContent = data.cidade;
  document.getElementById("temperature").textContent = Math.round(data.temperatura);
  document.getElementById("windspeed").textContent = data.vento + " km/h";
  document.getElementById("winddirection").textContent = data.direcao;
  document.getElementById("elevation").textContent = data.elevation + " m";

  // 🕒 DATA COMPLETA
  document.getElementById("weatherTime").textContent = formatarDataCompleta(data.horario);

  const desc = getDescricaoClima(data.weathercode);

  document.getElementById("weatherDesc").textContent = desc.texto;

  // 🌤️ WEATHER ICONS
  const icon = document.getElementById("weatherEmoji");
  icon.innerHTML = `<i class="wi ${desc.icon}"></i>`;

  // 🎨 FUNDO + ANIMAÇÃO
  alterarFundo(data.weathercode, data.isDay);

  mostrarResultado();
}

// ================================
// 🌤️ DESCRIÇÃO + ÍCONES
// ================================
function getDescricaoClima(code) {
  const mapa = {
    0: { texto: "Céu limpo", icon: "wi-day-sunny" },
    1: { texto: "Poucas nuvens", icon: "wi-day-cloudy" },
    2: { texto: "Parcialmente nublado", icon: "wi-cloud" },
    3: { texto: "Nublado", icon: "wi-cloudy" },
    45: { texto: "Nevoeiro", icon: "wi-fog" },
    51: { texto: "Garoa", icon: "wi-sprinkle" },
    61: { texto: "Chuva", icon: "wi-rain" },
    71: { texto: "Neve", icon: "wi-snow" },
    95: { texto: "Tempestade", icon: "wi-thunderstorm" }
  };

  return mapa[code] || { texto: "Clima desconhecido", icon: "wi-na" };
}

// ================================
// 🕒 DATA COMPLETA FORMATADA
// ================================
function formatarDataCompleta(horaISO) {
  const data = new Date(horaISO);

  return data.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

// ================================
// 🎨 FUNDO + ANIMAÇÃO
// ================================
function alterarFundo(code, isDay) {
  const body = document.body;

  removerAnimacoes();

  // 🌞 DIA / 🌙 NOITE
  if (isDay) {
    body.style.background = "linear-gradient(135deg, #4facfe, #00f2fe)";
  } else {
    body.style.background = "linear-gradient(135deg, #0f2027, #203a43, #2c5364)";
  }

  // 🌧️ CHUVA
  if ([51, 61].includes(code)) {
    criarChuva();
  }

  // ⛈️ TEMPESTADE
  if (code >= 95) {
    criarTempestade();
  }
}

// ================================
// 🌧️ ANIMAÇÃO DE CHUVA
// ================================
function criarChuva() {
  const chuva = document.createElement("div");
  chuva.classList.add("rain");

  for (let i = 0; i < 100; i++) {
    const drop = document.createElement("div");
    drop.classList.add("drop");
    drop.style.left = Math.random() * 100 + "vw";
    drop.style.animationDuration = (0.5 + Math.random()) + "s";
    chuva.appendChild(drop);
  }

  document.body.appendChild(chuva);
}

// ================================
// ⛈️ TEMPESTADE
// ================================
function criarTempestade() {
  criarChuva();

  const flash = document.createElement("div");
  flash.classList.add("lightning");
  document.body.appendChild(flash);
}

// ================================
// 🧹 LIMPAR ANIMAÇÕES
// ================================
function removerAnimacoes() {
  document.querySelectorAll(".rain, .lightning").forEach(el => el.remove());
}

// ================================
// 🎛️ UI CONTROLE
// ================================
function mostrarLoading(show) {
  document.getElementById("loading").classList.toggle("hidden", !show);
}

function mostrarResultado() {
  document.getElementById("weatherResult").classList.remove("hidden");
}

function esconderResultado() {
  document.getElementById("weatherResult").classList.add("hidden");
}

function mostrarErro(msg) {
  document.getElementById("errorText").textContent = msg;
  document.getElementById("errorMsg").classList.remove("hidden");
}

function esconderErro() {
  document.getElementById("errorMsg").classList.add("hidden");
}

module.exports = {
  buscarClima,
  getDirecaoCardinal,
  formatarDataCompleta,
  getDescricaoClima
};