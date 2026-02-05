// 定义 HTML 内容，包含云笔记页面的前端结构、样式和交互逻辑250<script>
const HTML_CONTENT = `<!DOCTYPE html><html lang="zh-CN">
<head>
<!-- Font Awesome for EasyMDE toolbar icons -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/font-awesome@4.7.0/css/font-awesome.min.css">
<!-- EasyMDE Markdown 编辑器依赖 -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/easymde/dist/easymde.min.css">
<script src="https://cdn.jsdelivr.net/npm/easymde/dist/easymde.min.js"></script>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Cloud Notes</title>
<!-- 网页标签页头像 favicon -->
<link rel="icon" type="image/png" href="https://img.momobako.me/favicon.ico">
<!-- 引入 marked.js 用于解析 Markdown 内容 -->
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
<style>
/* 设置页面整体样式，确保填满视窗并使用盒模型 */
html, body {
    height: 100%;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}
/* 页面主体样式：设置背景、字体和居中布局 */
body {
    font-family: Arial, sans-serif;
    background-color: rgb(199, 255, 255); /* 默认背景色 */
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    background-attachment: fixed;
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    transition: background-color 0.3s ease;
    min-height: 100vh;
}
/* 侧边栏样式：显示分类导航（桌面端默认样式） */
.sidebar {
    width: 200px;
    position: fixed;
    left: 20px;
    top: 20px;
    background-color: hsl(183, 100.00%, 95.30%); /* 半透明白色背景 */
    border-radius: 10px;
    padding: 15px;
    height: fit-content;
    max-height: 70vh;
    overflow-y: auto;
    scrollbar-width: thin;
    z-index: 1000; /* 确保不被遮挡 */
}
/* 侧边栏滚动条样式 */
.sidebar::-webkit-scrollbar {
    width: 6px;
}
.sidebar::-webkit-scrollbar-thumb {
    background: #b3e0ff;
    border-radius: 3px;
}
/* 侧边栏项目样式 */
.sidebar-item {
    padding: 10px;
    margin: 5px 0;
    cursor: pointer;
    border-radius: 5px;
    transition: background-color 0.2s;
}
.sidebar-item:hover {
    background-color: rgba(0, 123, 255, 0.1); /* 悬停效果 */
}
.sidebar-item.active {
    background-color: #007bff;
    color: white; /* 高亮选中分类 */
}
/* 手机端（屏幕宽度小于600px）侧边栏样式调整为悬浮球 */
@media (max-width: 1080px) {
    .sidebar {
        position: fixed;
        right: 20px;
        bottom: 60px; /* 避免与主题切换按钮重叠 */
        width: 50px;
        height: 50px;
        background-color: #007bff;
        border-radius: 50%;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        z-index: 1000;
        transition: all 0.3s ease;
    }
    .sidebar.expanded {
        width: 100%;
        height: 100%;
        right: 0;
        bottom: 0;
        border-radius: 0;
        background-color: rgba(255, 255, 255, 0.95);
        display: flex;
        flex-direction: column;
        padding: 20px;
        overflow-y: auto;
    }
    /* 手机端未展开时隐藏侧边栏项目 */
    .sidebar:not(.expanded) .sidebar-item {
        display: none;
    }
    /* 手机端展开时显示侧边栏项目 */
    .sidebar.expanded .sidebar-item {
        display: block;
    }
    /* 手机端卡片布局调整 */
    .note-container {
        grid-template-columns: repeat(1, 1fr); /* 手机端每行 2 个卡片 */
        gap: 10px;
    }
    .note {
        width: 100%; /* 卡片占满网格单元 */
        max-width: 100%;
        padding: 15px;
    }
}
/* 悬浮球图标样式 */
.sidebar-icon::before {
    content: '☰'; /* 菜单图标 */
    color: white;
    font-size: 24px;
}
.sidebar.expanded .sidebar-icon::before {
    content: '✕'; /* 关闭图标 */
    color: #333;
}
/* 调整页面布局，确保左侧 250px 留给侧边栏 */
body {
    padding-left: 200px;
}
h1 {
    text-align: center;
    margin: 40px auto 20px auto;
    width: 100%;
    font-size: 2.8em;
}
.admin-controls {
    display: none;
    position: fixed;
    top: 20px;
    right: 30px;
    font-size: 60%;
    z-index: 1000;
    background: rgba(255,255,255,0.8);
    border-radius: 8px;
    padding: 10px 16px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
.add-controls, .customization-controls, #sections-container {
    margin-left: 0;
    width: calc(100% - 200px);
}
@media (max-width: 1080px) {
    body {
        padding-left: 0 !important;
    }
    h1 {
        width: 100%;
        text-align: center;
        margin-left: 0;
    }
    .admin-controls {
        right: 8px;
        top: 8px;
        left: auto;
        width: auto;
        min-width: 0;
        font-size: 90%;
        padding: 7px 10px;
        border-radius: 8px;
    }
    .add-controls, .customization-controls, #sections-container {
        width: 100%;
        margin-left: 0;
    }
}

/* 笔记容器：使用网格布局 */
.note-container {
    display: grid;
    grid-template-columns: repeat(2, 1fr); /* 桌面端每行 4 个卡片 */
    gap: 10px;
}
/* 笔记卡片样式 */
.note.fullscreen {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    max-width: none !important;
    max-height: none !important;
    min-width: 0 !important;
    min-height: 0 !important;
    z-index: 2000 !important;
    background: #fff !important;
    box-shadow: 0 0 0 9999px rgba(0,0,0,0.2) !important;
    overflow: auto !important;
    display: flex !important;
    flex-direction: column !important;
    padding: 40px 20px 20px 20px !important;
}
.note.fullscreen .note-title {
    font-size: 2em;
    margin-bottom: 20px;
}
.note.fullscreen .note-summary {
    display: none !important;
}
.note.fullscreen .note-content {
    overflow-y: auto;
    max-height: 200vh;
    background: #222c;
    color: #fff;
    padding: 24px;
    border-radius: 8px;
    font-size: 1.15em;
    box-shadow: 0 6px 32px rgba(0,0,0,0.18);
}
    display: block !important;
    font-size: 1.1em;
    max-height: none !important;
    flex: 1 1 auto;
    margin-bottom: 20px;
}
.note.fullscreen .note-buttons {
    margin-top: auto;
    justify-content: flex-end;
    padding-bottom: 10px;
    background: none;
    position: static;
    width: 100%;
    box-sizing: border-box;
}
@media (max-width: 700px) {
    .note.fullscreen .note-buttons {
        padding-bottom: 4vw;
    }
}
@media (max-width: 700px) {
    .note.fullscreen {
        padding: 10px 2vw 10px 2vw !important;
    }
}

.note {
    position: relative;
    background-color: rgba(242, 181, 172, 0.70);
    padding: 15px;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    width: auto; /* 宽度根据内容自适应 */
    min-width: 500px; /* 最小宽度，避免过窄 */
    max-width: 700px; /* 最大宽度，避免过宽 */
    height: auto;
}
.note:hover {
    transform: translateY(-5px); /* 悬停时上移 */
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}
/* 笔记标题 */
.note-title {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 5px;
    word-break: break-word; /* 标题过长时换行 */
}
/* 笔记摘要：限制显示3行，有滚动条 */
.note-summary {
    color: #555;
    font-size: 12px;
    word-break: break-word;
    display: -webkit-box;
    -webkit-line-clamp: 5;
    -webkit-box-orient: vertical;
    overflow: auto;
    max-height: 80px;
    scrollbar-width: thin;
}
.note-summary::-webkit-scrollbar, .note-content::-webkit-scrollbar {
    width: 6px;
}
.note-summary::-webkit-scrollbar-thumb, .note-content::-webkit-scrollbar-thumb {
    background: #b3e0ff;
    border-radius: 3px;
}
/* 笔记全文：默认隐藏，有滚动条 */
.note-content {
    display: none;
    font-size: 12px;
    color: #333;
    word-break: break-word;
    max-height: 320px;
    overflow: auto;
    scrollbar-width: thin;
} 
/* 展开状态：隐藏摘要，显示全文 */
.note.expanded .note-summary {
    display: none;
}
.note.expanded .note-content {
    display: block;
}
/* 笔记操作按钮容器 */
.note-buttons {
    display: flex;
    gap: 5px;
    margin-top: 5px;
}
/* 笔记操作按钮样式 */
.note-btn {
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    padding: 5px 10px;
    font-size: 12px;
    cursor: pointer;
}
/* 删除按钮：管理员模式显示 */
.delete-btn {
    position: absolute;
    top: -10px;
    right: -10px;
    background-color: red;
    color: white;
    border: none;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    text-align: center;
    font-size: 14px;
    line-height: 20px;
    cursor: pointer;
    display: none;
}
/* 管理员控制面板 */
.admin-controls {
    display: none;
    position: fixed;
    top: 10px;
    right: 10px;
    font-size: 60%;
    z-index: 1000; /* 确保不被遮挡 */
}
.admin-controls input {
    padding: 5px;
    font-size: 60%;
}
.admin-controls button {
    padding: 5px 10px;
    font-size: 60%;
    margin-left: 10px;
}
/* 添加笔记控制项 */
.add-controls {
    display: none;
    margin-top: 10px;
    flex-direction: row;
    gap: 10px;
}
/* 圆形按钮：添加笔记 */
.round-btn {
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    text-align: center;
    font-size: 24px;
    line-height: 40px;
    cursor: pointer;
}
/* 主题切换按钮 */
#theme-toggle {
    position: fixed;
    bottom: 10px;
    left: 280px; /* 调整位置，避免与侧边栏重叠 */
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    text-align: center;
    font-size: 24px;
    line-height: 40px;
    cursor: pointer;
    z-index: 1000; /* 确保不被遮挡 */
}
/* 对话框遮罩：添加/编辑笔记时显示 */
#dialog-overlay {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    justify-content: center;
    align-items: center;
    z-index: 2000; /* 高于其他元素 */
}
/* 对话框样式 */
#dialog-box { /* 对话框容器样式 */
    background: white; /* 背景颜色为白色 */
    padding: 20px; /* 内边距为20px */
    border-radius: 10px; /* 圆角半径为10px */
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* 添加阴影效果 */
    max-width: 800px; /* 最大宽度为800px */
    width: 90%; /* 宽度为父容器的90% */
}
#dialog-box label { /* 表单标签样式 */
    display: block; /* 显示为块级元素 */
    margin-bottom: 5px; /* 下边距为5px */
}
#dialog-box input, #dialog-box textarea { /* 输入框和文本区域样式 */
    width: 100%; /* 宽度为父容器的100% */
    padding: 5px; /* 内边距为5px */
    margin-bottom: 10px; /* 下边距为10px */
}
/* 分类勾选框组 */
.checkbox-group {
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 5px;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    max-height: 200px;
    gap: 6px;
    scrollbar-width: thin;
}
.checkbox-group::-webkit-scrollbar {
    width: 6px;
}
.checkbox-group::-webkit-scrollbar-thumb {
    background: #b3e0ff;
    border-radius: 3px;
}
.checkbox-group label.category-select-label {
    display: flex;
    align-items: center;
    margin-bottom: 2px;
    font-size: 14px;
    padding: 5px 10px;
    border-radius: 6px;
    cursor: pointer;
    user-select: none;
    transition: background 0.2s, color 0.2s;
}
.checkbox-group label.category-select-label.selected {
    background: #007bff;
    color: #fff;
    font-weight: bold;
}
.checkbox-group label.category-select-label:not(.selected):hover {
    background: #e6f0ff;
    color: #007bff;
}
.checkbox-group input {
    margin-right: 5px;
    width: 16px;
    height: 16px;
}
/* 分类区块 */
.section {
    margin-bottom: 20px;
}
.section-title {
    font-size: 50px;
    font-weight: bold;
    color: rgba(215, 247, 255, 0.78);
    margin-bottom: 15px;
}
/* 标题自定义控制项 */
.customization-controls {
    display: none;
    margin-top: 10px;
    font-size: 60%;
}
.customization-controls label {
    margin-right: 5px;
}
.footer-icon img {
    filter: grayscale(50%);
    transition: filter 0.2s, transform 0.2s;
}
.footer-icon:hover img {
    filter: grayscale(0%);
    transform: scale(1.15);
}
#footer {
    user-select: none;
}
</style>
</head>
<body>
<!-- 侧边栏：显示分类导航 -->
<div class="sidebar" id="sidebar">
    <div class="sidebar-icon"></div>
</div>
<!-- 主标题 -->
<h1>Cloud Notes</h1>
    <!-- 搜索框 -->
    <div style="width:100%;text-align:center;margin:16px 0;">
        <input id="search-input" type="text" placeholder="搜索笔记标题或内容..." style="width:60%;max-width:340px;padding:8px 14px;font-size:16px;border:1px solid #ddd;border-radius:6px;" oninput="searchNotes()">
    </div>
<!-- 管理员控制面板：输入密码进入管理模式 -->
<div class="admin-controls">
    <input type="password" id="admin-password" placeholder="输入密钥">
    <button id="admin-mode-btn" onclick="toggleAdminMode()">进入管理</button>
</div>
<!-- 添加笔记按钮 -->
<div class="add-controls">
    <button class="round-btn" onclick="showAddDialog()">+</button>
</div>
<!-- 标题样式自定义面板 -->
<div class="customization-controls">
    <label>主标题颜色:</label>
    <input type="color" id="main-title-color">
    <label>主标题大小(px):</label>
    <input type="number" id="main-title-size" min="10" max="50">
    <button onclick="saveMainTitleStyles()">应用</button>
</div>
<!-- 分类和笔记容器 -->
<div id="sections-container"></div>
<!-- 主题切换按钮 -->
<button id="theme-toggle" onclick="toggleTheme()">◑</button>
<!-- 添加/编辑笔记对话框 -->
<div id="dialog-overlay">
    <div id="dialog-box">
        <input type="hidden" id="note-id"> <!-- 存储笔记ID用于编辑 -->
        <label for="title-input">标题(默认私密)</label>
        <input type="text" id="title-input">
        <label for="content-input">笔记内容 (支持 Markdown)</label>
        <textarea id="content-input" placeholder="支持Markdown语法，图片可粘贴/拖拽"></textarea>
        <label>选择分类（可多选）</label>
        <div class="checkbox-group" id="category-checkboxes"></div>
        <button onclick="saveNote()">保存</button>
        <button onclick="hideAddDialog()">取消</button>
    </div>
</div>
<script>
// EasyMDE富文本Markdown编辑器逻辑
let easyMDE;
function initEasyMDE() {
    if (!easyMDE) {
        easyMDE = new EasyMDE({
            element: document.getElementById('content-input'),
            spellChecker: false,
            minHeight: "300px",
            maxHeight: "600px", // 约30行
            placeholder: "支持Markdown语法，图片可粘贴/拖拽",
            toolbar: [
                "bold", "italic", "heading", "|",
                "quote", "unordered-list", "ordered-list", "|",
                "link", "image", "table", "code", "preview", "side-by-side", "fullscreen"
            ]
        });
    }
}
// 弹窗打开时初始化编辑器并清空内容
const _oldShowAddDialog = showAddDialog;
showAddDialog = function() {
    _oldShowAddDialog && _oldShowAddDialog();
    setTimeout(() => {
        initEasyMDE();
        if (easyMDE) easyMDE.value("");
    }, 0);
}
// 编辑时赋值内容
const _oldShowEditDialog = showEditDialog;
showEditDialog = function(note) {
    _oldShowEditDialog && _oldShowEditDialog(note);
    setTimeout(() => {
        initEasyMDE();
        if (easyMDE && note && note.content) easyMDE.value(note.content);
    }, 0);
}
// 保存时优先从easyMDE读取内容
const _oldSaveNote = saveNote;
saveNote = function() {
    if (easyMDE) {
        document.getElementById('content-input').value = easyMDE.value();
    }
    _oldSaveNote && _oldSaveNote();
}

// 定义全局变量
let isAdmin = false; // 是否为管理员模式
let isDarkTheme = false; // 是否为深色主题
let notes = []; // 笔记列表
// 定义分类
const categories = {
    "Personal Notes": [],
    "python": [],
    "JavaScript": [],
    "HTML": [],
    "CSS": [],
    "GitHub": [],
    "cluodflare": [],
    "script": [],
    "tunnel": [],
    "API/TOKEN/cookie-privacy": [],
    "privacy": []
};
// 背景图片数组，用于轮播
const backgroundImages = [
    /*'https://mig01.996399.xyz/illust_100271795_20230408_132106.png',
    'https://img.996399.xyz/file/1745340768591_illust_79807334_20240509_025559.jpg',
    'https://mig01.996399.xyz/illust_115758338_20240710_045330.png',
    'https://mig01.996399.xyz/illust_92217855_20230408_132312.png',
    'https://mig01.996399.xyz/illust_92246778_20230326_164515.png',
    'https://mig01.996399.xyz/illust_120282671_20240710_034934.png',
    'https://mig01.996399.xyz/illust_109277225_20240420_013312.jpg',
    'https://img.996399.xyz/file/1745516991503_20230321_185007.jpg',
    'https://img.996399.xyz/file/1745517163071_FB_IMG_1726012639501.jpg',
    'https://img.996399.xyz/file/1745517174916_illust_109283065_20240929_022823.jpg',*/
    'https://img.996399.xyz/file/1745517409647_illust_122809108_20241005_203650.png',
    'https://img.996399.xyz/file/1745517413191_illust_122809108_20241005_203645.png'
];
// 随机设置背景图片
function setRandomBackground() {
    const randomIndex = Math.floor(Math.random() * backgroundImages.length);
    document.body.style.backgroundImage = 'url(' + backgroundImages[randomIndex] + ')';
}
// 启动背景图片轮播，每100秒切换一次
function startBackgroundRotation() {
    setRandomBackground();
    setInterval(setRandomBackground, 100000);
}
// 从 KV 数据库加载笔记并初始化页面
async function loadNotes() {
    const response = await fetch('/api/getNotes?userId=testUser');
    notes = await response.json(); // 获取笔记数据
    // 清空分类中的笔记
    Object.keys(categories).forEach(key => categories[key] = []);
    // 将笔记分配到对应分类（支持多分类）
    notes.forEach(note => {
        if (note.categories && Array.isArray(note.categories)) {
            note.categories.forEach(category => {
                if (categories[category]) categories[category].push(note);
            });
        }
    });
    await loadStyles(); // 加载标题样式
    loadSections(); // 加载分类和笔记
    updateCategoryCheckboxes(); // 更新分类勾选框
    startBackgroundRotation(); // 启动背景轮播
    // 检查是否为 /admin 路径，显示管理员控制面板
    if (window.location.pathname === '/admin') {
        document.querySelector('.admin-controls').style.display = 'block';
    }
    // 为侧边栏添加点击事件（手机端悬浮球展开/收起）
    const sidebar = document.getElementById('sidebar');
    sidebar.addEventListener('click', () => {
        sidebar.classList.toggle('expanded');
    });
}
// 从 KV 加载标题样式
async function loadStyles() {
    const mainStyles = await fetch('/api/getStyles?userId=testUser&type=mainTitle')
        .then(res => res.json())
        .catch(() => ({}));
    if (mainStyles.color) {
        document.querySelector('h1').style.color = mainStyles.color;
        document.getElementById('main-title-color').value = mainStyles.color;
    }
    if (mainStyles.fontSize) {
        document.querySelector('h1').style.fontSize = mainStyles.fontSize + 'px';
        document.getElementById('main-title-size').value = mainStyles.fontSize;
    }
}
// 搜索功能：根据输入内容过滤笔记
function searchNotes() {
    const keyword = document.getElementById('search-input').value.trim().toLowerCase();
    if (!keyword) {
        filteredNotes = notes.slice();
    } else {
        filteredNotes = notes.filter(note =>
            (note.title && note.title.toLowerCase().includes(keyword)) ||
            (note.content && note.content.toLowerCase().includes(keyword))
        );
    }
    // 重新分配分类
    Object.keys(categories).forEach(key => categories[key] = []);
    filteredNotes.forEach(note => {
        if (note.categories && Array.isArray(note.categories)) {
            note.categories.forEach(category => {
                if (categories[category]) categories[category].push(note);
            });
        }
    });
    loadSections();
}
// 加载分类和笔记到页面
function loadSections() {
    const container = document.getElementById('sections-container');
    const sidebar = document.getElementById('sidebar');
    container.innerHTML = '';
    sidebar.innerHTML = '<div class="sidebar-icon"></div>'; // 确保手机端有图标
    // 遍历分类，创建侧边栏和笔记区域
    Object.keys(categories).forEach(category => {
        // 创建侧边栏项目
        const sidebarItem = document.createElement('div');
        sidebarItem.className = 'sidebar-item';
        sidebarItem.textContent = category;
        sidebarItem.dataset.category = category;
        sidebarItem.onclick = function() {
            document.getElementById(category).scrollIntoView({ behavior: 'smooth' });
            sidebar.querySelectorAll('.sidebar-item').forEach(item => item.classList.remove('active'));
            sidebarItem.classList.add('active');
            // 手机端点击后收起侧边栏
            if (window.innerWidth <= 600) {
                sidebar.classList.remove('expanded');
            }
        };
        sidebar.appendChild(sidebarItem);
        // 创建分类区块
        const section = document.createElement('div');
        section.className = 'section';
        section.id = category;
        const title = document.createElement('div');
        title.className = 'section-title';
        title.textContent = category;
        const noteContainer = document.createElement('div');
        noteContainer.className = 'note-container';
        noteContainer.id = category;
        section.appendChild(title);
        section.appendChild(noteContainer);
        // 为分类中的每个笔记创建卡片
        categories[category].forEach(note => createNoteCard(note, noteContainer));
        container.appendChild(section);
    });
    // 默认高亮第一个分类
    if (sidebar.children.length > 1) sidebar.children[1].classList.add('active');
}
// 创建单个笔记卡片
function createNoteCard(note, container) {
    // 非管理员模式且私密笔记则不渲染
    if (!isAdmin && note.isPrivate) return;
    const card = document.createElement('div');
    card.className = 'note';
    card.dataset.id = note.id; // 存储笔记ID
    // 渲染自定义颜色
    if (note.color) card.style.backgroundColor = note.color;
    // 笔记标题
    const title = document.createElement('div');
    title.className = 'note-title';
    title.textContent = note.title;
    // 笔记摘要（前100字符）
    const summary = document.createElement('div');
    summary.className = 'note-summary';
    summary.innerHTML = marked.parse(note.content.substring(0, 200) + (note.content.length > 100 ? '...' : ''));
    // 笔记全文（默认隐藏）
    const content = document.createElement('div');
    content.className = 'note-content';
    content.innerHTML = marked.parse(note.content || '无内容');
    card.appendChild(title);
    // 创建日期显示
    if (note.createdAt) {
        const dateDiv = document.createElement('div');
        dateDiv.className = 'note-date';
        const dateObj = new Date(note.createdAt);
        // 格式化日期为 yyyy-MM-dd HH:mm
        const formatted = dateObj.getFullYear() + '-' + String(dateObj.getMonth()+1).padStart(2, '0') + '-' + String(dateObj.getDate()).padStart(2, '0') + ' ' + String(dateObj.getHours()).padStart(2, '0') + ':' + String(dateObj.getMinutes()).padStart(2, '0');
        dateDiv.textContent = '创建时间：' + formatted;
        card.appendChild(dateDiv);
    }
    card.appendChild(summary);
    card.appendChild(content);
    // 操作按钮容器
    const buttons = document.createElement('div');
    buttons.className = 'note-buttons';
    // 展开/收起按钮
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'note-btn';
    toggleBtn.textContent = '展开';
    toggleBtn.onclick = () => {
        card.classList.toggle('expanded');
        toggleBtn.textContent = card.classList.contains('expanded') ? '收起' : '展开';
    };
    // 复制按钮：复制 Markdown 渲染后的纯文本内容
    const copyBtn = document.createElement('button');
    copyBtn.className = 'note-btn';
    copyBtn.textContent = '复制';
    copyBtn.onclick = () => {
        const renderedContent = card.querySelector('.note-content').innerText; // 获取渲染后的纯文本
        navigator.clipboard.writeText(renderedContent).then(() => showToast('渲染后的笔记内容已复制'));
    };
    buttons.appendChild(toggleBtn);
    buttons.appendChild(copyBtn);
    // 全屏按钮
    const fullscreenBtn = document.createElement('button');
    fullscreenBtn.className = 'note-btn fullscreen-btn';
    fullscreenBtn.textContent = '全屏';
    fullscreenBtn.onclick = (e) => {
        e.stopPropagation();
        const isFullscreen = card.classList.toggle('fullscreen');
        fullscreenBtn.textContent = isFullscreen ? '关闭全屏' : '全屏';
        document.body.style.overflow = isFullscreen ? 'hidden' : '';
        // 全屏时重新渲染完整Markdown内容
        const contentDiv = card.querySelector('.note-content');
        if (isFullscreen) {
            contentDiv.innerHTML = marked.parse(note.content || '无内容');
            // 全屏图片点击放大缩小
            const imgs = contentDiv.querySelectorAll('img');
            imgs.forEach(img => {
                img.style.cursor = 'zoom-in';
                img.onclick = function(e) {
                    e.stopPropagation();
                    if (img.classList.contains('zoomed-img')) return;
                    // 创建遮罩
                    const mask = document.createElement('div');
                    mask.style.position = 'fixed';
                    mask.style.left = 0;
                    mask.style.top = 0;
                    mask.style.width = '100vw';
                    mask.style.height = '100vh';
                    mask.style.background = 'rgba(0,0,0,0.8)';
                    mask.style.zIndex = 9999;
                    mask.style.display = 'flex';
                    mask.style.alignItems = 'center';
                    mask.style.justifyContent = 'center';
                    mask.onclick = function() {
                        document.body.removeChild(mask);
                        img.classList.remove('zoomed-img');
                        img.style.maxWidth = '';
                        img.style.maxHeight = '';
                        img.style.boxShadow = '';
                        img.style.cursor = 'zoom-in';
                    };
                    // 放大图片
                    img.classList.add('zoomed-img');
                    img.style.maxWidth = '90vw';
                    img.style.maxHeight = '90vh';
                    img.style.boxShadow = '0 0 32px #fff8';
                    img.style.cursor = 'zoom-out';
                    // 将图片克隆到遮罩中展示（避免脱离原文流）
                    const bigImg = img.cloneNode();
                    bigImg.style.maxWidth = '90vw';
                    bigImg.style.maxHeight = '90vh';
                    bigImg.style.boxShadow = '0 0 32px #fff8';
                    bigImg.style.cursor = 'zoom-out';
                    bigImg.onclick = mask.onclick;
                    mask.appendChild(bigImg);
                    document.body.appendChild(mask);
                }
            });
        } else {
            // 退出全屏恢复摘要/折叠逻辑
            contentDiv.innerHTML = marked.parse(note.content.substring(0, 200) + (note.content.length > 100 ? '...' : ''));
        }
        // 代码高亮（如有prism.js等可在此调用）
        if (window.Prism) Prism.highlightAllUnder(contentDiv);
    };
    // 全屏状态下双击卡片退出全屏
    card.addEventListener('dblclick', function(e) {
        if (card.classList.contains('fullscreen')) {
            card.classList.remove('fullscreen');
            fullscreenBtn.textContent = '全屏';
            document.body.style.overflow = '';
        }
    });
    buttons.appendChild(fullscreenBtn);
    // 管理员模式下添加颜色自定义
    if (isAdmin) {
        const colorInput = document.createElement('input');
        colorInput.type = 'color';
        colorInput.className = 'note-color-input';
        // 默认色：若之前自定义过则读取，否则用当前背景色
        colorInput.value = card.dataset.bgcolor || rgb2hex(card.style.backgroundColor || getComputedStyle(card).backgroundColor || '#d6f1ad');
        colorInput.title = '自定义卡片颜色';
        colorInput.oninput = function(e) {
            card.style.backgroundColor = colorInput.value;
            card.dataset.bgcolor = colorInput.value;
            // 写入note.color并保存
            note.color = colorInput.value;
            saveNotes();
        };
        // 右侧紧凑显示
        colorInput.style.marginLeft = '8px';
        colorInput.style.width = '28px';
        colorInput.style.height = '28px';
        colorInput.style.verticalAlign = 'middle';
        colorInput.style.border = 'none';
        colorInput.style.background = 'none';
        buttons.appendChild(colorInput);
    }

    // 工具函数：rgb转hex
    function rgb2hex(rgb) {
        if (!rgb) return '#d6f1ad';
        if (rgb.startsWith('#')) return rgb;
        const result = rgb.match(/\d+/g);
        if (!result) return '#d6f1ad';
        return '#' + result.slice(0,3).map(x => ('0'+parseInt(x).toString(16)).slice(-2)).join('');
    }
    // 管理员模式下添加编辑和删除按钮
    if (isAdmin) {
        // 私密/公开切换按钮
        const privateBtn = document.createElement('button');
        privateBtn.className = 'note-btn';
        privateBtn.textContent = note.isPrivate ? '设为公开' : '设为私密';
        privateBtn.onclick = function() {
            note.isPrivate = !note.isPrivate;
            privateBtn.textContent = note.isPrivate ? '设为公开' : '设为私密';
            saveNotes();
            reloadNotes();
        };
        buttons.appendChild(privateBtn);
        // 编辑按钮
        const editBtn = document.createElement('button');
        editBtn.className = 'note-btn';
        editBtn.textContent = '编辑';
        editBtn.onclick = function(e) {
            e.stopPropagation(); // 防止冒泡
            showEditDialog(note);
        };
        buttons.appendChild(editBtn);
        // 删除按钮
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '–';
        deleteBtn.className = 'delete-btn';
        deleteBtn.onclick = function(event) {
            event.stopPropagation();
            removeNote(card, note, container.id);
        };
        card.appendChild(deleteBtn);
        deleteBtn.style.display = 'block';
    }
    // 双击卡片切换展开/收起
    card.ondblclick = function(e) {
        // 避免双击按钮时误触
        if (e.target.closest('.note-btn')) return;
        card.classList.toggle('expanded');
        // 同步按钮文本
        const toggleBtn = card.querySelector('.note-btn');
        if (toggleBtn) toggleBtn.textContent = card.classList.contains('expanded') ? '收起' : '展开';
    };
    card.appendChild(buttons);
    // 适配深色主题
    if (isDarkTheme) {
        card.style.backgroundColor = '#1e1e1e';
        card.style.color = '#ffffff';
        card.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.5)';
    }
    // 确保按钮组被添加到卡片底部
    card.appendChild(buttons);
    container.appendChild(card);
}
// 更新分类勾选框
function updateCategoryCheckboxes() {
    const checkboxGroup = document.getElementById('category-checkboxes');
    checkboxGroup.innerHTML = '';
    if (!window.selectedCategories) window.selectedCategories = [];
    // 为每个分类创建勾选框
    Object.keys(categories).forEach(category => {
        const label = document.createElement('label');
        label.textContent = category;
        label.className = 'category-select-label';
        if (window.selectedCategories.includes(category)) {
            label.classList.add('selected');
        }
        label.onclick = function() {
            const idx = window.selectedCategories.indexOf(category);
            if (idx === -1) {
                window.selectedCategories.push(category);
                label.classList.add('selected');
            } else {
                window.selectedCategories.splice(idx, 1);
                label.classList.remove('selected');
            }
        };
        checkboxGroup.appendChild(label);
    });
}
// 保存笔记到 KV 数据库
async function saveNotes() {
    const uniqueNotes = [];
    const seen = new Set();
    // 收集唯一笔记，移除重复
    for (const category in categories) {
        categories[category].forEach(note => {
            const noteKey = note.id;
            if (!seen.has(noteKey)) {
                seen.add(noteKey);
                uniqueNotes.push(note);
            }
        });
    }
    await fetch('/api/saveNotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'testUser', notes: uniqueNotes })
    });
}
// 保存标题样式到 KV
async function saveMainTitleStyles() {
    const color = document.getElementById('main-title-color').value;
    const fontSize = document.getElementById('main-title-size').value;
    document.querySelector('h1').style.color = color;
    document.querySelector('h1').style.fontSize = fontSize + 'px';
    await fetch('/api/saveStyles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'testUser', type: 'mainTitle', styles: { color, fontSize } })
    });
}
// 显示添加笔记对话框
function showAddDialog() {
    document.getElementById('note-id').value = '';
    document.getElementById('title-input').value = '';
    document.getElementById('content-input').value = '';
    window.selectedCategories = [];
    updateCategoryCheckboxes();
    document.getElementById('dialog-overlay').style.display = 'flex';
}
// 显示编辑笔记对话框
function showEditDialog(note) {
    document.getElementById('note-id').value = note.id;
    document.getElementById('title-input').value = note.title;
    document.getElementById('content-input').value = note.content;
    window.selectedCategories = note.categories.slice();
    updateCategoryCheckboxes();
    document.getElementById('dialog-overlay').style.display = 'flex';
}
// 隐藏对话框
function hideAddDialog() {
    document.getElementById('dialog-overlay').style.display = 'none';
}
// 保存笔记（新增或编辑）
function saveNote() {
    const id = document.getElementById('note-id').value || Date.now().toString(); // 使用时间戳作为新笔记ID
    const title = document.getElementById('title-input').value;
    const content = document.getElementById('content-input').value;
    const selectedCategories = window.selectedCategories || [];
    if (title && content && selectedCategories.length > 0) {
        // 编辑时保留原有isPrivate属性，新增默认为私密
        //公开=“false;”
        let isPrivate = true;
        const existingIndex = notes.findIndex(n => n.id === id);
        if (existingIndex !== -1 && typeof notes[existingIndex].isPrivate === 'boolean') {
            isPrivate = notes[existingIndex].isPrivate;
        }
        // 若编辑时原有color字段，保留
        let color = '';
        if (existingIndex !== -1 && notes[existingIndex].color) color = notes[existingIndex].color;
        // 添加创建日期字段，如果是新建则用当前时间，编辑则保留原有日期
        let createdAt = Date.now();
        if (existingIndex !== -1 && notes[existingIndex].createdAt) {
            createdAt = notes[existingIndex].createdAt;
        }
        const note = { id, title, content, categories: selectedCategories.slice(), isPrivate, createdAt };
        if (color) note.color = color;
        // 其余逻辑不变
        if (existingIndex !== -1) {
            // 编辑现有笔记
            notes[existingIndex] = note;
            // 保持颜色（如果页面上有自定义）
            if (notes[existingIndex].color) note.color = notes[existingIndex].color;
            Object.keys(categories).forEach(category => {
                categories[category] = categories[category].filter(n => n.id !== id);
                if (selectedCategories.includes(category)) {
                    categories[category].push(note);
                }
            });
        } else {
            // 新增笔记
            notes.push(note);
            selectedCategories.forEach(category => {
                if (categories[category]) {
                    categories[category].push(note);
                }
            });
        }
        saveNotes();
        document.getElementById('title-input').value = '';
        document.getElementById('content-input').value = '';
        window.selectedCategories = [];
        updateCategoryCheckboxes();
        hideAddDialog();
        reloadNotes();
    } else {
        alert('请填写标题、内容并至少选择一个分类');
    }
}
// 删除笔记
function removeNote(card, note, category) {
    categories[category] = categories[category].filter(n => n.id !== note.id);
    note.categories = note.categories.filter(cat => cat !== category);
    if (note.categories.length === 0) {
        notes = notes.filter(n => n.id !== note.id);
    }
    card.remove();
    saveNotes();
}
// 重新加载笔记（管理员模式切换时）
function reloadNotes() {
    document.querySelectorAll('.note-container').forEach(container => container.innerHTML = '');
    loadSections();
}
// 切换管理员模式
function toggleAdminMode() {
    const passwordInput = document.getElementById('admin-password');
    const adminBtn = document.getElementById('admin-mode-btn');
    const addControls = document.querySelector('.add-controls');
    const customizationControls = document.querySelector('.customization-controls');
    if (!isAdmin) {
        verifyPassword(passwordInput.value).then(isValid => {
            if (isValid) {
                isAdmin = true;
                adminBtn.textContent = "退出管理模式";
                addControls.style.display = 'flex';
                customizationControls.style.display = 'block';
                reloadNotes();
                if (window.location.pathname === '/admin') {
                    window.history.pushState({}, '', '/'); // 隐藏 /admin 路径
                }
            } else {
                alert('密码错误');
            }
        });
    } else {
        isAdmin = false;
        adminBtn.textContent = "进入管理模式";
        addControls.style.display = 'none';
        customizationControls.style.display = 'none';
        const deleteButtons = document.querySelectorAll('.delete-btn');
        deleteButtons.forEach(btn => btn.style.display = 'none');
        reloadNotes();
    }
    passwordInput.value = '';
}
// 切换明暗主题
function toggleTheme() {
    isDarkTheme = !isDarkTheme;
    document.body.style.backgroundColor = isDarkTheme ? '#121212' : 'rgb(199, 255, 255)';
    document.body.style.color = isDarkTheme ? '#ffffff' : '#333';
    const notes = document.querySelectorAll('.note');
    notes.forEach(note => {
        note.style.backgroundColor = isDarkTheme ? '#1e1e1e' : '#a0c9e5';
        note.style.color = isDarkTheme ? '#ffffff' : '#333';
        note.style.boxShadow = isDarkTheme ? '0 4px 8px rgba(0, 0, 0, 0.5)' : '0 4px 8px rgba(0, 0, 0, 0.1)';
    });
    const dialogBox = document.getElementById('dialog-box');
    dialogBox.style.backgroundColor = isDarkTheme ? '#1e1e1e' : '#ffffff';
    dialogBox.style.color = isDarkTheme ? '#ffffff' : '#333';
    const inputs = dialogBox.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.style.backgroundColor = isDarkTheme ? '#333333' : '#ffffff';
        input.style.color = isDarkTheme ? '#ffffff' : '#333';
    });
}
// 验证管理员密码
async function verifyPassword(inputPassword) {
    const response = await fetch('/api/verifyPassword', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: inputPassword })
    });
    const result = await response.json();
    return result.valid;
}
// 初始化页面
loadNotes();
</script>
<footer id="footer" style="width:100%;text-align:center;padding:24px 0 12px 0; background:rgba(0,0,0,0.04);margin-top:40px;">
  <div style="margin-bottom:8px;">
    <a href="https://youtube.com/你的频道" target="_blank" title="YouTube" class="footer-icon">
      <img src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/youtube.svg" alt="YouTube" style="width:28px;height:28px;margin:0 10px;vertical-align:middle;">
    </a>
    <a href="https://x.com/你的账号" target="_blank" title="X" class="footer-icon">
      <img src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/x.svg" alt="X" style="width:28px;height:28px;margin:0 10px;vertical-align:middle;">
    </a>
    <a href="https://discord.com/你的账号" target="_blank" title="discord" class="footer-icon">
      <img src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/discord.svg" alt="discord" style="width:28px;height:28px;margin:0 10px;vertical-align:middle;">
    </a>
    <a href="https://instagram.com/你的账号" target="_blank" title="Instagram" class="footer-icon">
      <img src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/instagram.svg" alt="Instagram" style="width:28px;height:28px;margin:0 10px;vertical-align:middle;">
    </a>
    <a href="https://github.com/akxxxxxxxxx9" target="_blank" title="GitHub" class="footer-icon">
      <img src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/github.svg" alt="GitHub" style="width:28px;height:28px;margin:0 10px;vertical-align:middle;">
    </a>
    <a href="https://web.telegram.org/你的账号" target="_blank" title="telegram" class="footer-icon">
      <img src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/telegram.svg" alt="telegram" style="width:28px;height:28px;margin:0 10px;vertical-align:middle;">
    </a>
  </div>
  <div style="margin-top:10px;font-size:15px;color:#555;">
  team：SUOU AKI
  </div>
  <div style="margin-top:8px;font-size:13px;color:#aaa;">
    &copy; 2025 AKI | Powered by Cloudflare Workers
  </div>
</footer>
</body>
<style>
#toast-notice {
  visibility: hidden;
  min-width: 160px;
  background: rgba(0,0,0,0.75);
  color: #fff;
  text-align: center;
  border-radius: 4px;
  padding: 12px 24px;
  position: fixed;
  left: 50%;
  bottom: 60px;
  font-size: 16px;
  z-index: 9999;
  transform: translateX(-50%);
  transition: visibility 0s, opacity 0.3s linear;
  opacity: 0;
}
#toast-notice.show {
  visibility: visible;
  opacity: 1;
}
</style>
<div id="toast-notice"></div>
<script>
// EasyMDE富文本Markdown编辑器逻辑
let easyMDE;
function initEasyMDE() {
    if (!easyMDE) {
        easyMDE = new EasyMDE({
            element: document.getElementById('content-input'),
            spellChecker: false,
            minHeight: "300px",
            maxHeight: "600px", // 约30行
            placeholder: "支持Markdown语法，图片可粘贴/拖拽",
            toolbar: [
                "bold", "italic", "heading", "|",
                "quote", "unordered-list", "ordered-list", "|",
                "link", "image", "table", "code", "preview", "side-by-side", "fullscreen"
            ]
        });
    }
}
// 弹窗打开时初始化编辑器并清空内容
const _oldShowAddDialog = showAddDialog;
showAddDialog = function() {
    _oldShowAddDialog && _oldShowAddDialog();
    setTimeout(() => {
        initEasyMDE();
        if (easyMDE) easyMDE.value("");
    }, 0);
}
// 编辑时赋值内容
const _oldShowEditDialog = showEditDialog;
showEditDialog = function(note) {
    _oldShowEditDialog && _oldShowEditDialog(note);
    setTimeout(() => {
        initEasyMDE();
        if (easyMDE && note && note.content) easyMDE.value(note.content);
    }, 0);
}
// 保存时优先从easyMDE读取内容
const _oldSaveNote = saveNote;
saveNote = function() {
    if (easyMDE) {
        document.getElementById('content-input').value = easyMDE.value();
    }
    _oldSaveNote && _oldSaveNote();
}

function showToast(msg) {
  const toast = document.getElementById('toast-notice');
  toast.textContent = msg;
  toast.className = 'show';
  toast.style.visibility = 'visible';
  toast.style.opacity = '1';
  setTimeout(() => {
    toast.className = '';
    toast.style.opacity = '0';
    toast.style.visibility = 'hidden';
  }, 1500);
}
</script>
</html>`;
// Cloudflare Worker 处理请求
  /**
   *  Cloudflare Worker 处理 HTTP 请求
   *  @param {Request} request HTTP 请求对象
   *  @param {Object} env  Cloudflare Worker 的环境变量
   *  @return {Promise<Response>}  HTTP 响应对象
   */
export default {
    // 处理 HTTP 请求
    async fetch(request, env) {
        const url = new URL(request.url);
        // 处理根路径和 /admin 路径，返回 HTML 页面
        if (url.pathname === '/' || url.pathname === '/admin') {
            return new Response(HTML_CONTENT, {
                headers: { 'Content-Type': 'text/html' }
            });
        }
        // 获取笔记列表
        if (url.pathname === '/api/getNotes') {
            const userId = url.searchParams.get('userId');
            const notes = await env.AA.get(userId);
            return new Response(notes || JSON.stringify([]), { status: 200 });
        }
        // 保存笔记
        if (url.pathname === '/api/saveNotes' && request.method === 'POST') {
            const { userId, notes } = await request.json();
            await env.AA.put(userId, JSON.stringify(notes));
            return new Response(JSON.stringify({ success: true }), { status: 200 });
        }
        // 验证管理员密码
        if (url.pathname === '/api/verifyPassword' && request.method === 'POST') {
            const { password } = await request.json();
            const isValid = password === env.BB;
            return new Response(JSON.stringify({ valid: isValid }), {
                status: isValid ? 200 : 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        // 获取标题样式
        if (url.pathname === '/api/getStyles') {
            const userId = url.searchParams.get('userId');
            const type = url.searchParams.get('type');
            const styles = await env.AA.get(userId + '_' + type);
            return new Response(styles || JSON.stringify({}), { status: 200 });
        }
        // 保存标题样式
        if (url.pathname === '/api/saveStyles' && request.method === 'POST') {
            const { userId, type, styles } = await request.json();
            await env.AA.put(userId + '_' + type, JSON.stringify(styles));
            return new Response(JSON.stringify({ success: true }), { status: 200 });
        }
        // 处理未找到的路径
        return new Response('未找到', { status: 404 });
    }
};

