import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const API_BASE = process.env.API_BASE_URL || 'https://new.tm-se.ru/external_api';

app.use(cors());
app.use(express.json());

// Прокси-запрос с передачей токена от клиента
const proxyRequest = async (req, res, endpoint, params = {}) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Токен не предоставлен' });
  }
  const token = authHeader.slice(7); // убираем "Bearer "

  try {
    const url = `${API_BASE}${endpoint}`;
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
      params,
    });
    res.json(response.data);
  } catch (error) {
    if (error.response?.status === 401) {
      return res.status(401).json({ error: 'Недействительный токен' });
    }
    console.error(`Ошибка прокси ${endpoint}:`, error.message);
    const status = error.response?.status || 500;
    res.status(status).json({ error: error.response?.data || 'Ошибка сервера' });
  }
};

// Все эндпоинты принимают токен из заголовка клиента
app.get('/api/organizations', (req, res) => proxyRequest(req, res, '/organizations'));
app.get('/api/organizations/:id/drivers', (req, res) => {
  const { id } = req.params;
  proxyRequest(req, res, `/organization/${id}/drivers`);
});
app.get('/api/organizations/:id/checkups', (req, res) => {
  const { id } = req.params;
  const { from, to } = req.query;
  if (!from || !to) {
    return res.status(400).json({ error: 'Параметры from и to обязательны' });
  }
  proxyRequest(req, res, `/organization/${id}/checkups`, { from, to });
});
app.get('/api/checkups/history', (req, res) => {
  const { itn, tab_num, from, to } = req.query;
  const params = {};
  if (itn) params.itn = itn;
  if (tab_num) params.tab_num = tab_num;
  if (from) params.from = from;
  if (to) params.to = to;
  proxyRequest(req, res, '/checkups', params);
});

// (Опционально) можно добавить проверку токена через /organizations, но фронт сам проверит

app.listen(PORT, () => {
  console.log(`✅ Прокси-сервер запущен на http://localhost:${PORT}`);
});
