import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./layouts/AppShell";
import { DashboardPage } from "./pages/DashboardPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { PortfolioPage } from "./pages/PortfolioPage";
import { StockDetailPage } from "./pages/StockDetailPage";
import { ThesisPage } from "./pages/ThesisPage";
import { TrackingPage } from "./pages/TrackingPage";
import { WatchlistPage } from "./pages/WatchlistPage";
import { WorkspaceStateProvider } from "./state/WorkspaceStateProvider";

function App() {
  return (
    <WorkspaceStateProvider>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<DashboardPage />} />
          <Route path="stocks">
            <Route index element={<Navigate to="/stocks/MSFT" replace />} />
            <Route path=":ticker" element={<StockDetailPage />} />
          </Route>
          <Route path="thesis" element={<ThesisPage />} />
          <Route path="thesis/:ticker" element={<ThesisPage />} />
          <Route path="portfolio" element={<PortfolioPage />} />
          <Route path="tracking" element={<TrackingPage />} />
          <Route path="watchlist" element={<WatchlistPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </WorkspaceStateProvider>
  );
}

export default App;
