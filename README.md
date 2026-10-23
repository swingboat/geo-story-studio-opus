# 地理故事工坊 GEO STORY STUDIO · Opus

用 Claude Opus 制作的**高中地理教学短视频**。每个视频是一个独立目录，用代码生成：Python 调用 edge-tts 生成配音和字幕，Node.js 用 Canvas 逐帧绘制动画，ffmpeg 合成成片。

选题对齐《普通高中地理课程标准（2017 年版 2020 年修订）》和人教版高中地理教材。制作规则见 [AGENTS.md](AGENTS.md)。

## 视频目录

画幅：竖屏 1080×1920，横屏 1920×1080。时长按当前成片统计。

### 必修第一册 第一章第一节 地球的宇宙环境

| 目录 | 标题 | 画幅 | 时长 | 内容简介 |
|---|---|---|---|---|
| [geo-celestial-bodies/](geo-celestial-bodies/) | 天体：宇宙里的“东西” | 横屏 | 1:58 | 恒星、行星、卫星、彗星、星云、流星体等天体类型；判断天体的三个要点：在太空、有实体、独立运行；天体系统的层次 |
| [star-planet-moon/](star-planet-moon/) | 恒星、行星、卫星：宇宙身份登记处 | 竖屏 | 1:37 | 从“光从哪来、谁绕谁转”两个问题，区分太阳（恒星）、地球（行星）、月球（天然卫星） |
| [celestial-judgement/](celestial-judgement/) | 哪些算天体？天体认证处开张了 | 竖屏 | 1:25 | 月球、星云、流星、太阳黑子、待发射的人造卫星能否称为天体；记住“对象、现象、局部、运行状态” |
| [cosmic-address/](cosmic-address/) | 我们在宇宙中的什么位置？ | 竖屏 | 1:31 | 天体系统的层次：地月系、太阳系、银河系、可观测宇宙 |
| [moonlight-origin/](moonlight-origin/) | 月亮那么亮，它的光从哪里来？ | 竖屏 | 1:01 | 月球自身不发光，月光是月面反射的太阳光 |
| [meteor-journey/](meteor-journey/) | 看见流星，地上就有陨石吗？ | 竖屏 | 1:28 | 流星体、流星、陨石的区别；大多数流星体在大气中烧蚀殆尽 |
| [nebula-nursery/](nebula-nursery/) | 星云都是“恒星的摇篮”吗？ | 竖屏 | 1:18 | 星云的不同来源：有的孕育新恒星，有的是恒星演化晚期的产物 |
| [space-not-empty/](space-not-empty/) | 太空里真的空无一物吗？ | 竖屏 | 1:22 | 星际物质：恒星之间飘着稀薄的气体和尘埃 |
| [spacecraft-missions/](spacecraft-missions/) | 太空打工人：空间站、北斗、嫦娥五号各干啥 | 竖屏 | 1:32 | 拓展：中国空间站、北斗卫星导航系统、嫦娥五号的任务，认识人造天体 |

### 必修第一册 第一章第二节 太阳对地球的影响

| 目录 | 标题 | 画幅 | 时长 | 内容简介 |
|---|---|---|---|---|
| [sun-energy/](sun-energy/) | 太阳为什么能发光发热？ | 竖屏 | 1:35 | 太阳能量来自核心的核聚变，以辐射形式向外传递 |
| [sunlight-through-space/](sunlight-through-space/) | 阳光为什么能穿过太空，温暖地球？ | 竖屏 | 1:26 | 太阳辐射以电磁波形式传播，不需要介质就能穿过太空 |
| [sun-angle/](sun-angle/) | 为什么同样晒太阳，有的地方更热？ | 竖屏 | 1:30 | 太阳高度角越小，同样的能量分布面积越大，单位面积获得的太阳辐射越少 |

### 必修第一册 第二章第二节 大气受热过程和大气运动

| 目录 | 标题 | 画幅 | 时长 | 内容简介 |
|---|---|---|---|---|
| [atmosphere-heating/](atmosphere-heating/) | 地面怎样把大气暖起来 | 竖屏 | 1:15 | 地面是对流层大气的主要直接热源：热红外辐射、对流、水的相变三条传热路线 |
| [atmosphere-insulation/](atmosphere-insulation/) | 大气怎样给地面保温 | 竖屏 | 1:26 | 大气吸收地面辐射，并以大气逆辐射把热量还给地面；为什么多云的冬夜不那么冷 |

## 视频目录结构

```
<video-name>/
├── script.json      # 旁白文案、角色声音、数字和资料出处
├── tts.py           # 配音、逐词时间轴、字幕
├── render.mjs       # 场景切换、字幕、logo、合成
├── lib.mjs          # 字体、缓动、通用绘图
├── scenes-*.mjs     # 分组的场景动画
├── assets/          # logo 等素材（从 brand/ 复制）
├── build/           # 中间产物（不入库）
└── out/             # 成片 .mp4 和 .srt（不入库）
```

[brand/](brand/) 存放账号 logo 原图，不要修改。

## 环境要求

- Node.js（依赖 `@napi-rs/canvas`）
- Python 3（依赖 `edge-tts`）
- ffmpeg

## 生成视频

在视频目录内执行：

```bash
npm install
python3 -m venv .venv && .venv/bin/pip install edge-tts

.venv/bin/python tts.py            # 生成配音、时间轴、字幕
node render.mjs --still 8.0 14.2   # 导出预览帧，检查画面
node render.mjs                    # 渲染完整视频到 out/
```

成片、音频和中间产物都不提交到仓库，需要时在本地重新生成。
