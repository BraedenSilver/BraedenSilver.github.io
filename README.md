# Braeden Silver - Desktop Portfolio

A unique, interactive portfolio website designed to mimic a desktop operating system environment. Built with pure HTML, CSS, and JavaScript, this project offers a playful yet professional way to showcase case studies, writing samples, and research.

## 🌟 Features

*   **Desktop Metaphor**: Draggable icons and a workspace environment.
*   **Window System**: Fully functional windows that can be dragged, resized, minimized, and closed.
*   **Dark Mode**: Built-in theme toggle (Light/Dark) that respects system preferences.
*   **Deep Linking & Sharing**: Share specific folders or files via URL (e.g., `/#type=folder&id=writing`).
*   **Selection Box**: Click and drag on the desktop to select multiple icons, similar to Windows/macOS.
*   **Smart Icons**: Folder icons automatically change appearance (open vs. closed) based on whether they contain files.
*   **Boundary Constraints**: Icons are constrained to the desktop area and cannot be lost off-screen.
*   **PDF Viewer**: Integrated document viewer to display PDFs directly within the "OS" windows.
*   **Smartphone Interface**: On mobile devices (< 768px), the site transforms into a modern smartphone OS with a home screen grid, dock, status bar, and app transitions.
*   **Zero Dependencies**: No Node.js, React, or build steps required. Just static files.

## 📂 Project Structure

*   **`index.html`**: The main entry point containing the HTML structure and window templates.
*   **`style.css`**: All styling rules, including CSS variables for theming and desktop layout.
*   **`script.js`**: The core logic engine. It handles:
    *   State management (windows, active focus, z-index).
    *   Data storage (content of folders).
    *   Drag-and-drop with boundary checks.
    *   Selection box logic.
    *   URL routing for deep linking.
*   **`pdfs/`**: A folder to store your actual PDF documents.

## 🛠️ How to Customize

### 1. Adding Your Content
All content is managed in the `desktopData` array at the top of `script.js`.

To add a file to a folder:
1.  Open `script.js`.
2.  Find the `desktopData` array.
3.  Locate the folder you want to edit (e.g., `id: 'writing'`).
4.  Add a file object to the `files` array:

```javascript
{
    id: 'my-unique-id',
    title: 'My Document Title',
    abstract: 'A short description that appears in the file list.',
    type: 'pdf', // Options: 'pdf', 'link', or 'email'
    date: '2025',
    tags: ['Tag1', 'Tag2'],
    pdfPath: 'pdfs/my-document.pdf' // Path to your file
    // For external links use: url: 'https://example.com'
    // For email use: emailUser: 'contact', emailDomain: 'example.com'
}
```

### 2. Adding PDFs
1.  Place your PDF files into the `pdfs/` directory.
2.  Reference them in `script.js` using the relative path `pdfs/filename.pdf`.

### 3. Changing Styles
Open `style.css` to modify the look and feel.
*   **Colors**: Edit the `:root` variables for Light Mode and `[data-theme="dark"]` for Dark Mode.
*   **Background**: The desktop background uses CSS variables for easy theming.

## 🚀 Deployment

Since this is a static site, deployment is incredibly simple.

### GitHub Pages (Recommended)
1.  Push this repository to GitHub.
2.  Go to your repository **Settings**.
3.  Navigate to **Pages** (on the left sidebar).
4.  Under **Build and deployment**, select **Source** as `Deploy from a branch`.
5.  Select your `main` branch and the `/ (root)` folder.
6.  Click **Save**.

Your site will be live at `https://yourusername.github.io/repo-name/`.

## ⌨️ Keyboard Shortcuts

*   **Enter**: Open the selected desktop icon.
*   **Escape**: Close the currently active window.
*   **Shift/Ctrl + Click**: Add to selection.
