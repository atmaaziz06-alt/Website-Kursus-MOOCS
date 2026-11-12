// Centralized Media Repository for EduSpace LMS
// Single source of truth for all images, banners, portraits, and media assets.
// To use local assets, replace strings with local paths like "/media/hero.jpg".

export interface CourseMediaItem {
  thumbnail: string;
  banner: string;
  previewPoster: string;
  previewVideoId?: string;
  previewVideoTitle?: string;
}

export interface MediaConfig {
  brand: {
    logoMark: string;
    logoFull: string;
    favicon: string;
  };
  hero: {
    mainImage: string;
    studentPortrait: string;
  };
  courses: Record<string, CourseMediaItem>;
  people: {
    instructors: Record<string, string>;
    users: Record<string, string>;
  };
  categories: Record<string, string>;
  auth: {
    loginPanel: string;
    registerPanel: string;
  };
  fallback: {
    course: string;
    avatar: string;
    banner: string;
  };
}

export const media: MediaConfig = {
  brand: {
    logoMark: "/eduspace-logo.png?v=2",
    logoFull: "/eduspace-logo.png?v=2",
    favicon: "/eduspace-favicon.png?v=2",
  },
  hero: {
    mainImage: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80", // REPLACE ME
    studentPortrait: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80", // REPLACE ME
  },
  courses: {
    "web-development-bootcamp-2025": {
      thumbnail: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&w=800&q=80", // REPLACE ME
      banner: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1600&q=80", // REPLACE ME
      previewPoster: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80", // REPLACE ME
      previewVideoId: "bMknfKXIFA8",
      previewVideoTitle: "React Course - Beginner's Tutorial for React JavaScript Library [2022]",
    },
    "digital-marketing-masterclass": {
      thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80", // REPLACE ME
      banner: "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1600&q=80", // REPLACE ME
      previewPoster: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&w=1200&q=80", // REPLACE ME
      previewVideoId: "nU-IIXBWlS4",
      previewVideoTitle: "Digital Marketing Course Part 1 | Digital Marketing Tutorial For Beginners | Simplilearn",
    },
    "ui-ux-design-fundamentals": {
      thumbnail: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=800&q=80", // REPLACE ME
      banner: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1600&q=80", // REPLACE ME
      previewPoster: "https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=1200&q=80", // REPLACE ME
      previewVideoId: "FTFaQWZBqQ8",
      previewVideoTitle: "Figma UI Design Tutorial: Get Started in Just 24 Minutes!",
    },
    "python-programming-scratch": {
      thumbnail: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=800&q=80", // REPLACE ME
      banner: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1600&q=80", // REPLACE ME
      previewPoster: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80", // REPLACE ME
      previewVideoId: "rfscVS0vtbw",
      previewVideoTitle: "Learn Python - Full Course for Beginners [Tutorial]",
    },
    "machine-learning-ai": {
      thumbnail: "https://images.unsplash.com/photo-1555255707-c07966088b7b?auto=format&fit=crop&w=800&q=80", // REPLACE ME
      banner: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80", // REPLACE ME
      previewPoster: "https://images.unsplash.com/photo-1507146426996-ef0538883dfa?auto=format&fit=crop&w=1200&q=80", // REPLACE ME
      previewVideoId: "i_LwzRVP7bg",
      previewVideoTitle: "Machine Learning for Everybody – Full Course",
    },
    "cloud-architecture-devops": {
      thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80", // REPLACE ME
      banner: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1600&q=80", // REPLACE ME
      previewPoster: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80", // REPLACE ME
      previewVideoId: "j5Zsa_eOXeY",
      previewVideoTitle: "DevOps Engineering Course for Beginners",
    },
    "full-stack-nextjs-ai": {
      thumbnail: "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&w=800&q=80", // REPLACE ME
      banner: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=80", // REPLACE ME
      previewPoster: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80", // REPLACE ME
      previewVideoId: "wm5gMKuwSYk",
      previewVideoTitle: "Next.js Full Course 2024 | Build and Deploy a Full Stack App Using the Official React Framework",
    },
    "deep-learning-pytorch": {
      thumbnail: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80", // REPLACE ME
      banner: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=1600&q=80", // REPLACE ME
      previewPoster: "https://images.unsplash.com/photo-1516116211227-bbc03a274bc3?auto=format&fit=crop&w=1200&q=80", // REPLACE ME
      previewVideoId: "Z_ikDlimN6A",
      previewVideoTitle: "Learn PyTorch for deep learning in a day. Literally.",
    },
    "figma-design-system": {
      thumbnail: "https://images.unsplash.com/photo-1509395062183-67c5ad6faff9?auto=format&fit=crop&w=800&q=80", // REPLACE ME
      banner: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=1600&q=80", // REPLACE ME
      previewPoster: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80", // REPLACE ME
      previewVideoId: "FTFaQWZBqQ8",
      previewVideoTitle: "Figma UI Design Tutorial: Get Started in Just 24 Minutes!",
    },
    "cloud-devops-kubernetes": {
      thumbnail: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&w=800&q=80", // REPLACE ME
      banner: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1600&q=80", // REPLACE ME
      previewPoster: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80", // REPLACE ME
      previewVideoId: "d6WC5n9G_sM",
      previewVideoTitle: "Kubernetes Course - Full Beginners Tutorial (Containerize Your Apps!)",
    },
  },
  people: {
    instructors: {
      "john-smith": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80", // REPLACE ME
      "dr-siti": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80", // REPLACE ME
      "marcus-vance": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80", // REPLACE ME
      "sarah-jenkins": "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80", // REPLACE ME
      "alex-rivera": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80", // REPLACE ME
      "elena-rostova": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80", // REPLACE ME
    },
    users: {
      "dian-paramitha": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80", // REPLACE ME
      "usr-84920": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80", // REPLACE ME
      "rian-hidayat": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80", // REPLACE ME
      "ahmad-fauzi": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80", // REPLACE ME
      "budi-santoso": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80", // REPLACE ME
      "michael-wong": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80", // REPLACE ME
    },
  },
  categories: {
    "technology": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80", // REPLACE ME
    "business": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80", // REPLACE ME
    "design": "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=600&q=80", // REPLACE ME
    "development": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80", // REPLACE ME
    "marketing": "https://images.unsplash.com/photo-1533750349088-cd871a92f312?auto=format&fit=crop&w=600&q=80", // REPLACE ME
    "personal-growth": "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=600&q=80", // REPLACE ME
    "data-ai": "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80", // REPLACE ME
  },
  auth: {
    loginPanel: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1000&q=80", // REPLACE ME
    registerPanel: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80", // REPLACE ME
  },
  fallback: {
    course: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80", // REPLACE ME
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80", // REPLACE ME
    banner: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1600&q=80", // REPLACE ME
  },
};

export function getCourseMedia(slug: string): CourseMediaItem {
  if (slug && media.courses[slug]) {
    return media.courses[slug];
  }

  const availableCourseMedia = [
    ...Object.values(media.courses),
    ...Object.values(media.categories).map((thumbnail) => ({
      thumbnail,
      banner: media.fallback.banner,
      previewPoster: thumbnail,
    })),
  ];
  if (availableCourseMedia.length === 0) {
    return {
      thumbnail: media.fallback.course,
      banner: media.fallback.banner,
      previewPoster: media.fallback.course,
    };
  }

  const slugNumber = Number(slug.match(/\d+$/)?.[0]);
  const hash = [...slug].reduce((value, character) => value + character.charCodeAt(0), 0);
  const index = Number.isFinite(slugNumber) && slugNumber > 0
    ? (slugNumber - 1) % availableCourseMedia.length
    : hash % availableCourseMedia.length;
  const fallbackMedia = availableCourseMedia[index];
  return {
    thumbnail: fallbackMedia.thumbnail,
    banner: fallbackMedia.banner,
    previewPoster: fallbackMedia.previewPoster,
  };
}

export function getInstructorPhoto(id: string): string {
  if (id.startsWith('http://') || id.startsWith('https://') || id.startsWith('/')) {
    return id;
  }
  if (id && media.people.instructors[id]) {
    return media.people.instructors[id];
  }
  return media.fallback.avatar;
}

export function getUserAvatar(id: string): string {
  if (id && media.people.users[id]) {
    return media.people.users[id];
  }
  return media.fallback.avatar;
}

export function getCategoryMedia(categoryId: string): string {
  if (categoryId && media.categories[categoryId]) {
    return media.categories[categoryId];
  }
  return media.fallback.course;
}
