# dsh-ui-placement

Two placement fixes for the DeepSeek Harness Web page, shipped as one stylesheet.

| 位置 | 原来是 | 现在是 |
| --- | --- | --- |
| 提问卡的「跳过 / 提交」 | 被 `space-between` 顶在卡片最右边 | 收到中间偏右（`clamp(24px, 26%, 320px)`） |
| 输入区整列 | 卡片居中且很宽，窗口一窄右边缘就伸到右下角宠物下面 | 在 880–1560px 区间整列左移一条让位通道 |

不改 DSH 本体源码，不动 `app.asar`：本插件只通过 `webserver/index-inject` 往页面 `<head>` 加一条 `<style>`，停用即消失，布局立刻回到原样。

## 为什么是容器而不是按钮

被压住的是**输入区右半边**——卡片里的尾部控件和下面那排状态项，不是某几个按钮。挪单个按钮既治不好，也会让两排对不齐，所以调整落在容器 `[data-composer-seat]` 上：内容盒从右侧收窄，居中的卡片在剩下的空间里重新居中，整列一起左移、宽度不变，输入框每行的字数也不变。

用 `padding` 而不是 `transform`：`transform` 会让该元素成为 `position: fixed` 子元素的包含块，输入区里的下拉面板是 fixed 定位的，会被钉在这个元素里而不是视口上。

## 调参

避让量只有一个变量，写在 `:root` 上：

```css
--dsh-ui-placement-pet-lane
```

默认 `0px`（宽屏完全不动）。只在 `880px–1560px` 区间取 `clamp(48px, 7.5vw, 112px)`：

- 更宽的窗口，卡片本来就结束在宠物左边，没有要修的东西
- 更窄的窗口，留通道会挤掉卡片本身，该让步的是宠物而不是输入区

换了宠物大小或位置，改这一个值即可。想整条关掉，把它设成 `0px`，或者直接停用本插件。

## 安装

```sh
dsh plugin --profile <profile> add https://github.com/inaflash123/dsh-ui-placement/releases/download/v0.1.0/dsh-ui-placement-0.1.0.tgz
```

或从源码目录：

```sh
dsh plugin --profile <profile> add github:inaflash123/dsh-ui-placement
```

桌面端（DSH Desktop）的 profile 由应用自己的插件管理器独占，请用应用内的 **设置 → 插件** 安装，不要用命令行指向 `desktop`。

装完刷新页面即可，不需要重启。

## 说明

- **选择器是构建产物。** `wnLwla_` / `an3WzG_` 这两个前缀是 CSS Modules 生成的哈希，DSH 升级重建这些模块后会改名，届时规则匹配不到、布局自动回到原样，不会报错。为此每条规则都同时写了该元素稳定携带的 `data-*` 属性；宠物那一侧用到的 `[data-composer-seat]` 不受哈希影响。
- **不监听、不读写 DOM。** 整个插件只往 `<head>` 里加一条样式，其余什么都不做。
- **不收集任何数据。**

## License

MIT
