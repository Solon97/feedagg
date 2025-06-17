import { NewsPageContent } from "@/src/features/news/components/news-page-content";
import { RouteGuard } from "@/components/route-guard";

export default function NewsPage() {
  return (
    <RouteGuard>
      <NewsPageContent />
    </RouteGuard>
  );
}
