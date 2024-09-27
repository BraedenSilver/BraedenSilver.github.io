import os
import shutil
from filecmp import dircmp

# Define the paths for public and docs directories
public_dir = 'public'
docs_dir = 'docs'

# Function to sync files from source to destination
def sync_folders(src, dest):
    # Compare the two directories
    comparison = dircmp(src, dest)

    # Copy files from src to dest if they are new or different
    for file_name in comparison.left_only + comparison.diff_files:
        src_file = os.path.join(src, file_name)
        dest_file = os.path.join(dest, file_name)

        if os.path.isdir(src_file):
            # Recursively copy directories
            shutil.copytree(src_file, dest_file, dirs_exist_ok=True)
        else:
            # Copy or overwrite the file
            shutil.copy2(src_file, dest_file)

    # Remove files from dest if they don't exist in src anymore
    for file_name in comparison.right_only:
        dest_file = os.path.join(dest, file_name)
        if os.path.isdir(dest_file):
            shutil.rmtree(dest_file)  # Remove the entire directory
        else:
            os.remove(dest_file)  # Remove the file

    # Recursively apply this sync process to subdirectories
    for common_dir in comparison.common_dirs:
        sync_folders(os.path.join(src, common_dir), os.path.join(dest, common_dir))

# Make sure the docs directory exists
if not os.path.exists(docs_dir):
    os.makedirs(docs_dir)

# Sync the public folder with the docs folder
sync_folders(public_dir, docs_dir)

print("Sync complete! 'docs' is now a 1:1 mirror of 'public'.")
