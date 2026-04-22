/**
 * Pix Payload Generator (Static)
 * Based on EMV Co standards
 */

export function generatePixPayload(key: string, merchantName: string = 'LUAN E LAIS', city: string = 'SAO PAULO'): string {
  try {
    let cleanKey = key.trim();

    if (cleanKey.includes('@')) {
      // E-mail: mantém como está
    } else if (/^\+/.test(cleanKey) || /^\d{10,11}$/.test(cleanKey.replace(/\D/g, ''))) {
      // Celular: garante formato +55DDDXXXXXXXXX
      const digits = cleanKey.replace(/\D/g, '');
      if (digits.length === 11) {
        cleanKey = '+55' + digits;
      } else if (digits.length === 13 && digits.startsWith('55')) {
        cleanKey = '+' + digits;
      } else if (digits.length === 10) {
        cleanKey = '+55' + digits;
      } else {
        cleanKey = cleanKey.replace(/[^\d+]/g, '');
      }
    } else {
      // CPF / CNPJ / Chave aleatória
      cleanKey = cleanKey.replace(/[^\w]/g, '');
    }

    const cleanName = merchantName.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().substring(0, 25);
    const cleanCity = city.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().substring(0, 15);

    const getTag = (id: string, value: string) => {
      const len = new TextEncoder().encode(value).length;
      return id + String(len).padStart(2, '0') + value;
    };

    const sub26_00 = getTag('00', 'br.gov.bcb.pix');
    const sub26_01 = getTag('01', cleanKey);
    const tag26 = getTag('26', sub26_00 + sub26_01);

    const sections = [
      '000201',
      tag26,
      '52040000',
      '5303986',
      '5802BR',
      getTag('59', cleanName),
      getTag('60', cleanCity),
      '6304',
    ];

    const payload = sections.join('');
    return payload + crc16ccitt(payload);
  } catch (err) {
    console.error('[Pix] Erro ao gerar payload:', err);
    return '';
  }
}

function crc16ccitt(str: string): string {
  let crc = 0xFFFF;
  const data = new TextEncoder().encode(str);
  
  for (let i = 0; i < data.length; i++) {
    crc ^= (data[i] << 8);
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc <<= 1;
      }
    }
  }
  return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
}

/**
 * Input Masking
 */
export function maskPixKey(value: string, type: string): string {
  const cleanValue = value.replace(/\D/g, '');
  
  if (type === 'cpf') {
    return cleanValue
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
      .substring(0, 14);
  }
  
  if (type === 'cnpj') {
    return cleanValue
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{1,2})$/, '$1-$2')
      .substring(0, 18);
  }

  if (type === 'cell' || type === 'phone') {
    return maskPhone(value);
  }
  
  return value;
}

export function maskPhone(value: string): string {
  const cleanValue = value.replace(/\D/g, '');
  return cleanValue
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d{4})$/, '$1-$2')
    .substring(0, 15);
}

export function unmaskValue(value: string): string {
  return value.replace(/[^\w\s@.]/g, '').replace(/\s/g, '');
}

export function maskCurrency(value: string): string {
  const cleanValue = value.replace(/\D/g, '');
  if (!cleanValue) return '';
  const amount = (Number(cleanValue) / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return amount;
}

export function parseCurrency(value: string): number {
  const cleanValue = value.replace(/\./g, '').replace(',', '.');
  return Number(cleanValue) || 0;
}
