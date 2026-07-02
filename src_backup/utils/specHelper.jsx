import React from 'react';

// ============================================================================
// HELPERS CHO SPECIFICATIONS
// ============================================================================

export const resolveSpec = (key) => {
  const k = (key || '').toLowerCase();
  if (k.includes('cpu') || k.includes('processor') || k.includes('vi xử lý') || k.includes('chip') || k.includes('bộ vi xử lý')) return 'cpu';
  if (k.includes('gpu') || k.includes('vga') || k.includes('card') || k.includes('graphics') || k.includes('đồ họa')) return 'gpu';
  if (k.includes('ram') || k.includes('memory') || k.includes('bộ nhớ')) return 'ram';
  if (k.includes('ổ cứng') || k.includes('ssd') || k.includes('hdd') || k.includes('storage') || k.includes('lưu trữ') || k.includes('rom')) return 'storage';
  if (k.includes('mainboard') || k.includes('bo mạch') || k.includes('motherboard')) return 'mainboard';
  if (k.includes('màn hình') || k.includes('screen') || k.includes('display') || k.includes('size') || k.includes('kích thước')) return 'screen';
  if (k.includes('nguồn') || k.includes('psu')) return 'psu';
  if (k.includes('tản nhiệt') || k.includes('cooler') || k.includes('tản')) return 'cooler';
  if (k.includes('vỏ') || k.includes('case')) return 'case';
  if (k.includes('tần số') || k.includes('hz') || k.includes('refresh') || k.includes('quét')) return 'refresh_rate';
  if (k.includes('pin') || k.includes('battery') || k.includes('dung lượng')) return 'battery';
  if (k.includes('nặng') || k.includes('trọng lượng') || k.includes('weight') || k.includes('khối lượng')) return 'weight';
  if (k.includes('cổng') || k.includes('port') || k.includes('giao tiếp') || k.includes('kết nối') || k.includes('usb') || k.includes('type-c') || k.includes('hdmi')) return 'ports';
  if (k.includes('phím') || k.includes('keyboard') || k.includes('bàn phím') || k.includes('led')) return 'keyboard';
  if (k.includes('âm thanh') || k.includes('audio') || k.includes('loa') || k.includes('speaker') || k.includes('sound')) return 'audio';
  if (k.includes('màu') || k.includes('color')) return 'color';
  if (k.includes('os') || k.includes('hệ điều hành') || k.includes('windows') || k.includes('linux')) return 'os';
  if (k.includes('bảo hành') || k.includes('warranty')) return 'warranty';
  
  return 'other';
};

export const shortValue = (val, type) => {
  if (!val) return '';
  if (type === 'cpu') {
    let m = val.match(/(i\d\s*-?\s*\d+[a-zA-Z]*|r\d\s*-?\s*\d+[a-zA-Z]*|ultra\s*\d\s*\d+[a-zA-Z]*|Ryzen\s*(?:AI)?\s*\d+\s*[a-zA-Z0-9]+)/i);
    if (m) {
      return m[0].replace(/r/i, 'R').replace(/i/i, 'i').replace(/ultra/i, 'Ultra').replace(/\s*-\s*/, ' ').trim();
    }
    let clean = val.split(/[\(\,\/]/)[0];
    clean = clean.replace(/bộ vi xử lý|intel|amd|processor|®|™/gi, '').trim().replace(/\s{2,}/g, ' ');
    clean = clean.replace(/Ryzen\s*(?=\d)/gi, 'R');
    clean = clean.replace(/Core\s*i/gi, 'i');
    clean = clean.replace(/Core\s*Ultra\s*/gi, 'Ultra ');
    return clean || val;
  }
  if (type === 'gpu') {
    let m = val.match(/(RTX\s*\d+[a-zA-Z]*|GTX\s*\d+[a-zA-Z]*|RX\s*\d+\s*[a-zA-Z]*|Arc\s*[a-zA-Z0-9]+)/i);
    if (m) {
      return m[0].toUpperCase().replace(/\s+/g, ' ').trim();
    }
    let clean = val.split(/[\(\,\/]|with/i)[0];
    clean = clean.replace(/card màn hình|nvidia|geforce|amd|radeon|graphics|laptop gpu|®|™/gi, '').trim().replace(/\s{2,}/g, ' ');
    clean = clean.replace(/(gddr|vram).*/i, '').trim();
    clean = clean.replace(/\d+\s*gb/i, '').trim();
    return clean || val;
  }
  if (type === 'mainboard') {
    let m = val.match(/(H\d{3}|B\d{3}|Z\d{3}|X\d{3}|A\d{3})[a-zA-Z]*/i);
    if (m) {
      return m[0].toUpperCase();
    }
    return val.replace(/bo mạch chủ|mainboard|motherboard/gi, '').split(/[\(\,\/]/)[0].trim().split(' ').slice(0, 2).join(' ');
  }
  if (type === 'ram' || type === 'storage') return val.match(/\d+\s*(gb|tb)/i)?.[0].toUpperCase() || val.split(/[\(\,]/)[0].trim();
  if (type === 'psu') {
    let watt = val.match(/\d{3,4}\s*W/i);
    let clean = val.replace(/nguồn máy tính|nguồn|psu|power supply/gi, '').trim().split(' ')[0];
    return watt ? `${watt[0].toUpperCase()} ${clean}` : clean;
  }
  if (type === 'case') {
    return val.replace(/vỏ máy tính|vỏ case|case/gi, '').trim().split(' ').slice(0, 2).join(' ');
  }
  if (type === 'cooler') {
    return val.replace(/tản nhiệt nước|tản nhiệt khí|tản nhiệt/gi, '').trim().split(' ').slice(0, 2).join(' ');
  }
  if (type === 'screen') return val.match(/\d+(\.\d+)?\s*(inch|")/i)?.[0] || val.split(/[\(\,]/)[0].trim();
  if (type === 'battery') {
    let clean = val.match(/\d+\s*(Wh|mAh)/i);
    if (clean) return clean[0];
    clean = val.split(/[\(\,]|adapter/i)[0];
    return clean.replace(/li-ion|battery|batter|pin/gi, '').trim();
  }
  if (type === 'weight') {
    let w = val.match(/\d+(\.\d+)?\s*(kg|g)/i);
    return w ? w[0] : val.split(/[\(\,]/)[0].trim();
  }
  if (type === 'keyboard') {
    let m = val.match(/(RGB|LED|Backlit)/i);
    return m ? `Phím ${m[0]}` : 'Bàn phím';
  }
  if (type === 'ports') {
    let p = [];
    if (/type-c|usb-c|usb c/i.test(val)) p.push('Type-C');
    if (/thunderbolt/i.test(val)) p.push('Thunderbolt');
    if (/hdmi/i.test(val)) p.push('HDMI');
    if (/lan|rj45/i.test(val)) p.push('LAN');
    return p.length ? p.join(', ') : 'Đa cổng';
  }
  if (type === 'audio') {
    let m = val.match(/\d+\s*(loa|speaker)/i);
    return m ? m[0].replace(/speaker/i, 'Loa') : 'Audio';
  }
  return val.split(/[\(\,]/)[0].trim();
};

export const parseSpecs = (specifications) => {
  if (!specifications) return [];
  
  let specsObj = specifications;
  if (typeof specifications === 'string') {
    try {
      specsObj = JSON.parse(specifications);
    } catch (e) {
      specsObj = [];
    }
  }

  let entries = [];
  const addEntry = (k, v) => {
    if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
      Object.entries(v).forEach(([subK, subV]) => {
        // Nếu subKey là size/resolution, ta có thể ghép chung hoặc tách riêng.
        // Tách riêng là tốt nhất vì resolveSpec sẽ tìm được 'screen' từ 'size' và 'refresh_rate' từ 'refresh_rate'
        addEntry(subK, subV);
      });
    } else {
      entries.push({ key: k, value: String(v || '') });
    }
  };

  if (Array.isArray(specsObj)) {
    specsObj.forEach(s => {
      const k = s.key || s.name || s.type || '';
      addEntry(k, s.value);
    });
  } else if (typeof specsObj === 'object' && specsObj !== null) {
    Object.entries(specsObj).forEach(([k, v]) => addEntry(k, v));
  }
  
  const chips = [];
  const seen = new Set();
  for (const { key, value } of entries) {
    if (!value || value === 'null') continue;
    
    const normalizedKey = key.toLowerCase().trim();
    if (!seen.has(normalizedKey)) {
      seen.add(normalizedKey);
      const type = resolveSpec(key) || 'other';
      chips.push({ type, value, short: shortValue(value, type), key });
    }
    if (chips.length >= 8) break;
  }
  return chips;
};

// ============================================================================
// COMPONENT SPEC ICON
// ============================================================================
export const SpecIcon = ({ type }) => {
  const icons = {
    cpu: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
        <rect x="9" y="9" width="6" height="6"></rect>
        <line x1="9" y1="1" x2="9" y2="4"></line>
        <line x1="15" y1="1" x2="15" y2="4"></line>
        <line x1="9" y1="20" x2="9" y2="23"></line>
        <line x1="15" y1="20" x2="15" y2="23"></line>
        <line x1="20" y1="9" x2="23" y2="9"></line>
        <line x1="20" y1="14" x2="23" y2="14"></line>
        <line x1="1" y1="9" x2="4" y2="9"></line>
        <line x1="1" y1="14" x2="4" y2="14"></line>
      </svg>
    ),
    gpu: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2"></rect>
        <path d="M6 15V9"></path>
        <path d="M10 15V9"></path>
        <path d="M14 15V9"></path>
        <path d="M18 15V9"></path>
      </svg>
    ),
    ram: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="10" rx="2"></rect>
        <path d="M6 17V7"></path>
        <path d="M10 17V7"></path>
        <path d="M14 17V7"></path>
        <path d="M18 17V7"></path>
      </svg>
    ),
    storage: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="6" width="20" height="12" rx="2"></rect>
        <circle cx="18" cy="12" r="1.5"></circle>
        <path d="M6 12H12"></path>
      </svg>
    ),
    mainboard: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <rect x="7" y="7" width="4" height="4"></rect>
        <line x1="15" y1="7" x2="17" y2="7"></line>
        <line x1="15" y1="11" x2="17" y2="11"></line>
        <line x1="7" y1="15" x2="17" y2="15"></line>
      </svg>
    ),
    screen: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2"></rect>
        <path d="M8 21H16"></path>
        <path d="M12 17V21"></path>
      </svg>
    ),
    psu: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
      </svg>
    ),
    case: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
        <rect x="8" y="6" width="8" height="12"></rect>
      </svg>
    ),
    cooler: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
        <circle cx="12" cy="12" r="4"></circle>
      </svg>
    ),
    refresh_rate: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3v3"></path>
        <path d="M18.36 5.64l-2.12 2.12"></path>
        <path d="M21 12h-3"></path>
        <path d="M18.36 18.36l-2.12-2.12"></path>
        <path d="M12 21v-3"></path>
        <path d="M5.64 18.36l2.12-2.12"></path>
        <path d="M3 12h3"></path>
        <path d="M5.64 5.64l2.12 2.12"></path>
        <circle cx="12" cy="12" r="3"></circle>
      </svg>
    ),
    battery: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="16" height="10" rx="2"></rect>
        <path d="M22 11v2"></path>
      </svg>
    ),
    weight: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9"></circle>
        <path d="M12 3v9l4 4"></path>
      </svg>
    ),
    ports: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="8" width="16" height="8" rx="2"></rect>
        <line x1="8" y1="12" x2="10" y2="12"></line>
        <line x1="14" y1="12" x2="16" y2="12"></line>
      </svg>
    ),
    keyboard: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="6" width="20" height="12" rx="2"></rect>
        <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M6 14h.01M10 14h.01M14 14h.01M18 14h.01M8 18h8"></path>
      </svg>
    ),
    audio: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14"></path>
      </svg>
    ),
    os: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"></rect>
        <rect x="14" y="3" width="7" height="7"></rect>
        <rect x="14" y="14" width="7" height="7"></rect>
        <rect x="3" y="14" width="7" height="7"></rect>
      </svg>
    ),
    color: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <circle cx="12" cy="12" r="4"></circle>
      </svg>
    ),
    warranty: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
      </svg>
    ),
    other: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    )
  };
  return icons[type] || icons['other'];
};
