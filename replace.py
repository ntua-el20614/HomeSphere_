import os
import sys

# Define directories to scan and always include "main.js"
directories_to_scan = ["rooms", "utils"]
files_to_edit = ["main.js"]

# Find all .js files dynamically and store correct paths
for directory in directories_to_scan:
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith(".js"):
                files_to_edit.append(os.path.join(root, file))

# Define direct string replacements
relative_replacements_main = {
    "import * as THREE from '/local/HomeSphere/three/build/three.module.js'":
        "import * as THREE from '../three/build/three.module.js'",

    "import { OrbitControls } from '/local/HomeSphere/three/examples/jsm/controls/OrbitControls.js'":
        "import { OrbitControls } from './three/examples/jsm/controls/OrbitControls.js'",
    
    "loader.load('/local/HomeSphere/models":
        "loader.load('../models"
}

relative_replacements_other = {
    "import * as THREE from '/local/HomeSphere/three/build/three.module.js'":
        "import * as THREE from '../three/build/three.module.js'",
    
    "loader.load('/local/HomeSphere/models":
        "loader.load('../models"
}

absolute_replacements_main = {v: k for k, v in relative_replacements_main.items()}
absolute_replacements_other = {v: k for k, v in relative_replacements_other.items()}

def update_imports(to_absolute=True):
    """ Updates import paths using direct string replacement """
    for file_path in files_to_edit:
        if os.path.exists(file_path):
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()

            # Choose the correct replacements
            replacements = (absolute_replacements_main if to_absolute else relative_replacements_main
                            if file_path == "main.js"
                            else absolute_replacements_other if to_absolute else relative_replacements_other)

            updated_content = content
            for old, new in replacements.items():
                updated_content = updated_content.replace(old, new)

            # If changes were made, save the file
            if updated_content != content:
                with open(file_path, "w", encoding="utf-8") as f:
                    f.write(updated_content)
                print(f"Updated: {file_path}")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("\nUsage:")
        print("  python3 replace.py homeassistant   # Use absolute paths (/local/HomeSphere/...)")
        print("  python3 replace.py locally        # Use relative paths (../three/...)")
        sys.exit(1)

    mode = sys.argv[1].strip().lower()

    if mode == "homeassistant":
        print("Replacing relative imports with absolute paths (/local/HomeSphere/...)")
        update_imports(to_absolute=True)

    elif mode == "locally":
        print("Reverting absolute paths back to relative imports (../three/...)")
        update_imports(to_absolute=False)

    else:
        print("\nInvalid option. Please use one of the following:")
        print("  python3 replace.py homeassistant   # Use absolute paths (/local/HomeSphere/...)")
        print("  python3 replace.py locally        # Use relative paths (../three/...)")
        sys.exit(1)

    print("Import paths updated successfully.")
