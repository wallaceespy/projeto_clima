global.fetch = jest.fn();


const { buscarClima } = require("../assets/js/api.js");

global.fetch = jest.fn();

// ================================
// ✅ 1. CIDADE VÁLIDA
// ================================
test("Cidade válida retorna dados", async () => {
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      results: [{
        latitude: -22.9,
        longitude: -43.2,
        name: "Rio de Janeiro",
        country: "Brasil"
      }]
    })
  });

  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      current_weather: {
        temperature: 30,
        windspeed: 10,
        winddirection: 90,
        weathercode: 0,
        is_day: 1,
        time: "2025-10-13T10:00"
      }
    })
  });

  await expect(buscarClima("Rio")).resolves.not.toThrow();
});

// ================================
// ❌ 2. CIDADE INVÁLIDA
// ================================
test("Cidade inexistente lança erro", async () => {
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ results: [] })
  });

  await expect(buscarClima("xxxxx"))
    .rejects
    .toThrow("Cidade não encontrada");
});

// ================================
// ⚠️ 3. ENTRADA VAZIA
// ================================
test("Entrada vazia retorna erro", async () => {
  await expect(buscarClima(""))
    .rejects
    .toThrow("Digite o nome de uma cidade");
});

// ================================
// 🚨 4. FALHA NA API
// ================================
test("Erro na API", async () => {
  fetch.mockResolvedValueOnce({ ok: false });

  await expect(buscarClima("Rio"))
    .rejects
    .toThrow("Erro na API");
});

// ================================
// 🔥 CASOS EXTREMOS
// ================================

// 🚫 LIMITE EXCEDIDO
test("Limite da API excedido", async () => {
  fetch.mockResolvedValueOnce({
    ok: false,
    status: 429
  });

  await expect(buscarClima("Rio"))
    .rejects
    .toThrow();
});

// 🌐 REDE LENTA
test("Rede lenta", async () => {
  fetch.mockImplementationOnce(() =>
    new Promise(resolve =>
      setTimeout(() => resolve({
        ok: true,
        json: async () => ({ results: [] })
      }), 2000)
    )
  );

  await expect(buscarClima("Rio"))
    .rejects
    .toThrow();
});

// 🧩 JSON INESPERADO
test("Formato inesperado da API", async () => {
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({})
  });

  await expect(buscarClima("Rio"))
    .rejects
    .toThrow();
});

