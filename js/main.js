(function () {
  "use strict";

  /* ─────────────────────────────────────────────────────────────
     Configuration & GitHub Release Constants
     ───────────────────────────────────────────────────────────── */
  const REPO = "atharapp/athar-website";
  const FALLBACK_VERSION = "1448.23.3";
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
     Theme Management (Shadcn Dark / Light)
     ───────────────────────────────────────────────────────────── */
  const themeToggle = document.getElementById("theme-toggle");

  function getSystemTheme() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function applyTheme(theme) {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
      root.setAttribute("data-theme", "dark");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
      root.setAttribute("data-theme", "light");
    }
    localStorage.setItem("theme", theme);
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const isDark = document.documentElement.classList.contains("dark") ||
                     document.documentElement.getAttribute("data-theme") === "dark";
      applyTheme(isDark ? "light" : "dark");
    });
  }

  /* ─────────────────────────────────────────────────────────────
     Mobile Drawer (Sheet) Toggle
     ───────────────────────────────────────────────────────────── */
  const mobileMenuBtn = document.getElementById("mobile-menu-btn");
  const mobileDrawer = document.getElementById("mobile-drawer");
  const mobileDrawerBackdrop = document.getElementById("mobile-drawer-backdrop");
  const mobileDrawerClose = document.getElementById("mobile-drawer-close");

  function openMobileDrawer() {
    if (mobileDrawer && mobileDrawerBackdrop) {
      mobileDrawer.classList.add("open");
      mobileDrawerBackdrop.classList.add("open");
      document.body.style.overflow = "hidden";
    }
  }

  function closeMobileDrawer() {
    if (mobileDrawer && mobileDrawerBackdrop) {
      mobileDrawer.classList.remove("open");
      mobileDrawerBackdrop.classList.remove("open");
      document.body.style.overflow = "";
    }
  }

  if (mobileMenuBtn) mobileMenuBtn.addEventListener("click", openMobileDrawer);
  if (mobileDrawerClose) mobileDrawerClose.addEventListener("click", closeMobileDrawer);
  if (mobileDrawerBackdrop) mobileDrawerBackdrop.addEventListener("click", closeMobileDrawer);

  document.querySelectorAll(".mobile-nav-link").forEach((link) => {
    link.addEventListener("click", closeMobileDrawer);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && mobileDrawer && mobileDrawer.classList.contains("open")) {
      closeMobileDrawer();
    }
  });

  /* ─────────────────────────────────────────────────────────────
     Accordion Toggle (FAQ)
     ───────────────────────────────────────────────────────────── */
  document.querySelectorAll(".accordion-trigger").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const isExpanded = trigger.getAttribute("aria-expanded") === "true";
      const content = trigger.nextElementSibling;

      // Close other accordions in the same list
      const parentAccordion = trigger.closest(".accordion");
      if (parentAccordion) {
        parentAccordion.querySelectorAll(".accordion-trigger").forEach((otherTrigger) => {
          if (otherTrigger !== trigger) {
            otherTrigger.setAttribute("aria-expanded", "false");
            const otherContent = otherTrigger.nextElementSibling;
            if (otherContent) {
              otherContent.style.maxHeight = null;
              otherContent.classList.remove("open");
            }
          }
        });
      }

      if (isExpanded) {
        trigger.setAttribute("aria-expanded", "false");
        if (content) {
          content.style.maxHeight = null;
          content.classList.remove("open");
        }
      } else {
        trigger.setAttribute("aria-expanded", "true");
        if (content) {
          content.classList.add("open");
          content.style.maxHeight = content.scrollHeight + "px";
        }
      }
    });
  });

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
      console.warn("Using fallback releases due to:", e.message);
      return FALLBACK_RELEASE;
    }
  }

  function pickPrimaryAsset(assets, osKey, archKey, rawVersion) {
    if (osKey === "windows") {
      return (
        assets.find((a) => a.name.endsWith(".exe") && (archKey === "arm64" ? a.name.includes("arm64") : !a.name.includes("arm64"))) ||
        assets.find((a) => a.name.endsWith(".exe"))
      );
    }
    if (osKey === "mac") {
      return (
        assets.find((a) => a.name.endsWith(".dmg") && (archKey === "arm64" ? a.name.includes("aarch64") : a.name.includes("x64"))) ||
        assets.find((a) => a.name.endsWith(".dmg"))
      );
    }
    if (osKey === "linux") {
      return (
        assets.find((a) => a.name.endsWith(".tar.gz") && !a.name.includes("arm64")) ||
        assets.find((a) => a.name.endsWith(".deb")) ||
        assets.find((a) => a.name.endsWith(".AppImage"))
      );
    }
    return assets[0];
  }

  function updateDownloadButtons(release) {
    const assets = release.assets || [];
    const rawVersion = release.tag_name ? release.tag_name.replace(/^v/, "") : FALLBACK_VERSION;

    document.querySelectorAll(".live-version").forEach((el) => {
      el.textContent = `الإصدار ${release.tag_name || `v${FALLBACK_VERSION}`}`;
    });

    const heroBtn = document.getElementById("hero-download-btn");
    const heroMeta = document.getElementById("hero-download-meta");

    if (heroBtn) {
      const primary = pickPrimaryAsset(assets, userOS, userArch, rawVersion);
      if (primary) {
        heroBtn.href = primary.browser_download_url;
        const osArabic = userOS === "windows" ? "ويندوز" : userOS === "mac" ? "ماك" : "لينكس";
        const p = parseAssetName(primary.name);
        heroBtn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          تحميل مجاني لـ ${osArabic} <span style="font-size:0.8em;opacity:0.9">(${p.format})</span>
        `;
      }
    }

    if (heroMeta) {
      const osArabic = userOS === "windows" ? "Windows" : userOS === "mac" ? "macOS" : "Linux";
      heroMeta.textContent = `تم اكتشاف نظامك: ${osArabic} (${userArch}) · مجاني ومستقل بالكامل`;
    }

    // Terminal snippet code for Arch Linux
    const terminalCode = document.getElementById("terminal-code-text");
    if (terminalCode) {
      const tarAsset = assets.find((a) => a.name.endsWith("amd64.tar.gz")) || { name: `Athar_${rawVersion}_amd64.tar.gz` };
      const folder = tarAsset.name.replace(/\.tar\.gz$/, "");
      const cmd = `tar -xf ${tarAsset.name} --one-top-level && cd ${folder} && makepkg -si`;
      terminalCode.textContent = cmd;
      const copyBtn = document.querySelector(".terminal-box .copy-btn");
      if (copyBtn) copyBtn.dataset.code = cmd;
    }

    // Update OS Cards
    document.querySelectorAll(".os-card").forEach((card) => {
      const osKey = card.dataset.os;
      const mainBtn = card.querySelector(".os-download-btn");
      const dropList = card.querySelector(".dropdown-menu");

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
            li.innerHTML = `
              <a class="dropdown-item" href="${a.browser_download_url}" target="_blank" rel="noopener">
                <span>${parsed.format} <bdi>(${parsed.arch})</bdi></span>
                <span style="opacity:0.65;font-size:0.8em;">${humanSize(a.size)}</span>
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
      const isOpen = menu && menu.classList.contains("open");
      document.querySelectorAll(".dropdown-menu.open").forEach((m) => m.classList.remove("open"));
      if (menu && !isOpen) menu.classList.add("open");
    });
  });

  document.addEventListener("click", () => {
    document.querySelectorAll(".dropdown-menu.open").forEach((m) => m.classList.remove("open"));
  });

  /* ─────────────────────────────────────────────────────────────
     Interactive Narrator Popovers (Card Tooltips)
     ───────────────────────────────────────────────────────────── */
  const NARRATOR_PROFILES = {
    1: {
      name: "عبد الله بن الزبير الحميدي",
      shohra: "الحميدي",
      rotba: "ثقة حافظ فقيه",
      tabaqa: "الطبقة التاسعة — صغار أتباع التابعين",
      death: "219 هـ (مكة المكرمة)",
      gradeColor: "var(--grade-strong)",
      quote: "قال الإمام الشافعي: الحميدي إمام في الحديث والفقه، ما رأيت أحداً أحفظ منه.",
    },
    2: {
      name: "سفيان بن عيينة بن ميمون الهلالي",
      shohra: "ابن عيينة",
      rotba: "ثقة ثبت حافظ إمام حجة",
      tabaqa: "الطبقة الثامنة — كبار أتباع التابعين",
      death: "198 هـ (مكة المكرمة)",
      gradeColor: "var(--grade-strong)",
      quote: "قال الإمام أحمد بن حنبل: ما رأيت أحداً أعلم بالسنن من سفيان بن عيينة.",
    },
    3: {
      name: "يحيى بن سعيد بن قيس الأنصاري",
      shohra: "يحيى بن سعيد الأنصاري",
      rotba: "ثقة ثبت (مدار الحديث)",
      tabaqa: "الطبقة الخامسة — صغار التابعين",
      death: "143 هـ",
      gradeColor: "var(--grade-pivot)",
      quote: "قال يحيى بن معين: يحيى بن سعيد الأنصاري ثقة مأمون حجة.",
    },
    4: {
      name: "محمد بن إبراهيم بن الحارث التيمي",
      shohra: "محمد بن إبراهيم التيمي",
      rotba: "ثقة جليل",
      tabaqa: "الطبقة الرابعة — أوساط التابعين",
      death: "120 هـ",
      gradeColor: "var(--grade-strong)",
      quote: "قال أبو حاتم الرازي: ثقة، متقن، حديثه حجة.",
    },
    5: {
      name: "علقمة بن وقاص الليثي",
      shohra: "علقمة بن وقاص",
      rotba: "ثقة جليل مخضرم",
      tabaqa: "الطبقة الثالثة — كبار التابعين",
      death: "توفي في خلافة عبد الملك بن مروان",
      gradeColor: "var(--grade-strong)",
      quote: "قال ابن سعد: كان ثقة، وله أحاديث صالحة.",
    },
    6: {
      name: "عمر بن الخطاب بن نفيل القرشي",
      shohra: "أمير المؤمنين عمر بن الخطاب",
      rotba: "صحابي جليل — خليفة رسول الله ﷺ",
      tabaqa: "الطبقة الأولى — كبار الصحابة",
      death: "23 هـ (شهيداً في المحراب)",
      gradeColor: "var(--grade-companion)",
      quote: "قال رسول الله ﷺ: «لو كان بعدي نبي لكان عمر بن الخطاب».",
    },
    7: {
      name: "عبيد الله بن سعيد بن يحيى اليشكري (أبو قدامة السرخسي)",
      shohra: "أبو قدامة السرخسي",
      rotba: "ثقة ثبت مأمون إمام",
      tabaqa: "الطبقة العاشرة — كبار الآخذين عن تبع الأتباع",
      death: "241 هـ",
      gradeColor: "var(--grade-strong)",
      quote: "قال النسائي: ثقة مأمون، وقال ابن حبان: كان متقناً ورعاً.",
    },
    8: {
      name: "عبد بن حميد بن نصر الكشي (أبو محمد)",
      shohra: "عبد بن حميد",
      rotba: "حافظ حجة إمام مفسر",
      tabaqa: "الطبقة العاشرة — صاحب المسند والتفسير",
      death: "249 هـ",
      gradeColor: "var(--grade-strong)",
      quote: "قال الإمام مسلم: كان من أئمة المسلمين وأهل الحفظ والإتقان.",
    },
    9: {
      name: "عبد الملك بن عمرو القيسي (أبو عامر العقدي)",
      shohra: "أبو عامر العقدي",
      rotba: "ثقة مأمون",
      tabaqa: "الطبقة التاسعة — صغار أتباع التابعين",
      death: "204 هـ (البصرة)",
      gradeColor: "var(--grade-strong)",
      quote: "قال يحيى بن معين والإمام أحمد: ثقة صالح الحديث مأمون.",
    },
    10: {
      name: "سليمان بن بلال القرشي التيمي (أبو محمد المدني)",
      shohra: "سليمان بن بلال",
      rotba: "ثقة ثبت",
      tabaqa: "الطبقة الثامنة — كبار أتباع التابعين",
      death: "177 هـ (المدينة المنورة)",
      gradeColor: "var(--grade-strong)",
      quote: "قال أحمد بن حنبل: سليمان بن بلال ثقة صحيح الحديث، قاضي المدينة.",
    },
    11: {
      name: "عبد الله بن دينار العدوي القرشي (أبو عبد الرحمن المدني)",
      shohra: "عبد الله بن دينار",
      rotba: "ثقة ثبت إمام",
      tabaqa: "الطبقة الخامسة — صغار التابعين (مولى ابن عمر)",
      death: "127 هـ (المدينة المنورة)",
      gradeColor: "var(--grade-strong)",
      quote: "قال شعبة بن الحجاج: عبد الله بن دينار من سادات أهل المدينة وأوثق الناس.",
    },
    12: {
      name: "ذكوان بن عبد الله السمان (أبو صالح السمان المدني)",
      shohra: "أبو صالح السمان",
      rotba: "ثقة ثبت جليل",
      tabaqa: "الطبقة الثالثة — كبار التابعين (ملازم لأبي هريرة)",
      death: "101 هـ (المدينة المنورة)",
      gradeColor: "var(--grade-strong)",
      quote: "قال علي بن المديني: أبو صالح السمان من الثقات الأثبات، روى عن أبي هريرة نحواً من ألف حديث.",
    },
    13: {
      name: "عبد الرحمن بن صخر الدوسي (أبو هريرة رضي الله عنه)",
      shohra: "أبو هريرة رضي الله عنه",
      rotba: "صحابي جليل — راوية الإسلام وأحفظ الصحابة",
      tabaqa: "الطبقة الأولى — كبار الصحابة",
      death: "57 هـ (المدينة المنورة)",
      gradeColor: "var(--grade-companion)",
      quote: "قال الإمام الشافعي: أبو هريرة أحفظ من روى الحديث في دهره.",
    },
  };

  const popover = document.createElement("div");
  popover.className = "narrator-popover";
  document.body.appendChild(popover);

  let activeToken = null;

  function showNarratorPopover(token) {
    const id = token.dataset.narratorId;
    const narrator = NARRATOR_PROFILES[id];
    if (!narrator) return;

    popover.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
        <span style="font-weight:700;font-size:0.95rem;color:var(--popover-foreground);">${narrator.shohra}</span>
        <span class="badge badge-secondary" style="color:${narrator.gradeColor};font-weight:700;font-size:0.75rem;">${narrator.rotba}</span>
      </div>
      <div style="font-size:0.8125rem;color:var(--muted-foreground);">${narrator.name}</div>
      <div style="display:flex;flex-direction:column;gap:3px;font-size:0.78rem;color:var(--muted-foreground);border-top:1px solid var(--border);padding-top:6px;">
        <div><strong>الطبقة:</strong> ${narrator.tabaqa}</div>
        <div><strong>الوفاة:</strong> ${narrator.death}</div>
      </div>
      <p style="font-size:0.8rem;color:var(--popover-foreground);font-style:italic;line-height:1.5;background:var(--muted);padding:8px 10px;border-radius:var(--radius);border-right:3px solid var(--primary);">${narrator.quote}</p>
    `;

    const rect = token.getBoundingClientRect();
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    const scrollX = window.scrollX || document.documentElement.scrollLeft;

    popover.style.display = "flex";
    popover.style.top = `${rect.bottom + scrollY + 8}px`;
    popover.style.left = `${Math.max(10, Math.min(window.innerWidth - 300, rect.left + scrollX - 60))}px`;
    activeToken = token;
  }

  function hideNarratorPopover() {
    popover.style.display = "none";
    activeToken = null;
  }

  document.querySelectorAll(".rawy-token").forEach((token) => {
    token.addEventListener("mouseenter", () => showNarratorPopover(token));
    token.addEventListener("click", (e) => {
      e.stopPropagation();
      showNarratorPopover(token);
    });
  });

  document.addEventListener("click", (e) => {
    if (activeToken && !popover.contains(e.target) && e.target !== activeToken) {
      hideNarratorPopover();
    }
  });

  /* ─────────────────────────────────────────────────────────────
     Hero Narration Card Tashkeel, Font Controls & Heart Pop
     ───────────────────────────────────────────────────────────── */
  const TASHKEEL_REGEX = /[\u064B-\u0652\u0640\u0670\u200C]/g;
  let tashkeelEnabled = true;

  const matnEl = document.getElementById("hero-matn-text");
  const origMatn = matnEl ? matnEl.textContent.trim() : "";
  const tashkeelBtn = document.getElementById("toggle-tashkeel-btn");

  if (tashkeelBtn && matnEl) {
    tashkeelBtn.addEventListener("click", () => {
      tashkeelEnabled = !tashkeelEnabled;
      if (tashkeelEnabled) {
        matnEl.textContent = origMatn;
        tashkeelBtn.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/></svg>
          إخفاء التشكيل
        `;
      } else {
        matnEl.textContent = origMatn.replace(TASHKEEL_REGEX, "");
        tashkeelBtn.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/></svg>
          إظهار التشكيل
        `;
      }
    });
  }

  // Font Size Adjuster
  const zoomInBtn = document.getElementById("font-zoom-in");
  const zoomOutBtn = document.getElementById("font-zoom-out");
  let currentFontSize = 1.35;

  if (zoomInBtn && matnEl) {
    zoomInBtn.addEventListener("click", () => {
      if (currentFontSize < 1.9) {
        currentFontSize += 0.125;
        matnEl.style.fontSize = `${currentFontSize}rem`;
      }
    });
  }
  if (zoomOutBtn && matnEl) {
    zoomOutBtn.addEventListener("click", () => {
      if (currentFontSize > 1.05) {
        currentFontSize -= 0.125;
        matnEl.style.fontSize = `${currentFontSize}rem`;
      }
    });
  }

  // Heart Pop Animation from athar-desktop
  const demoHeartBtn = document.getElementById("demo-heart-btn");
  const container = document.getElementById("narration-view-container");

  function triggerHeartPop(x, y) {
    if (!container) return;
    const heart = document.createElement("div");
    heart.className = "floating-heart";
    heart.innerHTML = `<svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`;
    heart.style.left = `${x}px`;
    heart.style.top = `${y}px`;
    container.appendChild(heart);
    setTimeout(() => heart.remove(), 950);
  }

  if (demoHeartBtn && container) {
    demoHeartBtn.addEventListener("click", (e) => {
      const rect = demoHeartBtn.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const x = rect.left - containerRect.left + rect.width / 2 - 18;
      const y = rect.top - containerRect.top - 20;
      triggerHeartPop(x, y);
    });
  }

  if (matnEl && container) {
    matnEl.addEventListener("dblclick", (e) => {
      const containerRect = container.getBoundingClientRect();
      const x = e.clientX - containerRect.left - 18;
      const y = e.clientY - containerRect.top - 24;
      triggerHeartPop(x, y);
    });
  }

  /* ─────────────────────────────────────────────────────────────
     Interactive Live Takhrij Simulator
     ───────────────────────────────────────────────────────────── */
  const DEMO_CASES = [
    {
      id: "niyyah",
      label: "إنما الأعمال بالنيات",
      sourceBook: "صحيح البخاري — رقم (1)",
      sourceText: "إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى، فَمَنْ كَانَتْ هِجْرَتُهُ إِلَى دُنْيَا يُصِيبُهَا أَوْ إِلَى امْرَأَةٍ يَنْكِحُهَا، فَهِجْرَتُهُ إِلَى مَا هَاجَرَ إِلَيْهِ.",
      targetBook: "صحيح مسلم — رقم (1907)",
      targetRendered: `إِنَّمَا الْأَعْمَالُ <span class="diff-add">بِالنِّيَّةِ</span>، وَإِنَّمَا <span class="diff-del">لِامْرِئٍ</span> <span class="diff-add">لِكُلِّ امْرِئٍ</span> مَا نَوَى، فَمَنْ كَانَتْ هِجْرَتُهُ إِلَى <span class="diff-add">اللهِ وَرَسُولِهِ فَهِجْرَتُهُ إِلَى اللهِ وَرَسُولِهِ، وَمَنْ كَانَتْ هِجْرَتُهُ لِدُنْيَا</span> يُصِيبُهَا أَوْ <span class="diff-add">امْرَأَةٍ</span> يَتَزَوَّجُهَا، فَهِجْرَتُهُ إِلَى مَا هَاجَرَ إِلَيْهِ.`,
      matchScore: "94% تطابق",
    },
    {
      id: "iman",
      label: "شعب الإيمان",
      sourceBook: "صحيح مسلم — رقم (35)",
      sourceText: "الْإِيمَانُ بِضْعٌ وَسَبْعُونَ أَوْ بِضْعٌ وَسِتُّونَ شُعْبَةً، فَأَفْضَلُهَا قَوْلُ: لَا إِلَهَ إِلَّا اللهُ، وَأَدْنَاهَا إِمَاطَةُ الْأَذَى عَنِ الطَّرِيقِ، وَالْحَيَاءُ شُعْبَةٌ مِنَ الْإِيمَانِ.",
      targetBook: "سنن أبي داود — رقم (4676)",
      targetRendered: `الْإِيمَانُ بِضْعٌ وَسَبْعُونَ <span class="diff-del">شُعْبَةً</span>، <span class="diff-add">وَأَفْضَلُهَا</span> قَوْلُ لَا إِلَهَ إِلَّا اللهُ، وَأَدْنَاهَا إِمَاطَةُ الْأَذَى عَنِ الطَّرِيقِ، وَالْحَيَاءُ شُعْبَةٌ مِنَ الْإِيمَانِ.`,
      matchScore: "91% تطابق",
    },
    {
      id: "athar-umar",
      label: "أثر عمر في التفقه",
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
      document.querySelectorAll(".demo-btn").forEach((b) => {
        b.classList.remove("active", "btn-outline");
        b.classList.add("btn-ghost");
      });
      btn.classList.add("active", "btn-outline");
      btn.classList.remove("btn-ghost");
      const caseId = btn.dataset.case;
      const found = DEMO_CASES.find((c) => c.id === caseId);
      if (found) renderDemoCase(found);
    });
  });

  /* ─────────────────────────────────────────────────────────────
     Interactive Search Modes Showcase Tabs
     ───────────────────────────────────────────────────────────── */
  document.querySelectorAll(".search-mode-tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const container = btn.closest(".search-modes-showcase");
      if (!container) return;

      container.querySelectorAll(".search-mode-tab-btn").forEach((b) => b.classList.remove("active"));
      container.querySelectorAll(".search-mode-tab-pane").forEach((p) => p.classList.remove("active"));

      btn.classList.add("active");
      const targetId = btn.dataset.searchMode;
      const targetPane = document.getElementById(targetId);
      if (targetPane) targetPane.classList.add("active");
    });
  });

  /* ─────────────────────────────────────────────────────────────
     Interactive App Showcase Tabs
     ───────────────────────────────────────────────────────────── */
  document.querySelectorAll(".tabs-trigger").forEach((tab) => {
    tab.addEventListener("click", () => {
      const container = tab.closest(".tabs");
      if (!container) return;

      container.querySelectorAll(".tabs-trigger").forEach((t) => t.classList.remove("active"));
      container.querySelectorAll(".tabs-content").forEach((p) => p.classList.remove("active"));

      tab.classList.add("active");
      const targetId = tab.dataset.target;
      const panel = document.getElementById(targetId);
      if (panel) panel.classList.add("active");
    });
  });

  /* ─────────────────────────────────────────────────────────────
     Interactive Chain Search Demo
     ───────────────────────────────────────────────────────────── */
  const chainChipsContainer = document.getElementById("chain-chips-container");
  const chainResultCount = document.getElementById("chain-result-count");

  let activeChain = [
    { id: 1, name: "الحميدي" },
    { id: 2, name: "سفيان بن عيينة" },
    { id: 3, name: "يحيى بن سعيد" },
  ];

  function renderChainChips() {
    if (!chainChipsContainer) return;
    chainChipsContainer.innerHTML = "";
    activeChain.forEach((n, idx) => {
      const chip = document.createElement("div");
      chip.className = "badge badge-outline";
      chip.style.fontSize = "0.8125rem";
      chip.style.padding = "0.25rem 0.65rem";
      chip.style.display = "inline-flex";
      chip.style.alignItems = "center";
      chip.style.gap = "0.375rem";
      chip.innerHTML = `
        <span style="font-weight:700;color:var(--primary);">${idx + 1}.</span>
        <span style="font-weight:600;color:var(--foreground);">${n.name}</span>
        ${idx < activeChain.length - 1 ? '<span style="color:var(--primary);font-weight:700;">⬅</span>' : ""}
      `;
      chainChipsContainer.appendChild(chip);
    });

    if (chainResultCount) {
      chainResultCount.textContent = `${activeChain.length * 4 + 2} آثار مطابقة بنفس الترتيب`;
    }
  }

  const addChainBtn = document.getElementById("add-chain-narrator-btn");
  if (addChainBtn) {
    const extraNarrators = [
      { id: 4, name: "محمد بن إبراهيم التيمي" },
      { id: 5, name: "علقمة بن وقاص" },
      { id: 6, name: "عمر بن الخطاب" },
    ];
    let nextIdx = 0;
    addChainBtn.addEventListener("click", () => {
      if (nextIdx < extraNarrators.length) {
        activeChain.push(extraNarrators[nextIdx]);
        nextIdx++;
        renderChainChips();
      } else {
        activeChain = [{ id: 1, name: "الحميدي" }, { id: 2, name: "سفيان بن عيينة" }];
        nextIdx = 0;
        renderChainChips();
      }
    });
  }

  /* ─────────────────────────────────────────────────────────────
     Clipboard Copy Helper
     ───────────────────────────────────────────────────────────── */
  document.querySelectorAll(".copy-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const code = btn.dataset.code || btn.previousElementSibling?.textContent || "";
      try {
        await navigator.clipboard.writeText(code.trim());
        const originalText = btn.innerHTML;
        btn.textContent = "تم النسخ ✓";
        setTimeout(() => {
          btn.innerHTML = originalText;
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
    renderChainChips();

    // 1. Render immediate fallback release
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
