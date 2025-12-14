// ============================
//  LOGIN.js
// ============================
import AuthService from "../services/auth.service.js";
import { showLoading, hideLoading, redirectWithSpinner } from "../core/loading.js";


const loginForm = document.getElementById("login-form");
const errorDiv = document.getElementById("form-group__error");

// Nếu đã login → redirect index
if (AuthService.isLoggedIn()) {
    redirectWithSpinner("index.html", "Đang đăng nhập, vui lòng chờ...");
}

loginForm.onsubmit = async (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    showLoading("Đang đăng nhập...");
    try {


        await AuthService.login({ username, password });
        redirectWithSpinner("index.html", "Đang đăng nhập, vui lòng chờ...", 400);
    } catch (err) {
        hideLoading();
        errorDiv.innerText = err.message || "Login thất bại";
    }
};
