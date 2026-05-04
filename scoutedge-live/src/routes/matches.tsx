import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/matches")({
  component: MatchesLayout,
});

function MatchesLayout() {
  return <Outlet />;
}
