/** グラフとリストで共有するパステル調カラーパレット */
export const CHART_COLORS = [
    "#60a5fa", /* soft blue */
    "#34d399", /* soft green */
    "#fbbf24", /* soft yellow */
    "#a78bfa", /* soft purple */
    "#fb923c", /* soft orange */
    "#38bdf8", /* soft cyan */
    "#f472b6", /* soft pink */
    "#4ade80", /* soft lime */
];

/**
 * 各カラーに対応する薄い背景色（タグ用）
 * メインカラーの10%不透明度相当
 */
export const CHART_COLORS_BG = [
    "#eff6ff", /* blue-50 */
    "#ecfdf5", /* emerald-50 */
    "#fefce8", /* yellow-50 */
    "#f5f3ff", /* violet-50 */
    "#fff7ed", /* orange-50 */
    "#ecfeff", /* cyan-50 */
    "#fdf2f8", /* pink-50 */
    "#f0fdf4", /* green-50 */
];

/**
 * ユニークなキーのリストからカラーマッピングを生成
 */
export function getColorMap(keys: string[]): Map<string, { main: string; bg: string }> {
    const map = new Map<string, { main: string; bg: string }>();
    const unique = [...new Set(keys)];
    unique.forEach((key, i) => {
        map.set(key, {
            main: CHART_COLORS[i % CHART_COLORS.length],
            bg: CHART_COLORS_BG[i % CHART_COLORS_BG.length],
        });
    });
    return map;
}
