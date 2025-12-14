// ============================
// loading.js
// ============================

const overlay = document.getElementById("loading-overlay");
const message = document.getElementById("loading-message");

export function showLoading(msg = "Đang xử lý...") {
    if (!overlay || !message) return;
    overlay.classList.remove("hidden");
    overlay.style.display = "block";
    message.innerText = msg;
}

export function hideLoading() {
    if (!overlay) return;
    overlay.classList.add("hidden");
    overlay.style.display = "none";
}

/**
 * Hiển thị spinner + message trong một khoảng thời gian, rồi redirect
 */
export function redirectWithSpinner(url, msg = "Đang chuyển trang...", delay = 400) {
    showLoading(msg);
    setTimeout(() => {
        window.location.href = url;
    }, delay);
}
