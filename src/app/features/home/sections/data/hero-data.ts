/**
 * Hero section content — edit this file to update hero text.
 * Structure is preserved for consistent layout and styling.
 */
export interface HeroSection {
  id: string;
  title: string;
  paragraphs: string[];
  highlight?: string;
}

export const heroTagline = 'Building Systems, Exploring Ideas, and Continuously Improving';

export const heroIntro = {
  greeting: "Hi, I'm Pranay Das,",
  role: 'a Senior Software Engineer with over 7 years of experience building modern, scalable web applications.',
  focus:
    'I primarily work with Angular, TypeScript, and the modern JavaScript ecosystem, focusing on building applications that are not just fast, but thoughtfully structured to evolve over time. I enjoy working on systems where architecture matters — where small decisions today shape how easily things grow tomorrow.',
  experience:
    "Over the years, I've worked on enterprise platforms across finance, travel, and education domains, contributing to products used by thousands of users globally. My work often involves navigating complex problems — whether it's modernizing legacy systems, designing modular front-end architectures, or building features that require both technical depth and practical thinking.",
  philosophy:
    'What I value most in engineering is clarity. Writing code that others can understand, extend, and rely on. For me, good software is not just about solving problems today — it’s about building systems that continue to make sense months or even years down the line.',
};

export const heroSections: HeroSection[] = [
  {
    id: 'philosophy',
    title: 'My Philosophy',
    highlight: '"Enough" is never enough.',
    paragraphs: [
      'I believe growth is a continuous process. Every day gives us a limited window of time — and how we choose to use that time shapes who we become.',
      'I try to be intentional with that time.',
      'Beyond my professional work, I consistently invest time in learning, experimenting, and maintaining both mental and physical balance. Whether it’s exploring new technologies, improving how I think through problems, or simply building something out of curiosity — progress, for me, comes from showing up consistently.',
    ],
  },
  {
    id: 'building-ideas',
    title: 'Building Ideas Into Reality',
    paragraphs: [
      'What excites me most about technology is the ability to turn an idea into something real.',
      'Many of my projects start from simple curiosity — exploring a concept, testing an interaction, or solving a small problem — and gradually evolve into more structured systems. I enjoy that process of building, iterating, and refining.',
      'Lately, I’ve been exploring interactive web experiences using Three.js — experimenting with motion, particle systems, and immersive interfaces that push beyond traditional UI boundaries.',
    ],
  },
  {
    id: 'beyond-coding',
    title: 'Beyond Coding',
    paragraphs: [
      'While engineering is a big part of my life, curiosity doesn’t stop there.',
      'Outside of code, I spend my time exploring different interests that help me stay balanced and inspired:',
    ],
    highlight: undefined,
  },
];

export const heroBeyondCodingItems = [
  'Painting, exploring creativity through visual expression',
  'Riding bikes, seeking adventure and discovering new places',
  'Playing chess, a game I\'ve been learning independently',
  'History and geopolitics',
  'Psychology and mindfulness',
  'Economy and finance',
];

export const heroBeyondCodingClosing =
  'These interests help me reset and recharge, often bringing fresh perspectives that influence how I approach problems in my work.';

  export const heroIntentionalTime = {
    intro:
      'In a world full of distractions, I try to be intentional about where my attention goes.',
    steppedAway:
      'I’ve consciously stepped away from platforms like Facebook and Instagram, where it’s easy to lose time without gaining much value. Instead, I prefer consuming content that actually helps me learn, grow, and stay informed.',
    platforms: [
      'YouTube, for deep dives into technical and educational content',
      'LinkedIn, to stay connected with the professional community',
      'X (formerly Twitter), for insights from engineers, builders, and thinkers',
    ],
    closing:
      'For me, learning with purpose always outweighs passive consumption.',
  };

  export const heroClosing = {
    mindset: 'Stay curious. Keep improving. Build things that matter.',
    paragraph:
      'Technology moves fast — and that’s what makes it exciting. There’s always something new to explore, a better way to build, or a more elegant solution waiting to be discovered.',
    final:
      'I enjoy that journey — one idea, one system, one improvement at a time.',
  };