import * as THREE from 'three';
import { GLTFLoader } from 'https://unpkg.com/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';
import { mergeVertices } from 'https://unpkg.com/three@0.160.0/examples/jsm/utils/BufferGeometryUtils.js';

// ─────────────────────────────────────────────────────────────────────────
// Desk + wall + floor, low-poly/flat-shaded, plus a first pass of props
// sitting on the desk (telephone, notebook, book stack). No interaction
// beyond viewing yet; wiring these to actual content is future work.
// ─────────────────────────────────────────────────────────────────────────

const container = document.getElementById('scene-root');

// Brighter, more saturated take on the same warm family — same wood/parchment
// identity, pushed up in lightness/chroma so the scene reads as lively
// rather than dim.
const COLORS = {
    wall: 0xF6D998,
    floor: 0xC2A98A,
    deskTop: 0xC85A32,
    deskSide: 0x7A3820
};

const FRUSTUM_SIZE = 3.25;
const MIN_ASPECT = 0.6;
const MAX_ASPECT = 2.0;

// ── Renderer ─────────────────────────────────────────────────────────────
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

// ── Scene ────────────────────────────────────────────────────────────────
const scene = new THREE.Scene();
scene.background = new THREE.Color(COLORS.wall);

// ── Camera ───────────────────────────────────────────────────────────────
// Orthographic (true isometric-family projection, no vanishing point), but
// framed low and close per the reference — the desk fills/overflows the
// frame rather than sitting distant in a bird's-eye view.
function getClampedAspect() {
    const raw = container.clientWidth / container.clientHeight;
    return Math.min(Math.max(raw, MIN_ASPECT), MAX_ASPECT);
}

const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
// Head-on (no side azimuth), steeper near-overhead angle so a usable amount
// of flat tabletop is actually visible (not just the front skirt), centered
// on the tabletop (y: 1.2 matches TOP_Y below — the desk's top surface height).
camera.position.set(0, 4.89, 4.73);
camera.lookAt(0, 1.2, 0);

function applyCameraFrustum() {
    const aspect = getClampedAspect();
    camera.left = (-FRUSTUM_SIZE * aspect) / 2;
    camera.right = (FRUSTUM_SIZE * aspect) / 2;
    camera.top = FRUSTUM_SIZE / 2;
    camera.bottom = -FRUSTUM_SIZE / 2;
    camera.updateProjectionMatrix();
}

// ── Lighting ─────────────────────────────────────────────────────────────
const ambient = new THREE.AmbientLight(0xffffff, 0.95);
scene.add(ambient);

// Warm/cool sky-ground bounce gives the flat-shaded faces some color
// variation instead of one flat ambient tone — cheap way to make the scene
// feel more alive without touching shadow-casting geometry.
const hemi = new THREE.HemisphereLight(0xFFF6E0, 0x8A6D52, 0.55);
scene.add(hemi);

const key = new THREE.DirectionalLight(0xFFF4DE, 1.15);
key.position.set(4, 6, 4);
key.castShadow = true;
key.shadow.mapSize.set(1024, 1024);
key.shadow.camera.left = -6;
key.shadow.camera.right = 6;
key.shadow.camera.top = 6;
key.shadow.camera.bottom = -6;
scene.add(key);

// Cool fill from the opposite side to lift shadow faces and add a little
// contrast/pop against the warm key light, rather than flat dark shadows.
const fill = new THREE.DirectionalLight(0xCFE8FF, 0.35);
fill.position.set(-5, 3, -2);
scene.add(fill);

// ── Floor ────────────────────────────────────────────────────────────────
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(40, 40),
    new THREE.MeshStandardMaterial({ color: COLORS.floor, flatShading: true })
);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

// ── Wall ─────────────────────────────────────────────────────────────────
const wall = new THREE.Mesh(
    new THREE.PlaneGeometry(40, 20),
    new THREE.MeshStandardMaterial({ color: COLORS.wall, flatShading: true })
);
wall.position.set(0, 10, -3);
wall.receiveShadow = true;
scene.add(wall);

// ── Baseboard trim ───────────────────────────────────────────────────────
// A plain flat wall dropping straight into a plain flat floor reads as a
// void, not a room. A simple painted baseboard along the join — plus a
// thin shadow line along its top edge for a hint of molded profile — is
// enough to sell "real room corner" without adding real geometry detail.
const TRIM_HEIGHT = 0.16;
const TRIM_DEPTH = 0.055;
const TRIM_WIDTH = 14;
const trim = new THREE.Mesh(
    new THREE.BoxGeometry(TRIM_WIDTH, TRIM_HEIGHT, TRIM_DEPTH),
    new THREE.MeshStandardMaterial({ color: 0xF4ECDA, flatShading: true })
);
trim.position.set(0, TRIM_HEIGHT / 2, wall.position.z + TRIM_DEPTH / 2);
trim.castShadow = true;
trim.receiveShadow = true;
scene.add(trim);

const trimShadowLine = new THREE.Mesh(
    new THREE.BoxGeometry(TRIM_WIDTH, 0.018, TRIM_DEPTH + 0.008),
    new THREE.MeshStandardMaterial({ color: 0xC9B48C, flatShading: true })
);
trimShadowLine.position.set(0, TRIM_HEIGHT - 0.009, wall.position.z + (TRIM_DEPTH + 0.008) / 2);
scene.add(trimShadowLine);

// ── Mouse holes ──────────────────────────────────────────────────────────
// The wall is a flat, infinitely-thin plane, so the mouse toy's floor loop
// (see MOUSE_TOY_PATH below) has to cross behind it to complete the back
// stretch of its lap — rather than fight that, a couple of classic arched
// mouseholes cut into the baseboard sell it as the toy ducking into the
// wall on purpose, right where its path meets the wall on each side.
function createMouseHole(width, height) {
    const half = width / 2;
    const archRadius = half;
    const shape = new THREE.Shape();
    shape.moveTo(-half, 0);
    shape.lineTo(-half, height - archRadius);
    shape.absarc(0, height - archRadius, archRadius, Math.PI, 0, true);
    shape.lineTo(half, 0);
    shape.lineTo(-half, 0);
    return new THREE.Mesh(
        new THREE.ShapeGeometry(shape),
        new THREE.MeshBasicMaterial({ color: 0x000000 })
    );
}

const MOUSE_HOLE_Z = wall.position.z + TRIM_DEPTH + 0.01;
[-1.9, 1.9].forEach((x) => {
    const hole = createMouseHole(0.34, 0.34);
    hole.position.set(x, 0, MOUSE_HOLE_Z);
    scene.add(hole);
});

// ── Desk ─────────────────────────────────────────────────────────────────
const DESK_WIDTH = 3.4;
const DESK_DEPTH = 3.0;
const TOP_THICKNESS = 0.18;
const TOP_Y = 1.2;
const LEG_SIZE = 0.14;
const LEG_INSET = 0.28;

function faceMaterials(topColor, sideColor) {
    const side = new THREE.MeshStandardMaterial({ color: sideColor, flatShading: true });
    const top = new THREE.MeshStandardMaterial({ color: topColor, flatShading: true });
    // BoxGeometry face/group order: [+x, -x, +y, -y, +z, -z]
    return [side, side, top, side, side, side];
}

const desk = new THREE.Group();

const topSlab = new THREE.Mesh(
    new THREE.BoxGeometry(DESK_WIDTH, TOP_THICKNESS, DESK_DEPTH),
    faceMaterials(COLORS.deskTop, COLORS.deskSide)
);
topSlab.position.y = TOP_Y - TOP_THICKNESS / 2;
topSlab.castShadow = true;
topSlab.receiveShadow = true;
desk.add(topSlab);

const legHeight = TOP_Y - TOP_THICKNESS;
const legMaterial = new THREE.MeshStandardMaterial({ color: COLORS.deskSide, flatShading: true });
const legGeometry = new THREE.BoxGeometry(LEG_SIZE, legHeight, LEG_SIZE);

const legX = DESK_WIDTH / 2 - LEG_INSET;
const legZ = DESK_DEPTH / 2 - LEG_INSET;
[[-legX, -legZ], [legX, -legZ], [-legX, legZ], [legX, legZ]].forEach(([x, z]) => {
    const leg = new THREE.Mesh(legGeometry, legMaterial);
    leg.position.set(x, legHeight / 2, z);
    leg.castShadow = true;
    leg.receiveShadow = true;
    desk.add(leg);
});

scene.add(desk);

// ── Model loading (for hand-modeled props, e.g. built in Blockbench) ────
// Exports as .glb (glTF Binary) into /models. Scale doesn't need to match
// the scene exactly — the model is auto-fit to targetSize by its longest
// bounding-box dimension, and repositioned to sit on its own local floor
// (y = 0), so whatever origin/pivot you modeled it at, it lands correctly.
const gltfLoader = new GLTFLoader();

function loadModel(path, { targetSize = 0.6, flatShading = true } = {}) {
    return new Promise((resolve, reject) => {
        gltfLoader.load(
            path,
            (gltf) => {
                const model = gltf.scene;

                const box = new THREE.Box3().setFromObject(model);
                const size = new THREE.Vector3();
                box.getSize(size);
                const maxDim = Math.max(size.x, size.y, size.z) || 1;
                model.scale.setScalar(targetSize / maxDim);

                const scaledBox = new THREE.Box3().setFromObject(model);
                model.position.y -= scaledBox.min.y;

                model.traverse((o) => {
                    if (o.isMesh) {
                        o.castShadow = true;
                        o.receiveShadow = true;
                        if (!flatShading) {
                            // Blockbench's glTF export gives every face its own
                            // unshared vertices with a flat per-face normal
                            // baked in — flipping flatShading off alone still
                            // interpolates those same flat normals and looks
                            // just as faceted. Actually smoothing means
                            // dropping the baked normals, welding vertices
                            // that share a position (real hard edges, like a
                            // box corner, also differ in UV and so stay
                            // unwelded/sharp), then recomputing normals from
                            // that welded topology.
                            o.geometry.deleteAttribute('normal');
                            o.geometry = mergeVertices(o.geometry);
                            o.geometry.computeVertexNormals();
                        }
                        if (o.material) {
                            o.material.flatShading = flatShading;
                            o.material.needsUpdate = true;
                        }
                    }
                });

                resolve(model);
            },
            undefined,
            reject
        );
    });
}

// ── Interactive props on the desk ───────────────────────────────────────
const HOVER_LIFT = 0.16;
const HOVER_LERP = 0.18;
const interactiveProps = [];

// Highlight-on-hover: rather than an outline mesh sitting near the surface
// (which has to be pushed back from the real geometry by some offset to
// avoid z-fighting, and — for anything that rotates — needs that offset
// re-derived every frame or it drifts out of alignment as the object
// turns), just light the object's own surface up, like a CSS button's
// hover state. Every material on the prop gets its emissive color set to
// the prop's accent color once, then emissiveIntensity is animated 0→max
// on hover — no extra geometry, and correct at any rotation for free.
const HOVER_EMISSIVE_INTENSITY = 0.55;

function collectMaterials(group) {
    const materials = new Set();
    group.traverse((o) => {
        if (o.isMesh && o.material) materials.add(o.material);
    });
    return [...materials];
}

function registerProp(group, { pageId, glowColor }) {
    group.userData.baseY = group.position.y;
    group.userData.hoverTarget = 0;
    group.userData.hoverCurrent = 0;
    group.userData.pageId = pageId;

    const glowMaterials = collectMaterials(group);
    glowMaterials.forEach((m) => {
        m.emissive = new THREE.Color(glowColor);
        m.emissiveIntensity = 0;
    });
    group.userData.glowMaterials = glowMaterials;

    group.traverse((o) => { if (o.isMesh) o.userData.propGroup = group; });

    interactiveProps.push(group);
    return group;
}

async function setupTelephone() {
    const telephone = await loadModel('models/telephone.gltf', { targetSize: 0.62, flatShading: false });
    telephone.rotation.y = Math.PI + 0.15;
    telephone.position.set(-1.2, TOP_Y, -0.85);
    desk.add(telephone);
    registerProp(telephone, { pageId: 'contact', glowColor: 0xC2291F });
}
setupTelephone();

async function setupNotebook() {
    const notebook = await loadModel('models/notebook.gltf', { targetSize: 0.82, flatShading: false });
    notebook.position.set(0.15, TOP_Y, 0.55);
    notebook.rotation.y = 0.25;
    desk.add(notebook);
    // Not registered as an interactive prop yet.
}
// Hidden until it has content to open (quizzes page removed) — call
// setupNotebook() again once a PAGES entry exists for it.

async function setupBookStack() {
    const bookStack = await loadModel('models/book-stack.gltf', { targetSize: 0.68, flatShading: false });
    bookStack.position.set(1.0, TOP_Y, -0.8);
    bookStack.rotation.y = -0.4;
    desk.add(bookStack);
    registerProp(bookStack, { pageId: 'reading', glowColor: 0xD9A24B });
}
setupBookStack();

// ── Wind-up mouse toy — a floor easter egg, not a desk prop ────────────
// Sits still on the floor until clicked, then loops a closed path that
// dips under the desk (the real desk-top geometry naturally occludes it
// via depth testing — no extra hide/show logic needed) and back out
// again, wagging its tail and spinning its wind-up key the whole time.
// This camera is steep and close, so the desk slab occludes most of the
// floor directly under it — but there's a full loop around the desk's
// perimeter that stays visible: a strip along the front edge, a narrow
// corridor down each side (between the desk and the frustum edge), and a
// strip along the back wall, all confirmed by raycasting real screen
// points against the live scene (not guessed from geometry alone — the
// occlusion math here is easy to get wrong by hand). The toy runs that
// whole racetrack, only dipping out of sight for an instant where it
// passes directly behind a front leg — "under the table and on the
// ground" reads as brief hide-and-peek rather than a long disappearance.
// Each hole sits at x = ±1.9. The points immediately before/after it on
// the loop share that same x (only z changes) so the spline has no
// lateral tangent right at the hole's mouth — it runs straight through
// the center instead of bowing to one side and clipping the wall/trim
// next to the opening.
const MOUSE_TOY_PATH = [
    [-1.9, 0.85], [0, 0.75], [1.9, 0.85],
    [1.9, -1.5], [1.9, MOUSE_HOLE_Z], [1.9, -3.4],
    [-1.9, -3.4], [-1.9, MOUSE_HOLE_Z], [-1.9, -1.5]
].map(([x, z]) => new THREE.Vector3(x, 0, z));
const mouseToyCurve = new THREE.CatmullRomCurve3(MOUSE_TOY_PATH, true, 'catmullrom', 0.5);
const MOUSE_TOY_LAP_SECONDS = 12;
const MOUSE_TOY_FORWARD = new THREE.Vector3(0, 0, -1);

const mouseToyState = {
    running: false,
    t: 0,
    runCycle: 0,
    hoverTarget: 0,
    hoverCurrent: 0
};
let mouseToy = null;
let mouseToyTail = null;
let mouseToyTailBaseQuat = null;
let mouseToyWinder = null;
let mouseToyWinderBaseQuat = null;
let mouseToyGlowMaterials = [];
let mouseToyBaseY = 0;

function orientMouseToyAt(t, instant) {
    const point = mouseToyCurve.getPointAt(t);
    mouseToy.position.x = point.x;
    mouseToy.position.z = point.z;
    const tangent = mouseToyCurve.getTangentAt(t).setY(0).normalize();
    const targetQuat = new THREE.Quaternion().setFromUnitVectors(MOUSE_TOY_FORWARD, tangent);
    if (instant) mouseToy.quaternion.copy(targetQuat);
    else mouseToy.quaternion.slerp(targetQuat, 0.25);
}

async function setupMouseToy() {
    mouseToy = await loadModel('models/mouse-toy.gltf', { targetSize: 0.5, flatShading: false });

    mouseToyTail = mouseToy.getObjectByName('tail');
    mouseToyTailBaseQuat = mouseToyTail.quaternion.clone();
    mouseToyWinder = mouseToy.getObjectByName('keywinder');
    mouseToyWinderBaseQuat = mouseToyWinder.quaternion.clone();
    mouseToyBaseY = mouseToy.position.y;

    orientMouseToyAt(0, true);
    scene.add(mouseToy);

    mouseToyGlowMaterials = collectMaterials(mouseToy);
    mouseToyGlowMaterials.forEach((m) => {
        m.emissive = new THREE.Color(0xE0A040);
        m.emissiveIntensity = 0;
    });
    mouseToy.traverse((o) => { if (o.isMesh) o.userData.isMouseToy = true; });
}
setupMouseToy();

function updateMouseToy(delta) {
    if (!mouseToy) return;

    mouseToyState.hoverCurrent += (mouseToyState.hoverTarget - mouseToyState.hoverCurrent) * HOVER_LERP;
    const intensity = mouseToyState.hoverCurrent * HOVER_EMISSIVE_INTENSITY;
    mouseToyGlowMaterials.forEach((m) => { m.emissiveIntensity = intensity; });

    if (mouseToyState.running) {
        mouseToyState.t = (mouseToyState.t + delta / MOUSE_TOY_LAP_SECONDS) % 1;
        mouseToyState.runCycle += delta;
        orientMouseToyAt(mouseToyState.t, false);
        mouseToy.position.y = mouseToyBaseY + Math.abs(Math.sin(mouseToyState.runCycle * 10)) * 0.03;

        const wag = Math.sin(mouseToyState.runCycle * 14) * 0.5;
        mouseToyTail.quaternion.copy(mouseToyTailBaseQuat)
            .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), wag));

        const spin = mouseToyState.runCycle * 9;
        mouseToyWinder.quaternion.copy(mouseToyWinderBaseQuat)
            .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), spin));
    } else {
        mouseToy.position.y = mouseToyBaseY;
    }
}

function updatePropAnimations() {
    interactiveProps.forEach((group) => {
        const ud = group.userData;
        ud.hoverCurrent += (ud.hoverTarget - ud.hoverCurrent) * HOVER_LERP;
        group.position.y = ud.baseY + ud.hoverCurrent * HOVER_LIFT;
        const intensity = ud.hoverCurrent * HOVER_EMISSIVE_INTENSITY;
        ud.glowMaterials.forEach((m) => { m.emissiveIntensity = intensity; });
    });
}

// ── Hover + click (raycasting) ──────────────────────────────────────────
const raycaster = new THREE.Raycaster();
const pointerNDC = new THREE.Vector2(-10, -10);
let hoveredProp = null;
let hoveredMouseToy = false;

function updatePointerFromEvent(e) {
    const rect = renderer.domElement.getBoundingClientRect();
    pointerNDC.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointerNDC.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
}

function updateHover() {
    raycaster.setFromCamera(pointerNDC, camera);
    const targets = mouseToy ? [...interactiveProps, mouseToy] : interactiveProps;
    const hits = raycaster.intersectObjects(targets, true);
    const hitObject = hits.length > 0 ? hits[0].object : null;
    const hit = hitObject && !hitObject.userData.isMouseToy ? hitObject.userData.propGroup || null : null;
    const hitMouseToy = !!(hitObject && hitObject.userData.isMouseToy);

    if (hit !== hoveredProp) {
        if (hoveredProp) hoveredProp.userData.hoverTarget = 0;
        hoveredProp = hit;
        if (hoveredProp) hoveredProp.userData.hoverTarget = 1;
    }
    if (hitMouseToy !== hoveredMouseToy) {
        hoveredMouseToy = hitMouseToy;
        mouseToyState.hoverTarget = hoveredMouseToy ? 1 : 0;
    }
    renderer.domElement.style.cursor = (hoveredProp || hoveredMouseToy) ? 'pointer' : 'default';
}

renderer.domElement.addEventListener('pointermove', updatePointerFromEvent);
renderer.domElement.addEventListener('pointerleave', () => {
    pointerNDC.set(-10, -10);
    if (hoveredProp) hoveredProp.userData.hoverTarget = 0;
    hoveredProp = null;
    if (hoveredMouseToy) mouseToyState.hoverTarget = 0;
    hoveredMouseToy = false;
    renderer.domElement.style.cursor = 'default';
});
renderer.domElement.addEventListener('click', () => {
    if (hoveredProp) openContentPage(hoveredProp.userData.pageId);
    else if (hoveredMouseToy) mouseToyState.running = !mouseToyState.running;
});

// ── Content page (regular DOM overlay, not part of the 3D scene) ───────
const CONTACT_ICONS = {
    email: ICONS.FILE_EMAIL,
    linkedin: ICONS.FILE_LINKEDIN,
    github: ICONS.FILE_GITHUB
};

function getContactPageHtml() {
    const contact = desktopData.find((f) => f.id === 'contact');
    const rows = (contact?.files || []).map((f) => {
        const href = f.type === 'email' ? `mailto:${f.emailUser}@${f.emailDomain}` : f.url;
        const target = f.type === 'email' ? '' : ' target="_blank" rel="noopener"';
        const icon = CONTACT_ICONS[f.id] || ICONS.FILE_LINK;
        return `
            <a class="contact-row" href="${href}"${target}>
                <span class="contact-row-icon">${icon}</span>
                <span class="contact-row-text">
                    <span class="contact-row-title">${f.title}</span>
                    <span class="contact-row-sub">${f.abstract}</span>
                </span>
                <span class="contact-row-arrow">${ICONS.EXTERNAL}</span>
            </a>`;
    }).join('');
    return `<div class="contact-rows">${rows}</div>`;
}

const BOOK_SPINE_COLORS = ['#1A1A1A', '#C94E3A', '#D9A24B', '#3E8E91'];

function renderBookRow(item, i) {
    const editionLine = [item.edition, item.isbn ? `ISBN ${item.isbn}` : null].filter(Boolean).join(' • ');
    return `
        <li class="book-row" style="--spine: ${BOOK_SPINE_COLORS[i % BOOK_SPINE_COLORS.length]};">
            <a class="book-row-link" href="${item.wikiUrl || '#'}" target="_blank" rel="noopener">
                <span class="book-spine"></span>
                <span class="book-info">
                    <span class="book-title">${item.title}</span>
                    <span class="book-author">${item.author}</span>
                    ${editionLine ? `<span class="book-edition">${editionLine}</span>` : ''}
                </span>
                <span class="book-row-arrow">${ICONS.EXTERNAL}</span>
            </a>
        </li>`;
}

function getReadingPageHtml() {
    const note = desktopData.find((f) => f.id === 'what-im-reading');
    const items = note?.note?.items || [];
    const completed = note?.note?.completed || [];

    const itemsHtml = items.map(renderBookRow).join('');
    const completedHtml = completed.length
        ? `<ul class="book-list">${completed.map(renderBookRow).join('')}</ul>`
        : `<p class="book-list-empty">Nothing finished yet — still working through the shelf above.</p>`;

    return `
        <p class="content-intro">A running shelf of what's open on my desk right now — not a full library, just what I'm actually reading. Titles link to their Wikipedia page for more on each one's significance.</p>
        <h2 class="reading-section-title">Currently Reading</h2>
        <ul class="book-list">${itemsHtml}</ul>
        <h2 class="reading-section-title">Finished</h2>
        ${completedHtml}`;
}

const PAGES = {
    contact: { title: 'Contact', kicker: 'Get in touch', accent: '#C2291F', html: getContactPageHtml },
    reading: { title: "What I'm Reading", kicker: 'On the desk', accent: '#D9A24B', html: getReadingPageHtml }
};

const contentPageEl = document.getElementById('content-page');
const contentKickerEl = document.getElementById('content-kicker');
const contentTitleEl = document.getElementById('content-title');
const contentBodyEl = document.getElementById('content-body');

function openContentPage(pageId) {
    const page = PAGES[pageId];
    if (!page) return;
    contentKickerEl.textContent = page.kicker || '';
    contentTitleEl.textContent = page.title;
    contentBodyEl.innerHTML = page.html();
    contentPageEl.style.setProperty('--accent', page.accent || '#8A6D3B');
    contentPageEl.classList.add('is-open');
    contentPageEl.setAttribute('aria-hidden', 'false');
    if (page.onOpen) page.onOpen();
}

function closeContentPage() {
    contentPageEl.classList.remove('is-open');
    contentPageEl.setAttribute('aria-hidden', 'true');
}

document.getElementById('content-back-btn').addEventListener('click', closeContentPage);
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && contentPageEl.classList.contains('is-open')) closeContentPage();
});

// ── Resize ───────────────────────────────────────────────────────────────
function handleResize() {
    const width = container.clientWidth;
    const height = container.clientHeight;
    renderer.setSize(width, height);
    applyCameraFrustum();
}
window.addEventListener('resize', handleResize);
handleResize();

// ── Render loop ──────────────────────────────────────────────────────────
const clock = new THREE.Clock();
function animate() {
    requestAnimationFrame(animate);
    const delta = Math.min(clock.getDelta(), 0.1);
    updateHover();
    updatePropAnimations();
    updateMouseToy(delta);
    renderer.render(scene, camera);
}
animate();
