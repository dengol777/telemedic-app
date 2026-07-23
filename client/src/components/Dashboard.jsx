import React, { useState, useEffect } from 'react';
import { fetchOrganizations, fetchDrivers, fetchCheckups } from '../api';
import CheckupModal from './CheckupModal';

const Dashboard = ({ token, onLogout }) => {
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState('');
  const [drivers, setDrivers] = useState([]);
  const [checkups, setCheckups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCheckup, setSelectedCheckup] = useState(null);

  const today = new Date().toISOString().split('T')[0];
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);

  useEffect(() => {
    const loadOrgs = async () => {
      try {
        const data = await fetchOrganizations(token);
        setOrganizations(data);
        if (data.length > 0) setSelectedOrg(data[0].id.toString());
      } catch (err) {
        if (err.message.includes('401')) {
          alert('Сессия истекла. Войдите заново.');
          onLogout();
        } else {
          alert('Не удалось загрузить организации: ' + err.message);
        }
      }
    };
    loadOrgs();
  }, [token, onLogout]);

  useEffect(() => {
    if (!selectedOrg) return;
    const loadDrivers = async () => {
      try {
        const data = await fetchDrivers(selectedOrg, token);
        setDrivers(data);
      } catch (err) {
        console.error('Ошибка загрузки водителей:', err);
      }
    };
    loadDrivers();
  }, [selectedOrg, token]);

  const loadCheckups = async () => {
    if (!selectedOrg) return;
    setLoading(true);
    try {
      const data = await fetchCheckups(selectedOrg, fromDate, toDate, token);
      setCheckups(data);
    } catch (err) {
      alert('Ошибка загрузки осмотров: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getDriverStatusMap = () => {
    const map = new Map();
    checkups.forEach(c => {
      const key = c.driver?.tab_num;
      if (!key) return;
      map.set(key, c);
    });
    return map;
  };
  const statusMap = getDriverStatusMap();

  const getStatusBadge = (approved) => {
    if (approved === true) return <span className="status-badge status-approved">Допущен</span>;
    if (approved === false) return <span className="status-badge status-rejected">Недопуск</span>;
    return <span className="status-badge status-unknown">Ожидает</span>;
  };

  return (
    <div className="container">
      <div className="flex-row" style={{ justifyContent: 'space-between', marginBottom: '16px' }}>
        <h1>🚛 Контроль предрейсовых осмотров</h1>
        <button className="btn-outline" onClick={onLogout}>Выйти</button>
      </div>

      <div className="card">
        <div className="flex-row">
          <div>
            <label>Организация</label>
            <select value={selectedOrg} onChange={(e) => setSelectedOrg(e.target.value)}>
              {organizations.map(org => (
                <option key={org.id} value={org.id}>{org.name} (ИНН {org.itn})</option>
              ))}
            </select>
          </div>
          <div>
            <label>Дата с (from)</label>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </div>
          <div>
            <label>Дата по (to)</label>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </div>
          <div>
            <button onClick={loadCheckups} disabled={loading}>
              {loading ? 'Загрузка...' : 'Показать осмотры'}
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '16px' }}>Статус водителей</h3>
        {drivers.length === 0 && <p style={{ color: '#94a3b8' }}>Нет водителей в этой организации.</p>}
        
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Таб. номер</th>
                <th>ФИО</th>
                <th>Дата/время осмотра</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map(driver => {
                const checkup = statusMap.get(driver.tab_num);
                const mc = checkup?.mc || {};
                return (
                  <tr key={driver.tab_num}>
                    <td>{driver.tab_num}</td>
                    <td>{driver.last_name} {driver.first_name} {driver.middle_name}</td>
                    <td>
                      {checkup ? `${mc.date || ''} ${mc.stime || ''}` : '—'}
                    </td>
                    <td>{getStatusBadge(mc.approved)}</td>
                    <td>
                      {checkup ? (
                        <button onClick={() => setSelectedCheckup(checkup)} style={{ padding: '4px 12px', fontSize: '13px' }}>
                          Детали
                        </button>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '14px' }}>Нет данных</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedCheckup && (
        <CheckupModal checkup={selectedCheckup} onClose={() => setSelectedCheckup(null)} />
      )}
    </div>
  );
};

export default Dashboard;
