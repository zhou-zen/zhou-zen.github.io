const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// 连接数据库
mongoose.connect('mongodb://localhost/creator_oj', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// 用户模型
const UserSchema = new mongoose.Schema({
    userId: { type: Number, unique: true },
    username: { 
        type: String, 
        required: true, 
        unique: true, 
        minlength: 4, 
        maxlength: 16,
        index: true
    },
    email: { 
        type: String, 
        required: true, 
        unique: true,
        index: true 
    },
    password: { type: String, required: true, minlength: 8 },
    isLoggedIn: { type: Boolean, default: false },
    lastLogin: { type: Date },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);

// 生成JWT令牌
function generateToken(user) {
    return jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET || 'your_jwt_secret',
        { expiresIn: '30d' }
    );
}

// 注册路由
app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        // 验证输入
        if (!username || !email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: '请填写所有字段' 
            });
        }
        
        // 检查用户名和邮箱是否已存在
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            let message = '注册失败，';
            if (existingUser.username === username) {
                message += '用户名已被使用';
            } else {
                message += '邮箱已被使用';
            }
            return res.status(400).json({ 
                success: false, 
                message 
            });
        }
        
        // 哈希密码
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // 创建用户
        const newUser = await User.create({ 
            username, 
            email, 
            password: hashedPassword,
            userId: Math.floor(Math.random() * 90000) + 10000 // 生成5位用户ID
        });
        
        // 生成令牌
        const token = generateToken(newUser);
        
        res.json({
            success: true,
            token,
            user: {
                id: newUser._id,
                userId: newUser.userId,
                username: newUser.username,
                email: newUser.email
            }
        });
    } catch (error) {
        console.error('注册错误:', error);
        res.status(500).json({ 
            success: false, 
            message: '服务器错误，请稍后再试' 
        });
    }
});

// 登录路由
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // 验证输入
        if (!username || !password) {
            return res.status(400).json({ 
                success: false, 
                message: '请填写用户名和密码' 
            });
        }
        
        // 查找用户
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ 
                success: false, 
                message: '用户名或密码错误' 
            });
        }
        
        // 检查是否已登录
        if (user.isLoggedIn) {
            return res.status(400).json({ 
                success: false, 
                message: '该用户已登录，请勿重复登录' 
            });
        }
        
        // 验证密码
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ 
                success: false, 
                message: '用户名或密码错误' 
            });
        }
        
        // 更新登录状态
        await User.findByIdAndUpdate(user._id, {
            isLoggedIn: true,
            lastLogin: new Date()
        });
        
        // 生成令牌
        const token = generateToken(user);
        
        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                userId: user.userId,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error('登录错误:', error);
        res.status(500).json({ 
            success: false, 
            message: '服务器错误，请稍后再试' 
        });
    }
});

// 登出路由
app.post('/api/logout', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: '未授权' 
            });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
        await User.findByIdAndUpdate(decoded.id, { isLoggedIn: false });
        
        res.json({ success: true });
    } catch (error) {
        console.error('登出错误:', error);
        res.status(500).json({ 
            success: false, 
            message: '服务器错误，请稍后再试' 
        });
    }
});

// 获取用户信息
app.get('/api/user', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: '未授权' 
            });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
        const user = await User.findById(decoded.id);
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: '用户未找到' 
            });
        }
        
        res.json({
            success: true,
            user: {
                id: user._id,
                userId: user.userId,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error('获取用户信息错误:', error);
        res.status(500).json({ 
            success: false, 
            message: '服务器错误，请稍后再试' 
        });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`服务器运行在端口 ${PORT}`));