// 命运抽签功能
function setupFortuneDraw() {
    const fortuneButton = document.querySelector('.fortune-button');
    const fortuneText = document.querySelector('.fortune-text');
    
    if (!fortuneButton || !fortuneText) return;

    // 检查是否有保存的抽签结果
    const lastFortune = localStorage.getItem('lastFortune');
    const lastFortuneDate = localStorage.getItem('lastFortuneDate');
    const today = new Date().toDateString();
    
    if (lastFortuneDate === today && lastFortune) {
        fortuneText.textContent = lastFortune;
        fortuneButton.textContent = '今日已抽签';
        fortuneButton.disabled = true;
        return;
    }
    
    fortuneButton.addEventListener('click', function() {
        // 命运签文库
        const fortunes = [
            "大吉: 今天你将解决一个困扰已久的难题",
            "中吉: 会遇到一位志同道合的编程伙伴",
            "小吉: 代码一次通过评测，没有bug",
            "末吉: 虽然会遇到小问题，但能学到新知识",
            "凶: 小心今天的代码提交会有编译错误",
            "大凶: 可能会遇到服务器宕机，记得及时保存代码",
            "命运之签: 今天是你创造奇迹的日子",
            "智者之签: 你将在算法上获得新的领悟"
        ];
        
        // 禁用按钮防止重复点击
        fortuneButton.disabled = true;
        fortuneButton.textContent = '抽签中...';
        
        // 清空结果
        fortuneText.textContent = "命运正在抽取中...";
        
        // 抽签动画
        let counter = 0;
        const interval = setInterval(() => {
            const randomIndex = Math.floor(Math.random() * fortunes.length);
            fortuneText.textContent = fortunes[randomIndex];
            counter++;
            
            if (counter > 5) {
                clearInterval(interval);
                const finalFortune = fortunes[Math.floor(Math.random() * fortunes.length)];
                fortuneText.textContent = finalFortune;
                
                // 保存抽签结果和日期
                localStorage.setItem('lastFortuneDate', today);
                localStorage.setItem('lastFortune', finalFortune);
                
                fortuneButton.textContent = '今日已抽签';
            }
        }, 200);
    });
}

// 初始化
document.addEventListener('DOMContentLoaded', setupFortuneDraw);