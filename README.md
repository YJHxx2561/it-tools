## BREAKING CHANGE for Container Image

Since the *base image* is now `nginx-unpriviledged` the container will now listen to port **8080** and not 80. So you need to update your port mapping, i.e. from `8080:80` to `8080:8080`.

You can override listening port using environment variable `PORT` (docker option `-e PORT=8888`).

If the container needs to listen to IPv6, it needs to be enabled: https://serverfault.com/questions/1147296/how-to-enable-ipv6-on-ubuntu-20-04. Alternatively, you can mount your own `nginx.conf` own using docker option `-v "./nginx.conf:/etc/nginx/templates/default.conf.template"` (with `listen [::]:8080;` removed)

## PR Welcome

Especially for UI improvements and translation. And for anything else.

Want to support this fork of IT Tools: [Buy me a coffee](https://www.buymeacoffee.com/sharevb)

## HTTPS is recommended

Some tools like PGP encryption rely on WebCrypto API that is only available in HTTPS/SSL. Also, if you want to use PWA, HTTPS is required.

So even on internal installations, you should enable HTTPS using Let's Encrypt using DNS Challenge

Some docs about DNS Challenge:
- https://medium.com/@life-is-short-so-enjoy-it/homelab-nginx-proxy-manager-setup-ssl-certificate-with-domain-name-in-cloudflare-dns-732af64ddc0b
- https://doc.traefik.io/traefik/user-guides/docker-compose/acme-dns/
- https://medium.com/@svenvanginkel/traefik-letsencrypt-dns01-challenge-with-ovhcloud-52f2a2c6d08a

Related doc for CyberPanel: https://community.cyberpanel.net/t/reverse-proxy-traffic-to-docker-container-on-cyberpanel/30644

### Check out these change here: <https://sharevb-it-tools.vercel.app/> or <https://sharevb.github.io/it-tools/>

You can use my image in your docker-compose/quadlet file if you want an up-to-date version of it-tools (with my PR and some of others) until the main branch has been updated.

- github action triggers on every push to this branch - [view package here](https://github.com/sharevb/it-tools/pkgs/container/it-tools)

(Thanks to [gitmotion](https://github.com/gitmotion/it-tools) for this model of README fork)

## Contributors

Big thanks to all the people who have already contributed!

[![contributors](https://contrib.rocks/image?repo=sharevb/it-tools&refresh=1)](https://github.com/sharevb/it-tools/graphs/contributors)

## Development under Windows

Use of WSL2 is recommended to develop using VSCode on Windows. Direct development is tricky (because of some dependencies)

## Added features

- Almost [all tools PR, 192 of mine, of original it-tools](https://github.com/CorentinTh/it-tools/pulls)
- 95% of [issues if original it-tools](https://github.com/CorentinTh/it-tools/issues)
- Full UI translation in many language (Google Translated)
- Many [new tools](https://sharevb-it-tools.vercel.app/about)
- Many bug fixes and enhancements
- Many customizations (Docker version), see below

## Container images

[GitHub Container Registry](https://github.com/sharevb/it-tools/pkgs/container/it-tools): `ghcr.io/sharevb/it-tools:latest`

[Docker Hub](https://hub.docker.com/r/sharevb/it-tools): `sharevb/it-tools:latest`

```bash
docker run --pull always --restart unless-stopped -p 8080:8080 sharevb/it-tools:latest
```

Other existing docker tags: `latest-en` (english only)

## Use in Docker Compose file

```yml
services:
  it-tools:
    container_name: it-tools
    image: sharevb/it-tools:latest
    pull_policy: always
    restart: unless-stopped
    ports:
      - 8080:8080
```

## Use in Podman Quadlet file

```
[Unit]
Description=IT Tools container
After=network-online.target

[Container]
AutoUpdate=registry
Image=ghcr.io/sharevb/it-tools:latest
PublishPort=8080:8080
Label=io.containers.autoupdate=registry

[Install]
WantedBy=multi-user.target default.target

[Service]
Restart=always
```


## Filter tools and add home custom content

You can add custom content in Home page by mounting a `home.custom.md` in `/usr/share/nginx/html`.

You can filter available tools by mounting `tools-filter.json` in `/usr/share/nginx/html`. It can contains the following filtering regex:
```json
{
  "excludeCategoryFilterRegex": "",
  "includeCategoryFilterRegex": "",
  "excludeToolsFilterRegex": "",
  "includeToolsFilterRegex": ""
}
```
Category matches on category (English) names ; Tools matches on tools path/url.

See [docker-tools-filter-and-home-content](https://github.com/sharevb/it-tools)

## Add custom external tools

You can add custom external tools (href or markdownContent) by mounting a `external-tools.json` in `/usr/share/nginx/html` with the following structure:

```json
[
  {
    "name": "GitHub",
    "path": "/github",
    "description": "Link to Github",
    "keywords": ["github"],
    "category": "Links",
    "href": "https://github.com"
  },
  {
    "name": "Some text",
    "path": "/some-text",
    "description": "Some description",
    "keywords": ["some"],
    "category": "Links",
    "markdownContent": "Some useful **text**\n\nin *markdown*"
  }
]
```

See [docker-tools-filter-and-home-content](https://github.com/sharevb/it-tools)

## Setting default tools parameters / default UI language at runtime

You can set default tool parameters by mounting a `tools-settings.json` in `/usr/share/nginx/html`.

It is a two level json, with the first level being for `tool name` and the second level for `parameter name`:
```json
{
  "regex-tester": {
    "multi": true,
    "regex": "some regex",
    "global": false
  }
}
```

You can find `tool name` and `parameter name` in the tools source code `src/tools` subfolder :
- example pattern for `const global = useQueryParamOrStorage({ storageName: 'regex-tester:g', name: 'global', defaultValue: true });`:
```json
{
  "regex-tester": {
    "global": false
  }
}
```
- example pattern for `const value = useQueryParam({ tool: 'barcode-gen', name: 'text', defaultValue: '123456789' });`:
```json
{
  "barcode-gen": {
    "text": "4356"
  }
}
```
- example pattern for `const width = useITStorage('ascii-text-drawer:width', 80);`:
```json
{
  "ascii-text-drawer": {
    "width": 80
  }
}
```

To define the default UI language, add a `default_locale` key to json:
```json
{
  "default_locale": "fr"
}
```

## To build using a custom default language:

```
docker build -t it-tools-fr --build-arg VITE_LANGUAGE=fr .
docker run -d --name it-tools-fr --restart unless-stopped -p 8080:8080 it-tools-fr
```

## Build container image for a custom subfolder

According to https://github.com/sharevb/it-tools/pull/461#issuecomment-1602506049 and https://github.com/CorentinTh/it-tools/pull/461:
```
docker build -t it-tools  --build-arg BASE_URL="/my-folder/" .
docker run -d --name it-tools --restart unless-stopped -p 8080:8080 it-tools
```

Then if you go to `http://localhost:8080` you'll get a blank page, but opening the DevTools (& refreshing) you'll notice in the Network tab that the app is trying to fetch assets from `/my-folder/...`

So you would need to put another server in front of it, like [Nginx Proxy Manager](https://nginxproxymanager.com/), [Traefik](https://traefik.io/traefik/), [caddy](https://caddyserver.com/) etc. Then setup a reverse proxy pass using `/my-folder`

## Docker compose for hosting in a `/it-tools/` subfolder

For `/it-tools/` subfolder, you can use `baseurl-it-tools` tag.

See [sample of docker-compose.yml and nginx.conf](https://github.com/sharevb/it-tools/tree/chore/all-my-stuffs/docker-subfolder-sample), this docker image needs to have another reverse proxy in front of it, like [Nginx Proxy Manager](https://nginxproxymanager.com/), [Traefik](https://traefik.io/traefik/), [caddy](https://caddyserver.com/) etc. 

Setup a reverse proxy pass using `/it-tools/`. And you should be able to access it-tools in `/it-tools/` of your server.

An example of nginx reverse proxy configuration is available at: https://github.com/sharevb/it-tools/tree/chore/all-my-stuffs/docker-subfolder-sample

To run the sample:

```bash
git clone https://github.com/sharevb/it-tools
cd it-tools/docker-subfolder-sample/
docker compose up
```

Then navigate to http://localhost:8080/it-tools/

## To build using a custom folder:

1. `BASE_URL="/it-tools/" pnpm build`
2. Rename the generated `dist` folder to `it-tools` and serve on `https://your-domain.com/it-tools`

## To build for GitHub Pages:

1. Enable GitHub Pages build and deployment option in your fork, under **Settings** > **Pages** and select **GitHub Actions** as the source
2. Add the following GitHub action to your repo: https://github.com/sharevb/it-tools/tree/chore/all-my-stuffs/.github/workflows/sharevb-github-pages-publish.yml

## 部署到 Cloudflare Pages

### 推荐方法：通过 Cloudflare 连接 GitHub 仓库（自动部署）

这是最简单的部署方式，Cloudflare 会自动连接您的 GitHub 仓库，每次推送代码时自动构建和部署。

#### 步骤 1：准备 GitHub 仓库

确保您的项目已推送到 GitHub 仓库：

```bash
git remote add origin https://github.com/<your-username>/<your-repo>.git
git branch -M main
git push -u origin main
```

#### 步骤 2：创建 Cloudflare Pages 项目

1. 访问 https://dash.cloudflare.com/
2. 导航到 **Workers & Pages** > **Pages**
3. 点击 **Create a project**
4. 选择 **Connect to Git**

#### 步骤 3：连接 GitHub 仓库

1. 选择您的 GitHub 账户
2. 在仓库列表中找到并选择 `it-tools` 仓库
3. 点击 **Begin setup**

#### 步骤 4：配置构建和部署设置

在 **Build settings** 页面，配置以下内容：

| 设置项 | 值 | 说明 |
|--------|-----|------|
| **Production branch** | `main` | 生产环境分支 |
| **Build command** | `pnpm install --ignore-scripts && pnpm build` | 安装依赖并构建项目 |
| **Build output directory** | `dist` | 构建产物输出目录 |
| **Root directory** | `.` | 项目根目录 |
| **Environment** | `Node.js` | 运行环境 |
| **Node.js version** | `20` | Node.js 版本 |

#### 步骤 5：配置环境变量（可选）

如果需要设置环境变量，在 **Environment variables** 下添加：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `BASE_URL` | `/` | 站点基础路径 |
| `VITE_AVAILABLE_LOCALES` | `*` | 可用语言（`*` 表示全部） |

#### 步骤 6：开始部署

点击 **Save and Deploy**，Cloudflare 会：
1. 自动拉取 GitHub 仓库代码
2. 执行构建命令 `pnpm install --ignore-scripts && pnpm build`
3. 将 `dist` 目录的内容部署到 Cloudflare Pages

部署完成后，您的网站将在 `https://<project-name>.pages.dev` 上线。

#### 步骤 7：配置自定义域名（可选）

1. 在 Cloudflare Pages 项目中，点击 **Custom domains**
2. 点击 **Add custom domain**
3. 输入您的域名（如 `tools.example.com`）
4. 按照提示在域名注册商处配置 DNS 记录

---

### 其他部署方法

#### 方法二：使用 Wrangler CLI 直接部署

如果您已在本地构建好项目，可以使用 Wrangler CLI 直接部署：

1. **安装 Wrangler**
   ```bash
   npm install -g wrangler
   ```

2. **登录 Cloudflare**
   ```bash
   wrangler login
   ```

3. **构建项目**
   ```bash
   pnpm install --ignore-scripts
   pnpm build
   ```

4. **部署到 Cloudflare Pages**
   ```bash
   wrangler pages deploy dist --project-name=<your-project-name>
   ```

#### 方法三：使用 GitHub Actions 部署

如果您希望通过 GitHub Actions 控制部署流程，可以创建以下工作流文件：

创建 `.github/workflows/cloudflare-pages.yml`：

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Install pnpm
        uses: pnpm/action-setup@v3
        with:
          version: 9

      - name: Install Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --ignore-scripts

      - name: Build project
        run: pnpm build

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: <your-project-name>
          directory: dist
```

然后在 GitHub 仓库的 **Settings** > **Secrets and variables** > **Actions** 中添加：
- `CLOUDFLARE_API_TOKEN`：您的 Cloudflare API Token
- `CLOUDFLARE_ACCOUNT_ID`：您的 Cloudflare 账户 ID

---

### 构建配置说明

#### 构建命令详解

```bash
pnpm install --ignore-scripts && pnpm build
```

- `pnpm install --ignore-scripts`：安装所有依赖，跳过脚本执行（避免不必要的构建步骤）
- `pnpm build`：执行 `package.json` 中的 `build` 脚本，即 `vue-tsc --noEmit && . ./set_node_mem.sh && vite build`
  - `vue-tsc --noEmit`：TypeScript 类型检查
  - `. ./set_node_mem.sh`：设置 Node.js 内存限制
  - `vite build`：使用 Vite 构建项目，输出到 `dist` 目录

#### 输出目录

构建完成后，所有静态资源会输出到 `dist` 目录，包括：
- `index.html`：入口 HTML 文件
- `assets/`：JavaScript、CSS 和静态资源文件
- `locales/`：多语言配置文件
- `favicon-*.png`：网站图标

#### 环境变量说明

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `BASE_URL` | `/` | 站点基础路径，用于非根域名部署 |
| `VITE_AVAILABLE_LOCALES` | `*` | 可用语言列表，`*` 或 `all` 表示全部语言 |
| `VERCEL` | 无 | 设置后会调整构建配置以适配 Vercel 环境 |

---

### 重要注意事项

- **预览部署**：Cloudflare Pages 会自动为 Pull Request 创建预览部署，方便您在合并前查看效果
- **构建日志**：可以在 Cloudflare Pages 仪表板的 **Deployments** 标签中查看构建日志，排查构建失败问题
- **缓存策略**：Cloudflare Pages 默认会缓存静态资源，新版本部署后可能需要清除浏览器缓存
- **SSL 证书**：Cloudflare Pages 会自动为您的站点配置免费的 SSL 证书
- **自定义 404 页面**：可以在项目中创建 `src/404.vue` 来自定义 404 页面

## To add authentication

Assuming you're already hosting it-tools behind a reverse proxy, you can configure forward-auth and enforce authentication from the reverse proxy

* [Official guides](https://docs.goauthentik.io/docs/add-secure-apps/providers/proxy/server_nginx) with nginx. Guides with other reverse proxy setups are available
* [Step-by-step setup guide with nginx-proxy-manager](https://geekscircuit.com/set-up-authentik-sso-with-nginx-proxy-manager/)

(thanks @jogerj)

## Deploy as LXC container

In Proxmox VE, you can use docker image directly:
```bash
sudo lxc-create -n sharevb-it-tools -t oci -- --url docker://ghcr.io/sharevb/it-tools:latest
```

## Contribute

### Recommended IDE Setup

To install VSCode in WSL2 (Windows), see: https://learn.microsoft.com/en-us/windows/wsl/tutorials/wsl-vscode

[VSCode](https://code.visualstudio.com/) with the following extensions:

- [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur)
- [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [i18n Ally](https://marketplace.visualstudio.com/items?itemName=lokalise.i18n-ally)

with the following settings:

```json
{
  "editor.formatOnSave": false,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "i18n-ally.localesPaths": ["locales", "src/tools/*/locales"],
  "i18n-ally.keystyle": "nested"
}
```

### Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin) to make the TypeScript language service aware of `.vue` types.

If the standalone TypeScript plugin doesn't feel fast enough to you, Volar has also implemented a [Take Over Mode](https://github.com/johnsoncodehk/volar/discussions/471#discussioncomment-1361669) that is more performant. You can enable it by the following steps:

1. Disable the built-in TypeScript Extension
   1. Run `Extensions: Show Built-in Extensions` from VSCode's command palette
   2. Find `TypeScript and JavaScript Language Features`, right click and select `Disable (Workspace)`
2. Reload the VSCode window by running `Developer: Reload Window` from the command palette.

### Project Setup

```sh
pnpm install --ignore-scripts
```

### Compile and Hot-Reload for Development

```sh
pnpm dev
```

### Type-Check, Compile and Minify for Production

```sh
pnpm build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
pnpm test
```

### Lint with [ESLint](https://eslint.org/)

```sh
pnpm lint
```

### Ensure CI (lock, eslint, typecheck) will succeed

Before submitting a PR, run:

```sh
pnpm install --ignore-scripts && pnpm lint --fix && pnpm typecheck
```

### Create a new tool

To create a new tool, there is a script that generate the boilerplate of the new tool, simply run:

```sh
pnpm run script:create:tool my-tool-name
```

It will create a directory in `src/tools` with the correct files. You will need to fill `src/tools/_my-tool-name_/index.ts` with tool name, category, description... and then develop the tool.

## Installation methods

Local installation required installing first: `python3 make g++`

| Container Image                         | Local Installation                                                                                                          |
|-----------------------------------------|-----------------------------------------------------------------------------------------------------------------------------|
| GitHub Container Registry: <span title="triple click me!">`ghcr.io/sharevb/it-tools:latest`</span><br/>Docker Hub: <span title="triple click me!">`sharevb/it-tools:latest`</span> | <span title="triple click me!">`sudo apt-get install python3 make g++ && git clone -b chore/all-my-stuffs https://github.com/sharevb/it-tools.git && cd it-tools/ && pnpm i --ignore-scripts && pnpm dev`</span> |
| replace your current image with this image | copy & paste oneliner (from github repo) |
| You may need to clear cache and hard reload to get new features loading | Installing packages for the first time may take some time; please wait until it finishes |

<picture>
    <source srcset="./.github/logo-dark.png" media="(prefers-color-scheme: light)">
    <source srcset="./.github/logo-white.png" media="(prefers-color-scheme: dark)">
    <img src="./.github/logo-dark.png" alt="logo">
</picture>

## License

This project is under the [GNU GPLv3](LICENSE).