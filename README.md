

# 🌦️ Projeto Clima - Weather App

Aplicação web de previsão do tempo que consome a API da Open-Meteo para exibir dados meteorológicos em tempo real, com interface dinâmica e testes automatizados.

---

## 🚀 Tecnologias Utilizadas

- JavaScript (Vanilla)
- HTML5 + CSS3
- API: Open-Meteo
- Jest (Testes automatizados)

---

## ✨ Funcionalidades

- 🔎 Busca de clima por cidade
- 🌡️ Exibição de temperatura atual
- 💨 Velocidade e direção do vento
- 🧭 Direção cardinal automática
- 🕒 Data e hora formatadas
- 🌤️ Ícones dinâmicos do clima
- 🎨 Alteração de fundo conforme clima (dia/noite)
- 🌧️ Animações reais (chuva e tempestade)
- ⚠️ Tratamento de erros (cidade inválida, falha de API, etc.)

---

## 🧪 Testes Automatizados

Testes unitários implementados com Jest cobrindo:

### ✅ Testes Básicos
- Cidade válida retorna dados meteorológicos
- Cidade inexistente lança erro tratado
- Entrada vazia retorna erro de validação
- Falha da API retorna erro adequado

### ⚠️ Casos Extremos
- Limite de requisições da API excedido
- Rede lenta/instável
- Mudança inesperada no formato da resposta

---

## 📂 Estrutura do Projeto
projeto_clima/
│
├── assets/
│ ├── css/
│ └── js/
│ └── api.js
│
├── tests/
│ └── api.test.js
│
├── index.html
├── package.json
└── README.md


---

## ▶️ Como Executar o Projeto

### 1️⃣ Clonar repositório

```bash
git clone https://github.com/seu-usuario/seu-repo.git
2️⃣ Instalar dependências
npm install
3️⃣ Rodar os testes
npm test
4️⃣ Rodar o projeto
Abra o arquivo:

index.html
no navegador.

🌐 API Utilizada
https://open-meteo.com/

📌 Aprendizados
Este projeto demonstra:

Consumo de APIs externas

Manipulação de DOM

Tratamento de erros assíncronos

Separação entre lógica e interface

Criação de testes automatizados com Jest

👨‍💻 Autor
Desenvolvido por Wallace
