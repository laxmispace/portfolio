import type { BlogCategory } from "@/app/data/blogPosts";
import { colors } from "@/app/theme/tokens";

// How each blog category is marked: an accent colour and a doodle.
export const CATEGORY_ACCENT: Record<BlogCategory, string> = {
  "write about design": colors.orange,
  "personal musings": colors.pink,
  "life in a nutshell": colors.olive,
};

export const CATEGORY_DOODLE: Record<BlogCategory, string> = {
  "write about design": "✏️",
  "personal musings": "☁️",
  "life in a nutshell": "🌱",
};
