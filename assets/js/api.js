// ================================
// 🌍 CONFIG API (Open-Meteo)
// ================================
const GEO_URL = "https://geocoding-api.open-meteo.com/v1/search";
const WEATHER_URL = "https://api.open-meteo.com/v1/forecast";

// ================================
// 🔎 BUSCAR DADOS (API)
// ================================
async function buscarClima(cidadeParam) {
  if (!cidadeParam) {
    throw new Error("Digite o nome de uma cidade");
  }

  const geoResponse = await fetch(
    `${GEO_URL}?name=${cidadeParam}&count=1&language=pt&format=json`
  );

  if (!geoResponse.ok) {
    throw new Error("Erro na API de localização");
  }

  const geoData = await geoResponse.json();

  if (!geoData.results || geoData.results.length === 0) {
    throw new Error("Cidade não encontrada");
  }

  const { latitude, longitude, name, country, elevation } = geoData.results[0];

  const weatherResponse = await fetch(
    `${WEATHER_URL}?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`
  );

  if (!weatherResponse.ok) {
    throw new Error("Erro na API de clima");
  }

  const weatherData = await weatherResponse.json();

  return {
    cidade: `${name}, ${country}`,
    elevation,
    atual: weatherData.current_weather,
    diaria: weatherData.daily
  };
}

// ================================
// 🚀 CONTROLE PRINCIPAL
// ================================
async function executarBusca(cidade) {
  try {
    mostrarLoading(true);
    esconderErro();
    esconderResultado();

    const dados = await buscarClima(cidade);

    atualizarTela({
      cidade: dados.cidade,
      temperatura: dados.atual.temperature,
      vento: dados.atual.windspeed,
      direcao: getDirecaoCardinal(dados.atual.winddirection),
      elevation: dados.elevation,
      horario: dados.atual.time,
      weathercode: dados.atual.weathercode,
      isDay: dados.atual.is_day
    });

    mostrarPrevisao(dados.diaria);

  } catch (error) {
    mostrarErro(error.message || "Erro inesperado.");
  } finally {
    mostrarLoading(false);
  }
}

// ================================
// 📅 PREVISÃO 5 DIAS
// ================================
function mostrarPrevisao(daily) {
  const container = document.getElementById("previsaoDias");
  if (!container || !daily) return;

  container.innerHTML = "";

  const dias = daily.time || [];
  const max = daily.temperature_2m_max || [];
  const min = daily.temperature_2m_min || [];
  const codes = daily.weathercode || [];

  const total = Math.min(5, dias.length);

  for (let i = 0; i < total; i++) {
    const data = new Date(dias[i]).toLocaleDateString("pt-BR", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit"
    });

    const desc = getDescricaoClima(codes[i]);

    const card = document.createElement("div");
    card.classList.add("card-dia");

    card.innerHTML = `
      <p><strong>${data}</strong></p>
      <i class="wi ${desc.icon}" style="font-size: 24px; margin: 5px 0;"></i>
      <p>${desc.texto}</p>
      <p>🌡️ ${Math.round(max[i])}°C</p>
      <p>❄️ ${Math.round(min[i])}°C</p>
    `;

    container.appendChild(card);
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

  document.getElementById("weatherTime").textContent = formatarDataCompleta(data.horario);

  const desc = getDescricaoClima(data.weathercode);

  document.getElementById("weatherDesc").textContent = desc.texto;
  document.getElementById("weatherEmoji").innerHTML = `<i class="wi ${desc.icon}"></i>`;

  alterarFundo(data.weathercode, data.isDay);

  mostrarResultado();
}

// ================================
// 🌤️ DESCRIÇÃO + ÍCONES (COMPLETO)
// ================================
function getDescricaoClima(code) {
  const mapa = {
    0: { texto: "Céu limpo", icon: "wi-day-sunny" },
    1: { texto: "Poucas nuvens", icon: "wi-day-cloudy" },
    2: { texto: "Parcialmente nublado", icon: "wi-cloud" },
    3: { texto: "Nublado", icon: "wi-cloudy" },

    45: { texto: "Nevoeiro", icon: "wi-fog" },
    48: { texto: "Nevoeiro com gelo", icon: "wi-fog" },

    51: { texto: "Garoa leve", icon: "wi-sprinkle" },
    53: { texto: "Garoa", icon: "wi-sprinkle" },
    55: { texto: "Garoa forte", icon: "wi-sprinkle" },

    61: { texto: "Chuva leve", icon: "wi-rain" },
    63: { texto: "Chuva", icon: "wi-rain" },
    65: { texto: "Chuva forte", icon: "wi-rain" },

    71: { texto: "Neve leve", icon: "wi-snow" },
    73: { texto: "Neve", icon: "wi-snow" },
    75: { texto: "Neve forte", icon: "wi-snow" },

    80: { texto: "Pancadas de chuva", icon: "wi-showers" },
    81: { texto: "Pancadas moderadas", icon: "wi-showers" },
    82: { texto: "Pancadas fortes", icon: "wi-showers" },

    95: { texto: "Tempestade", icon: "wi-thunderstorm" },
    96: { texto: "Tempestade com granizo", icon: "wi-thunderstorm" },
    99: { texto: "Tempestade forte", icon: "wi-thunderstorm" }
  };

  return mapa[code] || { texto: "Clima desconhecido", icon: "wi-na" };
}

// ================================
// 🕒 DATA FORMATADA
// ================================
function formatarDataCompleta(horaISO) {
  return new Date(horaISO).toLocaleDateString("pt-BR", {
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
  removerAnimacoes();
  document.body.classList.remove("chuva");

  const chuvaCodes = [51,53,55,61,63,65,80,81,82];

  if (chuvaCodes.includes(code)) {
    document.body.style.background =
      "linear-gradient(135deg, #5f6c7b, #3a3f47)";
    document.body.classList.add("chuva");
    criarChuva();
    return;
  }

  if (code >= 95) {
    document.body.style.background =
      "linear-gradient(135deg, #2c3e50, #000000)";
    criarTempestade();
    return;
  }

  if (isDay) {
    document.body.style.background =
      "linear-gradient(135deg, #4facfe, #00f2fe)";
  } else {
    document.body.style.background =
      "linear-gradient(135deg, #0f2027, #203a43, #2c5364)";
  }
}

// ================================
// 🌧️ CHUVA
// ================================
function criarChuva() {
  const chuva = document.createElement("div");
  chuva.classList.add("rain");

  for (let i = 0; i < 120; i++) {
    const drop = document.createElement("div");
    drop.classList.add("drop");
    drop.style.left = Math.random() * 100 + "vw";
    drop.style.animationDuration = (0.4 + Math.random()) + "s";
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
// 🎛️ CONTROLE UI
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

// ================================
// 📦 EXPORT
// ================================
if (typeof module !== "undefined") {
  module.exports = {
    buscarClima,
    getDirecaoCardinal,
    formatarDataCompleta,
    getDescricaoClima
  };
}