// Data
const desktopData = [
    {
        id: 'case-summary',
        title: 'Case Summary',
        type: 'folder',
        color: '#89CFF0', // Baby Blue
        stroke: '#5CA0C1',
        files: []
    },
    {
        id: 'writing',
        title: 'Writing Samples',
        type: 'folder',
        color: '#A0D6B4', // Sage Green
        stroke: '#71A885',
        files: []
    },
    {
        id: 'research',
        title: 'Research',
        type: 'folder',
        color: '#B39EB5', // Pastel Purple
        stroke: '#846F86',
        files: []
    },
    {
        id: 'exhibits',
        title: 'Exhibits',
        type: 'folder',
        color: '#FFB7B2', // Pastel Red/Pink
        stroke: '#D08883',
        files: []
    },
    {
        id: 'contact',
        title: 'Contact',
        type: 'folder',
        color: '#e3d296', // Classic Manila
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

// Icons
const ICONS = {
    FOLDER_EMPTY: (color, stroke) => `<svg width="48" height="48" viewBox="0 0 24 24" fill="${color}" stroke="${stroke}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>`,
    FOLDER_FULL: (color, stroke) => `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 6h-7l-2-2H4a2 2 0 0 0-2 2v12h20V6z" fill="${color}" fill-opacity="0.3"></path>
        <path d="M6 8h12v8H6z" fill="white" stroke="none"></path>
        <path d="M22 12H2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-7z" fill="${color}"></path>
    </svg>`,
    SETTINGS: (color, stroke) => `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`,
    FILE_PDF: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>`,
    FILE_LINK: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`,
    FILE_EMAIL: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>`,
    DOWNLOAD: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
    EXTERNAL: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`
};

// State
const state = {
    windows: [], // { id, title, type, contentId, x, y, width, height, zIndex, isMinimized }
    activeWindowId: null,
    nextZIndex: 100,
    selectedIconId: null
};

// Sky wallpaper animation (12-minute loop)
const SKY_CYCLE_DURATION_MS = 12 * 60 * 1000;
const SKY_RENDER_INTERVAL_MS = 50; // ~20fps
const SKY_ARC = {
    xStart: -10,
    xEnd: 110,
    horizonY: 95,
    peakOffset: 70
};
let skyAnimationFrameId = null;
let skyLastRenderedAt = 0;
let shootingStarIntervalId = null;
const SHOOTING_STAR_CHECK_INTERVAL_MS = 6000;
const SHOOTING_STAR_CHANCE_PER_CHECK = 0.15;

// DOM Elements
const desktopIconsContainer = document.getElementById('desktop-icons');
const windowsContainer = document.getElementById('windows-container');
const dockItemsContainer = document.getElementById('dock-items');
const windowTemplate = document.getElementById('window-template');

// Initialization
function init() {
    renderDesktopIcons();
    renderMobileView();
    setupTheme();
    setupShare();
    setupSettings();
    setupSelectionBox();
    handleInitialUrl();
    
    // Global click to deselect
    document.getElementById('desktop-view').addEventListener('click', (e) => {
        if (e.target.id === 'desktop-view') {
            deselectIcons();
        }
    });

    // Keyboard shortcuts
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && state.activeWindowId) {
            closeWindow(state.activeWindowId);
        }
        if (e.key === 'Enter' && state.selectedIconId) {
            const folder = desktopData.find(f => f.id === state.selectedIconId);
            if (folder) {
                openWindow(folder.id, folder.title, 'folder', folder.id);
            }
        }
    });
}

function handleInitialUrl() {
    const hash = window.location.hash;
    if (!hash) return;

    const params = new URLSearchParams(hash.substring(1));
    const type = params.get('type');
    const id = params.get('id');
    const isMobile = window.innerWidth <= 768;

    if (type && id) {
        if (type === 'folder') {
            const folder = desktopData.find(f => f.id === id);
            if (folder) {
                if (isMobile) {
                    openMobileApp(folder);
                } else {
                    openWindow(folder.id, folder.title, 'folder', folder.id);
                }
            }
        } else if (type === 'pdf') {
            // Find file in any folder
            let file;
            for (const folder of desktopData) {
                const f = folder.files.find(fi => fi.id === id);
                if (f) { file = f; break; }
            }
            if (file) {
                if (isMobile) {
                    // For PDF on mobile, maybe just open it directly? 
                    // Or open the folder containing it?
                    // Let's open the folder containing it for now as mobile doesn't have window system
                    const parentFolder = desktopData.find(folder => folder.files.includes(file));
                    if (parentFolder) {
                        openMobileApp(parentFolder);
                        // Ideally scroll to item or highlight it, but opening folder is good start
                    }
                } else {
                    openWindow(file.id, file.title, 'pdf', file.id);
                }
            }
        }
    }
}

function updateUrl(type, id) {
    const url = new URL(window.location);
    url.hash = `type=${type}&id=${id}`;
    window.history.replaceState({}, '', url);
}

// Rendering
function renderDesktopIcons() {
    desktopIconsContainer.innerHTML = '';
    desktopData.forEach((folder, index) => {
        const iconEl = document.createElement('div');
        iconEl.className = 'desktop-icon';
        iconEl.dataset.id = folder.id;
        iconEl.style.left = '20px';
        iconEl.style.top = `${20 + (index * 100)}px`;
        
        let iconSvg;
        if (folder.type === 'app') {
            iconSvg = ICONS.SETTINGS(folder.color, folder.stroke);
        } else {
            const isFull = folder.files && folder.files.length > 0;
            iconSvg = isFull 
                ? ICONS.FOLDER_FULL(folder.color, folder.stroke) 
                : ICONS.FOLDER_EMPTY(folder.color, folder.stroke);
        }

        iconEl.innerHTML = `
            <div class="icon-svg">${iconSvg}</div>
            <div class="icon-label">${folder.title}</div>
        `;

        // Events
        iconEl.addEventListener('click', (e) => {
            e.stopPropagation();
            if (iconEl.getAttribute('data-just-dragged') === 'true') {
                iconEl.removeAttribute('data-just-dragged');
                return;
            }
            selectIcon(folder.id);
            if (folder.type === 'app' && folder.id === 'settings') {
                openSettingsWindow();
            } else {
                openWindow(folder.id, folder.title, 'folder', folder.id);
            }
        });

        makeDraggable(iconEl);
        desktopIconsContainer.appendChild(iconEl);
    });
}

function selectIcon(id) {
    state.selectedIconId = id;
    document.querySelectorAll('.desktop-icon').forEach(el => {
        if (el.dataset.id === id) {
            el.classList.add('selected');
        } else {
            el.classList.remove('selected');
        }
    });
}

function deselectIcons() {
    state.selectedIconId = null;
    document.querySelectorAll('.desktop-icon').forEach(el => el.classList.remove('selected'));
}

// Window Management
function openWindow(id, title, type, contentId) {
    const existingWindow = state.windows.find(w => w.id === id);
    
    if (existingWindow) {
        restoreWindow(id);
        return;
    }

    const startX = 100 + (state.windows.length * 30);
    const startY = 50 + (state.windows.length * 30);
    
    const newWindow = {
        id,
        title,
        type,
        contentId,
        x: startX,
        y: startY,
        width: type === 'pdf' ? 800 : 600,
        height: type === 'pdf' ? 700 : 400,
        zIndex: state.nextZIndex++,
        isMinimized: false
    };

    state.windows.push(newWindow);
    state.activeWindowId = id;
    
    createWindowDOM(newWindow);
    renderDock();
}

function createWindowDOM(windowObj) {
    const clone = windowTemplate.content.cloneNode(true);
    const windowEl = clone.querySelector('.window');
    
    windowEl.id = `window-${windowObj.id}`;
    windowEl.style.left = `${windowObj.x}px`;
    windowEl.style.top = `${windowObj.y}px`;
    windowEl.style.width = `${windowObj.width}px`;
    windowEl.style.height = `${windowObj.height}px`;
    windowEl.style.zIndex = windowObj.zIndex;
    
    // Header
    const titleEl = windowEl.querySelector('.window-title-text');
    titleEl.textContent = windowObj.title;

    if (windowObj.type === 'folder') {
        const folder = desktopData.find(f => f.id === windowObj.contentId);
        applyWindowHeaderTheme(windowEl, folder?.color);
    }
    
    // Controls
    windowEl.querySelector('.minimize-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        minimizeWindow(windowObj.id);
    });
    
    windowEl.querySelector('.close-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        closeWindow(windowObj.id);
    });

    windowEl.querySelector('.share-window-btn').addEventListener('click', async (e) => {
        e.stopPropagation();
        const url = `${window.location.origin}${window.location.pathname}#type=${windowObj.type}&id=${windowObj.contentId}`;
        try {
            await navigator.clipboard.writeText(url);
            const btn = e.currentTarget;
            const originalHtml = btn.innerHTML;
            btn.innerHTML = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
            setTimeout(() => {
                btn.innerHTML = originalHtml;
            }, 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    });

    // Content
    const contentEl = windowEl.querySelector('.window-content');
    if (windowObj.type === 'folder') {
        renderFolderContent(contentEl, windowObj.contentId);
    } else if (windowObj.type === 'pdf') {
        renderPdfContent(contentEl, windowObj.contentId);
    }

    // Interaction
    windowEl.addEventListener('mousedown', () => focusWindow(windowObj.id));
    
    const headerEl = windowEl.querySelector('.window-header');
    makeDraggable(windowEl, headerEl, (x, y) => {
        const w = state.windows.find(win => win.id === windowObj.id);
        if (w) { w.x = x; w.y = y; }
    });

    const resizeHandle = windowEl.querySelector('.resize-handle');
    makeResizable(windowEl, resizeHandle, (w, h) => {
        const win = state.windows.find(win => win.id === windowObj.id);
        if (win) { win.width = w; win.height = h; }
    });

    windowsContainer.appendChild(windowEl);
    focusWindow(windowObj.id);
}

function closeWindow(id) {
    const el = document.getElementById(`window-${id}`);
    if (el) el.remove();
    
    state.windows = state.windows.filter(w => w.id !== id);
    if (state.activeWindowId === id) {
        state.activeWindowId = null;
    }
    renderDock();
}

function minimizeWindow(id) {
    const w = state.windows.find(win => win.id === id);
    if (w) {
        w.isMinimized = true;
        const el = document.getElementById(`window-${id}`);
        if (el) el.style.display = 'none';
        renderDock();
    }
}

function restoreWindow(id) {
    const w = state.windows.find(win => win.id === id);
    if (w) {
        w.isMinimized = false;
        w.zIndex = state.nextZIndex++;
        state.activeWindowId = id;
        
        const el = document.getElementById(`window-${id}`);
        if (el) {
            el.style.display = 'flex';
            el.style.zIndex = w.zIndex;
        }
        renderDock();
    }
}

function focusWindow(id) {
    const w = state.windows.find(win => win.id === id);
    if (w) {
        w.zIndex = state.nextZIndex++;
        state.activeWindowId = id;
        
        const el = document.getElementById(`window-${id}`);
        if (el) {
            el.style.zIndex = w.zIndex;
            // Update visual active state
            document.querySelectorAll('.window').forEach(win => win.classList.remove('active'));
            el.classList.add('active');
        }
        renderDock();
        
        // Update URL
        let type = w.type;
        // If it's a PDF, we want to share the file ID, not the window ID (which are the same currently but good to be explicit)
        updateUrl(type, w.contentId);
    }
}

// Content Rendering
function renderFolderContent(container, folderId) {
    const folder = desktopData.find(f => f.id === folderId);
    if (!folder) return;

    if (folder.files.length === 0) {
        container.innerHTML = '<div class="empty-folder">This folder is empty.</div>';
        return;
    }

    const list = document.createElement('div');
    list.className = 'folder-list';

    folder.files.forEach(file => {
        const item = document.createElement('div');
        item.className = 'file-item';
        item.innerHTML = `
            <div class="file-icon">
                ${file.type === 'pdf' ? ICONS.FILE_PDF : (file.type === 'email' ? ICONS.FILE_EMAIL : ICONS.FILE_LINK)}
            </div>
            <div class="file-info">
                <h3>${file.title}</h3>
                <div class="file-meta">${file.date} • ${file.abstract}</div>
                <div class="file-tags">
                    ${file.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            </div>
        `;

        item.addEventListener('click', () => {
            if (file.type === 'pdf') {
                openWindow(file.id, file.title, 'pdf', file.id);
            } else if (file.type === 'email') {
                window.location.href = `mailto:${file.emailUser}@${file.emailDomain}`;
            } else if (file.url) {
                window.open(file.url, '_blank');
            }
        });

        list.appendChild(item);
    });

    container.appendChild(list);
}

function renderPdfContent(container, fileId) {
    // Find file
    let file;
    for (const folder of desktopData) {
        const f = folder.files.find(fi => fi.id === fileId);
        if (f) { file = f; break; }
    }

    if (!file) return;

    container.innerHTML = `
        <div class="pdf-container">
            <div class="pdf-header">
                <div class="pdf-title">
                    <h2>${file.title}</h2>
                </div>
                <div class="pdf-actions">
                    <a href="${file.pdfPath}" download class="btn btn-secondary">
                        ${ICONS.DOWNLOAD} Download
                    </a>
                    <a href="${file.pdfPath}" target="_blank" class="btn btn-primary">
                        ${ICONS.EXTERNAL} Open Tab
                    </a>
                </div>
            </div>
            <div class="pdf-frame-container">
                ${file.pdfPath ? `<iframe src="${file.pdfPath}" class="pdf-frame"></iframe>` : '<div class="empty-folder">PDF Source Not Available</div>'}
            </div>
        </div>
    `;
}

// Dock
function renderDock() {
    dockItemsContainer.innerHTML = '';
    if (state.windows.length === 0) {
        document.getElementById('dock').style.display = 'none';
        return;
    }
    document.getElementById('dock').style.display = 'block';

    state.windows.forEach(win => {
        const btn = document.createElement('button');
        btn.className = `dock-item ${win.isMinimized ? 'minimized' : ''} ${state.activeWindowId === win.id && !win.isMinimized ? 'active' : ''}`;
        btn.title = win.title;
        
        let iconHtml;
        if (win.type === 'folder') {
            const folder = desktopData.find(f => f.id === win.contentId);
            const isFull = folder && folder.files.length > 0;
            const color = folder ? folder.color : '#e3d296';
            const stroke = folder ? folder.stroke : '#b8a870';
            
            const iconSvg = isFull 
                ? ICONS.FOLDER_FULL(color, stroke) 
                : ICONS.FOLDER_EMPTY(color, stroke);
                
            iconHtml = iconSvg.replace('width="48"', 'width="24"').replace('height="48"', 'height="24"');
        } else {
            iconHtml = ICONS.FILE_PDF;
        }

        btn.innerHTML = `
            ${iconHtml}
            ${!win.isMinimized ? '<div class="dock-dot"></div>' : ''}
        `;

        btn.addEventListener('click', () => {
            if (win.isMinimized || state.activeWindowId !== win.id) {
                restoreWindow(win.id);
            } else {
                minimizeWindow(win.id);
            }
        });

        dockItemsContainer.appendChild(btn);
    });
}

// Mobile View
function renderMobileView() {
    const mobileApps = document.getElementById('mobile-apps');
    
    if (!mobileApps) return;
    
    mobileApps.innerHTML = '';

    // Grid: Render ALL folders
    desktopData.forEach(folder => {
        mobileApps.appendChild(createMobileAppIcon(folder, true));
    });

    // Setup Back Button
    const backBtn = document.getElementById('mobile-back-btn');
    if (backBtn) backBtn.addEventListener('click', closeMobileApp);

    // Start Clock
    updateMobileClock();
    setInterval(updateMobileClock, 1000);
}

function createMobileAppIcon(item, isFolder = true) {
    const iconEl = document.createElement('div');
    iconEl.className = 'mobile-app-icon';
    
    const iconColor = '#ffffff';
    const iconStroke = 'rgba(255,255,255,0.8)';
    
    let iconSvg;
    if (isFolder) {
        if (item.type === 'app') {
            iconSvg = ICONS.SETTINGS(iconColor, iconStroke);
        } else {
            const isFull = item.files.length > 0;
            iconSvg = isFull 
                ? ICONS.FOLDER_FULL(iconColor, iconStroke) 
                : ICONS.FOLDER_EMPTY(iconColor, iconStroke);
        }
    } else {
        if (item.iconType === 'email') iconSvg = ICONS.FILE_EMAIL;
        else iconSvg = ICONS.FILE_LINK;
        iconSvg = iconSvg.replace(/currentColor/g, 'white');
    }
    
    // Adjust SVG size
    const scaledSvg = iconSvg
        .replace('width="48"', 'width="32"').replace('height="48"', 'height="32"')
        .replace('width="24"', 'width="32"').replace('height="24"', 'height="32"');

    iconEl.innerHTML = `
        <div class="mobile-app-icon-bg" style="background-color: ${item.color};">
            ${scaledSvg}
        </div>
        <div class="mobile-app-label">${item.title}</div>
    `;

    if (isFolder) {
        if (item.type === 'app' && item.id === 'settings') {
            iconEl.addEventListener('click', openSettingsWindow);
        } else {
            iconEl.addEventListener('click', () => openMobileApp(item));
        }
    } else {
        iconEl.addEventListener('click', item.action);
    }
    return iconEl;
}

function openMobileApp(folder) {
    const windowEl = document.getElementById('mobile-app-window');
    const titleEl = document.getElementById('mobile-app-title');
    const contentEl = document.getElementById('mobile-app-content');

    titleEl.textContent = folder.title;
    contentEl.innerHTML = '';
    applyMobileHeaderTheme(windowEl, folder?.color);

    if (folder.files.length === 0) {
        contentEl.innerHTML = '<div class="empty-folder">No items</div>';
    } else {
        folder.files.forEach(file => {
            const item = document.createElement('div');
            item.className = 'file-item';
            item.innerHTML = `
                <div class="file-icon">
                    ${file.type === 'pdf' ? ICONS.FILE_PDF : (file.type === 'email' ? ICONS.FILE_EMAIL : ICONS.FILE_LINK)}
                </div>
                <div class="file-info">
                    <h3>${file.title}</h3>
                    <div class="file-meta">${file.date} • ${file.abstract}</div>
                    <div class="file-tags">
                        ${file.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                </div>
            `;

            item.addEventListener('click', () => {
                if (file.type === 'email') {
                    window.location.href = `mailto:${file.emailUser}@${file.emailDomain}`;
                } else if (file.pdfPath) {
                    window.open(file.pdfPath, '_blank');
                } else if (file.url) {
                    window.open(file.url, '_blank');
                }
            });

            contentEl.appendChild(item);
        });
    }

    // Update URL for sharing
    window.location.hash = `type=folder&id=${folder.id}`;

    // Setup Share Button
    const shareBtn = document.getElementById('mobile-app-share-btn');
    // Remove old listeners by cloning
    const newShareBtn = shareBtn.cloneNode(true);
    shareBtn.parentNode.replaceChild(newShareBtn, shareBtn);
    
    newShareBtn.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            
            // Visual feedback
            const originalIcon = newShareBtn.innerHTML;
            newShareBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
            
            setTimeout(() => {
                newShareBtn.innerHTML = originalIcon;
            }, 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
            alert("Link copied to clipboard!");
        }
    });

    windowEl.classList.add('open');
}

function closeMobileApp() {
    document.getElementById('mobile-app-window').classList.remove('open');
    // Clear hash without scrolling
    history.pushState("", document.title, window.location.pathname + window.location.search);
}

function updateMobileClock() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const timeString = `${hours % 12 || 12}:${minutes.toString().padStart(2, '0')}`;
    const timeEl = document.getElementById('mobile-time');
    if (timeEl) timeEl.textContent = timeString;
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
        fg: isLight ? '#111827' : '#f9fafb',
        hoverBg: isLight ? 'rgba(0, 0, 0, 0.10)' : 'rgba(255, 255, 255, 0.18)'
    };
}

function applyWindowHeaderTheme(windowEl, bgColor) {
    const theme = computeHeaderTheme(bgColor);
    if (!theme.bg) return;
    windowEl.style.setProperty('--window-header-bg', theme.bg);
    windowEl.style.setProperty('--window-header-bg-active', theme.bg);
    windowEl.style.setProperty('--window-header-fg', theme.fg);
    windowEl.style.setProperty('--window-header-hover-bg', theme.hoverBg);
}

function applyMobileHeaderTheme(mobileWindowEl, bgColor) {
    if (!mobileWindowEl) return;
    const theme = computeHeaderTheme(bgColor);
    if (!theme.bg) {
        mobileWindowEl.style.removeProperty('--app-header-bg');
        mobileWindowEl.style.removeProperty('--app-header-fg');
        return;
    }
    mobileWindowEl.style.setProperty('--app-header-bg', theme.bg);
    mobileWindowEl.style.setProperty('--app-header-fg', theme.fg);
}

// Utilities
function makeDraggable(element, handle = element, onDrag) {
    let isDragging = false;
    let startX, startY;
    let draggedElements = [];

    handle.addEventListener('mousedown', (e) => {
        // Only left click
        if (e.button !== 0) return;
        
        // Reset drag flag
        element.removeAttribute('data-just-dragged');
        
        // Handle selection logic for icons
        if (element.classList.contains('desktop-icon')) {
            const isSelected = element.classList.contains('selected');
            if (!isSelected && !e.shiftKey && !e.metaKey && !e.ctrlKey) {
                deselectIcons();
                element.classList.add('selected');
                state.selectedIconId = element.dataset.id;
            }
        }
        
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        
        // Identify targets
        let targets = [element];
        if (element.classList.contains('desktop-icon')) {
            const selectedIcons = document.querySelectorAll('.desktop-icon.selected');
            if (selectedIcons.length > 0) {
                targets = Array.from(selectedIcons);
            }
        }
        
        draggedElements = targets.map(el => ({
            el,
            initialLeft: el.offsetLeft,
            initialTop: el.offsetTop
        }));
        
        draggedElements.forEach(item => item.el.style.transition = 'none');
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });

    function onMouseMove(e) {
        if (!isDragging) return;
        
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        
        draggedElements.forEach(item => {
            let newLeft = item.initialLeft + dx;
            let newTop = item.initialTop + dy;
            
            // Boundary checks
            const container = item.el.offsetParent || document.body;
            const maxLeft = container.clientWidth - item.el.offsetWidth;
            const maxTop = container.clientHeight - item.el.offsetHeight;
            
            newLeft = Math.max(0, Math.min(newLeft, maxLeft));
            newTop = Math.max(0, Math.min(newTop, maxTop));
            
            item.el.style.left = `${newLeft}px`;
            item.el.style.top = `${newTop}px`;
        });
        
        if (onDrag) {
            const currentLeft = parseInt(element.style.left || 0);
            const currentTop = parseInt(element.style.top || 0);
            onDrag(currentLeft, currentTop);
        }
        
        // Mark as dragged
        element.setAttribute('data-just-dragged', 'true');
    }

    function onMouseUp() {
        isDragging = false;
        draggedElements.forEach(item => item.el.style.transition = '');
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }
}

function makeResizable(element, handle, onResize) {
    let isResizing = false;
    let startX, startY, startWidth, startHeight;

    handle.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        isResizing = true;
        startX = e.clientX;
        startY = e.clientY;
        startWidth = element.offsetWidth;
        startHeight = element.offsetHeight;
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });

    function onMouseMove(e) {
        if (!isResizing) return;
        
        const width = Math.max(300, startWidth + (e.clientX - startX));
        const height = Math.max(200, startHeight + (e.clientY - startY));
        
        element.style.width = `${width}px`;
        element.style.height = `${height}px`;
        
        if (onResize) onResize(width, height);
    }

    function onMouseUp() {
        isResizing = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }
}

function setupSelectionBox() {
    const container = document.getElementById('desktop-view');
    let isSelecting = false;
    let startX, startY;
    let selectionBox = null;

    container.addEventListener('mousedown', (e) => {
        // Only left click and only on the container itself (not on icons/windows)
        if (e.button !== 0 || e.target !== container) return;

        isSelecting = true;
        startX = e.clientX;
        startY = e.clientY;

        // Deselect all first unless shift/ctrl
        if (!e.shiftKey && !e.metaKey && !e.ctrlKey) {
            deselectIcons();
        }

        // Create box
        selectionBox = document.createElement('div');
        selectionBox.className = 'selection-box';
        selectionBox.style.left = `${startX}px`;
        selectionBox.style.top = `${startY}px`;
        selectionBox.style.width = '0px';
        selectionBox.style.height = '0px';
        container.appendChild(selectionBox);

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });

    function onMouseMove(e) {
        if (!isSelecting) return;

        const currentX = e.clientX;
        const currentY = e.clientY;

        const width = Math.abs(currentX - startX);
        const height = Math.abs(currentY - startY);
        const left = Math.min(currentX, startX);
        const top = Math.min(currentY, startY);

        selectionBox.style.width = `${width}px`;
        selectionBox.style.height = `${height}px`;
        selectionBox.style.left = `${left}px`;
        selectionBox.style.top = `${top}px`;

        // Check intersections
        const icons = document.querySelectorAll('.desktop-icon');
        const boxRect = selectionBox.getBoundingClientRect();

        icons.forEach(icon => {
            const iconRect = icon.getBoundingClientRect();
            if (rectsIntersect(boxRect, iconRect)) {
                icon.classList.add('selected');
            } else {
                // Only deselect if we didn't start with shift/ctrl
                // But for simplicity, let's just follow standard behavior:
                // If it's in the box, it's selected. If not, it's not (unless it was already selected and we held shift? No, standard box select usually clears others unless modifier held)
                // Let's keep it simple: Box defines selection.
                // If we want to add to selection, we'd need more complex logic.
                // For now: Box selects what's inside, deselects what's outside (relative to this operation)
                // But wait, if I hold shift, I want to ADD to selection.
                // Let's just make box select absolute for now.
                icon.classList.remove('selected');
                if (rectsIntersect(boxRect, iconRect)) {
                    icon.classList.add('selected');
                }
            }
        });
    }

    function onMouseUp() {
        isSelecting = false;
        if (selectionBox) {
            selectionBox.remove();
            selectionBox = null;
        }
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }

    function rectsIntersect(r1, r2) {
        return !(r2.left > r1.right || 
                 r2.right < r1.left || 
                 r2.top > r1.bottom || 
                 r2.bottom < r1.top);
    }
}

function setupTheme() {
    const desktopBtn = document.getElementById('theme-toggle');
    const mobileBtn = document.getElementById('mobile-theme-toggle');
    
    const updateIcons = (isDark) => {
        [desktopBtn, mobileBtn].forEach(btn => {
            if (!btn) return;
            const sunIcon = btn.querySelector('.sun-icon');
            const moonIcon = btn.querySelector('.moon-icon');
            if (isDark) {
                sunIcon.style.display = 'none';
                moonIcon.style.display = 'block';
            } else {
                sunIcon.style.display = 'block';
                moonIcon.style.display = 'none';
            }
        });
    };

    // Check saved preference or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialDark = savedTheme === 'dark' || (!savedTheme && systemDark);
    
    if (initialDark) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
    updateIcons(initialDark);
    syncSkyAppearance();

    const toggleTheme = () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        if (isDark) {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
            updateIcons(false);
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            updateIcons(true);
        }
        syncSkyAppearance();
    };

    if (desktopBtn) desktopBtn.addEventListener('click', toggleTheme);
    if (mobileBtn) mobileBtn.addEventListener('click', toggleTheme);
}

function setupShare() {
    const handleShare = async (btn) => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            
            // Visual feedback
            const originalIcon = btn.innerHTML;
            btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
            
            setTimeout(() => {
                btn.innerHTML = originalIcon;
            }, 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
            // Fallback
            const textArea = document.createElement("textarea");
            textArea.value = window.location.href;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand("Copy");
            textArea.remove();
            alert("Link copied to clipboard!");
        }
    };

    const desktopBtn = document.getElementById('share-btn');
    const mobileBtn = document.getElementById('mobile-share-btn');

    if (desktopBtn) desktopBtn.addEventListener('click', () => handleShare(desktopBtn));
    if (mobileBtn) mobileBtn.addEventListener('click', () => handleShare(mobileBtn));
}

function setupSettings() {
    // Load saved wallpaper
    const savedWallpaper = localStorage.getItem('wallpaper');
    if (savedWallpaper) {
        document.body.setAttribute('data-wallpaper', savedWallpaper);
    }
    syncSkyAnimationState();
    syncSkyAppearance();
    updateSkyPosition();

    const settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', openSettingsWindow);
    }

    const mobileSettingsBtn = document.getElementById('mobile-settings-btn');
    if (mobileSettingsBtn) {
        mobileSettingsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            openMobileSettings();
        });
    }
}

function getSettingsContent(isMobile = false) {
    const content = document.createElement('div');
    content.className = 'settings-content';
    content.style.padding = isMobile ? '0' : '1.5rem';

    const wallpapers = [
        { id: 'default', name: 'Classic', color: '#f3f4f6' },
        { id: 'ocean', name: 'Ocean', color: '#e0f2fe' },
        { id: 'forest', name: 'Forest', color: '#dcfce7' },
        { id: 'sunset', name: 'Sunset', color: '#fff7ed' },
        { id: 'midnight', name: 'Midnight', color: 'linear-gradient(to bottom right, #e0e7ff, #f3e8ff)' },
        { id: 'bliss', name: 'Bliss', color: 'linear-gradient(to bottom, #38bdf8, #4ade80)' },
        { id: 'sky', name: 'Sky', color: '#60a5fa' }
    ];

    content.innerHTML = `
        <h3 style="margin-bottom: 1rem; font-weight: 600; ${isMobile ? 'display:none;' : ''}">Appearance</h3>
        <div style="margin-bottom: 1.5rem;">
            <label style="display: block; margin-bottom: 0.5rem; font-size: 0.9rem; color: var(--text-secondary);">Wallpaper</label>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 1rem;">
                ${wallpapers.map(wp => `
                    <div class="wallpaper-option" data-id="${wp.id}" style="cursor: pointer;">
                        <div style="height: 60px; border-radius: 8px; background: ${wp.color}; border: 2px solid var(--border-color); margin-bottom: 0.5rem; position: relative;">
                            ${document.body.getAttribute('data-wallpaper') === wp.id || (!document.body.getAttribute('data-wallpaper') && wp.id === 'default') ? 
                                '<div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; color: var(--text-color);"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div>' 
                                : ''}
                        </div>
                        <div style="text-align: center; font-size: 0.8rem; color: var(--text-color);">${wp.name}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    // Add event listeners for wallpaper selection
    content.querySelectorAll('.wallpaper-option').forEach(opt => {
        opt.addEventListener('click', () => {
            const id = opt.dataset.id;
            if (id === 'default') {
                document.body.removeAttribute('data-wallpaper');
                localStorage.removeItem('wallpaper');
            } else {
                document.body.setAttribute('data-wallpaper', id);
                localStorage.setItem('wallpaper', id);
            }

            syncSkyAnimationState();
            syncSkyAppearance();
            updateSkyPosition();
            
            // Refresh UI
            if (isMobile) {
                openMobileSettings();
            } else {
                closeWindow('settings');
                setTimeout(() => openSettingsWindow(), 50);
            }
        });
    });

    return content;
}

function updateSkyPosition() {
    if (!isSkyWallpaperActive()) return;

    const progress = (Date.now() % SKY_CYCLE_DURATION_MS) / SKY_CYCLE_DURATION_MS; // 0..1
    const x = SKY_ARC.xStart + (SKY_ARC.xEnd - SKY_ARC.xStart) * progress;
    const y = SKY_ARC.horizonY - SKY_ARC.peakOffset * Math.sin(progress * Math.PI);

    document.querySelectorAll('.celestial-body.sun, .celestial-body.moon').forEach(el => {
        el.style.left = `${x}%`;
        el.style.top = `${y}%`;
    });

    syncSkyAppearance();
}

function isSkyWallpaperActive() {
    return document.body.getAttribute('data-wallpaper') === 'sky';
}

function startSkyAnimation() {
    if (skyAnimationFrameId) return;
    skyLastRenderedAt = 0;

    const tick = (now) => {
        if (!isSkyWallpaperActive()) {
            stopSkyAnimation();
            syncSkyAppearance();
            return;
        }

        if (now - skyLastRenderedAt >= SKY_RENDER_INTERVAL_MS) {
            updateSkyPosition();
            skyLastRenderedAt = now;
        }

        skyAnimationFrameId = requestAnimationFrame(tick);
    };

    skyAnimationFrameId = requestAnimationFrame(tick);
}

function stopSkyAnimation() {
    if (!skyAnimationFrameId) return;
    cancelAnimationFrame(skyAnimationFrameId);
    skyAnimationFrameId = null;
}

function syncSkyAnimationState() {
    if (isSkyWallpaperActive()) startSkyAnimation();
    else stopSkyAnimation();
}

function isDarkTheme() {
    return document.documentElement.getAttribute('data-theme') === 'dark';
}

function shouldShowShootingStars() {
    return isSkyWallpaperActive() && isDarkTheme();
}

function spawnShootingStar() {
    document.querySelectorAll('.sky-wallpaper.is-night').forEach(wp => {
        const star = document.createElement('div');
        star.className = 'shooting-star';

        const startLeft = Math.random() * 60 + 5; // 5%..65%
        const startTop = Math.random() * 40 + 5; // 5%..45%
        const dx = Math.random() * 260 + 260; // 260..520px
        const dy = Math.random() * 180 + 180; // 180..360px
        const duration = Math.random() * 500 + 850; // 850..1350ms

        star.style.left = `${startLeft}%`;
        star.style.top = `${startTop}%`;
        star.style.setProperty('--shoot-x', `${dx}px`);
        star.style.setProperty('--shoot-y', `${dy}px`);
        star.style.setProperty('--shoot-duration', `${Math.round(duration)}ms`);

        const remove = () => star.remove();
        star.addEventListener('animationend', remove, { once: true });
        setTimeout(remove, duration + 250);

        wp.appendChild(star);
    });
}

function startShootingStars() {
    if (shootingStarIntervalId) return;
    shootingStarIntervalId = setInterval(() => {
        if (!shouldShowShootingStars()) return;
        if (Math.random() < SHOOTING_STAR_CHANCE_PER_CHECK) spawnShootingStar();
    }, SHOOTING_STAR_CHECK_INTERVAL_MS);
}

function stopShootingStars() {
    if (!shootingStarIntervalId) return;
    clearInterval(shootingStarIntervalId);
    shootingStarIntervalId = null;
    document.querySelectorAll('.shooting-star').forEach(el => el.remove());
}

function syncShootingStarsState() {
    if (shouldShowShootingStars()) startShootingStars();
    else stopShootingStars();
}

function syncSkyAppearance() {
    const isDark = isDarkTheme();
    document.querySelectorAll('.sky-wallpaper').forEach(wp => {
        wp.classList.remove('is-sunrise', 'is-sunset');
        wp.classList.toggle('is-night', isSkyWallpaperActive() && isDark);
    });
    syncShootingStarsState();
}

// --- Weather System ---

function fetchWeather() {
    // Estimate weather based on season and hemisphere
    const now = new Date();
    const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    const isNorth = (localStorage.getItem('hemisphere') || 'north') === 'north';
    
    // Seasonality Factor (-1 Winter to 1 Summer)
    const peakDay = isNorth ? 172 : 355;
    const seasonFactor = Math.cos((dayOfYear - peakDay) / 365 * 2 * Math.PI);
    
    // Determine probabilities based on season
    let probs = { clear: 0, clouds: 0, rain: 0, snow: 0, storm: 0 };
    
    if (seasonFactor > 0.5) { 
        // Summer
        probs = { clear: 0.6, clouds: 0.2, rain: 0.1, snow: 0, storm: 0.1 };
    } else if (seasonFactor < -0.5) {
        // Winter
        probs = { clear: 0.3, clouds: 0.3, rain: 0.1, snow: 0.3, storm: 0 };
    } else {
        // Spring/Autumn
        probs = { clear: 0.4, clouds: 0.3, rain: 0.25, snow: 0.05, storm: 0 };
    }
    
    // Random selection
    const rand = Math.random();
    let sum = 0;
    let weatherType = 'clear';
    
    for (const [type, prob] of Object.entries(probs)) {
        sum += prob;
        if (rand < sum) {
            weatherType = type;
            break;
        }
    }
    
    // Only update if auto-weather is on (default)
    if (localStorage.getItem('weatherMode') !== 'manual') {
        updateWeatherEffects(weatherType);
        localStorage.setItem('detectedWeather', weatherType);
    }
}

function updateWeatherEffects(type) {
    // Types: clear, clouds, rain, snow, storm
    const layers = document.querySelectorAll('.weather-layer');
    layers.forEach(l => {
        l.style.opacity = '0';
        l.classList.remove('flash');
    });

    // Reset wallpaper state
    const wallpapers = document.querySelectorAll('.sky-wallpaper');
    wallpapers.forEach(wp => {
        wp.classList.remove('is-stormy', 'is-rainy', 'is-snowy', 'is-cloudy');
    });

    if (type === 'clear') return;

    // Add state class
    wallpapers.forEach(wp => {
        if (type === 'storm') wp.classList.add('is-stormy');
        else if (type === 'rain') wp.classList.add('is-rainy');
        else if (type === 'snow') wp.classList.add('is-snowy');
        else if (type === 'clouds') wp.classList.add('is-cloudy');
    });

    if (type === 'clouds') {
        document.querySelectorAll('.weather-layer.clouds').forEach(l => l.style.opacity = '0.8');
    } else if (type === 'rain') {
        document.querySelectorAll('.weather-layer.clouds').forEach(l => l.style.opacity = '1');
        document.querySelectorAll('.weather-layer.rain').forEach(l => l.style.opacity = '1');
    } else if (type === 'snow') {
        document.querySelectorAll('.weather-layer.clouds').forEach(l => l.style.opacity = '0.6');
        document.querySelectorAll('.weather-layer.snow').forEach(l => l.style.opacity = '1');
    } else if (type === 'storm') {
        document.querySelectorAll('.weather-layer.clouds').forEach(l => l.style.opacity = '1');
        document.querySelectorAll('.weather-layer.rain').forEach(l => l.style.opacity = '1');
        document.querySelectorAll('.weather-layer.lightning').forEach(l => l.style.opacity = '1');
        
        // Start random lightning loop
        const lightningLoop = () => {
            // Check if we are still in storm mode
            const isStorm = document.querySelector('.sky-wallpaper.is-stormy');
            if (!isStorm) return;

            const layers = document.querySelectorAll('.weather-layer.lightning');
            const delay = Math.random() * 3000 + 1000; // Random delay between 1-4 seconds (More frequent)

            setTimeout(() => {
                if (!document.querySelector('.sky-wallpaper.is-stormy')) return;
                
                // Randomize position
                const randomLeft = Math.random() * 80 + 10; // 10% to 90%
                const randomScale = Math.random() * 0.5 + 0.8; // 0.8 to 1.3 scale
                
                layers.forEach(l => {
                    const bolt = l.querySelector('.lightning-bolt');
                    if (bolt) {
                        bolt.style.left = `${randomLeft}%`;
                        bolt.style.transform = `translateX(-50%) scale(${randomScale})`;
                    }
                    
                    // Trigger flash
                    l.classList.remove('flash');
                    void l.offsetWidth; // Trigger reflow
                    l.classList.add('flash');
                });

                // Continue loop
                lightningLoop();
            }, delay);
        };
        
        lightningLoop();
    }
}




function openMobileSettings() {
    const windowEl = document.getElementById('mobile-app-window');
    const titleEl = document.getElementById('mobile-app-title');
    const contentEl = document.getElementById('mobile-app-content');
    const shareBtn = document.getElementById('mobile-app-share-btn');

    if (!windowEl || !titleEl || !contentEl) return;

    titleEl.textContent = 'Settings';
    applyMobileHeaderTheme(windowEl, null);
    contentEl.innerHTML = '';
    contentEl.appendChild(getSettingsContent(true));
    
    // Hide share button for settings
    if (shareBtn) shareBtn.style.display = 'none';

    // Override back button to just close
    const backBtn = document.getElementById('mobile-back-btn');
    if (backBtn) {
        const newBackBtn = backBtn.cloneNode(true);
        backBtn.parentNode.replaceChild(newBackBtn, backBtn);
        
        newBackBtn.addEventListener('click', () => {
            closeMobileApp();
            // Restore share button visibility
            if (shareBtn) shareBtn.style.display = 'flex';
        });
    }

    windowEl.classList.add('open');
}

function openSettingsWindow() {
    // Check if settings window is already open
    const existingWindow = state.windows.find(w => w.id === 'settings');
    if (existingWindow) {
        restoreWindow('settings');
        return;
    }

    const content = getSettingsContent(false);

    // Open the window
    // Use openWindow helper but with custom content
    const id = 'settings';
    const title = 'Settings';
    
    // Full screen
    const desktop = document.querySelector('.desktop-container');
    const width = desktop ? desktop.clientWidth : window.innerWidth;
    const height = desktop ? desktop.clientHeight : window.innerHeight;
    
    const newWindow = {
        id,
        title,
        type: 'settings',
        contentId: null,
        x: 0,
        y: 0,
        width: width,
        height: height,
        zIndex: state.nextZIndex++,
        isMinimized: false
    };

    state.windows.push(newWindow);
    state.activeWindowId = id;
    
    // Custom create window DOM since we have direct content element
    const clone = windowTemplate.content.cloneNode(true);
    const windowEl = clone.querySelector('.window');
    
    windowEl.id = `window-${id}`;
    windowEl.style.left = `${newWindow.x}px`;
    windowEl.style.top = `${newWindow.y}px`;
    windowEl.style.width = `${newWindow.width}px`;
    windowEl.style.height = `${newWindow.height}px`;
    windowEl.style.zIndex = newWindow.zIndex;
    
    // Header
    const titleEl = windowEl.querySelector('.window-title-text');
    titleEl.textContent = title;
    
    // Controls
    windowEl.querySelector('.minimize-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        minimizeWindow(id);
    });
    
    windowEl.querySelector('.close-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        closeWindow(id);
    });

    // Content
    const contentContainer = windowEl.querySelector('.window-content');
    contentContainer.appendChild(content);

    // Dragging
    const header = windowEl.querySelector('.window-header');
    makeDraggable(windowEl, header);

    // Focus on click
    windowEl.addEventListener('mousedown', () => {
        focusWindow(id);
    });

    windowsContainer.appendChild(windowEl);
    renderDock();
}

// Start
init();
syncSkyAnimationState();
syncSkyAppearance();
updateSkyPosition();
