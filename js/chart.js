/**
 * Webtoon Price Calculator V2 — Chart Module
 * กราฟแสดงผลความคุ้มค่าโดยใช้ Chart.js
 *
 * API:
 *   WebtoonChart.create(canvasId, packages, epPrice, isDark)
 *   WebtoonChart.update(chart, packages, epPrice, isDark)
 *   WebtoonChart.destroy(chart)
 */

window.WebtoonChart = (() => {
    'use strict';

    /* ── สีตาม Tag ── */
    const TAG_COLORS = {
        'ทั่วไป':       { bg: 'rgba(107, 114, 128, 0.7)', border: 'rgba(107, 114, 128, 1)' },
        'รายเดือน':     { bg: 'rgba(147, 51, 234, 0.7)',  border: 'rgba(147, 51, 234, 1)' },
        'จำกัดเวลา':    { bg: 'rgba(245, 158, 11, 0.7)',  border: 'rgba(245, 158, 11, 1)' },
        'One-time':      { bg: 'rgba(244, 63, 94, 0.7)',   border: 'rgba(244, 63, 94, 1)' },
        '⚡ โปรโมชัน':   { bg: 'rgba(249, 115, 22, 0.7)',  border: 'rgba(249, 115, 22, 1)' },
        'default':       { bg: 'rgba(20, 184, 166, 0.7)',  border: 'rgba(20, 184, 166, 1)' }
    };

    function getTagColor(tag) {
        if (!tag) return TAG_COLORS['ทั่วไป'];
        if (TAG_COLORS[tag]) return TAG_COLORS[tag];
        const t = tag.toLowerCase();
        if (t.includes('โปรโมชัน') || t.includes('promo') || t.includes('⚡')) return TAG_COLORS['⚡ โปรโมชัน'];
        if (t.includes('one-time') || t.includes('welcome')) return TAG_COLORS['One-time'];
        if (t.includes('รายเดือน') || t.includes('member') || t.includes('club')) return TAG_COLORS['รายเดือน'];
        if (t.includes('จำกัดเวลา') || t.includes('weekend') || t.includes('limited')) return TAG_COLORS['จำกัดเวลา'];
        return TAG_COLORS['default'];
    }

    /* ── คำนวณราคาต่อตอน ── */
    function calcPricePerEp(pkg, epPrice) {
        const total = Number(pkg.baseCoin || 0) + Number(pkg.bonusCoin || 0);
        if (!total || !epPrice || !pkg.price) return 0;
        return (Number(pkg.price) / total) * epPrice;
    }

    /* ── สร้าง Label ── */
    function makeLabel(pkg) {
        const tag = pkg.tag || 'ทั่วไป';
        const label = pkg.label ? ` (${pkg.label})` : '';
        return `฿${Number(pkg.price).toLocaleString()} — ${tag}${label}`;
    }

    /* ── สร้าง Chart ── */
    function create(canvasId, packages, epPrice, isDark) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return null;

        const ctx = canvas.getContext('2d');
        const filtered = packages
            .filter(p => calcPricePerEp(p, epPrice) > 0)
            .sort((a, b) => calcPricePerEp(a, epPrice) - calcPricePerEp(b, epPrice));

        if (filtered.length === 0) return null;

        const labels = filtered.map(p => makeLabel(p));
        const data = filtered.map(p => +calcPricePerEp(p, epPrice).toFixed(2));
        const bgColors = filtered.map(p => getTagColor(p.tag).bg);
        const borderColors = filtered.map(p => getTagColor(p.tag).border);

        /* หา min เพื่อไฮไลท์ */
        const minVal = Math.min(...data);

        const textColor = isDark ? '#e5e7eb' : '#374151';
        const gridColor = isDark ? 'rgba(75,85,99,0.3)' : 'rgba(203,213,225,0.5)';

        return new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: 'ราคา / ตอน (บาท)',
                    data,
                    backgroundColor: data.map((v, i) =>
                        v === minVal ? 'rgba(34, 197, 94, 0.8)' : bgColors[i]
                    ),
                    borderColor: data.map((v, i) =>
                        v === minVal ? 'rgba(34, 197, 94, 1)' : borderColors[i]
                    ),
                    borderWidth: 1.5,
                    borderRadius: 4,
                    maxBarThickness: 36
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                layout: { padding: { right: 16 } },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'ราคา / ตอน (บาท) — ยิ่งสั้นยิ่งคุ้ม',
                            color: textColor,
                            font: { family: 'Sarabun', size: 12 }
                        },
                        ticks: { color: textColor, font: { family: 'Sarabun', size: 11 } },
                        grid: { color: gridColor }
                    },
                    y: {
                        ticks: {
                            color: textColor,
                            font: { family: 'Sarabun', size: 11 },
                            autoSkip: false
                        },
                        grid: { display: false }
                    }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        titleFont: { family: 'Sarabun' },
                        bodyFont: { family: 'Sarabun' },
                        callbacks: {
                            label: (ctx) => `  ${ctx.parsed.x.toFixed(2)} บาท/ตอน`
                        }
                    }
                }
            }
        });
    }

    /* ── อัปเดต Chart ── */
    function update(chart, packages, epPrice, isDark) {
        if (!chart) return null;

        const filtered = packages
            .filter(p => calcPricePerEp(p, epPrice) > 0)
            .sort((a, b) => calcPricePerEp(a, epPrice) - calcPricePerEp(b, epPrice));

        if (filtered.length === 0) { destroy(chart); return null; }

        const labels = filtered.map(p => makeLabel(p));
        const data = filtered.map(p => +calcPricePerEp(p, epPrice).toFixed(2));
        const bgColors = filtered.map(p => getTagColor(p.tag).bg);
        const borderColors = filtered.map(p => getTagColor(p.tag).border);
        const minVal = Math.min(...data);

        const textColor = isDark ? '#e5e7eb' : '#374151';
        const gridColor = isDark ? 'rgba(75,85,99,0.3)' : 'rgba(203,213,225,0.5)';

        chart.data.labels = labels;
        chart.data.datasets[0].data = data;
        chart.data.datasets[0].backgroundColor = data.map((v, i) =>
            v === minVal ? 'rgba(34, 197, 94, 0.8)' : bgColors[i]
        );
        chart.data.datasets[0].borderColor = data.map((v, i) =>
            v === minVal ? 'rgba(34, 197, 94, 1)' : borderColors[i]
        );

        chart.options.scales.x.title.color = textColor;
        chart.options.scales.x.ticks.color = textColor;
        chart.options.scales.x.grid.color = gridColor;
        chart.options.scales.y.ticks.color = textColor;

        chart.update('none');
        return chart;
    }

    /* ── ทำลาย Chart ── */
    function destroy(chart) {
        if (chart) {
            chart.destroy();
        }
        return null;
    }

    return { create, update, destroy };
})();
