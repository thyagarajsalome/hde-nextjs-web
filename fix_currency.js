const fs = require('fs');
const files = [
  'src/features/construction/USAFlooringCalculator.tsx',
  'src/features/construction/USAPlumbingCalculator.tsx',
  'src/features/construction/USAElectricalCalculator.tsx',
  'src/features/construction/USARentVsBuyCalculator.tsx',
  'src/features/construction/USAPropertyTaxCalculator.tsx',
  'src/features/construction/USASalaryCalculator.tsx'
];

files.forEach(f => {
  if (!fs.existsSync(f)) return;
  let content = fs.readFileSync(f, 'utf8');
  content = content.replace(
    /import\s+{\s*formatCurrency\s*}\s+from\s+['"](.+?)['"];/,
    "import { formatCurrency as formatCurrencyOrig } from '$1';\nconst formatCurrency = (val: number) => formatCurrencyOrig(val, 'US');"
  );
  fs.writeFileSync(f, content);
});
