// ================================
// 🌍 CONFIG API (Open-Meteo)
// ================================
const GEO_URL = "https://geocoding-api.open-meteo.com/v1/search";
const WEATHER_URL = "https://api.open-meteo.com/v1/forecast";

// ================================
// 🔎 FUNÇÃO PRINCIPAL
// ================================
async function buscarClima() {
  const cidade = document.getElementById("cityInput").value;

  if (!cidade) return;

  mostrarLoading(true);
  esconderErro();
  esconderResultado();

  try {
    // 1️⃣ Buscar coordenadas
    const geoRes = await fetch(`${GEO_URL}?name=${cidade}&count=1&language=pt&format=json`);
    const geoData = await geoRes.json();

    if (!geoData.results) {
      throw new Error("Cidade não encontrada");
    }

    const { latitude, longitude, name, country, elevation } = geoData.results[0];

    // 2️⃣ Buscar clima
    const weatherRes = await fetch(
      `${WEATHER_URL}?latitude=${latitude}&longitude=${longitude}&current_weather=true`
    );

    const weatherData = await weatherRes.json();
    const clima = weatherData.current_weather;

    // 3️⃣ Atualizar UI
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

  } catch (error) {
    mostrarErro(error.message);
  } finally {
    mostrarLoading(false);
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
  document.getElementById("weatherTime").textContent = formatarHora(data.horario);

  const desc = getDescricaoClima(data.weathercode);
  document.getElementById("weatherDesc").textContent = desc.texto;
  document.getElementById("weatherEmoji").textContent = desc.emoji;

  alterarFundo(data.weathercode, data.isDay);

  mostrarResultado();
}

// ================================
// 🌤️ DESCRIÇÃO DO CLIMA
// ================================
function getDescricaoClima(code) {
  const mapa = {
    0: { texto: "Céu limpo", emoji: "☀️" },
    1: { texto: "Poucas nuvens", emoji: "🌤️" },
    2: { texto: "Parcialmente nublado", emoji: "⛅" },
    3: { texto: "Nublado", emoji: "☁️" },
    45: { texto: "Nevoeiro", emoji: "🌫️" },
    48: { texto: "Nevoeiro denso", emoji: "🌫️" },
    51: { texto: "Garoa", emoji: "🌦️" },
    61: { texto: "Chuva", emoji: "🌧️" },
    71: { texto: "Neve", emoji: "❄️" },
    95: { texto: "Tempestade", emoji: "⛈️" }
  };

  return mapa[code] || { texto: "Clima desconhecido", emoji: "❓" };
}

// ================================
// 🎨 FUNDO DINÂMICO + ANIMAÇÃO
// ================================
function alterarFundo(code, isDay) {
  const body = document.body;

  // remove classes antigas
  body.className = "";

  // remove efeitos antigos
  removerAnimacoes();

  if (code === 0 && isDay) {
    body.style.background = "linear-gradient(135deg, #4facfe, #00f2fe)";
  } 
  else if (code === 0 && !isDay) {
    body.style.background = "linear-gradient(135deg, #0f2027, #203a43, #2c5364)";
  } 
  else if ([1,2,3].includes(code)) {
    body.style.background = "linear-gradient(135deg, #bdc3c7, #2c3e50)";
  } 
  else if ([51,61].includes(code)) {
    criarChuva();
    body.style.background = "linear-gradient(135deg, #2c3e50, #4ca1af)";
  } 
  else if (code >= 95) {
    criarTempestade();
    body.style.background = "linear-gradient(135deg, #232526, #414345)";
  }
}

// ================================
// 🌧️ ANIMAÇÃO DE CHUVA REAL
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
// 🧹 REMOVER ANIMAÇÕES
// ================================
function removerAnimacoes() {
  document.querySelectorAll(".rain, .lightning").forEach(el => el.remove());
}

// ================================
// ⏱️ FORMATAR HORA
// ================================
function formatarHora(horaISO) {
  const data = new Date(horaISO);
  return data.toLocaleString("pt-BR");
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