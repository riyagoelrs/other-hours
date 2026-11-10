// NYC launch edition. Curated references only; no live pricing, inventory or event status.
// Source URLs checked 2026-11-10.
const places = {
  "reuse": {
    "name": "Brooklyn Creative Reuse",
    "kind": "CREATIVE REUSE / SUPPLIES",
    "area": "Sunset Park, Brooklyn",
    "address": "254 36th St, Space C244, Brooklyn, NY 11232",
    "summary": "A treasure hunt for donated craft supplies and materials. Inventory changes, which is half the fun.",
    "url": "https://brooklyncreativereuse.org/visit-us",
    "color": "pink",
    "tags": [
      "Secondhand first",
      "Materials"
    ]
  },
  "mood": {
    "name": "Mood Fabrics",
    "kind": "FABRIC / NOTIONS",
    "area": "Garment District, Manhattan",
    "address": "225 W 37th St, 3rd Floor, New York, NY 10018",
    "summary": "Fabric, trims and sewing notions in the heart of NYC’s Garment District.",
    "url": "https://www.moodfabrics.com/pages/new-york-store",
    "color": "lime",
    "tags": [
      "Fabric",
      "Sewing"
    ]
  },
  "books": {
    "name": "Center for Book Arts",
    "kind": "BOOKBINDING / CLASSES",
    "area": "Midtown, Manhattan",
    "address": "28 W 27th St, 3rd Floor, New York, NY 10001",
    "summary": "Workshops and education around book arts, letterpress and bookbinding. Check current course offerings.",
    "url": "https://centerforbookarts.org/",
    "color": "lilac",
    "tags": [
      "Workshops",
      "Book arts"
    ]
  },
  "clay": {
    "name": "BKLYN CLAY",
    "kind": "POTTERY / CLASSES",
    "area": "Brooklyn + Tribeca",
    "address": "535 Carlton Ave, Brooklyn / 288 West St, Manhattan",
    "summary": "Ceramics studios offering one-time classes and longer courses. Check locations and registration.",
    "url": "https://bklynclay.com/",
    "color": "orange",
    "tags": [
      "Classes",
      "Ceramics"
    ]
  },
  "craft": {
    "name": "Brooklyn Craft Company",
    "kind": "CRAFT SUPPLIES / WORKSHOPS",
    "area": "Greenpoint, Brooklyn",
    "address": "165 Greenpoint Ave, Brooklyn, NY 11222",
    "summary": "Yarn, embroidery and sewing supplies, plus beginner workshops and open sewing.",
    "url": "https://www.brooklyncraftcompany.com/",
    "color": "pink",
    "tags": [
      "Supplies",
      "Workshops"
    ]
  },
  "textile": {
    "name": "Textile Arts Center",
    "kind": "FIBER ARTS / CLASSES",
    "area": "Brooklyn, NYC",
    "address": "Brooklyn, NY (check website for campus details)",
    "summary": "Weaving, textile printing, stitching, natural dye and other textile classes.",
    "url": "https://textileartscenter.com/adult-classes/",
    "color": "lilac",
    "tags": [
      "Workshops",
      "Textiles"
    ]
  },
  "metal": {
    "name": "Brooklyn Metal Works",
    "kind": "JEWELRY / CLASSES",
    "area": "Brooklyn, NYC",
    "address": "640 Dean St, Brooklyn, NY 11238",
    "summary": "Metalsmithing and jewelry workshops; studio tools and beginner courses.",
    "url": "https://www.bkmetalworks.com/classes/",
    "color": "orange",
    "tags": [
      "Classes",
      "Jewelry"
    ]
  },
  "darkroom": {
    "name": "Gowanus Darkroom",
    "kind": "FILM / PHOTOGRAPHY",
    "area": "Gowanus, Brooklyn",
    "address": "119 8th St, Suite 212, Brooklyn, NY 11215",
    "summary": "Photography labs, printing classes and peer critiques.",
    "url": "https://www.gowanusdarkroom.com/",
    "color": "lime",
    "tags": [
      "Workshops",
      "Photography"
    ]
  },
  "brainery": {
    "name": "Brooklyn Brainery",
    "kind": "EVERYDAY CLASSES",
    "area": "Prospect Heights + Park Slope",
    "address": "190 Underhill Ave, Brooklyn, NY 11238 (one location)",
    "summary": "Affordable community-taught classes including painting, printmaking and craft.",
    "url": "https://brooklynbrainery.com/courses/",
    "color": "pink",
    "tags": [
      "Classes",
      "Neighborhood"
    ]
  },
  "soho": {
    "name": "SoHo Art Materials",
    "kind": "ART SUPPLIES",
    "area": "SoHo, Manhattan",
    "address": "3 Wooster St, New York, NY 10013",
    "summary": "Drawing paper, watercolor paint, print materials and painting supplies.",
    "url": "https://www.sohoartmaterials.com/",
    "color": "lime",
    "tags": [
      "Materials",
      "Paper"
    ]
  },
  "urbanglass": {
    "name": "UrbanGlass",
    "kind": "GLASS / STUDIO CLASSES",
    "area": "Fort Greene, Brooklyn",
    "address": "Brooklyn, NY (verify studio address on website)",
    "summary": "Glassmaking, beadwork and studio classes for a range of levels.",
    "url": "https://urbanglass.org/classes",
    "color": "orange",
    "tags": [
      "Workshops",
      "Glass"
    ]
  },
  "bpl": {
    "name": "Brooklyn Public Library",
    "kind": "FREE COMMUNITY PROGRAMS",
    "area": "Across Brooklyn",
    "address": "Multiple library branches, Brooklyn, NY",
    "summary": "Free and low-cost craft circles, knit/crochet meetups and maker events. Check the calendar.",
    "url": "https://discover.bklynlibrary.org/?event=true&search=Craft",
    "color": "lilac",
    "tags": [
      "Community",
      "Often free"
    ]
  }
};
const communities = {
  "purls": {
    "name": "NYC Pints 'n' Purls",
    "kind": "COMMUNITY GROUP",
    "area": "Manhattan + rotating meetups",
    "summary": "Social knitting, crochet, embroidery and other fiber arts. All skill levels welcome.",
    "url": "https://www.meetup.com/nyc-pints-n-purls/",
    "tags": [
      "knit",
      "crochet",
      "embroider",
      "mend",
      "sew",
      "weave"
    ]
  },
  "embroidery": {
    "name": "NYC Contemporary Hand Embroidery & Sewing Meetup",
    "kind": "COMMUNITY GROUP",
    "area": "NYC · meetup locations vary",
    "summary": "Bring your own project and stitch alongside local needlework enthusiasts.",
    "url": "https://www.meetup.com/embroidery-nyc/",
    "tags": [
      "embroider",
      "needlepoint",
      "sew",
      "patch",
      "sashiko",
      "cross stitch"
    ]
  },
  "library": {
    "name": "Brooklyn Public Library craft circles",
    "kind": "FREE / PUBLIC EVENTS",
    "area": "Multiple Brooklyn branches",
    "summary": "Library-run craft sessions, knitting and crochet groups. Check the event calendar for current dates.",
    "url": "https://discover.bklynlibrary.org/?event=true&search=Craft",
    "tags": [
      "crochet",
      "knit",
      "craft",
      "paper",
      "collage",
      "embroidery",
      "sew"
    ]
  },
  "cba": {
    "name": "Center for Book Arts workshops",
    "kind": "STUDIO COMMUNITY / CLASSES",
    "area": "Manhattan",
    "summary": "Bookbinding, printmaking, risograph and letterpress learning with practicing artists.",
    "url": "https://centerforbookarts.org/",
    "tags": [
      "bookbinding",
      "zine",
      "print",
      "book",
      "paper",
      "journal"
    ]
  },
  "tac": {
    "name": "Textile Arts Center classes",
    "kind": "STUDIO COMMUNITY / CLASSES",
    "area": "Brooklyn",
    "summary": "Find fellow textile makers through hands-on workshops and fiber arts classes.",
    "url": "https://textileartscenter.com/adult-classes/",
    "tags": [
      "weave",
      "crochet",
      "print",
      "sew",
      "dye",
      "leather",
      "mend",
      "textile"
    ]
  },
  "brainery": {
    "name": "Brooklyn Brainery workshops",
    "kind": "LOCAL CLASSES",
    "area": "Brooklyn",
    "summary": "Small classes taught by people who love what they make, from watercolor to block printing.",
    "url": "https://brooklynbrainery.com/courses/",
    "tags": [
      "paint",
      "flower",
      "collage",
      "print",
      "watercolor",
      "stamp",
      "soap",
      "marble"
    ]
  },
  "metal": {
    "name": "Brooklyn Metal Works classes",
    "kind": "STUDIO COMMUNITY / CLASSES",
    "area": "Brooklyn",
    "summary": "Metalsmithing and jewelry classes; ideal for work requiring specialized tools.",
    "url": "https://www.bkmetalworks.com/classes/",
    "tags": [
      "jewelry",
      "silver",
      "ring",
      "necklace"
    ]
  },
  "darkroom": {
    "name": "Gowanus Darkroom critiques",
    "kind": "PHOTO COMMUNITY",
    "area": "Gowanus, Brooklyn",
    "summary": "Group critiques, darkroom classes, and opportunities to meet photographers.",
    "url": "https://www.gowanusdarkroom.com/",
    "tags": [
      "film",
      "photo",
      "cyanotype"
    ]
  },
  "clay": {
    "name": "BKLYN CLAY studio classes",
    "kind": "STUDIO COMMUNITY / CLASSES",
    "area": "Brooklyn + Manhattan",
    "summary": "Beginner wheel throwing, handbuilding and group clay courses.",
    "url": "https://bklynclay.com/classes",
    "tags": [
      "pottery",
      "clay",
      "ceramic"
    ]
  },
  "urban": {
    "name": "UrbanGlass classes",
    "kind": "STUDIO COMMUNITY / CLASSES",
    "area": "Fort Greene, Brooklyn",
    "summary": "Take a class with glass artists; equipment-based activities are best learned in-studio.",
    "url": "https://urbanglass.org/classes",
    "tags": [
      "glass",
      "bead"
    ]
  }
};
const projects = [
  {
    "slug": "leather-journal",
    "title": "Make your own leather journal",
    "category": "paper",
    "label": "PAPER & BINDING",
    "skill": "CURIOUS BEGINNER",
    "time": "1–3 hours",
    "budgetMin": 24,
    "budgetMax": 60,
    "visual": "journal",
    "accent": "cinnamon",
    "count": "06 MATERIALS",
    "tags": [
      "leather",
      "journal",
      "bookbinding",
      "book",
      "notebook",
      "diy",
      "handmade"
    ],
    "intro": "A little book for big ideas. Start with a simple pamphlet stitch and add a soft leather or leather-look cover.",
    "materials": [
      [
        "Paper for signatures",
        "Folded printer or text paper works"
      ],
      [
        "Leather remnant or sturdy cover stock",
        "Secondhand scraps work beautifully"
      ],
      [
        "Waxed linen thread",
        "Strong cotton thread can be substituted"
      ],
      [
        "Bookbinding needle",
        "A blunt tapestry needle also works"
      ],
      [
        "Awl or piercing tool",
        "Borrow a tool if you can"
      ],
      [
        "Ruler + cutting mat",
        "Use what you already own"
      ]
    ],
    "steps": [
      "Fold sheets into signatures and mark sewing holes.",
      "Prepare your cover, leaving extra room at the spine.",
      "Pierce holes carefully, then bind with a basic pamphlet stitch.",
      "Trim, fold and personalize your new journal."
    ],
    "placeIds": [
      "reuse",
      "books"
    ],
    "tip": "For a first attempt, make a paper-covered version before buying leatherworking tools.",
    "communityIds": [
      "cba",
      "tac"
    ]
  },
  {
    "slug": "visible-mending",
    "title": "Give your old jeans another life",
    "category": "textile",
    "label": "NEEDLE & THREAD",
    "skill": "FIRST-TIMER FRIENDLY",
    "time": "1–2 hours",
    "budgetMin": 8,
    "budgetMax": 25,
    "visual": "denim",
    "accent": "blue",
    "count": "05 MATERIALS",
    "tags": [
      "visible mending",
      "denim",
      "sewing",
      "repair",
      "embroidery",
      "jeans",
      "patch"
    ],
    "intro": "Make the fix the point. Visible mending turns a worn-out pair of jeans into a small work of art.",
    "materials": [
      [
        "Embroidery floss",
        "Two contrasting colors are plenty"
      ],
      [
        "Embroidery / darning needle",
        "Choose a size suited to denim"
      ],
      [
        "Fabric scrap for a patch",
        "Use something already in your closet"
      ],
      [
        "Small scissors",
        "Regular sharp scissors are fine"
      ],
      [
        "Pins or temporary fabric marker",
        "Optional if you can work slowly"
      ]
    ],
    "steps": [
      "Find a worn area and cleanly trim stray threads.",
      "Place a fabric patch behind the opening.",
      "Pin it in position and sew short, visible stitches.",
      "Secure your thread on the inside and wear it out."
    ],
    "placeIds": [
      "reuse",
      "mood"
    ],
    "tip": "A contrasting patch is easier than an invisible repair, and looks more intentional.",
    "communityIds": [
      "embroidery",
      "library"
    ]
  },
  {
    "slug": "sewn-tote",
    "title": "Sew the tote you keep imagining",
    "category": "textile",
    "label": "NEEDLE & THREAD",
    "skill": "BEGINNER",
    "time": "2–4 hours",
    "budgetMin": 15,
    "budgetMax": 40,
    "visual": "tote",
    "accent": "peach",
    "count": "05 MATERIALS",
    "tags": [
      "tote",
      "sewing",
      "bag",
      "fabric",
      "upcycle",
      "machine",
      "needle"
    ],
    "intro": "A straightforward tote made from sturdy fabric, with space for your books and all your other unfinished projects.",
    "materials": [
      [
        "Sturdy cotton or canvas",
        "A thrifted tablecloth can work"
      ],
      [
        "Matching thread",
        "Use standard all-purpose thread"
      ],
      [
        "Fabric scissors",
        "Or a rotary cutter and mat"
      ],
      [
        "Measuring tape + pins",
        "For a tidy shape"
      ],
      [
        "Sewing machine or hand needle",
        "Borrow a machine to speed things up"
      ]
    ],
    "steps": [
      "Cut two rectangles for the body and two straps.",
      "Fold and stitch the straps securely.",
      "Sew the body panels, then finish the upper hem.",
      "Attach straps with reinforced stitches and flip right-side out."
    ],
    "placeIds": [
      "mood",
      "reuse",
      "craft"
    ],
    "tip": "Ask a friend if you can borrow a machine before buying one for a single project.",
    "communityIds": [
      "tac",
      "embroidery"
    ]
  },
  {
    "slug": "ceramic-trinket-dish",
    "title": "Make a tiny ceramic catch-all",
    "category": "objects",
    "label": "THINGS & OBJECTS",
    "skill": "BEGINNER",
    "time": "1 workshop",
    "budgetMin": 25,
    "budgetMax": 75,
    "visual": "clay",
    "accent": "butter",
    "count": "03 MATERIALS",
    "tags": [
      "ceramics",
      "pottery",
      "clay",
      "dish",
      "trinket",
      "bowl",
      "handbuilding"
    ],
    "intro": "For your keys, your rings, or the random tiny objects that somehow rule your life.",
    "materials": [
      [
        "Clay",
        "Usually supplied by a ceramics studio"
      ],
      [
        "Water + sponge",
        "Often included in a workshop"
      ],
      [
        "Basic shaping tools",
        "Usually available in class"
      ]
    ],
    "steps": [
      "Book a beginner handbuilding session.",
      "Form and smooth a small shallow bowl.",
      "Decorate or glaze using your studio’s guidance.",
      "Let the studio fire it before taking it home."
    ],
    "placeIds": [
      "clay",
      "brainery"
    ],
    "tip": "Choose a workshop with firing included; air-dry clay won’t make a food-safe dish.",
    "communityIds": [
      "clay"
    ]
  },
  {
    "slug": "embroidered-patch",
    "title": "Embroider something worth keeping",
    "category": "textile",
    "label": "NEEDLE & THREAD",
    "skill": "BEGINNER",
    "time": "1–2 hours",
    "budgetMin": 12,
    "budgetMax": 28,
    "visual": "patch",
    "accent": "lavender",
    "count": "05 MATERIALS",
    "tags": [
      "embroidery",
      "patch",
      "needlepoint",
      "stitch",
      "flower",
      "hand sewing"
    ],
    "intro": "Make a one-of-one patch for a shirt, bag, or just to frame and show off.",
    "materials": [
      [
        "Embroidery floss",
        "Start with three colors"
      ],
      [
        "Embroidery needle",
        "A small mixed pack is useful"
      ],
      [
        "Cotton fabric scrap",
        "Thrifted fabric is fine"
      ],
      [
        "Embroidery hoop",
        "Borrow or buy secondhand"
      ],
      [
        "Fabric marker or pencil",
        "Sketch something simple"
      ]
    ],
    "steps": [
      "Draw a small motif on your fabric.",
      "Stretch fabric in your embroidery hoop.",
      "Use running stitch, backstitch, and satin stitch.",
      "Finish the back and sew the patch onto something."
    ],
    "placeIds": [
      "reuse",
      "craft",
      "textile"
    ],
    "tip": "Start with a tiny design rather than an ambitious full-shirt illustration.",
    "communityIds": [
      "embroidery",
      "purls"
    ]
  },
  {
    "slug": "beaded-charm",
    "title": "Bead a charm for everything",
    "category": "objects",
    "label": "THINGS & OBJECTS",
    "skill": "FIRST-TIMER FRIENDLY",
    "time": "30–60 min",
    "budgetMin": 8,
    "budgetMax": 24,
    "visual": "beads",
    "accent": "mint",
    "count": "04 MATERIALS",
    "tags": [
      "beading",
      "beads",
      "jewelry",
      "bracelet",
      "charm",
      "phone charm",
      "necklace"
    ],
    "intro": "For your phone, bag, keys, or whoever could use an extremely specific little gift.",
    "materials": [
      [
        "Assorted beads",
        "Repurpose a broken necklace"
      ],
      [
        "Beading cord",
        "Choose one that fits your bead holes"
      ],
      [
        "Clasp or jump ring",
        "Only if attaching to a bag or keys"
      ],
      [
        "Scissors",
        "You already have these"
      ]
    ],
    "steps": [
      "Pick a short color palette or theme.",
      "Lay out the bead order before threading.",
      "Thread beads and check the length.",
      "Tie or fasten securely and attach to your object."
    ],
    "placeIds": [
      "reuse"
    ],
    "tip": "Start with a bead swap among friends; one bag of mixed beads goes a long way.",
    "communityIds": [
      "library",
      "metal"
    ]
  },
  {
    "slug": "crochet-granny-square-bag",
    "title": "Crochet a granny-square bag",
    "category": "textile",
    "label": "NEEDLE & THREAD",
    "skill": "BEGINNER",
    "time": "1–2 weekends",
    "budgetMin": 15,
    "budgetMax": 38,
    "visual": "crochet",
    "accent": "cinnamon",
    "count": "04 MATERIALS",
    "tags": [
      "crochet",
      "granny square",
      "bag",
      "knit",
      "yarn",
      "purse"
    ],
    "intro": "The kind of bag that makes strangers ask where you bought it.",
    "materials": [
      [
        "Cotton yarn",
        "Two or three coordinating colors"
      ],
      [
        "Crochet hook",
        "Match the label on your yarn"
      ],
      [
        "Tapestry needle",
        "For joining squares and hiding ends"
      ],
      [
        "Scissors",
        "Any pair"
      ]
    ],
    "steps": [
      "Practice one small granny square.",
      "Make matching squares until you have enough for two panels.",
      "Join squares, add a handle and weave in ends."
    ],
    "placeIds": [
      "craft",
      "reuse"
    ],
    "communityIds": [
      "purls",
      "library"
    ],
    "tip": "Try a granny-square coaster before committing to a whole bag."
  },
  {
    "slug": "crochet-bookmark",
    "title": "Crochet a little bookmark",
    "category": "textile",
    "label": "NEEDLE & THREAD",
    "skill": "BEGINNER",
    "time": "45–90 min",
    "budgetMin": 5,
    "budgetMax": 15,
    "visual": "crochet",
    "accent": "mint",
    "count": "03 MATERIALS",
    "tags": [
      "crochet",
      "bookmark",
      "yarn",
      "reading",
      "knitting"
    ],
    "intro": "For the friend with a towering TBR pile.",
    "materials": [
      [
        "Scrap cotton yarn",
        "One small ball is plenty"
      ],
      [
        "Crochet hook",
        "Match yarn weight"
      ],
      [
        "Scissors",
        "Use what you have"
      ]
    ],
    "steps": [
      "Learn chain stitch.",
      "Work a narrow strip in single crochet.",
      "Tie off and weave in the ends."
    ],
    "placeIds": [
      "reuse",
      "craft"
    ],
    "communityIds": [
      "purls",
      "library"
    ],
    "tip": "A great way to use up leftover yarn."
  },
  {
    "slug": "knit-scarf",
    "title": "Knit your first scarf",
    "category": "textile",
    "label": "NEEDLE & THREAD",
    "skill": "BEGINNER",
    "time": "Several evenings",
    "budgetMin": 12,
    "budgetMax": 32,
    "visual": "knit",
    "accent": "blue",
    "count": "03 MATERIALS",
    "tags": [
      "knitting",
      "scarf",
      "yarn",
      "needles",
      "winter"
    ],
    "intro": "One simple stitch. An extremely satisfying amount of repetition.",
    "materials": [
      [
        "Medium-weight yarn",
        "Start with one or two skeins"
      ],
      [
        "Knitting needles",
        "Size recommended by your yarn"
      ],
      [
        "Blunt tapestry needle",
        "For finishing ends"
      ]
    ],
    "steps": [
      "Cast on 20–30 stitches.",
      "Work knit stitch until your scarf is long enough.",
      "Bind off loosely and weave in ends."
    ],
    "placeIds": [
      "craft",
      "reuse"
    ],
    "communityIds": [
      "purls",
      "library"
    ],
    "tip": "A scarf takes time; make a small swatch before buying several skeins."
  },
  {
    "slug": "punch-needle-coaster",
    "title": "Punch-needle a fuzzy coaster",
    "category": "textile",
    "label": "NEEDLE & THREAD",
    "skill": "BEGINNER",
    "time": "2 hours",
    "budgetMin": 20,
    "budgetMax": 45,
    "visual": "punch needle",
    "accent": "peach",
    "count": "04 MATERIALS",
    "tags": [
      "punch needle",
      "tuft",
      "rug",
      "coaster",
      "yarn",
      "needle"
    ],
    "intro": "A tiny rug for your coffee cup.",
    "materials": [
      [
        "Punch needle + hoop",
        "Choose compatible needle and fabric"
      ],
      [
        "Monks cloth or punch fabric",
        "Use sturdy cloth"
      ],
      [
        "Yarn",
        "Two colors are enough"
      ],
      [
        "Fabric glue or backing felt",
        "To finish the underside"
      ]
    ],
    "steps": [
      "Draw a bold shape onto your fabric.",
      "Stretch it taut in the hoop.",
      "Punch loops consistently, then secure the back."
    ],
    "placeIds": [
      "craft",
      "reuse",
      "textile"
    ],
    "communityIds": [
      "tac",
      "library"
    ],
    "tip": "Check that your cloth and needle are compatible before purchasing."
  },
  {
    "slug": "sashiko-mending",
    "title": "Try sashiko-style denim stitches",
    "category": "textile",
    "label": "NEEDLE & THREAD",
    "skill": "BEGINNER",
    "time": "1–2 hours",
    "budgetMin": 8,
    "budgetMax": 26,
    "visual": "sashiko",
    "accent": "lavender",
    "count": "04 MATERIALS",
    "tags": [
      "sashiko",
      "japanese stitching",
      "denim",
      "visible mending",
      "hand stitch",
      "repair"
    ],
    "intro": "Repair, pattern and patience in one satisfying square.",
    "materials": [
      [
        "Cotton sashiko or embroidery thread",
        "High-contrast thread reads best"
      ],
      [
        "Needle",
        "Sturdy hand-sewing needle"
      ],
      [
        "Denim or canvas scrap",
        "Patch a worn jacket"
      ],
      [
        "Ruler or chalk",
        "Mark a simple grid"
      ]
    ],
    "steps": [
      "Trace a repeating geometric pattern.",
      "Work even running stitches along lines.",
      "Secure ends and press gently."
    ],
    "placeIds": [
      "reuse",
      "mood",
      "textile"
    ],
    "communityIds": [
      "embroidery",
      "tac"
    ],
    "tip": "A small patch is a good introduction before a full garment."
  },
  {
    "slug": "block-printed-bandana",
    "title": "Block-print your own bandana",
    "category": "textile",
    "label": "NEEDLE & THREAD",
    "skill": "BEGINNER",
    "time": "2 hours",
    "budgetMin": 15,
    "budgetMax": 38,
    "visual": "print",
    "accent": "butter",
    "count": "05 MATERIALS",
    "tags": [
      "block print",
      "bandana",
      "fabric printing",
      "stamps",
      "textile print",
      "ink"
    ],
    "intro": "A small introduction to designing your own repeat pattern.",
    "materials": [
      [
        "Plain cotton bandana",
        "Prewash fabric"
      ],
      [
        "Fabric-safe printing ink",
        "Follow heat-setting directions"
      ],
      [
        "Carved stamp or printing block",
        "Borrow a block if possible"
      ],
      [
        "Foam roller or brayer",
        "For even ink"
      ],
      [
        "Scrap paper",
        "For tests"
      ]
    ],
    "steps": [
      "Press and iron your cotton square.",
      "Practice your print spacing on paper.",
      "Stamp fabric evenly and cure ink per instructions."
    ],
    "placeIds": [
      "mood",
      "textile",
      "brainery"
    ],
    "communityIds": [
      "tac",
      "brainery"
    ],
    "tip": "Use non-toxic, fabric-appropriate inks and follow the product curing instructions."
  },
  {
    "slug": "woven-wall-hanging",
    "title": "Weave a little wall hanging",
    "category": "textile",
    "label": "NEEDLE & THREAD",
    "skill": "BEGINNER",
    "time": "2–4 hours",
    "budgetMin": 12,
    "budgetMax": 32,
    "visual": "weave",
    "accent": "cinnamon",
    "count": "04 MATERIALS",
    "tags": [
      "weaving",
      "wall hanging",
      "yarn",
      "loom",
      "tapestry"
    ],
    "intro": "A satisfying first step into textile weaving.",
    "materials": [
      [
        "Small frame loom",
        "DIY cardboard loom also works"
      ],
      [
        "Yarn scraps",
        "Mix thicknesses and colors"
      ],
      [
        "Warp thread",
        "Strong cotton works"
      ],
      [
        "Tapestry needle",
        "Helpful for detail"
      ]
    ],
    "steps": [
      "Warp your loom with even tension.",
      "Weave over and under in different yarns.",
      "Finish edges and attach a dowel."
    ],
    "placeIds": [
      "textile",
      "reuse",
      "craft"
    ],
    "communityIds": [
      "tac",
      "purls"
    ],
    "tip": "Start on a cardboard loom before buying a larger one."
  },
  {
    "slug": "patchwork-pillow",
    "title": "Make a patchwork pillow cover",
    "category": "textile",
    "label": "NEEDLE & THREAD",
    "skill": "BEGINNER",
    "time": "3–5 hours",
    "budgetMin": 15,
    "budgetMax": 40,
    "visual": "patchwork",
    "accent": "mint",
    "count": "05 MATERIALS",
    "tags": [
      "quilting",
      "patchwork",
      "pillow",
      "sewing",
      "fabric",
      "scraps"
    ],
    "intro": "Turn the miscellaneous fabric drawer into something useful.",
    "materials": [
      [
        "Cotton fabric scraps",
        "Collect five coordinating pieces"
      ],
      [
        "Thread + needle or sewing machine",
        "Borrow when possible"
      ],
      [
        "Fabric scissors",
        "Sharp blades work best"
      ],
      [
        "Pillow insert",
        "Upcycle one you own"
      ],
      [
        "Pins or clips",
        "Keep seams aligned"
      ]
    ],
    "steps": [
      "Cut fabric into equal squares.",
      "Join squares into a front panel.",
      "Add an envelope back and turn inside out."
    ],
    "placeIds": [
      "reuse",
      "mood",
      "craft"
    ],
    "communityIds": [
      "tac",
      "embroidery"
    ],
    "tip": "Keep your first design to larger squares."
  },
  {
    "slug": "hand-stamped-wrapping",
    "title": "Carve a stamp for wrapping paper",
    "category": "paper",
    "label": "PAPER & PRINT",
    "skill": "BEGINNER",
    "time": "2–3 hours",
    "budgetMin": 16,
    "budgetMax": 40,
    "visual": "stamp",
    "accent": "blue",
    "count": "04 MATERIALS",
    "tags": [
      "linocut",
      "rubber stamp",
      "printmaking",
      "wrapping paper",
      "gift"
    ],
    "intro": "Gift wrapping that looks like an art print.",
    "materials": [
      [
        "Soft-carving block",
        "Choose beginner-safe material"
      ],
      [
        "Carving tool",
        "Use a bench hook and cut away from hands"
      ],
      [
        "Ink pad or water-based block ink",
        "One color is enough"
      ],
      [
        "Kraft paper",
        "Reuse paper bags"
      ]
    ],
    "steps": [
      "Sketch a bold two-tone motif.",
      "Carve carefully in a controlled workspace.",
      "Test stamp, then repeat across paper."
    ],
    "placeIds": [
      "soho",
      "reuse",
      "brainery"
    ],
    "communityIds": [
      "brainery",
      "cba"
    ],
    "tip": "Keep shapes simple and practice safe carving technique."
  },
  {
    "slug": "riso-zine",
    "title": "Make an eight-page mini zine",
    "category": "paper",
    "label": "PAPER & PRINT",
    "skill": "BEGINNER",
    "time": "1–2 hours",
    "budgetMin": 0,
    "budgetMax": 12,
    "visual": "zine",
    "accent": "peach",
    "count": "04 MATERIALS",
    "tags": [
      "zine",
      "risograph",
      "booklet",
      "magazine",
      "publishing",
      "collage"
    ],
    "intro": "The perfect format for your very specific opinions.",
    "materials": [
      [
        "One sheet of printer paper",
        "Letter size works"
      ],
      [
        "Pen, markers or collage scraps",
        "Use what you have"
      ],
      [
        "Scissors",
        "For a single center slit"
      ],
      [
        "Printer or copier",
        "Optional for duplicates"
      ]
    ],
    "steps": [
      "Fold a sheet into an eight-page mini book.",
      "Draft a tiny narrative or collection.",
      "Decorate, copy and trade."
    ],
    "placeIds": [
      "books",
      "reuse"
    ],
    "communityIds": [
      "cba",
      "library"
    ],
    "tip": "You can start with a photocopier; no risograph machine necessary."
  },
  {
    "slug": "cyanotype-prints",
    "title": "Make botanical cyanotype prints",
    "category": "paper",
    "label": "PAPER & PRINT",
    "skill": "BEGINNER",
    "time": "45 min",
    "budgetMin": 12,
    "budgetMax": 28,
    "visual": "cyanotype",
    "accent": "lavender",
    "count": "04 MATERIALS",
    "tags": [
      "cyanotype",
      "sunprint",
      "photography",
      "blueprint",
      "plants",
      "photogram"
    ],
    "intro": "A little sunlight turns your afternoon into a print studio.",
    "materials": [
      [
        "Pre-coated cyanotype paper",
        "Use pre-coated sheets for a safer first try"
      ],
      [
        "Leaves or flat objects",
        "Press them beforehand"
      ],
      [
        "Clear acrylic sheet",
        "To hold objects flat"
      ],
      [
        "Fresh water",
        "Follow package rinse instructions"
      ]
    ],
    "steps": [
      "Arrange dry leaves on sensitized paper away from bright light.",
      "Expose to sunlight following paper instructions.",
      "Rinse as directed and let dry flat."
    ],
    "placeIds": [
      "soho",
      "darkroom",
      "brainery"
    ],
    "communityIds": [
      "darkroom",
      "brainery"
    ],
    "tip": "Use pre-coated paper instead of mixing photographic chemicals at home."
  },
  {
    "slug": "collage-poster",
    "title": "Make a cut-and-paste collage poster",
    "category": "paper",
    "label": "PAPER & PRINT",
    "skill": "BEGINNER",
    "time": "1–2 hours",
    "budgetMin": 4,
    "budgetMax": 18,
    "visual": "collage",
    "accent": "butter",
    "count": "04 MATERIALS",
    "tags": [
      "collage",
      "scrapbook",
      "vision board",
      "poster",
      "magazine",
      "paper"
    ],
    "intro": "Turn the mail pile into something you might frame.",
    "materials": [
      [
        "Old magazines or flyers",
        "Ask a friend for leftovers"
      ],
      [
        "Glue stick",
        "Acid-free if you plan to archive"
      ],
      [
        "Large backing paper",
        "Recycled board works"
      ],
      [
        "Scissors",
        "Any good pair"
      ]
    ],
    "steps": [
      "Choose a color or theme.",
      "Arrange pieces before attaching them.",
      "Glue in layers and let the poster dry."
    ],
    "placeIds": [
      "reuse",
      "soho"
    ],
    "communityIds": [
      "library",
      "brainery"
    ],
    "tip": "Ask a creative reuse shop for scrap paper."
  },
  {
    "slug": "hand-marbled-paper",
    "title": "Make a marbled paper cover",
    "category": "paper",
    "label": "PAPER & PRINT",
    "skill": "BEGINNER",
    "time": "2 hours",
    "budgetMin": 18,
    "budgetMax": 45,
    "visual": "marble",
    "accent": "cinnamon",
    "count": "04 MATERIALS",
    "tags": [
      "marbling",
      "paper art",
      "book cover",
      "notebook",
      "printmaking"
    ],
    "intro": "A one-off paper pattern worthy of the inside of a book.",
    "materials": [
      [
        "Marbling kit suitable for paper",
        "Follow brand instructions"
      ],
      [
        "Absorbent paper",
        "Start with practice sheets"
      ],
      [
        "Shallow tray",
        "Use one you can dedicate to craft"
      ],
      [
        "Drying space + paper towels",
        "Protect your work surface"
      ]
    ],
    "steps": [
      "Prepare your marbling bath as instructed.",
      "Drop colors and swirl gently.",
      "Lay paper on the surface and lift to dry."
    ],
    "placeIds": [
      "books",
      "soho",
      "brainery"
    ],
    "communityIds": [
      "cba",
      "brainery"
    ],
    "tip": "Avoid improvising with chemical ingredients; use a beginner kit."
  },
  {
    "slug": "bookbinding-stitch",
    "title": "Bind a pocket notebook",
    "category": "paper",
    "label": "PAPER & PRINT",
    "skill": "BEGINNER",
    "time": "1–2 hours",
    "budgetMin": 5,
    "budgetMax": 24,
    "visual": "book",
    "accent": "mint",
    "count": "04 MATERIALS",
    "tags": [
      "bookbinding",
      "journal",
      "notebook",
      "coptic stitch",
      "pamphlet stitch"
    ],
    "intro": "An entire notebook from a piece of paper and an afternoon.",
    "materials": [
      [
        "10–20 sheets of paper",
        "Cut and fold to size"
      ],
      [
        "Cardstock covers",
        "Recycled boxes are great"
      ],
      [
        "Thread + blunt needle",
        "Strong cotton thread"
      ],
      [
        "Piercing tool",
        "Use on protected surface"
      ]
    ],
    "steps": [
      "Fold and stack the pages.",
      "Mark an even row of holes on the fold.",
      "Sew the signature into a cover."
    ],
    "placeIds": [
      "books",
      "reuse"
    ],
    "communityIds": [
      "cba",
      "library"
    ],
    "tip": "Start with a three-hole pamphlet stitch."
  },
  {
    "slug": "linocut-postcards",
    "title": "Print a batch of lino postcards",
    "category": "paper",
    "label": "PAPER & PRINT",
    "skill": "BEGINNER",
    "time": "3 hours",
    "budgetMin": 22,
    "budgetMax": 55,
    "visual": "linocut",
    "accent": "blue",
    "count": "05 MATERIALS",
    "tags": [
      "linocut",
      "relief print",
      "block print",
      "postcards",
      "carving",
      "printmaking"
    ],
    "intro": "Mail something you carved instead of something you bought.",
    "materials": [
      [
        "Soft-carve block",
        "Small postcard size"
      ],
      [
        "Carving tools",
        "Use a bench hook; cut away from your hands"
      ],
      [
        "Water-based block ink",
        "Starter color"
      ],
      [
        "Brayer",
        "Small roller"
      ],
      [
        "Heavy postcard paper",
        "Use offcuts"
      ]
    ],
    "steps": [
      "Draw a simple high-contrast design.",
      "Carve away the parts that will stay uninked.",
      "Ink lightly and burnish onto cards."
    ],
    "placeIds": [
      "soho",
      "books",
      "brainery"
    ],
    "communityIds": [
      "cba",
      "brainery"
    ],
    "tip": "Carving tools are sharp; a supervised workshop is a strong first option."
  },
  {
    "slug": "watercolor-postcards",
    "title": "Paint an NYC watercolor postcard",
    "category": "paper",
    "label": "PAPER & PRINT",
    "skill": "BEGINNER",
    "time": "1–2 hours",
    "budgetMin": 12,
    "budgetMax": 30,
    "visual": "watercolor",
    "accent": "peach",
    "count": "04 MATERIALS",
    "tags": [
      "watercolor",
      "painting",
      "postcard",
      "illustration",
      "art journal"
    ],
    "intro": "A reason to look a little closer at your neighborhood.",
    "materials": [
      [
        "Watercolor paper",
        "Postcard size, thick enough for water"
      ],
      [
        "Small watercolor set",
        "Student-grade is fine"
      ],
      [
        "Round paintbrush",
        "One medium brush"
      ],
      [
        "Water cup + tissue",
        "Already at home"
      ]
    ],
    "steps": [
      "Pick a small streetscape or flower.",
      "Sketch lightly and paint from light to dark.",
      "Dry fully before writing on the back."
    ],
    "placeIds": [
      "soho",
      "brainery",
      "reuse"
    ],
    "communityIds": [
      "brainery",
      "library"
    ],
    "tip": "A tiny travel palette is enough to begin."
  },
  {
    "slug": "gouache-food-illustration",
    "title": "Paint your favorite corner-store snack",
    "category": "paper",
    "label": "PAPER & PRINT",
    "skill": "BEGINNER",
    "time": "2 hours",
    "budgetMin": 18,
    "budgetMax": 48,
    "visual": "gouache",
    "accent": "lavender",
    "count": "04 MATERIALS",
    "tags": [
      "gouache",
      "food illustration",
      "paint",
      "drawing",
      "painting"
    ],
    "intro": "Make a tiny still life of your afternoon essentials.",
    "materials": [
      [
        "Gouache starter set",
        "Five colors are plenty"
      ],
      [
        "Mixed media or watercolor paper",
        "A few small sheets"
      ],
      [
        "Round + flat brushes",
        "Wash between colors"
      ],
      [
        "Pencil and palette",
        "Plate or spare palette works"
      ]
    ],
    "steps": [
      "Pick a small snack or food package.",
      "Block the main shapes with opaque color.",
      "Add labels and details last."
    ],
    "placeIds": [
      "soho",
      "brainery"
    ],
    "communityIds": [
      "brainery",
      "library"
    ],
    "tip": "Limit your palette to five colors for cohesion."
  },
  {
    "slug": "pressed-flower-frame",
    "title": "Press and frame flowers",
    "category": "objects",
    "label": "THINGS & OBJECTS",
    "skill": "BEGINNER",
    "time": "1–3 weeks (drying)",
    "budgetMin": 5,
    "budgetMax": 25,
    "visual": "flowers",
    "accent": "butter",
    "count": "04 MATERIALS",
    "tags": [
      "pressed flowers",
      "botanical",
      "frame",
      "floral art",
      "flower pressing"
    ],
    "intro": "A longer-lived version of a bouquet you loved.",
    "materials": [
      [
        "Flat flowers or leaves",
        "Try fallen leaves or wilted bouquets"
      ],
      [
        "Absorbent paper",
        "Uncoated paper works"
      ],
      [
        "Heavy books",
        "Or a flower press"
      ],
      [
        "Small frame",
        "Reuse an old one"
      ]
    ],
    "steps": [
      "Flatten flowers between absorbent paper in a book.",
      "Let them fully dry over days or weeks.",
      "Arrange and frame your dried composition."
    ],
    "placeIds": [
      "reuse",
      "brainery"
    ],
    "communityIds": [
      "brainery",
      "library"
    ],
    "tip": "Only pick plants where permitted; dried flowers take time."
  },
  {
    "slug": "air-dry-clay-magnets",
    "title": "Shape your own clay fridge magnets",
    "category": "objects",
    "label": "THINGS & OBJECTS",
    "skill": "BEGINNER",
    "time": "1 day + drying",
    "budgetMin": 10,
    "budgetMax": 28,
    "visual": "clay",
    "accent": "cinnamon",
    "count": "04 MATERIALS",
    "tags": [
      "clay",
      "magnets",
      "air",
      "dry",
      "clay",
      "mini",
      "sculpture"
    ],
    "intro": "Objects with absolutely no reason to be that charming.",
    "materials": [
      [
        "Air-dry clay",
        "Not for food-contact pieces"
      ],
      [
        "Small magnets",
        "Choose a suitable adhesive"
      ],
      [
        "Acrylic paint",
        "Optional"
      ],
      [
        "Craft glue",
        "Use per manufacturer instructions"
      ]
    ],
    "steps": [
      "Shape small flat figures or symbols.",
      "Dry fully per clay packaging.",
      "Paint and glue magnets to the backs."
    ],
    "placeIds": [
      "reuse",
      "brainery",
      "clay"
    ],
    "communityIds": [
      "brainery",
      "clay"
    ],
    "tip": "Do not use air-dry clay for dishes or food-safe objects."
  },
  {
    "slug": "silver-stacking-ring",
    "title": "Make a simple silver stacking ring",
    "category": "objects",
    "label": "THINGS & OBJECTS",
    "skill": "BEGINNER",
    "time": "One workshop",
    "budgetMin": 50,
    "budgetMax": 150,
    "visual": "ring",
    "accent": "mint",
    "count": "03 MATERIALS",
    "tags": [
      "ring",
      "silversmithing",
      "jewelry",
      "metal",
      "metalworking"
    ],
    "intro": "The answer to “where did you get that?” is “I made it.”",
    "materials": [
      [
        "Sterling silver wire",
        "Usually offered as a studio kit"
      ],
      [
        "Ring mandrel + jewelry pliers",
        "Professional studio tools"
      ],
      [
        "Soldering equipment",
        "Studio-only under instructor supervision"
      ]
    ],
    "steps": [
      "Book an intro metalsmithing class.",
      "Measure and shape silver into a ring.",
      "Join, finish and polish with supervision."
    ],
    "placeIds": [
      "metal"
    ],
    "communityIds": [
      "metal"
    ],
    "tip": "This one belongs in a supervised studio rather than a home soldering setup."
  },
  {
    "slug": "beaded-necklace",
    "title": "String a bright beaded necklace",
    "category": "objects",
    "label": "THINGS & OBJECTS",
    "skill": "BEGINNER",
    "time": "45–90 min",
    "budgetMin": 10,
    "budgetMax": 35,
    "visual": "beads",
    "accent": "blue",
    "count": "04 MATERIALS",
    "tags": [
      "necklace",
      "beads",
      "jewelry",
      "beading",
      "colorful jewelry"
    ],
    "intro": "A jewelry-box refresh in under an hour.",
    "materials": [
      [
        "Assorted beads",
        "Mix vintage and new"
      ],
      [
        "Beading wire or cord",
        "Select for bead size"
      ],
      [
        "Clasp and findings",
        "Crimps if using wire"
      ],
      [
        "Small pliers",
        "Borrow a pair"
      ]
    ],
    "steps": [
      "Lay out colors on a flat surface.",
      "String beads and check fit.",
      "Secure clasps carefully and test closures."
    ],
    "placeIds": [
      "reuse",
      "craft",
      "metal"
    ],
    "communityIds": [
      "metal",
      "library"
    ],
    "tip": "Broken jewelry is a good source of beads."
  },
  {
    "slug": "macrame-plant-hanger",
    "title": "Knot a macramé plant hanger",
    "category": "objects",
    "label": "THINGS & OBJECTS",
    "skill": "BEGINNER",
    "time": "2 hours",
    "budgetMin": 12,
    "budgetMax": 32,
    "visual": "macrame",
    "accent": "peach",
    "count": "04 MATERIALS",
    "tags": [
      "macrame",
      "plant hanger",
      "knots",
      "cord",
      "home decor"
    ],
    "intro": "Give your window plant a new apartment.",
    "materials": [
      [
        "Cotton macramé cord",
        "Choose soft beginner cord"
      ],
      [
        "Wooden ring",
        "Optional; can knot directly"
      ],
      [
        "Plant pot",
        "Test the weight first"
      ],
      [
        "Measuring tape + scissors",
        "Keep strands even"
      ]
    ],
    "steps": [
      "Cut equal lengths of cord.",
      "Work repeating square knots.",
      "Secure a base knot and test with an empty pot."
    ],
    "placeIds": [
      "craft",
      "reuse",
      "textile"
    ],
    "communityIds": [
      "tac",
      "library"
    ],
    "tip": "Hang only from an appropriate anchor rated for the full pot weight."
  },
  {
    "slug": "needle-felted-charm",
    "title": "Needle-felt a tiny wool charm",
    "category": "objects",
    "label": "THINGS & OBJECTS",
    "skill": "BEGINNER",
    "time": "1–2 hours",
    "budgetMin": 15,
    "budgetMax": 34,
    "visual": "felting",
    "accent": "lavender",
    "count": "04 MATERIALS",
    "tags": [
      "needle felting",
      "wool",
      "felt",
      "mini animal",
      "soft sculpture"
    ],
    "intro": "Tiny wool sculptures: surprisingly addictive.",
    "materials": [
      [
        "Wool roving",
        "Choose one or two colors"
      ],
      [
        "Felting needles",
        "Barbed and sharp"
      ],
      [
        "Foam felting pad",
        "Protect your hands and table"
      ],
      [
        "Keychain loop",
        "Optional"
      ]
    ],
    "steps": [
      "Work on a firm felting pad.",
      "Build a basic wool sphere with gentle repeated pokes.",
      "Add details and attach a loop."
    ],
    "placeIds": [
      "craft",
      "reuse",
      "textile"
    ],
    "communityIds": [
      "tac",
      "library"
    ],
    "tip": "Felting needles are sharp; work slowly and keep fingers clear."
  },
  {
    "slug": "film-photo-walk",
    "title": "Shoot a roll of 35mm film",
    "category": "objects",
    "label": "THINGS & OBJECTS",
    "skill": "BEGINNER",
    "time": "One walk + processing",
    "budgetMin": 20,
    "budgetMax": 55,
    "visual": "camera",
    "accent": "butter",
    "count": "03 MATERIALS",
    "tags": [
      "film photography",
      "analog",
      "camera",
      "darkroom",
      "street photography",
      "35mm"
    ],
    "intro": "A small reason to slow down and notice your block.",
    "materials": [
      [
        "35mm film camera",
        "Borrow or buy used"
      ],
      [
        "35mm film",
        "Match ISO to light"
      ],
      [
        "Film processing access",
        "A local lab or workshop"
      ]
    ],
    "steps": [
      "Check that your camera works.",
      "Pick a neighborhood and shoot intentionally.",
      "Develop at a lab or sign up for a darkroom class."
    ],
    "placeIds": [
      "darkroom"
    ],
    "communityIds": [
      "darkroom"
    ],
    "tip": "Film and processing costs vary significantly by lab."
  },
  {
    "slug": "candle-tin",
    "title": "Pour a small candle in a tin",
    "category": "objects",
    "label": "THINGS & OBJECTS",
    "skill": "BEGINNER",
    "time": "1–2 hours + curing",
    "budgetMin": 18,
    "budgetMax": 45,
    "visual": "candle",
    "accent": "cinnamon",
    "count": "04 MATERIALS",
    "tags": [
      "candlemaking",
      "candle",
      "scent",
      "tin",
      "wax",
      "soy"
    ],
    "intro": "The craft night that also makes your apartment smell good.",
    "materials": [
      [
        "Candle-safe wax flakes",
        "Use a suitable beginner kit"
      ],
      [
        "Candle-safe wick",
        "Match size to container"
      ],
      [
        "Metal candle tin",
        "Heat-appropriate container"
      ],
      [
        "Thermometer and melting vessel",
        "Use a kit with safety directions"
      ]
    ],
    "steps": [
      "Set up a heat-safe workspace and wick the tin.",
      "Melt wax using the kit’s instructions and temperature guidance.",
      "Pour carefully and cure before lighting."
    ],
    "placeIds": [
      "reuse",
      "brainery"
    ],
    "communityIds": [
      "brainery",
      "library"
    ],
    "tip": "Melted wax can burn; never leave it unattended and use only candle-rated materials."
  },
  {
    "slug": "miniature-diorama",
    "title": "Build a miniature room in a box",
    "category": "objects",
    "label": "THINGS & OBJECTS",
    "skill": "BEGINNER",
    "time": "2–4 hours",
    "budgetMin": 4,
    "budgetMax": 22,
    "visual": "miniature",
    "accent": "mint",
    "count": "04 MATERIALS",
    "tags": [
      "miniature",
      "diorama",
      "tiny room",
      "model",
      "cardboard",
      "dollhouse"
    ],
    "intro": "A whole world that fits on your shelf.",
    "materials": [
      [
        "Shoebox or cardboard",
        "Reuse packaging"
      ],
      [
        "Scrap paper + fabric",
        "For tiny wallpaper and rugs"
      ],
      [
        "Craft glue",
        "Use in ventilated space"
      ],
      [
        "Small scissors + ruler",
        "For tiny cuts"
      ]
    ],
    "steps": [
      "Choose one tiny room idea.",
      "Cut and assemble simple furniture forms.",
      "Layer textures and lighting details if desired."
    ],
    "placeIds": [
      "reuse",
      "soho"
    ],
    "communityIds": [
      "library",
      "brainery"
    ],
    "tip": "Start with paper furniture rather than buying miniature kits."
  },
  {
    "slug": "glass-bead-intro",
    "title": "Make a glass bead at a studio",
    "category": "objects",
    "label": "THINGS & OBJECTS",
    "skill": "BEGINNER",
    "time": "One workshop",
    "budgetMin": 75,
    "budgetMax": 175,
    "visual": "glass",
    "accent": "blue",
    "count": "03 MATERIALS",
    "tags": [
      "glass beads",
      "lampworking",
      "glass art",
      "glassblowing",
      "beading"
    ],
    "intro": "The kind of project where the studio is the supply list.",
    "materials": [
      [
        "Studio-provided glass rods",
        "Use materials provided in class"
      ],
      [
        "Safety equipment",
        "Provided by instructor"
      ],
      [
        "Studio torch and kiln",
        "Supervised access only"
      ]
    ],
    "steps": [
      "Choose a beginner beadmaking class.",
      "Learn torch safety with the instructor.",
      "Shape glass and let the studio anneal it in a kiln."
    ],
    "placeIds": [
      "urbanglass"
    ],
    "communityIds": [
      "urban"
    ],
    "tip": "Hot glass requires supervised equipment and protective gear."
  }
];
