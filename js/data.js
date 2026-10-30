/**
 * Webtoon Price Calculator V2 — Default Package Data
 * ข้อมูลแพ็กเกจตั้งต้นสำหรับแต่ละแอปพลิเคชัน
 *
 * ข้อมูลนี้ถูกดึงมาจากโปรเจกต์ต้นฉบับและจัดระเบียบใหม่
 * ไฟล์นี้เป็นอิสระจากโปรเจกต์เดิมโดยสมบูรณ์
 *
 * โครงสร้างแต่ละแอป:
 *   name        — ชื่อแอปพลิเคชัน
 *   unit        — หน่วยเงินในแอป (เหรียญ, Gems, Ink, Points ฯลฯ)
 *   defaultPrice — ราคาต่อตอนเริ่มต้น (หน่วยเงินของแอป)
 *   presets     — ปุ่มลัดราคาต่อตอน
 *   packages[]  — รายการแพ็กเกจ
 *     .price      — ราคาจริง (บาท)
 *     .baseCoin   — เหรียญหลักที่ได้
 *     .bonusCoin  — เหรียญโบนัสที่ได้เพิ่ม
 *     .tag        — ประเภท (ทั่วไป / รายเดือน / จำกัดเวลา / One-time)
 *     .label      — ชื่อแพ็กเกจ (ถ้ามี)
 *     .description— คำอธิบาย/เงื่อนไข (ถ้ามี)
 */

window.WEBTOON_DEFAULT_DATA = {

    /* ─────────────── Webtoon ─────────────── */
    'webtoon': {
        name: 'Webtoon',
        unit: 'เหรียญ',
        defaultPrice: 35,
        presets: [20, 30, 35, 899, 999],
        packages: [
            { price: 35,   baseCoin: 93,   bonusCoin: 0,   tag: 'ทั่วไป',   label: '', description: '' },
            { price: 55,   baseCoin: 100,  bonusCoin: 0,   tag: 'รายเดือน', label: '', description: '' },
            { price: 69,   baseCoin: 184,  bonusCoin: 0,   tag: 'ทั่วไป',   label: '', description: '' },
            { price: 179,  baseCoin: 477,  bonusCoin: 10,  tag: 'ทั่วไป',   label: '', description: '' },
            { price: 499,  baseCoin: 1331, bonusCoin: 30,  tag: 'ทั่วไป',   label: '', description: '' },
            { price: 599,  baseCoin: 1531, bonusCoin: 38,  tag: 'รายเดือน', label: '', description: '' },
            { price: 799,  baseCoin: 2131, bonusCoin: 49,  tag: 'ทั่วไป',   label: '', description: '' },
            { price: 1000, baseCoin: 2667, bonusCoin: 68,  tag: 'ทั่วไป',   label: '', description: '' },
            { price: 2200, baseCoin: 5867, bonusCoin: 100, tag: 'ทั่วไป',   label: '', description: '' }
        ]
    },

    /* ─────────────── Lezhin TH ─────────────── */
    'lezhin': {
        name: 'Lezhin TH',
        unit: 'C',
        defaultPrice: 3,
        presets: [1, 2, 3],
        packages: [
            { price: 59,   baseCoin: 10,  bonusCoin: 2,   tag: 'ทั่วไป', label: '', description: '' },
            { price: 119,  baseCoin: 20,  bonusCoin: 5,   tag: 'ทั่วไป', label: '', description: '' },
            { price: 299,  baseCoin: 45,  bonusCoin: 20,  tag: 'ทั่วไป', label: '', description: '' },
            { price: 499,  baseCoin: 75,  bonusCoin: 35,  tag: 'ทั่วไป', label: '', description: '' },
            { price: 599,  baseCoin: 100, bonusCoin: 50,  tag: 'ทั่วไป', label: '', description: '' },
            { price: 1100, baseCoin: 200, bonusCoin: 110, tag: 'ทั่วไป', label: '', description: '' },
            { price: 1900, baseCoin: 360, bonusCoin: 240, tag: 'ทั่วไป', label: '', description: '' }
        ]
    },

    /* ─────────────── We Comic ─────────────── */
    'wecomics': {
        name: 'We Comic',
        unit: 'เหรียญ',
        defaultPrice: 560,
        presets: [180, 300, 400, 560, 595, 630, 700],
        packages: [
            { price: 50,   baseCoin: 3000,  bonusCoin: 400,  tag: 'ทั่วไป', label: '', description: '' },
            { price: 100,  baseCoin: 6000,  bonusCoin: 800,  tag: 'ทั่วไป', label: '', description: '' },
            { price: 150,  baseCoin: 9000,  bonusCoin: 1300, tag: 'ทั่วไป', label: '', description: '' },
            { price: 300,  baseCoin: 18000, bonusCoin: 2600, tag: 'ทั่วไป', label: '', description: '' },
            { price: 500,  baseCoin: 30000, bonusCoin: 4500, tag: 'ทั่วไป', label: '', description: '' },
            { price: 1000, baseCoin: 60000, bonusCoin: 9300, tag: 'ทั่วไป', label: '', description: '' }
        ]
    },

    /* ─────────────── Tapas ─────────────── */
    'tapas': {
        name: 'Tapas',
        unit: 'Ink',
        defaultPrice: 405,
        presets: [283.5, 284, 337.5, 360, 405, 450],
        packages: [
            { price: 77,   baseCoin: 1600,  bonusCoin: 800,   tag: 'One-time', label: 'One-time offer', description: '' },
            { price: 77,   baseCoin: 1600,  bonusCoin: 0,     tag: 'ทั่วไป',   label: '', description: '' },
            { price: 200,  baseCoin: 4000,  bonusCoin: 1000,  tag: 'ทั่วไป',   label: '', description: '' },
            { price: 400,  baseCoin: 8000,  bonusCoin: 2500,  tag: 'ทั่วไป',   label: '', description: '' },
            { price: 775,  baseCoin: 16000, bonusCoin: 6500,  tag: 'ทั่วไป',   label: '', description: '' },
            { price: 1950, baseCoin: 40000, bonusCoin: 20000, tag: 'ทั่วไป',   label: '', description: '' },
            { price: 3900, baseCoin: 80000, bonusCoin: 50000, tag: 'ทั่วไป',   label: '', description: '' }
        ]
    },

    /* ─────────────── Manta ─────────────── */
    'manta': {
        name: 'Manta',
        unit: 'Gems',
        defaultPrice: 50,
        presets: [30, 40, 50, 60],
        packages: [
            { price: 77,   baseCoin: 100,   bonusCoin: 150,  tag: 'One-time', label: 'Starter Pack',  description: 'Special first-time offer' },
            { price: 74,   baseCoin: 200,   bonusCoin: 0,    tag: 'ทั่วไป',   label: '',              description: '' },
            { price: 200,  baseCoin: 500,   bonusCoin: 100,  tag: 'ทั่วไป',   label: '',              description: '' },
            { price: 350,  baseCoin: 1420,  bonusCoin: 0,    tag: 'รายเดือน', label: 'Preimum',       description: 'All-in-one plan ได้สิทธิ์อ่านบุฟเฟต์ 300+ เรื่อง (แบบเหมาจ่ายรายเดือน)' },
            { price: 375,  baseCoin: 1000,  bonusCoin: 250,  tag: 'ทั่วไป',   label: '',              description: '' },
            { price: 750,  baseCoin: 2000,  bonusCoin: 500,  tag: 'ทั่วไป',   label: '',              description: '' },
            { price: 1925, baseCoin: 5000,  bonusCoin: 1250, tag: 'ทั่วไป',   label: '',              description: '' },
            { price: 3500, baseCoin: 10000, bonusCoin: 2500, tag: 'ทั่วไป',   label: '',              description: '' },
            { price: 5250, baseCoin: 15000, bonusCoin: 3750, tag: 'ทั่วไป',   label: '',              description: '' },
            { price: 7000, baseCoin: 20000, bonusCoin: 5000, tag: 'ทั่วไป',   label: '',              description: '' },
            { price: 8750, baseCoin: 25000, bonusCoin: 6250, tag: 'ทั่วไป',   label: '',              description: '' }
        ]
    },

    /* ─────────────── Tappytoon ─────────────── */
    'tappytoon': {
        name: 'Tappytoon',
        unit: 'Points',
        defaultPrice: 300,
        presets: [150, 200, 225, 240, 270, 300, 400],
        packages: [
            { price: 71,   baseCoin: 2400,  bonusCoin: 0, tag: 'One-time',   label: 'Welcome Deal',  description: '' },
            { price: 175,  baseCoin: 5900,  bonusCoin: 0, tag: 'One-time',   label: 'Welcome Deal',  description: '' },
            { price: 500,  baseCoin: 15500, bonusCoin: 0, tag: 'One-time',   label: 'Welcome Deal',  description: '' },

            { price: 71,   baseCoin: 1400,  bonusCoin: 0, tag: 'ทั่วไป',     label: '',              description: '' },
            { price: 175,  baseCoin: 3900,  bonusCoin: 0, tag: 'ทั่วไป',     label: '',              description: '' },
            { price: 200,  baseCoin: 4400,  bonusCoin: 0, tag: 'รายเดือน',   label: 'Tappytoon Club', description: 'ยังไม่รวมล็อกอินรายวันรับวันละ 30 Point ระยะเวลา 30 วัน (รวมทั้งหมดได้เพิ่ม 900 Point)' },
            { price: 350,  baseCoin: 8000,  bonusCoin: 0, tag: 'ทั่วไป',     label: '',              description: '' },
            { price: 750,  baseCoin: 17000, bonusCoin: 0, tag: 'ทั่วไป',     label: '',              description: '' },
            { price: 1450, baseCoin: 36000, bonusCoin: 0, tag: 'ทั่วไป',     label: '',              description: '' },
            { price: 1900, baseCoin: 46000, bonusCoin: 0, tag: 'ทั่วไป',     label: '',              description: '' },
            { price: 3375, baseCoin: 91000, bonusCoin: 0, tag: 'ทั่วไป',     label: '',              description: '' },

            { price: 350,  baseCoin: 9000,   bonusCoin: 0, tag: 'จำกัดเวลา', label: 'Weekend Sale', description: '' },
            { price: 750,  baseCoin: 19000,  bonusCoin: 0, tag: 'จำกัดเวลา', label: 'Weekend Sale', description: '' },
            { price: 1450, baseCoin: 41000,  bonusCoin: 0, tag: 'จำกัดเวลา', label: 'Weekend Sale', description: '' },
            { price: 1900, baseCoin: 53000,  bonusCoin: 0, tag: 'จำกัดเวลา', label: 'Weekend Sale', description: '' },
            { price: 3375, baseCoin: 106000, bonusCoin: 0, tag: 'จำกัดเวลา', label: 'Weekend Sale', description: '' }
        ]
    }
};
