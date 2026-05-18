import os

file_path = r"c:\Users\Windows\Desktop\AIM Strom\FLT\Lions\lions\src\pages\blog\BlogPages.jsx"
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

open_divs = 0
close_divs = 0
for i, line in enumerate(lines):
    open_divs += line.count('<div')
    close_divs += line.count('</div')
    if '{' in line and '(' in line and '&&' in line:
        pass # placeholder for conditional
    
print(f"Open divs: {open_divs}")
print(f"Close divs: {close_divs}")
