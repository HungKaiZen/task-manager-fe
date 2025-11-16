async function loadHTML(selector, file) {
    const element = document.querySelector(selector);
    if (element) {
        const response = await fetch(file);
        if (response.ok) {
            element.innerHTML = await response.text();
        }else {
            element.innerHTML = "Khong the tai " + file;
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadHTML("header", "../../templates/header.html");
    loadHTML("footer", "../../templates/footer.html");
})