(function () {
  "use strict";

  /* ─────────────────────────────────────────────────────────────
     Configuration & Constants
     ───────────────────────────────────────────────────────────── */
  const REPO = "ali-ghamdan/athar-website";
  const FALLBACK_VERSION = "1448.10.3";
  const API_LATEST_URL = `https://api.github.com/repos/${REPO}/releases/latest`;

  const FALLBACK_RELEASE = {
    tag_name: `v${FALLBACK_VERSION}`,
    name: `v${FALLBACK_VERSION}`,
    assets: [
      {
        name: `Athar_${FALLBACK_VERSION}_amd64.tar.gz`,
        browser_download_url: `https://github.com/${REPO}/releases/download/v${FALLBACK_VERSION}/Athar_${FALLBACK_VERSION}_amd64.tar.gz`,
        size: 8912299,
      },
      {
        name: `Athar_${FALLBACK_VERSION}_arm64.tar.gz`,
        browser_download_url: `https://github.com/${REPO}/releases/download/v${FALLBACK_VERSION}/Athar_${FALLBACK_VERSION}_arm64.tar.gz`,
        size: 8912299,
      },
      {
        name: `Athar_${FALLBACK_VERSION}_amd64.deb`,
        browser_download_url: `https://github.com/${REPO}/releases/download/v${FALLBACK_VERSION}/Athar_${FALLBACK_VERSION}_amd64.deb`,
        size: 7500000,
      },
      {
        name: `Athar_${FALLBACK_VERSION}_amd64.AppImage`,
        browser_download_url: `https://github.com/${REPO}/releases/download/v${FALLBACK_VERSION}/Athar_${FALLBACK_VERSION}_amd64.AppImage`,
        size: 7800000,
      },
      {
        name: `Athar_${FALLBACK_VERSION}_x64-setup.exe`,
        browser_download_url: `https://github.com/${REPO}/releases/download/v${FALLBACK_VERSION}/Athar_${FALLBACK_VERSION}_x64-setup.exe`,
        size: 6800000,
      },
      {
        name: `Athar_${FALLBACK_VERSION}_arm64-setup.exe`,
        browser_download_url: `https://github.com/${REPO}/releases/download/v${FALLBACK_VERSION}/Athar_${FALLBACK_VERSION}_arm64-setup.exe`,
        size: 6800000,
      },
      {
        name: `Athar_${FALLBACK_VERSION}_aarch64.dmg`,
        browser_download_url: `https://github.com/${REPO}/releases/download/v${FALLBACK_VERSION}/Athar_${FALLBACK_VERSION}_aarch64.dmg`,
        size: 7900000,
      },
      {
        name: `Athar_${FALLBACK_VERSION}_x64.dmg`,
        browser_download_url: `https://github.com/${REPO}/releases/download/v${FALLBACK_VERSION}/Athar_${FALLBACK_VERSION}_x64.dmg`,
        size: 7900000,
      },
    ],
  };

  /* ─────────────────────────────────────────────────────────────
     Theme Management (Dark / Light)
     ───────────────────────────────────────────────────────────── */
  const themeToggle = document.getElementById("theme-toggle");

  function getSystemTheme() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme") || getSystemTheme();
      const next = current === "dark" ? "light" : "dark";
      applyTheme(next);
    });
  }

  /* ─────────────────────────────────────────────────────────────
     OS & Architecture Detection
     ───────────────────────────────────────────────────────────── */
  function detectOS() {
    const ua = navigator.userAgent || "";
    const platform = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || "";
    if (/win/i.test(platform) || /win/i.test(ua)) return "windows";
    if (/mac/i.test(platform) || /mac/i.test(ua)) return "mac";
    if (/linux/i.test(platform) || /linux/i.test(ua)) return "linux";
    return "windows";
  }

  function detectArch() {
    const ua = navigator.userAgent || "";
    if (navigator.userAgentData && navigator.userAgentData.architecture) {
      return /arm|aarch64/i.test(navigator.userAgentData.architecture) ? "arm64" : "x64";
    }
    if (/arm64|aarch64|armv8|apple/i.test(ua)) return "arm64";
    return "x64";
  }

  const userOS = detectOS();
  const userArch = detectArch();

  /* ─────────────────────────────────────────────────────────────
     Release Assets & GitHub API
     ───────────────────────────────────────────────────────────── */
  function humanSize(bytes) {
    if (!bytes && bytes !== 0) return "";
    const units = ["B", "KB", "MB", "GB"];
    let i = 0;
    let n = bytes;
    while (n >= 1024 && i < units.length - 1) {
      n /= 1024;
      i++;
    }
    return `${n.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
  }

  function parseAssetName(name) {
    const lower = name.toLowerCase();
    let os = null;
    let arch = "x64";
    let format = "";

    if (lower.endsWith(".exe")) {
      os = "windows";
      format = "Setup (.exe)";
      arch = lower.includes("arm64") ? "arm64" : "x64";
    } else if (lower.endsWith(".dmg")) {
      os = "mac";
      format = "Disk Image (.dmg)";
      arch = lower.includes("aarch64") || lower.includes("arm64") ? "arm64" : "x64";
    } else if (lower.endsWith(".deb")) {
      os = "linux";
      format = "Debian / Ubuntu (.deb)";
      arch = lower.includes("arm64") ? "arm64" : "x64";
    } else if (lower.endsWith(".rpm")) {
      os = "linux";
      format = "Fedora / RHEL (.rpm)";
      arch = lower.includes("aarch64") || lower.includes("arm64") ? "arm64" : "x64";
    } else if (lower.endsWith(".appimage")) {
      os = "linux";
      format = "AppImage (.AppImage)";
      arch = lower.includes("aarch64") || lower.includes("arm64") ? "arm64" : "x64";
    } else if (lower.endsWith(".tar.gz")) {
      os = "linux";
      format = "Arch / Portable (.tar.gz)";
      arch = lower.includes("arm64") ? "arm64" : "x64";
    }

    return { os, arch, format, name };
  }

  async function fetchReleases() {
    try {
      const res = await fetch(API_LATEST_URL);
      if (!res.ok) throw new Error(`GitHub API ${res.status}`);
      const data = await res.json();
      return data;
    } catch (e) {
      console.warn("Using fallback release data:", e);
      return null;
    }
  }

  function pickPrimaryAsset(osAssets, osKey, arch, currentVersion) {
    if (!osAssets || osAssets.length === 0) return null;
    const scored = osAssets.map((a) => {
      const p = parseAssetName(a.name);
      let score = 0;
      if (p.arch === arch) score += 10;
      if (currentVersion && a.name.includes(currentVersion)) score += 5;
      if (osKey === "linux") {
        if (a.name.endsWith(".tar.gz")) score += 6;
        else if (a.name.endsWith(".deb")) score += 3;
        else if (a.name.endsWith(".AppImage")) score += 2;
        else if (a.name.endsWith(".rpm")) score += 1;
      } else if (osKey === "windows") {
        if (a.name.endsWith(".exe")) score += 6;
      } else if (osKey === "mac") {
        if (a.name.endsWith(".dmg")) score += 6;
      }
      if (a.name.includes("-updater")) score -= 20;
      return { asset: a, score };
    });
    scored.sort((a, b) => b.score - a.score);
    return scored[0]?.asset || osAssets[0];
  }

  function updateDownloadButtons(releaseData) {
    if (!releaseData) return;

    const assets = releaseData.assets || [];
    const rawVersion = (releaseData.tag_name || "").replace(/^v/, "");
    const releaseName = releaseData.name || releaseData.tag_name || rawVersion;
    const versionText = releaseName.startsWith("الإصدار") ? releaseName : `الإصدار ${releaseName}`;

    // Update Version Badges
    document.querySelectorAll(".live-version").forEach((el) => {
      el.textContent = versionText;
    });

    // Update Arch Linux Terminal Command Snippet
    const terminalCode = document.getElementById("terminal-code-text");
    const copyBtn = document.querySelector(".terminal-box .copy-btn");
    const linuxTar = assets.find((a) => a.name.includes(rawVersion) && (a.name.endsWith("amd64.tar.gz") || a.name.endsWith("x86_64.tar.gz"))) ||
      assets.find((a) => a.name.endsWith("amd64.tar.gz") || a.name.endsWith("x86_64.tar.gz")) ||
      assets.find((a) => a.name.endsWith(".tar.gz"));

    if (linuxTar) {
      const folderName = linuxTar.name.replace(/\.tar\.gz$/, "");
      const cmd = `tar -xf ${linuxTar.name} --one-top-level && cd ${folderName} && makepkg -si`;
      if (terminalCode) terminalCode.textContent = cmd;
      if (copyBtn) copyBtn.setAttribute("data-code", cmd);
    }

    // Mark Detected OS Card
    const detectedCard = document.querySelector(`.os-card[data-os="${userOS}"]`);
    if (detectedCard) {
      detectedCard.classList.add("is-detected");
    }

    // Determine Best Asset for Hero Download Button
    const heroBtn = document.getElementById("hero-download-btn");
    const heroMeta = document.getElementById("hero-download-meta");

    const userOsAssets = assets.filter((a) => parseAssetName(a.name).os === userOS);
    const primaryAsset = pickPrimaryAsset(userOsAssets, userOS, userArch, rawVersion);

    if (heroBtn && primaryAsset) {
      heroBtn.href = primaryAsset.browser_download_url;
      const osLabel = userOS === "windows" ? "لويندوز" : userOS === "mac" ? "لماك" : "للينكس";
      const p = parseAssetName(primaryAsset.name);
      const formatLabel = userOS === "linux" ? " (.tar.gz)" : "";
      heroBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        تحميل مجاني ${osLabel}${formatLabel}
      `;
      if (heroMeta) {
        heroMeta.textContent = `${versionText} · ${p.format} · ${humanSize(primaryAsset.size)}`;
      }
    }

    // Populate Platform Cards
    ["windows", "mac", "linux"].forEach((osKey) => {
      const card = document.querySelector(`.os-card[data-os="${osKey}"]`);
      if (!card) return;

      const mainBtn = card.querySelector(".os-primary-btn");
      const dropList = card.querySelector(".os-dropdown-menu");

      const osAssets = assets.filter((a) => parseAssetName(a.name).os === osKey);

      if (osAssets.length > 0 && mainBtn) {
        const preferredArch = osKey === "mac" ? "arm64" : "x64";
        const best = pickPrimaryAsset(osAssets, osKey, preferredArch, rawVersion);
        if (best) {
          mainBtn.href = best.browser_download_url;
          const p = parseAssetName(best.name);
          mainBtn.innerHTML = `تحميل ${p.format} <span style="font-size:0.8em;opacity:0.85">(${humanSize(best.size)})</span>`;
        }

        if (dropList) {
          dropList.innerHTML = "";
          osAssets.forEach((a) => {
            const parsed = parseAssetName(a.name);
            const li = document.createElement("li");
            li.className = "os-dropdown-item";
            li.innerHTML = `
              <a href="${a.browser_download_url}" target="_blank" rel="noopener">
                <span>${parsed.format} <bdi>(${parsed.arch})</bdi></span>
                <span style="opacity:0.7">${humanSize(a.size)}</span>
              </a>
            `;
            dropList.appendChild(li);
          });
        }
      }
    });
  }

  // Handle Dropdown Toggles
  document.querySelectorAll(".os-dropdown-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const menu = btn.nextElementSibling;
      const isOpen = menu.classList.contains("open");
      document.querySelectorAll(".os-dropdown-menu.open").forEach((m) => m.classList.remove("open"));
      if (!isOpen) menu.classList.add("open");
    });
  });

  document.addEventListener("click", () => {
    document.querySelectorAll(".os-dropdown-menu.open").forEach((m) => m.classList.remove("open"));
  });

  /* ─────────────────────────────────────────────────────────────
     Interactive Live Takhrij Simulator
     ───────────────────────────────────────────────────────────── */
  const DEMO_CASES = [
    {
      id: "niyyah",
      label: "حديث: إنما الأعمال بالنيات",
      sourceBook: "صحيح البخاري — رقم (1)",
      sourceText: "إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى، فَمَنْ كَانَتْ هِجْرَتُهُ إِلَى دُنْيَا يُصِيبُهَا أَوْ إِلَى امْرَأَةٍ يَنْكِحُهَا، فَهِجْرَتُهُ إِلَى مَا هَاجَرَ إِلَيْهِ.",
      targetBook: "صحيح مسلم — رقم (1907)",
      targetRendered: `إِنَّمَا الْأَعْمَالُ <span class="diff-add">بِالنِّيَّةِ</span>، وَإِنَّمَا <span class="diff-del">لِامْرِئٍ</span> <span class="diff-add">لِكُلِّ امْرِئٍ</span> مَا نَوَى، فَمَنْ كَانَتْ هِجْرَتُهُ إِلَى <span class="diff-add">اللهِ وَرَسُولِهِ فَهِجْرَتُهُ إِلَى اللهِ وَرَسُولِهِ، وَمَنْ كَانَتْ هِجْرَتُهُ لِدُنْيَا</span> يُصِيبُهَا أَوْ <span class="diff-add">امْرَأَةٍ</span> يَتَزَوَّجُهَا، فَهِجْرَتُهُ إِلَى مَا هَاجَرَ إِلَيْهِ.`,
      matchScore: "94% تطابق",
    },
    {
      id: "iman",
      label: "حديث: الإيمان بضع وسبعون شعبة",
      sourceBook: "صحيح مسلم — رقم (35)",
      sourceText: "الْإِيمَانُ بِضْعٌ وَسَبْعُونَ أَوْ بِضْعٌ وَسِتُّونَ شُعْبَةً، فَأَفْضَلُهَا قَوْلُ: لَا إِلَهَ إِلَّا اللهُ، وَأَدْنَاهَا إِمَاطَةُ الْأَذَى عَنِ الطَّرِيقِ، وَالْحَيَاءُ شُعْبَةٌ مِنَ الْإِيمَانِ.",
      targetBook: "سنن أبي داود — رقم (4676)",
      targetRendered: `الْإِيمَانُ بِضْعٌ وَسَبْعُونَ <span class="diff-del">شُعْبَةً</span>، <span class="diff-add">وَأَفْضَلُهَا</span> قَوْلُ لَا إِلَهَ إِلَّا اللهُ، وَأَدْنَاهَا إِمَاطَةُ الْأَذَى عَنِ الطَّرِيقِ، وَالْحَيَاءُ شُعْبَةٌ مِنَ الْإِيمَانِ.`,
      matchScore: "91% تطابق",
    },
    {
      id: "athar-umar",
      label: "أثر عمر بن الخطاب في التفقه",
      sourceBook: "مصنف ابن أبي شيبة — رقم (26154)",
      sourceText: "تَفَقَّهُوا قَبْلَ أَنْ تُسَوَّدُوا، فَإِنَّكُمْ إِنْ لَمْ تَفَقَّهُوا لَمْ تَسُودُوا.",
      targetBook: "جامع بيان العلم وفضله — رقم (482)",
      targetRendered: `تَفَقَّهُوا قَبْلَ أَنْ تُسَوَّدُوا، <span class="diff-add">وَتَعَلَّمُوا الْعِلْمَ قَبْلَ أَنْ يُرْفَعَ</span>، فَإِنَّكُمْ إِنْ لَمْ تَفَقَّهُوا لَمْ تَسُودُوا.`,
      matchScore: "88% تطابق",
    },
  ];

  function renderDemoCase(caseData) {
    const srcTitle = document.getElementById("demo-src-title");
    const srcText = document.getElementById("demo-src-text");
    const tgtTitle = document.getElementById("demo-tgt-title");
    const tgtText = document.getElementById("demo-tgt-text");
    const matchPill = document.getElementById("demo-match-pill");

    if (srcTitle) srcTitle.textContent = caseData.sourceBook;
    if (srcText) srcText.textContent = caseData.sourceText;
    if (tgtTitle) tgtTitle.textContent = caseData.targetBook;
    if (tgtText) tgtText.innerHTML = caseData.targetRendered;
    if (matchPill) matchPill.textContent = caseData.matchScore;
  }

  document.querySelectorAll(".demo-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".demo-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const caseId = btn.dataset.case;
      const found = DEMO_CASES.find((c) => c.id === caseId);
      if (found) renderDemoCase(found);
    });
  });

  /* ─────────────────────────────────────────────────────────────
     Interactive App Showcase Tour Tabs
     ───────────────────────────────────────────────────────────── */
  const TOUR_DATA = {
    home: {
      title: "الشاشة الرئيسية",
      desc: "لوحة تحكم ترحيبية أنيقة تعرض «أثر اليوم»، إحصاءات مكتبتك، وسجل استئناف القراءة فورياً.",
      features: [
        "أثر يومي متجدد من كتبك المحملة مع زر تخريج مباشر بنقرة واحدة.",
        "إحصاءات شاملة لعدد الكتب والرواة والروايات المتاحة في جهازك.",
        "بطاقة «متابعة القراءة» للعودة الدقيقة لآخر كتاب كنت تقرؤه.",
        "إظهار وإخفاء التشكيل بضغطة زر مع خيارات نسخ متعددة بالعزو.",
      ],
      imgLight: "screenshots/light/home.png",
      imgDark: "screenshots/dark/home.png",
    },
    search: {
      title: "البحث الذكي",
      desc: "بحث متقدم وفائق السرعة في المتون والأسانيد، يتجاهل التشكيل والهمزات مع فلاتر دقيقة.",
      features: [
        "بحث ذكي وسريع في متون الأحاديث والآثار وأسانيدها.",
        "تصفية متزامنة بالكتب والمؤلفين وتراجم الرواة مع عدّادات حية.",
        "تظليل فوري للكلمات المطابقة داخل سياق الأثر وسنده.",
        "سجل تاريخي محفوظ لعمليات البحث مع تصدير النتائج CSV و JSON.",
      ],
      imgLight: "screenshots/light/search.png",
      imgDark: "screenshots/dark/search.png",
    },
    takhrij: {
      title: "التخريج ومقارنة الروايات",
      desc: "شاشة التخريج الآلي لعزو الأحاديث ومقارنة ألفاظ الروايات مع تلوين الفروق والزيادات.",
      features: [
        "عزو فوري لمواضع الأثر في مختلف كتب السنة والآثار.",
        "مقارنة دقيقة لألفاظ المتون وإبراز الزيادات والنواقص بالألوان.",
        "حساب نسبة التطابق الدلالي واللفظي بين الروايات.",
        "إمكانية الانتقال المباشر لموضع الشاهد في الكتاب الآخر.",
      ],
      imgLight: "screenshots/light/search-takhrij.png",
      imgDark: "screenshots/dark/search-takhrij.png",
    },
    narration: {
      title: "قارئ الآثار والمتون",
      desc: "تجربة قراءة تراثية راقية مع شجرة إسناد تفاعلية، فهرس موضوعات وتتبع دقيق للمواضع.",
      features: [
        "فهرس متسلسل لأبواب وموضوعات الكتاب مع تتبع الموضع تلقائياً.",
        "روابط تفاعلية لجميع الرواة في السند تفتح ترجمتهم بنقرة واحدة.",
        "شارات ملونة تبين درجة الراوي وحكم المحدثين فيه (صحابي، ثقة، مقبول...).",
        "محرر تدوين الفوائد والتعليقات وحفظ فواصل القراءة والمفضلة.",
      ],
      imgLight: "screenshots/light/narration.png",
      imgDark: "screenshots/dark/narration.png",
    },
    narrator: {
      title: "موسوعة تراجم الرواة",
      desc: "بطاقات بيوغرافية مفصلة لآلاف الرواة مع استعراض شيوخهم وتلاميذهم ومروياتهم.",
      features: [
        "بيانات الراوي الكاملة: الاسم، الكنية، اللقب، المذهب، الطبقة، وتاريخ الوفاة.",
        "نص الترجمة المعتمد من «تهذيب الكمال» للمزي والمصادر الكبرى.",
        "قائمة كاملة بشيوخ الراوي وتلاميذه مع إمكانية البحث بينهم.",
        "حصر عدد مرويات الراوي في المكتبة والوصول إليها بضغطة زر.",
      ],
      imgLight: "screenshots/light/narrator.png",
      imgDark: "screenshots/dark/narrator.png",
    },
    jarh: {
      title: "أقوال الجرح والتعديل",
      desc: "عرض مبوب ومفصل لأقوال أئمة ونقاد الحديث في مرتبة الراوي وتعديله وتجريحه.",
      features: [
        "أقوال النقاد مرتبة وموثقة بأسماء قائليها من أئمة الشأن.",
        "بيان رتبة وضبط الراوي بدقة (ثقة ثبت، صدوق، ضعيف، متروك...).",
        "سهولة تصفح ومقارنة أحكام النقاد المختلفة في الراوي الواحد.",
        "ربط مباشر بين حكم الراوي وظهوره في أسانيد الأحاديث.",
      ],
      imgLight: "screenshots/light/narrator-jarhandadala.png",
      imgDark: "screenshots/dark/narrator-jarhandadala.png",
    },
    allbooks: {
      title: "مستودع الكتب والتنزيل",
      desc: "تصفح مكتبة الآثار والمصنفات، وحمّل الكتب بنقرة واحدة مع إدارة متزامنة.",
      features: [
        "قائمة بالكتب والمؤلفين والأقسام وحجم كل كتاب بدقة.",
        "تحميل متزامن متعدد مع إيقاف مؤقت، استئناف، ونسبة مئوية حية.",
        "مزامنة دورية تلقائية للكتب والبيانات الحديثة.",
        "شارات ذكية لحالة الكتاب (مُحمّل، قيد التنزيل، تحديث متاح).",
      ],
      imgLight: "screenshots/light/allbooks.png",
      imgDark: "screenshots/dark/allbooks.png",
    },
    downloadedbooks: {
      title: "إدارة مكتبتي المحلية",
      desc: "استعراض وتنظيم كامل لجميع الكتب المحفوظة على جهازك وتصفيتها بلا إنترنت.",
      features: [
        "إحصاءات إجمالية لحجم الكتب ومجموع الآثار المحفوظة محلياً.",
        "فرز فوري حسب اسم الكتاب، المؤلف، القسم، أو تاريخ التنزيل.",
        "حذف وإعادة تنزيل الكتب والنسخ الاحتياطي لقواعد البيانات.",
        "فتح فوري لأي كتاب بدون انتظار في أجزاء من الثانية.",
      ],
      imgLight: "screenshots/light/downloadedbooks.png",
      imgDark: "screenshots/dark/downloadedbooks.png",
    },
  };

  document.querySelectorAll(".tour-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tour-tab").forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      const key = tab.dataset.tour;
      const data = TOUR_DATA[key];
      if (!data) return;

      const titleEl = document.getElementById("tour-title");
      const descEl = document.getElementById("tour-desc");
      const listEl = document.getElementById("tour-features-list");
      const imgLight = document.getElementById("tour-img-light");
      const imgDark = document.getElementById("tour-img-dark");

      if (titleEl) titleEl.textContent = data.title;
      if (descEl) descEl.textContent = data.desc;
      if (imgLight) imgLight.src = data.imgLight;
      if (imgDark) imgDark.src = data.imgDark;

      if (listEl) {
        listEl.innerHTML = "";
        data.features.forEach((feat) => {
          const li = document.createElement("li");
          li.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            <span>${feat}</span>
          `;
          listEl.appendChild(li);
        });
      }
    });
  });

  /* ─────────────────────────────────────────────────────────────
     Clipboard Copy Helper
     ───────────────────────────────────────────────────────────── */
  document.querySelectorAll(".copy-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const code = btn.dataset.code || btn.previousElementSibling?.textContent || "";
      try {
        await navigator.clipboard.writeText(code.trim());
        const originalText = btn.textContent;
        btn.textContent = "تم النسخ ✓";
        btn.style.borderColor = "var(--brand-primary)";
        btn.style.color = "var(--brand-primary)";
        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.borderColor = "";
          btn.style.color = "";
        }, 2000);
      } catch (err) {
        console.error("Copy failed:", err);
      }
    });
  });

  /* ─────────────────────────────────────────────────────────────
     Initialization
     ───────────────────────────────────────────────────────────── */
  async function init() {
    renderDemoCase(DEMO_CASES[0]);
    // 1. Render immediate fallback
    updateDownloadButtons(FALLBACK_RELEASE);

    // 2. Fetch latest live release from GitHub API
    const liveRelease = await fetchReleases();
    if (liveRelease) {
      updateDownloadButtons(liveRelease);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
