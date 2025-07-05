// js/auth.js
const UserStorage = {
  getUsers() {
    return JSON.parse(localStorage.getItem('ojUsers')) || [
      {
        id: '1',
        userId: 10001,
        username: 'admin',
        email: 'admin@example.com',
        password: 'password123',
        isLoggedIn: false,
        createdAt: new Date().toISOString()
      }
    ];
  },

  saveUsers(users) {
    localStorage.setItem('ojUsers', JSON.stringify(users));
  },

  getCurrentUser() {
    return JSON.parse(localStorage.getItem('ojCurrentUser'));
  },

  saveCurrentUser(user) {
    localStorage.setItem('ojCurrentUser', JSON.stringify(user));
  },

  clearCurrentUser() {
    localStorage.removeItem('ojCurrentUser');
  }
};

const AuthService = {
  async register(username, email, password, confirmPassword) {
    // 验证逻辑
    if (!username || !email || !password || !confirmPassword) {
      throw new Error('所有字段都必须填写');
    }

    if (username.length < 4 || username.length > 16) {
      throw new Error('用户名必须为4-16个字符');
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('请输入有效的邮箱地址');
    }

    if (password.length < 8) {
      throw new Error('密码长度至少为8位');
    }

    if (password !== confirmPassword) {
      throw new Error('两次输入的密码不一致');
    }

    // 检查用户是否存在
    const users = UserStorage.getUsers();
    const userExists = users.some(u => u.username === username || u.email === email);
    if (userExists) {
      throw new Error('用户名或邮箱已被注册');
    }

    // 创建用户
    const newUser = {
      id: Date.now().toString(),
      userId: Math.floor(Math.random() * 90000) + 10000,
      username,
      email,
      password,
      isLoggedIn: true,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    UserStorage.saveUsers(users);
    UserStorage.saveCurrentUser(newUser);

    return newUser;
  },

  async login(username, password) {
    if (!username || !password) {
      throw new Error('请输入用户名和密码');
    }

    const users = UserStorage.getUsers();
    const user = users.find(u => u.username === username && u.password === password);

    if (!user) {
      throw new Error('用户名或密码错误');
    }

    user.isLoggedIn = true;
    UserStorage.saveUsers(users);
    UserStorage.saveCurrentUser(user);

    return user;
  },

  logout() {
    const user = UserStorage.getCurrentUser();
    if (user) {
      const users = UserStorage.getUsers();
      const updatedUsers = users.map(u => 
        u.id === user.id ? { ...u, isLoggedIn: false } : u
      );
      UserStorage.saveUsers(updatedUsers);
    }
    UserStorage.clearCurrentUser();
  },

  getCurrentUser() {
    return UserStorage.getCurrentUser();
  },

  initUI() {
    const user = this.getCurrentUser();
    const userInfo = document.getElementById('userInfo');
    const guestActions = document.getElementById('guestActions');

    if (user) {
      if (userInfo) {
        userInfo.style.display = 'flex';
        const usernameEl = userInfo.querySelector('.username');
        const userIdEl = userInfo.querySelector('.user-id');
        if (usernameEl) usernameEl.textContent = user.username;
        if (userIdEl) userIdEl.textContent = `ID: ${user.userId}`;
      }
      if (guestActions) guestActions.style.display = 'none';
    } else {
      if (userInfo) userInfo.style.display = 'none';
      if (guestActions) guestActions.style.display = 'flex';
    }
  }
};

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  AuthService.initUI();

  // 全局登出按钮
  document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    AuthService.logout();
    window.location.href = '/index.html';
  });
});

// 全局访问
window.AuthService = AuthService;