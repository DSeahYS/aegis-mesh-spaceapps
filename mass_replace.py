import os
import re

def mass_replace(directory, old_term, new_term):
    for root, dirs, files in os.walk(directory):
        # Exclude node_modules, .git, venv
        if '.git' in root or 'node_modules' in root or 'venv' in root or '.antigravity' in root:
            continue
            
        for file in files:
            if not file.endswith(('.py', '.tsx', '.ts', '.mjs', '.md', '.json', '.yml')):
                continue
            
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Cases
            # EPG -> EPG
            # EPG -> EPG
            # epg -> epg
            
            new_content = content
            new_content = re.sub(r'EPG', 'EPG', new_content)
            new_content = re.sub(r'EPG', 'EPG', new_content)
            new_content = re.sub(r'epg', 'epg', new_content)
            
            if new_content != content:
                print(f"Updating {filepath}")
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)

mass_replace('.', 'EPG', 'EPG')
