import os
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

# Set paths
gallery_md_file = Path(r'C:\Users\BraedenSilver\Documents\GitHub\BraedenSilver.github.io\content\gallery.md')
image_folder = Path(r'C:\Users\BraedenSilver\Documents\GitHub\BraedenSilver.github.io\static\images\gallery')
target_size = 1 * 1024 * 1024  # 1MB in bytes
valid_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp']  # List of valid image extensions

# Watermark settings
watermark_text = "Braeden Silver"
font_path = "arial.ttf"  # Replace with a valid font path if needed
font_size = 60
opacity = 200  # Increased opacity for visibility (0-255)

# Function to add watermark to image
def add_watermark(image, watermark_text):
    draw = ImageDraw.Draw(image)
    font = ImageFont.truetype(font_path, font_size)

    # Calculate the text size using textbbox
    text_bbox = draw.textbbox((0, 0), watermark_text, font=font)
    text_width = text_bbox[2] - text_bbox[0]
    text_height = text_bbox[3] - text_bbox[1]

    # Set position: bottom-right corner
    position = (image.width - text_width - 10, image.height - text_height - 10)

    # Apply watermark
    draw.text(position, watermark_text, font=font, fill=(255, 255, 255, opacity))

    return image

# Function to compress image and add watermark
def compress_image(image_path):
    img = Image.open(image_path)
    img_format = img.format

    # Add watermark to the image
    img = add_watermark(img, watermark_text)

    quality = 85  # Start with a lower quality for better compression
    img_save_path = image_path.with_suffix('.jpg')

    img.save(img_save_path, format=img_format, optimize=True, quality=quality)

    # Check if size is still greater than 1MB and further compress
    while img_save_path.stat().st_size > target_size and quality > 10:
        quality -= 5
        img.save(img_save_path, format=img_format, optimize=True, quality=quality)

    print(f"Compressed: {image_path.name}, Final size: {img_save_path.stat().st_size / 1024:.2f} KB")

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

# Compress images, add watermark, and update gallery.md
def main():
    for img_path in image_folder.iterdir():
        if img_path.suffix.lower() in valid_extensions:
            compress_image(img_path)
    
    update_gallery_md()

if __name__ == "__main__":
    main()
