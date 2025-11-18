# aki-nav
**无需服务器搭建个人导航web**

## 搭建步骤
- 登录[cluodflare](https://dash.cloudflare.com/)
- 点击`Compute (Workers)`
- Create创建
- 选择**Start with Hello World!**
- 名称随意
- 编辑代码：将项目代码粘贴部署即可

---

### 创建kv
1.在 Cloudflare 控制台，进入 Workers & Pages -> KV。
名称随意
2.创建后，为此 KV 添加两个条目，用于设置后台登录的 用户名 和 密码。
- admin_username: 你的管理员用户名（例如 admin）
- admin_password: 你的管理员密码
`v1.01.06需要额外创建kv 名称随意`
```
admin_username
```

```
admin_username
```

### 创建 D1 
1.在 Cloudflare 控制台，进入 Workers & Pages -> D1。
2.点击 创建数据库，输入数据库名称，然后创建。

3.进入数据库的控制台，执行下方的 SQL 语句来快速创建所需的表结构。
---

1. 建立書籤表 (sites)

```
CREATE TABLE sites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  logo TEXT,
  desc TEXT,
  catelog TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_private INTEGER DEFAULT 0 NOT NULL,
  create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```



2. 建立分類表 (catalogs)
````
CREATE TABLE catalogs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  sort_order INTEGER DEFAULT 0,
  is_private INTEGER DEFAULT 0 NOT NULL
);
```



3. 建立待審核書籤表 (pending_sites)
```
CREATE TABLE pending_sites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  logo TEXT,
  desc TEXT,
  catelog TEXT NOT NULL,
  create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```


```
ALTER TABLE catalogs ADD COLUMN icon TEXT;
```
>**提示**: ·使用 SQL 是最快捷的方式。如果你想手动建表，请确保字段名、类型与上述 SQL 一致。



### 绑定服务
1.进入你刚刚创建的 Worker 的 设置 -> 变量。

2.在 D1 数据库绑定 中，点击 添加绑定：
变量名称:

```
 NAV_DB
```

D1 数据库: 选择你创建的 d1

3.在 KV 命名空间绑定 中，点击 添加绑定：
变量名称:

```
NAV_AUTH
```
KV 命名空间: 选择你创建的 kv
`v1.01.06需要额外绑定kv 变量名称:
```
NAV_SETTINGS
```

---

### 成功部署
1.访问你的 Worker 域名（例如 my-nav.your-subdomain.workers.dev）。

2.访问 你的域名/admin 进入后台，使用你在 Kv中设置的用户名和密码登录。






