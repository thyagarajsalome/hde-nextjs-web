import os, re

dir_path = "src/features/construction/"
files = [f for f in os.listdir(dir_path) if f.startswith("USA") and f.endswith(".tsx")]

for file in files:
    file_path = os.path.join(dir_path, file)
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    if "saveProject" in content and file != "USAGardenBedCalculator.tsx":
        continue
        
    if file == "USAGardenBedCalculator.tsx":
        # we already fixed this one manually!
        continue

    # Add import correctly
    if 'useProjectActions' not in content:
        content = content.replace('import React', 'import { useProjectActions } from "@/hooks/useProjectActions";\nimport React')

    # Component name
    comp_match = re.search(r"export default function ([A-Za-z0-9_]+)\(", content)
    if not comp_match:
        continue
    comp_name = comp_match.group(1)
    calc_id = comp_name.lower()
    
    states = re.findall(r"const \[([a-zA-Z0-9_]+),\s*set[a-zA-Z0-9_]+\]\s*=\s*useState", content)
    state_str = "{ " + ", ".join(states) + " }"
    
    total_cost_var = "0"
    if "const totalCost =" in content or "let totalCost =" in content:
        total_cost_var = "totalCost"
    elif "const estimatedTotal =" in content:
        total_cost_var = "estimatedTotal"
    elif "const total =" in content:
        total_cost_var = "total"

    # Add hook inside component
    hook_str = f'\n  const {{ saveProject, downloadPDF, isSaving, isDownloading }} = useProjectActions("{calc_id}");\n  const contentRef = React.useRef<HTMLElement>(null);\n'
    content = re.sub(r'(export default function ' + comp_name + r'\([^)]*\)\s*\{)', r'\1' + hook_str, content)
    
    # Add ref to main container safely
    # find `return (\n    <div ` and replace with `return (\n    <div ref={contentRef} `
    content = re.sub(r'(return\s*\(\s*<div )', r'\1ref={contentRef} ', content, count=1)
    
    buttons = f"""
      <div className="mt-8 flex flex-col sm:flex-row gap-4 border-t border-gray-100 dark:border-zinc-800 pt-6">
        <button onClick={{() => saveProject({state_str}, {total_cost_var})}} disabled={{isSaving}} className="flex-1 bg-primary text-white font-bold py-3 px-6 rounded-xl shadow-md hover:bg-primary-hover transition-colors disabled:opacity-50">
          <i className={{`fas ${{isSaving ? 'fa-spinner fa-spin' : 'fa-save'}} mr-2`}}></i> {{isSaving ? 'Saving...' : 'Save Project'}}
        </button>
        <button onClick={{() => downloadPDF(contentRef, 'Report')}} disabled={{isDownloading}} className="flex-1 bg-white text-primary border-2 border-primary font-bold py-3 px-6 rounded-xl hover:bg-primary/5 transition-colors disabled:opacity-50">
          <i className={{`fas ${{isDownloading ? 'fa-spinner fa-spin' : 'fa-file-pdf'}} mr-2`}}></i> {{isDownloading ? 'Exporting...' : 'Export PDF'}}
        </button>
      </div>
    """
    
    content = re.sub(r'( {4}</div>\n\s*</Card>\n\s*</div>\n\s*\);)', buttons + r'\1', content)
    if buttons not in content:
        content = re.sub(r'( {4}</div>\n\s*</div>\n\s*\);)', buttons + r'\1', content)

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
