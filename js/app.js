/**
 * Webtoon Price Calculator V2 — Main Application
 * Vue 3 Application Logic
 *
 * LocalStorage Key: webtoonCalcV2 (แยกจากต้นฉบับ webtoonCalcV5)
 * ไฟล์นี้เป็นอิสระจากโปรเจกต์เดิมโดยสมบูรณ์
 */

const { createApp, ref, reactive, computed, watch, onMounted, nextTick } = Vue;

/* ── Helpers ── */
const generateId = () => 'pkg_' + Date.now() + Math.random().toString(36).substr(2, 9);

const injectIdsToPackages = (appsData) => {
    if (!appsData || typeof appsData !== 'object') return {};
    Object.values(appsData).forEach(app => {
        if (app.packages) app.packages.forEach(p => { if (!p._id) p._id = generateId(); });
    });
    return appsData;
};

const STORAGE_KEY = 'webtoonCalcV2';
const THEME_KEY = 'webtoonCalcV2_theme';

/* ── Vue App ── */
createApp({
    data() {
        return {
            apps: {},
            selectedAppId: 'webtoon',
            epPrice: 35,
            budget: null,
            promos: [{ price: null, baseCoin: null, bonusCoin: null }],

            /* Section visibility */
            isSection2Open: true,
            isSection3Open: true,
            isSection4Open: false,
            isCrossAppOpen: false,

            /* Section 3: Filter & Sort & Chart */
            sec3FilterTag: 'all',
            sec3ShowOneTime: false,
            sec3CompactView: true,
            sec3SortKey: '',
            sec3SortOrder: 1,
            showChart: false,

            /* Section 4: Edit & Sort */
            isEditMode: false,
            _packagesBackup: null,
            sortKey: '',
            sortOrder: 1,

            expandedNotes: {},
            _previousAppId: 'webtoon',
            _skipWatch: false,

            /* Theme */
            isDarkMode: true,

            /* Chart instance */
            _chart: null,

            /* Modals */
            modal: { isOpen: false, isNewMode: false, appName: '', appUnit: '', presets: [], newPreset: null },
            advModal: { isOpen: false, pkgRef: null, tag: 'ทั่วไป', price: null, baseCoin: null, bonusCoin: null, label: '', description: '' }
        };
    },

    created() {
        this.initTheme();
        this.loadData();
        if (this.apps[this.selectedAppId]) {
            this.epPrice = this.apps[this.selectedAppId].defaultPrice;
        }
        this._previousAppId = this.selectedAppId;
    },

    computed: {
        currentApp() {
            return this.apps[this.selectedAppId] || { name: 'ไม่มีข้อมูล', unit: '-', presets: [], packages: [] };
        },

        hasPromoData() {
            return this.promos.some(p => p.price > 0 || p.baseCoin > 0 || p.bonusCoin > 0);
        },

        /* ═══ Section 3 ═══ */
        rawCombinedPackages() {
            if (!this.currentApp.packages) return [];
            const stdPkgs = this.currentApp.packages
                .filter(p => p.price > 0 || p.baseCoin > 0)
                .map(p => ({ ...p, type: 'standard', tag: p.tag || 'ทั่วไป' }));
            const promoPkgs = this.promos
                .filter(p => p.price > 0 && (p.baseCoin > 0 || p.bonusCoin > 0))
                .map((p, i) => ({ ...p, type: 'promo', tag: '⚡ โปรโมชัน', _id: 'promo_' + i }));
            return [...stdPkgs, ...promoPkgs];
        },

        availableTags() {
            const tags = new Set();
            this.rawCombinedPackages.forEach(p => { if (p.tag) tags.add(p.tag); });
            const sorted = [...tags].sort();
            const generals = sorted.filter(t => t === 'ทั่วไป');
            const oneTimes = sorted.filter(t => this.isOneTimeTag(t));
            const others = sorted.filter(t => t !== 'ทั่วไป' && !this.isOneTimeTag(t));
            return [...generals, ...others, ...oneTimes];
        },

        filteredCombinedPackages() {
            let pkgs = this.rawCombinedPackages;
            if (!this.sec3ShowOneTime) {
                pkgs = pkgs.filter(p => !this.isOneTimeTag(p.tag));
            }
            if (this.sec3FilterTag !== 'all') {
                pkgs = pkgs.filter(p => p.tag === this.sec3FilterTag);
            }
            return pkgs;
        },

        displayCombinedPackages() {
            const pkgs = [...this.filteredCombinedPackages];
            const key = this.sec3SortKey;
            const order = this.sec3SortOrder;

            if (!key || key === '') {
                return pkgs.sort((a, b) => {
                    const pa = this.calcPricePerEp(a), pb = this.calcPricePerEp(b);
                    if (pa === 0) return 1;
                    if (pb === 0) return -1;
                    return pa - pb;
                });
            }

            return pkgs.sort((a, b) => {
                let va, vb;
                if (key === 'total') {
                    va = Number(a.baseCoin || 0) + Number(a.bonusCoin || 0);
                    vb = Number(b.baseCoin || 0) + Number(b.bonusCoin || 0);
                } else if (key === 'episodes') {
                    va = this.epPrice > 0 ? (Number(a.baseCoin || 0) + Number(a.bonusCoin || 0)) / this.epPrice : 0;
                    vb = this.epPrice > 0 ? (Number(b.baseCoin || 0) + Number(b.bonusCoin || 0)) / this.epPrice : 0;
                } else if (key === 'pricePerEp') {
                    va = this.calcPricePerEp(a); vb = this.calcPricePerEp(b);
                    if (va === 0) return 1; if (vb === 0) return -1;
                } else if (key === 'tag') {
                    return (a.tag || '').localeCompare(b.tag || '') * order;
                } else {
                    va = Number(a[key] || 0); vb = Number(b[key] || 0);
                }
                return va < vb ? -1 * order : va > vb ? 1 * order : 0;
            });
        },

        bestValuePkgId() {
            let bestId = null, bestPrice = Infinity;
            for (const p of this.filteredCombinedPackages) {
                const pp = this.calcPricePerEp(p);
                if (pp > 0 && pp < bestPrice) { bestPrice = pp; bestId = p._id; }
            }
            return bestId;
        },

        /* ═══ Section 4 ═══ */
        sortedPackages() {
            if (!this.currentApp.packages) return [];
            const pkgs = [...this.currentApp.packages];
            if (!this.sortKey) return pkgs;
            return pkgs.sort((a, b) => {
                let va, vb;
                if (this.sortKey === 'total') {
                    va = Number(a.baseCoin || 0) + Number(a.bonusCoin || 0);
                    vb = Number(b.baseCoin || 0) + Number(b.bonusCoin || 0);
                } else if (this.sortKey === 'tag') {
                    return (a.tag || '').localeCompare(b.tag || '') * this.sortOrder;
                } else {
                    va = Number(a[this.sortKey] || 0); vb = Number(b[this.sortKey] || 0);
                }
                return va < vb ? -1 * this.sortOrder : va > vb ? 1 * this.sortOrder : 0;
            });
        },

        /* ═══ Cross-App Comparison ═══ */
        crossAppSummary() {
            const result = [];
            for (const [id, app] of Object.entries(this.apps)) {
                if (!app.packages || app.packages.length === 0) continue;

                const ep = app.defaultPrice || 1;
                let bestPkg = null;
                let bestPPE = Infinity;

                /* หาแพ็กเกจที่ราคา/ตอน ถูกที่สุด (เฉพาะทั่วไป+รายเดือน, ไม่รวม One-time) */
                for (const pkg of app.packages) {
                    if (this.isOneTimeTag(pkg.tag)) continue;
                    const total = Number(pkg.baseCoin || 0) + Number(pkg.bonusCoin || 0);
                    if (!total || !pkg.price) continue;
                    const ppe = (Number(pkg.price) / total) * ep;
                    if (ppe > 0 && ppe < bestPPE) {
                        bestPPE = ppe;
                        bestPkg = pkg;
                    }
                }

                if (bestPkg) {
                    const totalCoins = Number(bestPkg.baseCoin || 0) + Number(bestPkg.bonusCoin || 0);
                    result.push({
                        id,
                        name: app.name,
                        unit: app.unit,
                        epPrice: ep,
                        bestPkg: { ...bestPkg },
                        pricePerEp: bestPPE,
                        totalCoins,
                        episodes: Math.floor(totalCoins / ep)
                    });
                }
            }
            return result.sort((a, b) => a.pricePerEp - b.pricePerEp);
        },

        crossAppBestId() {
            if (this.crossAppSummary.length === 0) return null;
            return this.crossAppSummary[0].id;
        }
    },

    watch: {
        sec3ShowOneTime(newVal) {
            if (!newVal && this.isOneTimeTag(this.sec3FilterTag)) {
                this.sec3FilterTag = 'all';
            }
        },

        selectedAppId(newVal) {
            if (this._skipWatch) { this._skipWatch = false; this._previousAppId = newVal; return; }
            if (this.hasPromoData) {
                if (!confirm('คุณมีข้อมูลโปรโมชันที่กรอกอยู่ เปลี่ยนแอปจะล้างข้อมูลเหล่านี้ทิ้ง ยืนยันหรือไม่?')) {
                    this._skipWatch = true;
                    this.selectedAppId = this._previousAppId;
                    return;
                }
            }
            this._previousAppId = newVal;
            if (this.apps[newVal]) this.epPrice = this.apps[newVal].defaultPrice;
            this.promos = [{ price: null, baseCoin: null, bonusCoin: null }];
            this.isEditMode = false;
            this.sortKey = '';
            this.sec3SortKey = '';
            this.sec3FilterTag = 'all';
            this.expandedNotes = {};
            this.refreshChart();
        },

        showChart(val) {
            if (val) {
                nextTick(() => this.refreshChart());
            } else {
                this.destroyChart();
            }
        },

        filteredCombinedPackages: {
            handler() { if (this.showChart) nextTick(() => this.refreshChart()); },
            deep: true
        },

        epPrice() {
            if (this.showChart) nextTick(() => this.refreshChart());
        },

        isDarkMode() {
            if (this.showChart) nextTick(() => this.refreshChart());
        }
    },

    methods: {
        /* ═══ Core Calculation ═══ */
        calcPricePerEp(pkg) {
            const t = Number(pkg.baseCoin || 0) + Number(pkg.bonusCoin || 0);
            if (!t || !this.epPrice || !pkg.price) return 0;
            return (Number(pkg.price) / t) * this.epPrice;
        },

        /* ═══ Theme ═══ */
        initTheme() {
            const saved = localStorage.getItem(THEME_KEY);
            this.isDarkMode = saved !== 'light';
            this.applyTheme();
        },

        toggleTheme() {
            this.isDarkMode = !this.isDarkMode;
            localStorage.setItem(THEME_KEY, this.isDarkMode ? 'dark' : 'light');
            this.applyTheme();
        },

        applyTheme() {
            const html = document.documentElement;
            if (this.isDarkMode) {
                html.classList.add('dark');
            } else {
                html.classList.remove('dark');
            }
        },

        /* ═══ Tag Helpers ═══ */
        isOneTimeTag(tag) {
            if (!tag) return false;
            const t = tag.toLowerCase();
            return t === 'one-time' || t === 'ซื้อครั้งเดียว' || t.includes('one-time') || t.includes('welcome deal');
        },

        tagColorClass(tag) {
            if (!tag || tag === 'ทั่วไป') return 'bg-gray-500 dark:bg-gray-600 text-white';
            const t = tag.toLowerCase();
            if (t === 'รายเดือน' || t.includes('member') || t.includes('vip') || t.includes('club')) return 'bg-purple-600 text-white';
            if (t === 'จำกัดเวลา' || t.includes('weekend') || t.includes('limited')) return 'bg-amber-600 text-white';
            if (this.isOneTimeTag(tag)) return 'bg-rose-600 text-white';
            if (t.includes('โปรโมชัน') || t.includes('promo') || t.includes('⚡')) return 'bg-orange-600 text-white';
            return 'bg-teal-600 text-white';
        },

        tagRowClass(tag) {
            if (!tag) return 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/80 border-l-4 border-l-transparent';
            const t = tag.toLowerCase();
            if (t.includes('โปรโมชัน') || t.includes('promo') || t.includes('⚡'))
                return 'bg-orange-50 dark:bg-orange-950/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 border-l-4 border-l-orange-500';
            if (t === 'รายเดือน' || t.includes('member') || t.includes('vip') || t.includes('club'))
                return 'bg-purple-50 dark:bg-purple-950/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 border-l-4 border-l-purple-500';
            if (t === 'จำกัดเวลา' || t.includes('weekend') || t.includes('limited'))
                return 'bg-amber-50 dark:bg-amber-950/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 border-l-4 border-l-amber-500';
            if (this.isOneTimeTag(tag))
                return 'bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-900/30 border-l-4 border-l-rose-500';
            if (t === 'ทั่วไป')
                return 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/80 border-l-4 border-l-transparent';
            return 'bg-teal-50 dark:bg-teal-950/20 hover:bg-teal-100 dark:hover:bg-teal-900/30 border-l-4 border-l-teal-500';
        },

        budgetHighlightClass(pkg) {
            if (!this.budget || this.budget <= 0 || !pkg.price) return '';
            if (pkg.price > this.budget) return 'opacity-40';
            let bestId = null, bestPrice = Infinity;
            for (const p of this.filteredCombinedPackages) {
                if (p.price <= this.budget) {
                    const pp = this.calcPricePerEp(p);
                    if (pp > 0 && pp < bestPrice) { bestPrice = pp; bestId = p._id; }
                }
            }
            if (pkg._id === bestId) return 'ring-2 ring-green-500/70 ring-inset';
            return '';
        },

        selectFilterTag(tag) {
            if (this.sec3FilterTag === tag) {
                this.sec3FilterTag = 'all';
            } else {
                this.sec3FilterTag = tag;
                if (this.isOneTimeTag(tag)) this.sec3ShowOneTime = true;
            }
        },

        /* ═══ Section 3 Sort ═══ */
        sec3Sort(key) {
            if (this.sec3SortKey === key) {
                this.sec3SortOrder = this.sec3SortOrder === 1 ? -1 : 1;
                if (this.sec3SortOrder === 1) this.sec3SortKey = '';
            } else {
                this.sec3SortKey = key;
                this.sec3SortOrder = 1;
            }
        },

        /* ═══ Chart ═══ */
        refreshChart() {
            if (!this.showChart) return;
            this.destroyChart();
            nextTick(() => {
                this._chart = WebtoonChart.create(
                    'priceChart',
                    this.filteredCombinedPackages,
                    this.epPrice,
                    this.isDarkMode
                );
            });
        },

        destroyChart() {
            this._chart = WebtoonChart.destroy(this._chart);
        },

        /* ═══ Note Truncation ═══ */
        needsExpandButton(text) { return text && (text.length > 80 || text.includes('\n')); },
        toggleNote(id) { this.expandedNotes[id] = !this.expandedNotes[id]; },

        /* ═══ Package Editor Modal ═══ */
        openAdvancedEditModal(pkg) {
            this.advModal.pkgRef = pkg;
            this.advModal.tag = pkg.tag || 'ทั่วไป';
            this.advModal.price = pkg.price;
            this.advModal.baseCoin = pkg.baseCoin;
            this.advModal.bonusCoin = pkg.bonusCoin;
            this.advModal.label = pkg.label || '';
            this.advModal.description = pkg.description || '';
            this.advModal.isOpen = true;
        },

        saveAdvancedEditModal() {
            if (this.advModal.pkgRef) {
                const p = this.advModal.pkgRef;
                p.tag = (this.advModal.tag || 'ทั่วไป').trim();
                p.price = this.advModal.price;
                p.baseCoin = this.advModal.baseCoin;
                p.bonusCoin = this.advModal.bonusCoin;
                p.label = this.advModal.label.trim();
                p.description = this.advModal.description.trim();
            }
            this.advModal.isOpen = false;
        },

        deleteFromAdvModal() {
            if (!this.advModal.pkgRef) return;
            const pkg = this.advModal.pkgRef;
            const label = pkg.label || (pkg.price ? `${pkg.price.toLocaleString()} บาท` : 'แถวนี้');
            if (confirm(`ยืนยันการลบแพ็กเกจ "${label}"?`)) {
                const idx = this.currentApp.packages.indexOf(pkg);
                if (idx !== -1) this.currentApp.packages.splice(idx, 1);
                this.advModal.isOpen = false;
            }
        },

        closeAdvancedEditModal() {
            this.advModal.isOpen = false;
            this.advModal.pkgRef = null;
        },

        /* ═══ Promos ═══ */
        saveCurrentEpPriceAsPreset() {
            if (!this.currentApp.presets) this.currentApp.presets = [];
            if (this.epPrice > 0 && !this.currentApp.presets.includes(this.epPrice)) {
                this.currentApp.presets.push(this.epPrice);
                this.currentApp.presets.sort((a, b) => a - b);
                this.saveData();
            }
        },

        addPromo() { this.promos.push({ price: null, baseCoin: null, bonusCoin: null }); },

        removePromo(index) {
            this.promos.splice(index, 1);
            if (this.promos.length === 0) this.addPromo();
        },

        clearAllPromos() {
            if (confirm('ยืนยันการล้างข้อมูลโปรโมชันทั้งหมด?'))
                this.promos = [{ price: null, baseCoin: null, bonusCoin: null }];
        },

        /* ═══ Section 4 DB ═══ */
        sortBy(key) {
            if (this.sortKey === key) {
                this.sortOrder = this.sortOrder === 1 ? -1 : 1;
                if (this.sortOrder === 1 && this.sortKey !== '') this.sortKey = '';
            } else { this.sortKey = key; this.sortOrder = 1; }
        },

        toggleEditMode() {
            if (this.isEditMode) {
                this.currentApp.packages = this.currentApp.packages.filter(p => p.price > 0 || p.baseCoin > 0);
                this.currentApp.packages.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
                this.saveData();
                this._packagesBackup = null;
                this.isEditMode = false;
                this.sortKey = '';
            } else {
                this._packagesBackup = JSON.parse(JSON.stringify(this.currentApp.packages));
                this.isEditMode = true;
            }
        },

        cancelEditMode() {
            if (this._packagesBackup) this.currentApp.packages = JSON.parse(JSON.stringify(this._packagesBackup));
            this.isEditMode = false;
            this._packagesBackup = null;
        },

        addStandardPackage() {
            this.currentApp.packages.push({
                _id: generateId(), price: null, baseCoin: null, bonusCoin: null,
                tag: 'ทั่วไป', label: '', description: ''
            });
        },

        removeStandardPackage(pkg) {
            const idx = this.currentApp.packages.indexOf(pkg);
            if (idx === -1) return;
            const label = pkg.label || (pkg.price ? `${pkg.price.toLocaleString()} บาท` : 'แถวนี้');
            if (confirm(`ยืนยันการลบแพ็กเกจ "${label}"?`)) this.currentApp.packages.splice(idx, 1);
        },

        /* ═══ App Modal ═══ */
        openAppSettingModal() {
            this.modal.isNewMode = false;
            this.modal.appName = this.currentApp.name;
            this.modal.appUnit = this.currentApp.unit;
            this.modal.presets = [...(this.currentApp.presets || [])];
            this.modal.newPreset = null;
            this.modal.isOpen = true;
        },

        setNewAppMode() {
            this.modal.isNewMode = true;
            this.modal.appName = '';
            this.modal.appUnit = 'เหรียญ';
            this.modal.presets = [10];
            this.modal.newPreset = null;
        },

        closeAppModal() { this.modal.isOpen = false; },

        addPresetToModal() {
            if (this.modal.newPreset > 0 && !this.modal.presets.includes(this.modal.newPreset)) {
                this.modal.presets.push(this.modal.newPreset);
                this.modal.presets.sort((a, b) => a - b);
                this.modal.newPreset = null;
            }
        },

        saveAppModal() {
            if (!this.modal.appName.trim()) return;
            if (this.modal.isNewMode) {
                const newId = 'app_' + Date.now();
                this.apps[newId] = {
                    name: this.modal.appName.trim(),
                    unit: this.modal.appUnit.trim(),
                    defaultPrice: this.modal.presets.length > 0 ? this.modal.presets[0] : 10,
                    presets: this.modal.presets.sort((a, b) => a - b),
                    packages: []
                };
                this._skipWatch = true;
                this.selectedAppId = newId;
                this._previousAppId = newId;
                this.epPrice = this.apps[newId].defaultPrice;
                this.promos = [{ price: null, baseCoin: null, bonusCoin: null }];
                this.isEditMode = false;
                this.sortKey = '';
            } else {
                this.apps[this.selectedAppId].name = this.modal.appName.trim();
                this.apps[this.selectedAppId].unit = this.modal.appUnit.trim();
                this.apps[this.selectedAppId].presets = this.modal.presets.sort((a, b) => a - b);
            }
            this.saveData();
            this.closeAppModal();
        },

        deleteCurrentApp() {
            if (confirm(`ยืนยันการลบแอป "${this.currentApp.name}" พร้อมข้อมูลแพ็กเกจทั้งหมด?`)) {
                delete this.apps[this.selectedAppId];
                const keys = Object.keys(this.apps);
                this._skipWatch = true;
                if (keys.length > 0) {
                    this.selectedAppId = keys[0];
                    this._previousAppId = keys[0];
                    this.epPrice = this.apps[keys[0]].defaultPrice;
                } else {
                    this.apps['app_1'] = { name: 'แอปใหม่', unit: 'เหรียญ', defaultPrice: 10, presets: [10], packages: [] };
                    this.selectedAppId = 'app_1';
                    this._previousAppId = 'app_1';
                    this.epPrice = 10;
                }
                this.promos = [{ price: null, baseCoin: null, bonusCoin: null }];
                this.saveData();
                this.closeAppModal();
            }
        },

        /* ═══ Export / Import / Reset ═══ */
        exportData() {
            try {
                const blob = new Blob([JSON.stringify(this.apps, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `webtoon_calc_v2_backup_${new Date().toISOString().slice(0, 10)}.json`;
                a.click();
                URL.revokeObjectURL(url);
            } catch (e) { alert('เกิดข้อผิดพลาดในการ Export'); }
        },

        importData(event) {
            const file = event.target.files[0];
            if (!file) return;
            if (!confirm('การ Import จะแทนที่ข้อมูลทั้งหมด ยืนยันหรือไม่?')) { event.target.value = ''; return; }
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const d = JSON.parse(e.target.result);
                    if (typeof d !== 'object' || Object.keys(d).length === 0) { alert('ไฟล์ JSON ไม่ถูกต้อง'); return; }
                    this.apps = injectIdsToPackages(d);
                    this._skipWatch = true;
                    this.selectedAppId = Object.keys(this.apps)[0];
                    this._previousAppId = this.selectedAppId;
                    this.epPrice = this.apps[this.selectedAppId].defaultPrice || 10;
                    this.promos = [{ price: null, baseCoin: null, bonusCoin: null }];
                    this.saveData();
                    alert('Import สำเร็จ!');
                } catch (err) { alert('ไม่สามารถอ่านไฟล์ JSON: ' + err.message); }
            };
            reader.readAsText(file);
            event.target.value = '';
        },

        resetData() {
            if (confirm('ยืนยันโหลดข้อมูลตั้งต้นใหม่?\n\n⚠️ ข้อมูลที่แก้ไขไว้จะถูกเขียนทับทั้งหมด')) {
                const base = window.WEBTOON_DEFAULT_DATA || {};
                if (Object.keys(base).length === 0) {
                    alert('ไม่พบข้อมูลตั้งต้น กรุณาตรวจสอบว่าไฟล์ js/data.js โหลดถูกต้อง');
                    return;
                }
                this.apps = injectIdsToPackages(JSON.parse(JSON.stringify(base)));
                this._skipWatch = true;
                const keys = Object.keys(this.apps);
                if (keys.length > 0) {
                    this.selectedAppId = keys[0];
                    this._previousAppId = keys[0];
                    this.epPrice = this.apps[keys[0]].defaultPrice || 10;
                }
                this.promos = [{ price: null, baseCoin: null, bonusCoin: null }];
                this.isEditMode = false;
                this.sortKey = '';
                this.sec3SortKey = '';
                this.sec3FilterTag = 'all';
                this.saveData();
            }
        },

        /* ═══ Persistence ═══ */
        loadData() {
            try {
                const saved = localStorage.getItem(STORAGE_KEY);
                if (saved) {
                    this.apps = injectIdsToPackages(JSON.parse(saved));
                    if (!this.apps[this.selectedAppId]) {
                        this.selectedAppId = Object.keys(this.apps)[0] || 'webtoon';
                    }
                } else {
                    const base = window.WEBTOON_DEFAULT_DATA || {};
                    this.apps = injectIdsToPackages(JSON.parse(JSON.stringify(base)));
                }
            } catch (e) {
                const base = window.WEBTOON_DEFAULT_DATA || {};
                this.apps = injectIdsToPackages(JSON.parse(JSON.stringify(base)));
            }
        },

        saveData() {
            try {
                if (this.apps[this.selectedAppId]) {
                    this.apps[this.selectedAppId].defaultPrice = this.epPrice;
                }
                localStorage.setItem(STORAGE_KEY, JSON.stringify(this.apps));
            } catch (e) { /* quota exceeded or private mode */ }
        }
    }
}).mount('#app');
