// ============================
//  LOGOUT.js
// ============================
import AuthService from "../services/auth.service.js";
import { redirectWithSpinner } from "../core/loading.js";
document.addEventListener("click", (e) => {
    const overlay = document.getElementById("overlayLogout");


    if (e.target && (e.target.id === "showLogoutFormBtn" || e.target.closest("#showLogoutFormBtn"))) {
        e.preventDefault();
        overlay.classList.add("show");
    }

    if (e.target && (e.target.id === "logoutCloseBtn" || e.target.closest("#logoutCloseBtn"))) {
        overlay.classList.remove("show");
    }

    if (e.target && e.target.id === "cancelLogoutBtn") {
        overlay.classList.remove("show");
    }

    const logoutForm = document.getElementById("logoutForm");

    logoutForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        try {
            await AuthService.logout();
            redirectWithSpinner("signin.html", "Đang đăng xuất, hẹn gặp lại!", 400);
        } catch (err) {
            alert(err.message || "Logout Failed");
        }
    })
})

