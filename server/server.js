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

// Храним JWT токен в памяти (при перезапуске сервера нужно будет залогиниться заново)
let jwtToken = null;

// ---------- ЛОГИН ----------
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Требуются логин и пароль' });
  }

  try {
    const authHeader = 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64');
    const response = await axios.get(`${API_BASE}/token`, {
      headers: { Authorization: authHeader },
    });

    // Внешнее API возвращает токен как plain text
    jwtToken = response.data;
    res.json({ token: jwtToken });
  } catch (error) {
    console.error('Ошибка авторизации:', error.message);
    res.status(401).json({ error: 'Неверный логин или пароль' });
  }
});

// ---------- ПРОКСИ-ЗАПРОСЫ (все автоматически добавляют JWT) ----------
const proxyRequest = async (req, res, endpoint, params = {}) => {
  if (!jwtToken) {
    return res.status(401).json({ error: 'Не авторизован. Выполните вход.' });
  }

  try {
    const url = `${API_BASE}${endpoint}`;
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${jwtToken}` },
      params,
    });
    res.json(response.data);
  } catch (error) {
    // Если токен умер — возвращаем 401, чтобы фронт разлогинил пользователя
    if (error.response?.status === 401) {
      jwtToken = null;
      return res.status(401).json({ error: 'Сессия истекла. Войдите заново.' });
    }
    console.error(`Ошибка прокси ${endpoint}:`, error.message);
    const status = error.response?.status || 500;
    res.status(status).json({ error: error.response?.data || 'Ошибка сервера' });
  }
};

// Список организаций
app.get('/api/organizations', (req, res) => proxyRequest(req, res, '/organizations'));

// Список водителей по организации
app.get('/api/organizations/:id/drivers', (req, res) => {
  const { id } = req.params;
  proxyRequest(req, res, `/organization/${id}/drivers`);
});

// Список медосмотров организации за период (from, to)
app.get('/api/organizations/:id/checkups', (req, res) => {
  const { id } = req.params;
  const { from, to } = req.query;
  if (!from || !to) {
    return res.status(400).json({ error: 'Параметры from и to обязательны' });
  }
  proxyRequest(req, res, `/organization/${id}/checkups`, { from, to });
});

// История осмотров (фильтр по ИНН и табельному номеру)
app.get('/api/checkups/history', (req, res) => {
  const { itn, tab_num, from, to } = req.query;
  const params = {};
  if (itn) params.itn = itn;
  if (tab_num) params.tab_num = tab_num;
  if (from) params.from = from;
  if (to) params.to = to;
  proxyRequest(req, res, '/checkups', params);
});

// ---------- ЗАПУСК ----------
app.listen(PORT, () => {
  console.log(`✅ Прокси-сервер запущен на http://localhost:${PORT}`);
});
