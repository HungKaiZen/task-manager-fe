
// ============================
// save to memory
// reload page lost data
// Anti XSS
// ============================

const APP_KEY = "TASK_MANAGER_APP";
// namespace để tránh trùng key với website khác

const storageAvailable = (() => {
  try {
    const testKey = "__test__";
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    console.warn("⚠️ localStorage not available, fallback to memory");
    return false;
  }
})();

// fallback memory storage (khi trình duyệt chặn localStorage)
const memoryStorage = {};

/**
 * Mã hóa nhẹ để tránh đọc trộm đơn giản (NOT ENCRYPTION REAL)
 * Chỉ nhằm chống người dùng mở devtools thấy plain text
 */
function encode(data) {
  return btoa(unescape(encodeURIComponent(JSON.stringify(data))));
}

function decode(encoded) {
  return JSON.parse(decodeURIComponent(escape(atob(encoded))));
}

export const Storage = {

  /**
   * Lưu dữ liệu
   * @param {String} key
   * @param {any} value
   * @param {Number} expireSeconds (optional)
   */
  set(key, value, expireSeconds = null) {

    const record = {
      value,
      expireAt: expireSeconds
        ? Date.now() + expireSeconds * 1000
        : null,
      createdAt: Date.now()
    };

    const data = encode(record);

    const finalKey = `${APP_KEY}_${key}`;

    if (storageAvailable) {
      localStorage.setItem(finalKey, data);
    } else {
      memoryStorage[finalKey] = data;
    }

  },

  /**
   * Lấy dữ liệu
   */
  get(key) {

    const finalKey = `${APP_KEY}_${key}`;

    let raw;

    if (storageAvailable) {
      raw = localStorage.getItem(finalKey);
    } else {
      raw = memoryStorage[finalKey];
    }

    if (!raw) return null;

    try {
      const record = decode(raw);

      // kiểm tra expire
      if (record.expireAt && Date.now() > record.expireAt) {
        this.remove(key);
        return null;
      }

      return record.value;

    } catch (err) {
      console.warn("Storage corrupted:", finalKey);
      this.remove(key);
      return null;
    }

  },

  /**
   * Xóa 1 key
   */
  remove(key) {
    const finalKey = `${APP_KEY}_${key}`;

    if (storageAvailable) {
      localStorage.removeItem(finalKey);
    } else {
      delete memoryStorage[finalKey];
    }
  },

  /**
   * Clear toàn bộ storage của app
   */
  clearAll() {
    if (storageAvailable) {
      Object.keys(localStorage).forEach(k => {
        if (k.startsWith(APP_KEY)) {
          localStorage.removeItem(k);
        }
      });
    } else {
      Object.keys(memoryStorage).forEach(k => delete memoryStorage[k]);
    }
  },

  /**
   * Debug log
   */
  inspect() {
    const result = {};

    const source = storageAvailable ? localStorage : memoryStorage;

    Object.keys(source).forEach(key => {
      if (key.startsWith(APP_KEY)) {
        try {
          result[key] = decode(source[key]);
        } catch {
          result[key] = "corrupted";
        }
      }
    });

    return result;
  }
};
