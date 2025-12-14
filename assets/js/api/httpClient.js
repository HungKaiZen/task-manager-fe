// ============================
//  api/httpClient.api.js
// ============================
import { CONFIG } from "../core/config.js";
import { Storage } from "../core/storage.js";
import AuthService from "../services/auth.service.js";

// Cờ khóa: refresh đang chạy?
let isRefreshing = false;
// Hàng đợi request đang chờ refresh xong
let requestQueue = [];

/**
 * Sau khi refresh token thành công
 * → chạy lại tất cả request bị đợi
 */
function processQueue(error = null) {
    requestQueue.forEach(promise => {
        if (error) {
            promise.reject(error);
        } else {
            promise.resolve();
        }
    });
    requestQueue = [];
}

/**
 * HTTP CLIENT PRO
 */
export async function httpClient(url, options = {}, retry = false) {

    // Lấy token hiện tại
    const token = Storage.get("accessToken");
    // Tạo header chuẩn
    const headers = {
        "Content-Type": "application/json",
        ...(token && { "Authorization": `Bearer ${token}` }),
        ...(options.headers || {})
    };

    // sent request
    let response = await fetch(CONFIG.BASE_URL + url, {
        ...options,
        headers,
        credentials: "include"
    });

    /**
     * ======================
     * TOKEN HẾT HẠN (401)
     * ======================
     */
    // if (response.status === 401 && !retry && url !== "/auth/refresh") {

    //     // Nếu chưa ai refresh → refresh
    //     if (!isRefreshing) {
    //         isRefreshing = true;

    //         try {
    //             console.log("Refresh token...");

    //             // call refresh token
    //             const data = await AuthService.refreshToken();

    //             // save new token
    //             Storage.set("accessToken", data.data.accessToken);

    //             // Mở khóa hàng đợi
    //             processQueue();
    //         } catch (error) {
    //             // Refresh token die -> logout
    //             console.error("Refresh failed, logging out...");
    //             processQueue(error);
    //             AuthService.logout();
    //             throw error;
    //         } finally {
    //             isRefreshing = false;
    //         }
    //     }

    //     /**
    //      * Các request đến sau khi refresh đang chạy
    //      * → xếp hàng chờ token mới
    //      */
    //     return new Promise((resolve, reject) => {
    //         requestQueue.push({
    //             resolve: () => resolve(httpClient(url, options, true)),
    //             reject
    //         });
    //     });
    // }
    if (response.status === 401) {

        let errorData = null;
        try {
            errorData = await response.clone().json();
        } catch (e) { }

        // ✅ LOGOUT ALL / TOKEN BỊ REVOKE
        if (errorData?.errorCode === "SESSION_REVOKED") {
            console.warn("Session revoked -> force logout");
            AuthService.logout();
            return;
        }

        // ✅ ACCESS TOKEN HẾT HẠN -> REFRESH
        if (!retry && url !== "/auth/refresh") {

            if (!isRefreshing) {
                isRefreshing = true;

                try {
                    console.log("Refreshing token...");
                    const data = await AuthService.refreshToken();
                    Storage.set("accessToken", data.data.accessToken);
                    processQueue();
                } catch (error) {
                    console.error("Refresh failed -> force logout");
                    processQueue(error);
                    AuthService.logout();
                    throw error;
                } finally {
                    isRefreshing = false;
                }
            }

            return new Promise((resolve, reject) => {
                requestQueue.push({
                    resolve: () => resolve(httpClient(url, options, true)),
                    reject
                });
            });
        }

    }

    if (!response.ok) {
        const err = await response.json();
        throw err;
    }

    return response.json();

}