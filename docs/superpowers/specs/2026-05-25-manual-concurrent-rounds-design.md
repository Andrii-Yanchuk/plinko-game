# Manual Concurrent Rounds Design

## Goal

Allow manual mode to start a new Plinko game as soon as the previous manual bet response returns from the server, without waiting for the previous ball animation or result display to finish. Up to 10 returned manual rounds may be displayed at the same time.

Auto mode stays sequential. It continues to wait for each round presentation to complete before placing the next auto bet.

## Definitions

- **In-flight request:** a manual bet request that has been sent but has not returned from the server.
- **Active manual round:** a manual bet whose server response has returned and whose ball/result presentation is still displayed.
- **Manual round limit:** 10 active manual rounds.

Only active manual rounds count toward the limit. In-flight requests do not count toward the 10-round cap.

## User Behavior

In manual mode, the user may click Bet again after the previous server response returns. The new request is allowed even if earlier returned rounds are still animating, as long as fewer than 10 active manual rounds are displayed.

When at least one manual round is active, the manual button displays:

```text
Playing... (N/10)
```

`N` is the number of active manual rounds. The button remains enabled while `N < 10` and no manual request is pending. It becomes disabled when a manual request is pending or `N >= 10`.

When all 10 active manual round slots are occupied, the client does not send additional manual bet requests. The user must wait until at least one active round finishes and frees a slot.

## Round Lifecycle

`GameScreen` owns the active presentation state:

- `activeRounds`: active displayed rounds, including manual rounds and any round currently being presented.
- `lastBet`: the latest returned bet for the sidebar summary.

When a manual bet response returns:

1. Settle the displayed bet amount from the returned bet.
2. Store the returned bet as `lastBet`.
3. Append a new active manual round with its immutable `bet`, `rows`, `risk`, animation key, and timing metadata.
4. Return from the manual place-bet flow immediately so the button can become clickable again if the active-round cap is not full.

Each active manual round completes independently:

1. Its ball reaches the result bucket, or completes immediately when animation is disabled.
2. Result sounds and bucket-hit sounds run for that bet.
3. The current-user balance is updated from that bet's `balanceAfter`.
4. The configured result pause completes.
5. The round is removed from `activeRounds`, freeing one slot.

Auto rounds preserve the current awaitable lifecycle. `handleBetPlaced()` still returns a promise for auto mode, and that promise resolves only after the auto round presentation and result pause finish.

## Rendering

`PlinkoBoard` receives an array of active rounds instead of relying on a single `lastBet` for animation.

The canvas renderer draws one board and multiple active balls in a single animation loop. Each active ball uses the immutable path derived from the returned bet and the rows/risk that were active when the bet was placed.

Rows and risk changes are disabled while any manual round is active. This prevents older balls from being displayed on a board layout that no longer matches their path. Bet amount remains editable when no request is pending.

The active result bucket state can support multiple highlighted buckets. If several active rounds finish close together, all currently paused result buckets should remain visible until their own result pauses finish.

## Sidebar Controls

`GameSidebar` receives:

- `activeManualRoundCount`
- `manualRoundLimit`, fixed at `10`
- a manual cap/full flag derived from `activeManualRoundCount >= manualRoundLimit`

Manual mode disables only the interactions that would break active presentation:

- Disable Bet while a manual request is pending.
- Disable Bet while the active manual round cap is full.
- Disable rows/risk/mode changes while active manual rounds exist.
- Disable animation toggle while active manual rounds exist so in-flight visual timing does not change mid-round.
- Keep bet amount editable while active manual rounds exist, unless a request is pending.

Auto mode keeps the current behavior: while auto-play is running, the button is used to stop auto-play and displays auto progress.

## State and Boundaries

The concurrency rule belongs to the game screen/sidebar state boundary, not the API layer:

- The API still places one bet per request.
- `usePlaceBet` continues to own the request mutation and amount settlement callback.
- `GameScreen` owns active returned rounds because it coordinates presentation, sounds, balance updates, and completion timing.
- `PlinkoBoard` owns drawing active balls and reporting per-round animation completion.

This keeps server communication separate from display concurrency.

## Error Handling

If a manual request fails, no active round is added and no slot is consumed. The existing sidebar error message displays the failure.

If a manual request succeeds while the active round count is below 10, the returned bet is always displayed. Because new requests are blocked while the active count is 10, there is no client-side returned-round overflow queue.

If the user toggles settings before a response returns, the returned manual round uses the rows/risk sent in the request payload, not whatever selectors contain at response time.

## Testing

Implementation should include focused tests or verifications for:

- Manual mode allows a second bet after the first server response returns while the first animation continues.
- Manual button text shows `Playing... (N/10)` while manual rounds are active.
- Manual button remains enabled while `N < 10` and no request is pending.
- Manual button disables at `N >= 10` and does not send additional requests.
- Rows/risk/mode and animation toggle are locked while manual rounds are active.
- Auto mode remains sequential and unchanged.
- Multiple active balls render together and complete independently.
- Balance updates still use each bet's returned `balanceAfter`.

## Out of Scope

- Changing server APIs.
- Allowing multiple unresolved manual requests at once.
- Making auto-play concurrent.
- Queuing returned bets behind full animation slots.
- Supporting simultaneous active balls across different rows/risk board layouts.
