import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";
import { createRobots } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return createRobots(siteConfig);
}
