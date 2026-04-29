import { useOutletContext } from "react-router-dom";
import type { CmsData } from "@/shared/types/cms";
import DashboardChecklistSection from "../components/DashboardChecklistSection";
import DashboardHero from "../components/DashboardHero";
import DashboardLatestPostsSection from "../components/DashboardLatestPostsSection";
import DashboardStatGrid from "../components/DashboardStatGrid";
import { useDashboardContent } from "../hooks/useDashboardContent";

type DashboardOutletContext = {
  data: CmsData;
  canEditContent: boolean;
};

const DashboardPage = () => {
  const { data, canEditContent } = useOutletContext<DashboardOutletContext>();
  const { checklistItems, sectionStats, totalItems, latestItems } = useDashboardContent(data);

  return (
    <div className="space-y-admin-section">
      <DashboardHero canEditContent={canEditContent} />
      <DashboardStatGrid stats={sectionStats} />
      <DashboardChecklistSection checklistItems={checklistItems} totalItems={totalItems} canEditContent={canEditContent} />
      <DashboardLatestPostsSection items={latestItems} canEditContent={canEditContent} />
    </div>
  );
};

export default DashboardPage;
