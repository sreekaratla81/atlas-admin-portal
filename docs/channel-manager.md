# Channel Manager shell

The `/channel-manager` page uses the new `AdminShellLayout` with a shared property sidebar and tabs.

## Extension points
- Replace `useUnifiedCalendar` with a dedicated `useChannelManager` hook for property inventory, rate grids, and availability.
- `channelTabs` (`Inventory Rate`, `Flexi Pricing`) are defined in `src/pages/ChannelManager.tsx`; add new tabs by extending this array.
- `Integration status` card is a placeholder for API-driven connectivity checks (e.g., Channex). Surface connection state and action buttons here.

## Planned API endpoints
- `GET /properties/:id/channel-mapping` — pull OTA mapping details per property.
- `GET /properties/:id/rates` — base and seasonal rates for the selected property.
- `POST /properties/:id/rates` — save rate/availability changes.
- `GET /integrations/status` — global channel connection health for the status card.
