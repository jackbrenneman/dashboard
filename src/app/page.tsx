import DashboardHeader from "@/components/DashboardHeader";
import DashboardBody from "@/components/DashboardBody";

export default function Home() {
  return (
    <div className="wrap">
      <DashboardHeader />
      <DashboardBody />
      <p className="footer-note">Stored privately — nothing here is shared.</p>
    </div>
  );
}
