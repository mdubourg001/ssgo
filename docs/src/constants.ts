const CATEGORIES = {
  None: "None",
  Creators: "Creators",
  Templates: "Templates",
  "Custom components": "Custom components",
  "Static files": "Static files",
  "Guides": "Guides",
};

export const DOCS: Record<string, any> = {
  categories: CATEGORIES,
  docs: [
    {
      title: "Installation",
      md: "installation.md",
      path: "installation.html",
      weight: 1,
      category: CATEGORIES.None,
    },
    {
      title: "Quickstart",
      md: "quickstart.md",
      path: "quickstart.html",
      weight: 2,
      category: CATEGORIES.None,
    },
    {
      title: "Contionnally display elements",
      md: "cond-display.md",
      path: "conditionnally-display-elements.html",
      weight: 1,
      category: CATEGORIES.Templates,
    },
  ],
};
