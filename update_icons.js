const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'app', 'dubai-property', 'areas', '[slug]', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// Interface replacement
content = content.replace('emoji: string;', 'icon: string;');
content = content.replace(/area\.emoji/g, 'area.icon');
content = content.replace(/otherArea\.emoji/g, 'otherArea.icon');

// Emoji to Icon mapping
const map = {
  'dubai-marina': 'fas fa-city',
  'downtown-dubai': 'fas fa-building',
  'business-bay': 'fas fa-briefcase',
  'jvc': 'fas fa-home',
  'dubai-hills': 'fas fa-golf-ball',
  'palm-jumeirah': 'fas fa-umbrella-beach',
  'jlt': 'far fa-building',
  'dubai-creek-harbour': 'fas fa-water',
  'mbr-city': 'fas fa-tree',
  'arabian-ranches': 'fas fa-horse-head',
  'dubai-south': 'fas fa-plane',
  'jbr': 'fas fa-umbrella-beach',
  'dubai-silicon-oasis': 'fas fa-laptop',
  'al-barsha': 'fas fa-shopping-bag',
  'dubai-sports-city': 'fas fa-futbol'
};

for (const [slug, icon] of Object.entries(map)) {
  const regex = new RegExp(`slug:\\s*'${slug}',\\s*name:\\s*'.*?',\\s*emoji:\\s*'.*?'`);
  const match = content.match(regex);
  if (match) {
    const updated = match[0].replace(/emoji:\s*'.*?'/, `icon: '${icon}'`);
    content = content.replace(match[0], updated);
  }
}

// Update the JSX to render the icon instead of text for emojis
content = content.replace(
  /<span className="mr-3">\{area\.icon\}<\/span>/,
  '<span className="mr-3 text-gray-400 dark:text-zinc-500"><i className={area.icon}></i></span>'
);

content = content.replace(
  /<span className="text-2xl">\{otherArea\.icon\}<\/span>/,
  '<span className="text-2xl text-gray-400 dark:text-zinc-500"><i className={otherArea.icon}></i></span>'
);

fs.writeFileSync(filePath, content);
console.log("Done updating areas page");
