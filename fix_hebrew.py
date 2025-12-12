# -*- coding: utf-8 -*-
import os
import glob

# Common gibberish patterns and their correct Hebrew replacements
replacements = [
    # Login/Register form
    ("׳׳™׳׳™׳™׳:", "אימייל:"),
    ("׳\"׳›׳ ׳¡ ׳׳× ׳\"׳׳™׳׳™׳™׳ ׳©׳׳", "הכנס את האימייל שלך"),
    ("׳¡׳™׳¡׳׳\":", "סיסמה:"),
    ("׳\"׳›׳ ׳¡ ׳׳× ׳\"׳¡׳™׳¡׳׳\" ׳©׳׳", "הכנס את הסיסמה שלך"),
    ("׳\"׳›׳ ׳¡ ׳¡׳™׳¡׳׳\" ׳—׳\"׳©׳\"", "הכנס סיסמה חדשה"),
    ("׳©׳›׳—׳× ׳¡׳™׳¡׳׳\"?", "שכחת סיסמה?"),
    ("׳׳™׳©׳•׳¨ ׳¡׳™׳¡׳׳\":", "אישור סיסמה:"),
    ("׳\"׳›׳ ׳¡ ׳©׳•׳' ׳׳× ׳\"׳¡׳™׳¡׳׳\"", "הכנס שוב את הסיסמה"),
    
    # Chat input
    ("׳›׳×׳•׳' ׳\"׳•׳\"׳¢׳\"...", "כתוב הודעה..."),
    
    # Post descriptions
    ("׳׳\" ׳׳×׳\" ׳׳¦׳™׳¢ ׳׳• ׳׳—׳₪׳©?", "מה אתה מציע או מחפש?"),
    ("׳×׳ ׳׳'׳™׳', ׳ ׳×׳ ׳™׳\"", "למשל, תל אביב"),
]

def fix_file(filepath):
    """Fix Hebrew encoding in a single file."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        changes = 0
        
        for old, new in replacements:
            if old in content:
                count = content.count(old)
                content = content.replace(old, new)
                changes += count
                print(f"  ✓ Replaced '{old[:20]}...' → '{new[:20]}...' ({count} times)")
        
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"  ✅ Saved {filepath} ({changes} replacements)\n")
            return True
        else:
            print(f"  ⏭️  No changes needed for {filepath}\n")
            return False
            
    except Exception as e:
        print(f"  ❌ Error processing {filepath}: {e}\n")
        return False

def main():
    print("🔧 Starting Hebrew encoding fix...\n")
    print("=" * 60 + "\n")
    
    # Process all HTML files in public and page-creator directories
    html_files = []
    html_files.extend(glob.glob("public/**/*.html", recursive=True))
    html_files.extend(glob.glob("page-creator/**/*.html", recursive=True))
    
    total_fixed = 0
    for filepath in html_files:
        print(f"📄 Processing: {filepath}")
        if fix_file(filepath):
            total_fixed += 1
    
    print("=" * 60)
    print(f"\n✅ Complete! Fixed {total_fixed} out of {len(html_files)} file(s).\n")

if __name__ == "__main__":
    main()













