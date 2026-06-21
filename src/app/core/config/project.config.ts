export interface ProjectConfig {
    slug: string;
    title: string;
    subtitle: string;
  }
  
  export const ALLOWED_PROJECTS: ProjectConfig[] = [
    { slug: 'eva-ai', title: 'EVA AI Chatbot', subtitle: 'Personal Chatbot' },
    { slug: 'presmistique', title: 'Presmistique', subtitle: 'AI Resume Builder' },
    { slug: 'ckeditor-plugin', title: 'CKEditor Plugin', subtitle: 'Rich Text Extension' },
    { slug: 'fruit-basket', title: 'Fruit Basket', subtitle: 'E-commerce App' }
  ];
  
  // Pre-computed Set for O(1) lookups in the guard
  export const VALID_PROJECT_SLUGS = new Set(ALLOWED_PROJECTS.map(p => p.slug));