// ─────────────────────────────────────────────────────────────────────────
// Site content model. Two entries are live — `contact` and `what-im-reading`
// — read by scene.js via desktopData.find() for the telephone and book
// stack props. The rest (Case Summary, Projects, Writing, Research,
// Exhibits) are reserved: written but not reachable yet, waiting on a 3D
// model for their prop per todo.md.
// ─────────────────────────────────────────────────────────────────────────

const desktopData = [
    {
        id: 'case-summary',
        title: 'Case Summary',
        type: 'folder',
        color: '#6D8CAE',
        stroke: '#3B5878',
        files: []
    },
    {
        id: 'what-im-reading',
        title: "What I'm Reading",
        type: 'note',
        color: '#F3E3B8',
        stroke: '#A67C3D',
        note: {
            title: "What I'm Reading",
            subtitle: 'Current',
            items: [
                {
                    title: 'Leviathan',
                    author: 'Hobbes',
                    edition: 'Penguin Classics',
                    isbn: '978-0-141-39509-8',
                    wikiUrl: 'https://en.wikipedia.org/wiki/Leviathan_(Hobbes_book)'
                },
                {
                    title: 'Republic',
                    author: 'Plato',
                    edition: 'Penguin Classics',
                    isbn: '978-0-140-45511-3',
                    wikiUrl: 'https://en.wikipedia.org/wiki/Republic_(Plato)'
                }
            ],
            completed: []
        }
    },
    {
        id: 'projects',
        title: 'Projects',
        type: 'folder',
        color: '#D9B26B',
        stroke: '#8A6531',
        files: [
            {
                id: 'projects-plans',
                title: 'Plans',
                type: 'folder',
                date: 'Folder',
                abstract: "What I'm planning next",
                tags: ['Projects']
            },
            {
                id: 'projects-fun',
                title: 'Fun',
                type: 'folder',
                date: 'Folder',
                abstract: 'Games and things I made',
                tags: ['Projects']
            },
            {
                id: 'projects-books',
                title: 'Books',
                type: 'folder',
                date: 'Folder',
                abstract: "Books I've written",
                tags: ['Projects']
            },
            {
                id: 'projects-reviews',
                title: 'Reviews',
                type: 'folder',
                date: 'Folder',
                abstract: "Books I've read and reviewed",
                tags: ['Projects']
            }
        ]
    },
    {
        id: 'projects-plans',
        parentId: 'projects',
        title: 'Plans',
        type: 'folder',
        color: '#8FAE93',
        stroke: '#4B6B4E',
        files: []
    },
    {
        id: 'projects-fun',
        parentId: 'projects',
        title: 'Fun',
        type: 'folder',
        color: '#B98CB3',
        stroke: '#6B4066',
        files: []
    },
    {
        id: 'projects-books',
        parentId: 'projects',
        title: 'Books',
        type: 'folder',
        color: '#D98E7B',
        stroke: '#8C4A38',
        files: []
    },
    {
        id: 'projects-reviews',
        parentId: 'projects',
        title: 'Reviews',
        type: 'folder',
        color: '#7FA8B0',
        stroke: '#3E6870',
        files: [],
        reviews: []
    },
    {
        id: 'writing',
        title: 'Writing Samples',
        type: 'folder',
        color: '#C97B5B',
        stroke: '#7A4530',
        files: []
    },
    {
        id: 'research',
        title: 'Research',
        type: 'folder',
        color: '#9B84A8',
        stroke: '#5C4569',
        files: []
    },
    {
        id: 'exhibits',
        title: 'Exhibits',
        type: 'folder',
        color: '#B5654F',
        stroke: '#7A3B2C',
        files: []
    },
    {
        id: 'contact',
        title: 'Contact',
        type: 'folder',
        color: '#e3d296',
        stroke: '#b8a870',
        files: [
            {
                id: 'email',
                title: 'Email Me',
                type: 'email',
                date: 'Direct',
                abstract: 'contact@braedensilver.com',
                tags: ['Contact', 'Email'],
                emailUser: 'contact',
                emailDomain: 'braedensilver.com'
            },
            {
                id: 'linkedin',
                title: 'LinkedIn',
                type: 'link',
                date: 'Social',
                abstract: 'Connect professionally',
                tags: ['Social', 'Network'],
                url: 'https://www.linkedin.com/in/braedensilver/'
            },
            {
                id: 'github',
                title: 'GitHub',
                type: 'link',
                date: 'Code',
                abstract: 'View source code',
                tags: ['Code', 'Projects'],
                url: 'https://github.com/BraedenSilver/BraedenSilver.github.io'
            }
        ]
    }
];

// ── Tree helpers (pure functions over desktopData) ─────────────────────
function getRootDesktopItems() {
    return desktopData.filter(item => {
        if (item.parentId) return false;
        if (item.type !== 'folder') return true;
        return folderHasContent(item);
    });
}

function folderHasContent(folder, visited = new Set()) {
    if (!folder || folder.type !== 'folder') return false;
    if (visited.has(folder.id)) return false;
    visited.add(folder.id);

    const reviewsCount = Array.isArray(folder.reviews) ? folder.reviews.length : 0;
    if (reviewsCount > 0) return true;

    const files = Array.isArray(folder.files) ? folder.files : [];
    for (const file of files) {
        if (!file) continue;
        if (file.type !== 'folder') return true;
        const child = desktopData.find((item) => item.id === file.id && item.type === 'folder');
        if (child && folderHasContent(child, visited)) return true;
    }
    return false;
}

function getVisibleFolderFiles(folder) {
    if (!folder || folder.type !== 'folder') return [];
    const files = Array.isArray(folder.files) ? folder.files : [];

    return files.filter((file) => {
        if (!file) return false;
        if (file.type !== 'folder') return true;
        const child = desktopData.find((item) => item.id === file.id && item.type === 'folder');
        return folderHasContent(child);
    });
}

function findFileById(id) {
    for (const folder of desktopData) {
        if (!folder.files) continue;
        const f = folder.files.find(fi => fi.id === id);
        if (f) return f;
    }
    return null;
}

// ── Reserved icon set + content renderers (from the previous iteration) ─
// Coupled to the old card/list HTML look, which is being redesigned as
// 3D objects. Kept as reference/reusable logic for when that phase wires
// this data onto the desk — not dead code, just not called yet.
const ICONS = {
    FILE_PDF: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>`,
    FILE_FOLDER: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-label="Folder"><path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/></svg>`,
    FILE_NOTE: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-label="Note"><path d="M6 2h9l3 3v15a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"/><path d="M14 2v6h6"/><path d="M8 11h8M8 14h8M8 17h6"/></svg>`,
    FILE_LINK: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`,
    FILE_LINKEDIN: `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-label="LinkedIn"><path d="M22.225 0H1.771C.792 0 0 .774 0 1.727v20.545C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.273V1.727C24 .774 23.2 0 22.222 0h.003zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zM6.813 20.452H3.861V9h2.952v11.452zM20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.266 2.37 4.266 5.455v6.286z"/></svg>`,
    FILE_GITHUB: `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-label="GitHub"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>`,
    FILE_EMAIL: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>`,
    DOWNLOAD: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
    EXTERNAL: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`
};

function getFileIconSvg(file) {
    if (file.type === 'folder') return ICONS.FILE_FOLDER;
    if (file.type === 'pdf') return ICONS.FILE_PDF;
    if (file.type === 'email') return ICONS.FILE_EMAIL;
    if (file.type === 'note') return ICONS.FILE_NOTE;
    if (file.id === 'linkedin') return ICONS.FILE_LINKEDIN;
    if (file.id === 'github') return ICONS.FILE_GITHUB;
    return ICONS.FILE_LINK;
}

function getPdfIframeSrc(pdfPath) {
    if (!pdfPath) return pdfPath;
    return pdfPath.includes('#') ? pdfPath : `${pdfPath}#view=FitH`;
}

function hexToRgb(hex) {
    if (typeof hex !== 'string') return null;
    const trimmed = hex.trim();
    const match = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(trimmed);
    if (!match) return null;

    let value = match[1];
    if (value.length === 3) value = value.split('').map(ch => ch + ch).join('');
    const intVal = parseInt(value, 16);
    return {
        r: (intVal >> 16) & 255,
        g: (intVal >> 8) & 255,
        b: intVal & 255
    };
}

function relativeLuminance({ r, g, b }) {
    const toLinear = (v) => {
        const s = v / 255;
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    };
    const R = toLinear(r);
    const G = toLinear(g);
    const B = toLinear(b);
    return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function computeHeaderTheme(bgColor) {
    const rgb = hexToRgb(bgColor);
    if (!rgb) {
        return { bg: null, fg: null, hoverBg: null };
    }
    const lum = relativeLuminance(rgb);
    const isLight = lum > 0.6;
    return {
        bg: bgColor,
        fg: isLight ? '#2A1E14' : '#F6EFDD',
        hoverBg: isLight ? 'rgba(0, 0, 0, 0.10)' : 'rgba(255, 255, 255, 0.14)'
    };
}

function renderReviewCard(review) {
    const title = review?.title || 'Untitled';
    const author = review?.author ? `by ${review.author}` : '';
    const date = review?.date || '';
    const rating = typeof review?.rating === 'number' ? review.rating : null;
    const blurb = review?.blurb || '';

    return `
        <div class="review-card">
            <div class="review-cover" aria-hidden="true"></div>
            <div class="review-body">
                <div class="review-title">${title}</div>
                <div class="review-meta">${[author, date].filter(Boolean).join(' • ')}</div>
                ${rating !== null ? `<div class="review-rating" aria-label="Rating">${renderStars(rating)}</div>` : ''}
                ${blurb ? `<div class="review-blurb">${blurb}</div>` : ''}
            </div>
        </div>
    `;
}

function renderStars(rating) {
    const clamped = Math.max(0, Math.min(5, rating));
    const full = Math.floor(clamped);
    const half = clamped - full >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;

    const star = (className) => `
        <svg class="star ${className}" width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path>
        </svg>
    `;

    return [
        ...Array.from({ length: full }, () => star('is-full')),
        ...Array.from({ length: half }, () => star('is-half')),
        ...Array.from({ length: empty }, () => star('is-empty'))
    ].join('');
}

function renderNoteContent(container, noteId) {
    const note = desktopData.find(item => item.id === noteId && item.type === 'note');
    if (!note?.note) return;

    const itemsHtml = (note.note.items || [])
        .map((item) => `<li><span class="note-book">${item.title}</span><span class="note-author"> — ${item.author}</span></li>`)
        .join('');

    container.innerHTML = `
        <div class="note-pad">
            <div class="note-pad-paper">
                <div class="note-pad-header">
                    <h2>${note.note.title || note.title}</h2>
                    ${note.note.subtitle ? `<div class="note-pad-subtitle">${note.note.subtitle}</div>` : ''}
                </div>
                <ul class="note-pad-list">
                    ${itemsHtml}
                </ul>
            </div>
        </div>
    `;
}

// Explicit window exposure: `const`/class top-level declarations in a
// classic script do NOT become window properties (unlike `var`/function
// declarations, which do automatically). scene.js is a module and needs
// a reliable global to read from, so make it explicit rather than
// depending on cross-script lexical scoping nuances.
window.desktopData = desktopData;
window.ICONS = ICONS;
