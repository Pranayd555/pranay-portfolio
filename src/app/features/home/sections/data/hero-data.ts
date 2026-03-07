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
    'My work primarily revolves around Angular, TypeScript, and modern JavaScript ecosystems, where I focus on designing applications that are not only performant but also structured for long-term maintainability and growth. I enjoy working on complex systems where thoughtful architecture and clean engineering make a significant difference in how software evolves over time.',
  experience:
    "Throughout my career, I've contributed to enterprise platforms across industries such as finance, travel, and education technology, helping teams build reliable products used by thousands of users worldwide. My work often involves solving challenging engineering problems — from modernizing legacy applications and designing modular front-end architectures to implementing complex features that require both technical depth and careful system design.",
  philosophy:
    'One thing I value deeply in engineering is clarity — writing code that remains understandable, scalable, and easy for teams to build upon. For me, good software isn\'t just about delivering features today; it\'s about building systems that continue to work well tomorrow.',
};

export const heroSections: HeroSection[] = [
  {
    id: 'philosophy',
    title: 'My Philosophy',
    highlight: '"Enough" is never enough.',
    paragraphs: [
      'Every day offers an opportunity to grow. A typical day has 24 hours — after rest and responsibilities, what remains is time that can either be spent passively or invested intentionally.',
      'I try to treat that time as an investment.',
      'Alongside my professional work, I consistently dedicate time to learning, experimenting, and maintaining both mental and physical well-being. Whether it\'s exploring new technologies, improving my problem-solving ability, or experimenting with creative ideas, I believe progress comes from consistent effort over long periods of time.',
    ],
  },
  {
    id: 'building-ideas',
    title: 'Building Ideas Into Reality',
    paragraphs: [
      'One thing that constantly excites me about technology is its ability to turn ideas into real, working systems.',
      'I enjoy exploring ideas that can solve meaningful problems or create value for people. Many of my side projects start simply from curiosity — experimenting with new frameworks, building interactive interfaces, or designing systems that could evolve into something larger.',
      'Recently, I\'ve been exploring interactive web experiences using Three.js, experimenting with particle systems, motion, and immersive interfaces that push the boundaries of traditional web design.',
    ],
  },
  {
    id: 'beyond-coding',
    title: 'Beyond Coding',
    paragraphs: [
      'While engineering is a big part of my life, curiosity drives me in many directions.',
      'When I\'m not coding, I often spend my time:',
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
  'These activities help me reset my mind, often leading to fresh perspectives and new ideas that influence my technical work.';

export const heroIntentionalTime = {
  intro:
    'In a world filled with distractions, I try to be intentional about how I spend my attention.',
  steppedAway:
    'I\'ve consciously stepped away from platforms like Facebook and Instagram, which often encourage endless scrolling without meaningful value. Instead, I prefer consuming high-quality informative content, staying updated through platforms that help me learn and grow.',
  platforms: [
    'YouTube, where I follow educational and technical content',
    'LinkedIn, to stay connected with the professional community',
    'X (formerly Twitter), for insights from engineers, builders, and innovators',
  ],
  closing:
    'For me, staying informed and learning continuously is far more valuable than passive consumption.',
};

export const heroClosing = {
  mindset: 'Stay curious. Keep improving. Build things that matter.',
  paragraph:
    'Technology evolves rapidly, and that\'s exactly what makes this field exciting. There is always something new to learn, a new problem to solve, or a better system to design.',
  final:
    'I enjoy that journey — one idea, one system, one improvement at a time.',
};
