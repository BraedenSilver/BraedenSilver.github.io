import os
from PIL import Image
from pathlib import Path

# Set paths
gallery_md_file = Path(r'C:\Users\BraedenSilver\Documents\GitHub\BraedenSilver.github.io\content\gallery.md')
image_folder = Path(r'C:\Users\BraedenSilver\Documents\GitHub\BraedenSilver.github.io\static\images\gallery')
target_size = 1 * 1024 * 1024  # 1MB in bytes
valid_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp']  # List of valid image extensions

# Function to compress image
def compress_image(image_path):
    img = Image.open(image_path)
    img_format = img.format

    quality = 90
    img_save_path = image_path.with_suffix('.jpg')

    while img_save_path.stat().st_size > target_size and quality > 10:
        img.save(img_save_path, format=img_format, optimize=True, quality=quality)
        quality -= 5

    print(f"Compressed: {image_path.name}, Final size: {img_save_path.stat().st_size / 1024} KB")

# Update gallery.md
def update_gallery_md():
    # Get a list of images
    images = [f" - src: /images/gallery/{img.name}" for img in image_folder.iterdir() if img.suffix.lower() in valid_extensions]
    
    # Create new gallery.md content
    md_content = f"""
---
title: "Image Gallery"
draft: false
description: "My simple gallery, this is mostly for show, please go to my Instagram @braeden.silver to view the best images."
layout: "gallery"
galleryImages:
{"\n".join(images)}
viewer: true
viewerOptions:
    title: false
    toolbar: {{}}
---
"""
    # Write to gallery.md file
    with gallery_md_file.open('w', encoding='utf-8') as f:
        f.write(md_content)
    
    print(f"Updated gallery.md with {len(images)} images.")

# Compress images and update gallery.md
def main():
    for img_path in image_folder.iterdir():
        if img_path.suffix.lower() in valid_extensions:
            compress_image(img_path)
    
    update_gallery_md()

if __name__ == "__main__":
    main()
