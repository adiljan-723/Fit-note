# Fit Note Git 常用指令指南

本文档用于记录 Fit Note 小程序后续开发中常用的 Git 指令、使用场景和解释。

当前项目目录：

```powershell
c:\Users\86178\CodeBuddy\20260517223703
```

当前 GitHub 仓库地址：

```text
https://github.com/adiljan-723/Fit-note
```

---

## 一、每次开发最常用流程

### 1. 进入项目目录

```powershell
cd "c:\Users\86178\CodeBuddy\20260517223703"
```

作用：进入 Fit Note 小程序项目所在文件夹。

---

### 2. 查看当前修改状态

```powershell
git status
```

作用：查看哪些文件被修改、新增或删除。

建议：每次开发前、开发后都运行一次。

---

### 3. 查看具体改了什么

```powershell
git diff
```

作用：查看代码具体修改内容。

如果文件已经执行过 `git add`，可以用：

```powershell
git diff --staged
```

---

### 4. 暂存所有修改

```powershell
git add .
```

作用：把当前所有修改加入本次提交。

如果只想提交某一个文件：

```powershell
git add README.md
```

---

### 5. 提交一次版本

```powershell
git commit -m "本次修改说明"
```

示例：

```powershell
git commit -m "接入 CloudBase 登录功能"
```

作用：保存一个本地版本节点。以后出问题可以回看或回退。

---

### 6. 推送到 GitHub

```powershell
git push
```

作用：把本地提交上传到 GitHub 仓库。

---

## 二、推荐的日常开发顺序

每次完成一个功能后，建议按这个顺序执行：

```powershell
git status
git diff
git add .
git commit -m "描述这次完成的功能"
git push
```

例如：

```powershell
git status
git add .
git commit -m "新增训练记录云端同步"
git push
```

---

## 三、查看历史记录

### 查看提交历史

```powershell
git log
```

简洁查看：

```powershell
git log --oneline
```

作用：查看之前每一次提交的记录。

---

### 查看最近一次提交

```powershell
git log --oneline -1
```

作用：确认最近一次提交是什么。

---

## 四、分支相关指令

分支适合用来开发较大的新功能，例如后端改造、UI 重构、上线版本等。

### 查看当前分支

```powershell
git branch
```

当前主要分支一般是：

```text
main
```

---

### 创建并切换到新分支

```powershell
git checkout -b 分支名
```

示例：

```powershell
git checkout -b feature-cloudbase-sync
```

作用：创建一个新分支，专门开发某个功能。

---

### 切回主分支

```powershell
git checkout main
```

---

### 合并分支到 main

先切回 `main`：

```powershell
git checkout main
```

再合并功能分支：

```powershell
git merge feature-cloudbase-sync
```

作用：把功能分支中的代码合并回主分支。

---

## 五、回退和撤销

### 撤销某个文件的未提交修改

```powershell
git checkout -- 文件名
```

示例：

```powershell
git checkout -- app.wxss
```

作用：把这个文件恢复到上一次提交时的状态。

注意：未保存到 Git 的修改会丢失。

---

### 取消已经 add 的文件

```powershell
git restore --staged 文件名
```

示例：

```powershell
git restore --staged README.md
```

作用：把文件从暂存区移出来，但保留文件内容修改。

---

### 查看某次提交的内容

```powershell
git show 提交ID
```

示例：

```powershell
git show 37636c5
```

---

### 回到某个历史版本查看

```powershell
git checkout 提交ID
```

注意：这通常只是临时查看历史版本，不建议随便在这个状态下继续开发。

回到最新主分支：

```powershell
git checkout main
```

---

## 六、标签版本管理

标签适合给重要版本打标记，例如 `v0.8.0`、`v1.0.0`。

### 创建标签

```powershell
git tag v0.8.0
```

### 推送标签到 GitHub

```powershell
git push origin v0.8.0
```

### 查看所有标签

```powershell
git tag
```

建议：当 Fit Note 达到一个稳定版本时，可以打标签。

---

## 七、拉取 GitHub 最新代码

```powershell
git pull
```

作用：把 GitHub 上的最新代码同步到本地。

如果以后你换电脑开发，或者在 GitHub 网页上改过文件，开发前建议先运行：

```powershell
git pull
```

---

## 八、查看远程仓库地址

```powershell
git remote -v
```

作用：确认当前项目连接的是哪个 GitHub 仓库。

当前应该显示：

```text
https://github.com/adiljan-723/Fit-note.git
```

---

## 九、修改远程仓库地址

如果以后换了 GitHub 仓库地址，可以用：

```powershell
git remote set-url origin 新仓库地址
```

示例：

```powershell
git remote set-url origin https://github.com/adiljan-723/Fit-note.git
```

---

## 十、适合 Fit Note 的提交说明示例

可以使用这些提交说明：

```text
优化首页数据展示
新增动作详情页图解区域
修复计划页空状态样式
接入 CloudBase 初始化
新增 login 云函数
新增训练记录云端同步
新增饮食记录云端同步
优化我的页面用户信息展示
准备 v1.0.0 上线版本
```

建议：一次提交只对应一个相对完整的小功能，不要把很多无关修改混在一次提交里。

---

## 十一、遇到问题时先运行的指令

如果不知道当前 Git 状态，先运行：

```powershell
git status
```

如果推送失败，查看远程地址：

```powershell
git remote -v
```

如果想确认最近提交：

```powershell
git log --oneline -1
```

如果想确认本地分支和远程分支关系：

```powershell
git status --short --branch
```

---

## 十二、以后可以直接让我这样做

你可以直接对我说：

```text
请帮我实现训练记录云端同步，完成后提交并推送到 GitHub。
```

或者：

```text
请帮我创建一个新分支开发 CloudBase 后端功能。
```

或者：

```text
请帮我查看当前 Git 状态，并告诉我哪些文件还没提交。
```

我可以帮你完成代码修改、提交说明整理、提交和推送。
