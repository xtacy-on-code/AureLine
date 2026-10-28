// 28 Oct 2026
export function formatDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
}

// 1.4 MB / 820 KB
export function formatBytes(bytes) {
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export function plural(count, word) {
    return `${count} ${word}${count === 1 ? '' : 's'}`;
}

// highlight type -> label and marker tone
export const HIGHLIGHT_TYPES = {
    definition: { label: 'Definition', plural: 'Definitions', tone: 'yellow' },
    key_concept: { label: 'Key concept', plural: 'Key concepts', tone: 'blue' },
    important_point: { label: 'Important point', plural: 'Important points', tone: 'green' },
};
