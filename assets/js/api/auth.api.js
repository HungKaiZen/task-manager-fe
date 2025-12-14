// ============================
//  api/auth.api.js
// ============================
import { CONFIG } from "../core/config.js";
import { httpClient } from "./httpClient.js";

/**
 * Gửi request login
 * @param {Object} data - dữ liệu login (username, password)
 */

export async function loginAPI(data) {
    const response = await fetch(CONFIG.BASE_URL + "/auth/login", {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(data),
        headers: {
            "Content-Type": "application/json"
        },
    });

    // 💥 1. XỬ LÝ LỖI (4xx/5xx)
    if (!response.ok) {
        let errorData;
        try {
            errorData = await response.json();
        } catch (e) {
            throw new Error(`Đăng nhập thất bại. Mã HTTP: ${response.status} ${response.statusText}`);
        }

        // Trích xuất message từ phản hồi lỗi HTTP 4xx/5xx
        const errorMessage = errorData.message
            || errorData.error
            || "Lỗi xác thực không xác định từ Server.";

        throw new Error(errorMessage);
    }

    // Nếu Status Code là 200 OK, trả về JSON để xử lý tiếp
    return response.json();
}

/**
 * Refresh Token API
 */

export async function refreshTokenAPI() {
    const response = await fetch(CONFIG.BASE_URL + "/auth/refresh", {
        method: "POST",
        credentials: "include"
    });

    if (!response.ok) {
        throw new Error("Refresh token expired");
    }

    return response.json();
}


/**
 * Logout
 */

export async function logoutAPI() {
    const response = await fetch(CONFIG.BASE_URL + "/auth/logout", {
        method: "POST",
        credentials: "include"
    });
    if (!response.ok) throw await response.json();
    return response.json();
}


/**
 * Logout all
 */
export async function logoutAll() {
    await httpClient(CONFIG.BASE_URL + "/auth/logout-all", {
        method: "POST"
    });
}

