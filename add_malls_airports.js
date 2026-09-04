const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'app', 'dubai-property', 'areas', '[slug]', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Update interface
content = content.replace(
  '  nearbyLandmarks: string[];',
  '  nearbyLandmarks: string[];\n  malls: string[];\n  airports: string[];'
);

// 2. Add data for each area
const dataAdditions = {
  'dubai-marina': {
    malls: "['Dubai Marina Mall', 'Ibn Battuta Mall (10 mins)', 'Mall of the Emirates (15 mins)']",
    airports: "['Dubai Intl Airport (DXB) - 30 mins', 'Al Maktoum Airport (DWC) - 30 mins']"
  },
  'downtown-dubai': {
    malls: "['The Dubai Mall (0 mins)', 'City Walk (10 mins)']",
    airports: "['Dubai Intl Airport (DXB) - 15 mins', 'Al Maktoum Airport (DWC) - 40 mins']"
  },
  'business-bay': {
    malls: "['The Dubai Mall (5 mins)', 'Oasis Mall (10 mins)']",
    airports: "['Dubai Intl Airport (DXB) - 15 mins', 'Al Maktoum Airport (DWC) - 40 mins']"
  },
  'jvc': {
    malls: "['Circle Mall (0 mins)', 'Mall of the Emirates (15 mins)']",
    airports: "['Dubai Intl Airport (DXB) - 25 mins', 'Al Maktoum Airport (DWC) - 30 mins']"
  },
  'dubai-hills': {
    malls: "['Dubai Hills Mall (0 mins)', 'Mall of the Emirates (10 mins)']",
    airports: "['Dubai Intl Airport (DXB) - 20 mins', 'Al Maktoum Airport (DWC) - 35 mins']"
  },
  'palm-jumeirah': {
    malls: "['Nakheel Mall (0 mins)', 'The Pointe', 'Dubai Marina Mall (10 mins)']",
    airports: "['Dubai Intl Airport (DXB) - 35 mins', 'Al Maktoum Airport (DWC) - 40 mins']"
  },
  'jlt': {
    malls: "['Dubai Marina Mall (5 mins)', 'Ibn Battuta Mall (10 mins)']",
    airports: "['Dubai Intl Airport (DXB) - 30 mins', 'Al Maktoum Airport (DWC) - 30 mins']"
  },
  'dubai-creek-harbour': {
    malls: "['Dubai Square (Upcoming)', 'Dubai Festival City Mall (10 mins)', 'The Dubai Mall (15 mins)']",
    airports: "['Dubai Intl Airport (DXB) - 10 mins', 'Al Maktoum Airport (DWC) - 45 mins']"
  },
  'mbr-city': {
    malls: "['Meydan One Mall (Upcoming)', 'The Dubai Mall (15 mins)']",
    airports: "['Dubai Intl Airport (DXB) - 20 mins', 'Al Maktoum Airport (DWC) - 40 mins']"
  },
  'arabian-ranches': {
    malls: "['Arabian Ranches Retail Centre', 'Dubai Hills Mall (15 mins)', 'Mall of the Emirates (20 mins)']",
    airports: "['Dubai Intl Airport (DXB) - 30 mins', 'Al Maktoum Airport (DWC) - 30 mins']"
  },
  'dubai-south': {
    malls: "['Expo City Mall (Upcoming)', 'Ibn Battuta Mall (25 mins)']",
    airports: "['Al Maktoum Airport (DWC) - 5 mins', 'Dubai Intl Airport (DXB) - 45 mins']"
  },
  'jbr': {
    malls: "['The Beach JBR', 'Dubai Marina Mall (5 mins)', 'Ibn Battuta Mall (15 mins)']",
    airports: "['Dubai Intl Airport (DXB) - 35 mins', 'Al Maktoum Airport (DWC) - 35 mins']"
  },
  'dubai-silicon-oasis': {
    malls: "['Silicon Central Mall (0 mins)', 'Dubai Outlet Mall (15 mins)']",
    airports: "['Dubai Intl Airport (DXB) - 20 mins', 'Al Maktoum Airport (DWC) - 35 mins']"
  },
  'al-barsha': {
    malls: "['Mall of the Emirates (0 mins)', 'Al Barsha Mall']",
    airports: "['Dubai Intl Airport (DXB) - 25 mins', 'Al Maktoum Airport (DWC) - 35 mins']"
  },
  'dubai-sports-city': {
    malls: "['City Centre Me\'aisem (10 mins)', 'Dubai Hills Mall (15 mins)']",
    airports: "['Dubai Intl Airport (DXB) - 30 mins', 'Al Maktoum Airport (DWC) - 30 mins']"
  }
};

for (const [slug, additions] of Object.entries(dataAdditions)) {
  const searchStr = `slug: '${slug}',`;
  // find index of nearbyLandmarks after this slug
  const slugIndex = content.indexOf(searchStr);
  if (slugIndex !== -1) {
    const landmarkStr = 'nearbyLandmarks: [';
    const landmarkIndex = content.indexOf(landmarkStr, slugIndex);
    const endOfLandmarkLine = content.indexOf('],', landmarkIndex) + 2;
    
    // insert right after nearbyLandmarks
    const insertion = `\n    malls: ${additions.malls},\n    airports: ${additions.airports},`;
    
    content = content.slice(0, endOfLandmarkLine) + insertion + content.slice(endOfLandmarkLine);
  }
}

// 3. Update the JSX
const jsxReplacement = `
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2 mt-4">Shopping & Malls</h3>
              <ul className="space-y-1">
                {area.malls.map((item) => (
                  <li key={item} className="flex items-center text-sm text-gray-600 dark:text-zinc-400">
                    <span className="w-1.5 h-1.5 bg-primary/60 rounded-full mr-2"></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2 mt-4">Airport Distance</h3>
              <ul className="space-y-1">
                {area.airports.map((item) => (
                  <li key={item} className="flex items-center text-sm text-gray-600 dark:text-zinc-400">
                    <span className="w-1.5 h-1.5 bg-primary/60 rounded-full mr-2"></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </section>`;

// Insert the new JSX right before the Lifestyle & Amenities section
content = content.replace(
  '          <section className="space-y-4">\n            <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-100">Lifestyle & Amenities</h2>',
  jsxReplacement + '\n\n          <section className="space-y-4">\n            <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-100">Lifestyle & Amenities</h2>'
);

fs.writeFileSync(filePath, content);
console.log("Done");
