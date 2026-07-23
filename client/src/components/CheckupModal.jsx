import React from 'react';

const CheckupModal = ({ checkup, onClose }) => {
  if (!checkup) return null;
  const mc = checkup.mc || {};

  const getStatus = (approved) => {
    if (approved === true) return { label: 'Допущен', cls: 'status-approved' };
    if (approved === false) return { label: 'НЕ ДОПУЩЕН', cls: 'status-rejected' };
    return { label: 'Ожидание', cls: 'status-unknown' };
  };
  const status = getStatus(mc.approved);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>Детали осмотра</h2>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <div style={{ fontWeight: '500' }}>
              {checkup.driver?.last_name} {checkup.driver?.first_name} {checkup.driver?.middle_name}
            </div>
            <div style={{ fontSize: '14px', color: '#64748b' }}>
              Таб. №{checkup.driver?.tab_num}
            </div>
          </div>
          <span className={`status-badge ${status.cls}`}>{status.label}</span>
        </div>

        <div className="metric-grid">
          <div className="metric-item">
            <div className="label">Дата</div>
            <div className="value">{mc.date || '—'}</div>
          </div>
          <div className="metric-item">
            <div className="label">Время</div>
            <div className="value">{mc.stime || '—'}</div>
          </div>
          <div className="metric-item">
            <div className="label">Терминал</div>
            <div className="value">{mc.tname || '—'}</div>
          </div>
          <div className="metric-item">
            <div className="label">Тип</div>
            <div className="value">{mc.type === 'before' ? 'Предрейсовый' : 'Послерейсовый'}</div>
          </div>
          <div className="metric-item">
            <div className="label">Давление (А/В)</div>
            <div className="value">{mc.apress || '—'} / {mc.vpress || '—'}</div>
          </div>
          <div className="metric-item">
            <div className="label">Пульс</div>
            <div className="value">{mc.pulse || '—'}</div>
          </div>
          <div className="metric-item">
            <div className="label">Алкоголь</div>
            <div className="value">{mc.alc || '—'}</div>
          </div>
          <div className="metric-item">
            <div className="label">Температура</div>
            <div className="value">{mc.temp || '—'}</div>
          </div>
        </div>

        {mc.rejection_reasons && (
          <div style={{ marginTop: '12px', padding: '12px', background: '#fef2f2', borderRadius: '8px', color: '#991b1b' }}>
            <strong>Причина недопуска:</strong> {mc.rejection_reasons}
          </div>
        )}

        {mc.photo && (
          <div style={{ marginTop: '12px' }}>
            <div style={{ fontWeight: '500', marginBottom: '6px' }}>Фото осмотра:</div>
            <div className="media-preview">
              <img src={mc.photo} alt="Фото осмотра" />
            </div>
          </div>
        )}
        {mc.video && (
          <div style={{ marginTop: '12px' }}>
            <div style={{ fontWeight: '500', marginBottom: '6px' }}>Видео осмотра:</div>
            <div className="media-preview">
              <video controls src={mc.video} />
            </div>
          </div>
        )}

        <div style={{ marginTop: '20px', fontSize: '13px', color: '#94a3b8' }}>
          Медик: {checkup.medic?.lname} {checkup.medic?.fname}
        </div>
      </div>
    </div>
  );
};

export default CheckupModal;
