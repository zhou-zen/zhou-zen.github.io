// 这里可以添加一些简单的交互逻辑，例如用户登录状态的切换
document.addEventListener("DOMContentLoaded", () => {
    const loginButton = document.querySelector(".topbar button:last-child");

    // 模拟用户登录状态
    const isLoggedIn = false;

    if (isLoggedIn) {
        loginButton.textContent = "抽签";
    } else {
        loginButton.textContent = "登录";
    }
});
