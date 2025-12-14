// ============================
//  service/auth.service.js
// ============================
import { loginAPI, refreshTokenAPI, logoutAPI, logoutAll } from "../api/auth.api.js";
import { Storage } from "../core/storage.js";

const channel = new BroadcastChannel("auth");

class AuthService {

    /**
    * LOGIN PRO
    */
    async login({ username, password }) {

        const payload = {
            username: username,
            password: password,
            platform: "WEB",
            deviceToken: "browser",
            versionUp: "1.0.0"
        };


        // 1. GỌI API (Chỉ ném lỗi nếu HTTP Status là 4xx/5xx)
        const data = await loginAPI(payload);

        // 2. KIỂM TRA LỖI NỘI DUNG JSON (Nếu Backend trả 200 OK nhưng JSON lỗi)
        if (data.status !== 200) {
            // Nếu trường 'status' trong JSON không phải 200 (ví dụ: 401, 403), ném lỗi
            const errorMessage = data.message
                || data.error
                || `Lỗi nội bộ server với mã status: ${data.status}`;

            throw new Error(errorMessage);
        }

        // 3. KIỂM TRA THIẾU TOKEN (Chỉ chạy khi Backend xác nhận thành công (status: 200))
        if (!data.data || !data.data.accessToken) {
            // Lỗi này chỉ chạy khi JSON thành công bị thiếu trường data
            throw new Error("Phản hồi thành công từ server không chứa Access Token.");
        }

        // 4. LƯU TOKEN
        Storage.set("accessToken", data.data.accessToken);
        return data;
    }

    /**
   * REFRESH TOKEN
   */
    async refreshToken() {
        const data = await refreshTokenAPI();
        Storage.set("accessToken", data.data.accessToken);
        return data.data;
    }

    /**
   * LOGOUT
   */
    async logout() {
        channel.postMessage("logout");
        // 1️⃣ Gọi backend logout
        await logoutAPI();

        // 2️⃣ Xoá accessToken ở client
        Storage.remove("accessToken");
    }

    async logoutAll() {
        await logoutAll();
        this.logout();
        window.location.href = "signin.html";
    }


    /**
     * Kiểm tra đăng nhập
     */
    isLoggedIn() {
        return !!Storage.get("accessToken");
    }

}

export default new AuthService();

