# ADR-034 — PALMI Ecosystem Business Finance Integration

- **Status:** ACCEPTED — architecture decision; implementation not started
- **Date:** 2026-11-12
- **Owners:** PALMI-D3V
- **Scope:** Financial-D3v, Sandwichies, Cupboard, PALMI Ecosystem cloud integration
- **Decision type:** Security, data ownership, integration, accounting model

## 1. Context

Financial-D3v currently uses a user-controlled FDV1 encrypted `.fdv` file as the persistent source of truth. Decrypted financial data is held in memory while a vault is unlocked. The documented cryptographic baseline is PBKDF2-SHA256 (600,000 iterations), AES-256-GCM, fresh random salt and IV, and a 15-minute inactivity auto-lock.

Sandwichies owns orders, payment states, prices and commercial operations. Cupboard owns product identity, inventory quantities and stock movements. PALMI Ecosystem / Connected Workspace launches the four local applications; it is not currently a financial ledger.

The business needs cash-basis financial tracking for Sandwichies while preserving the private personal-finance product. A cloud integration is desired, but it must not make Financial-D3v's personal vault or decrypted financial records remotely accessible.

## 2. Decision

Adopt three independent decisions:

1. **Vault separation: separate.** Personal and Business are independent encrypted vault files, with independent passwords/keys, salts, IVs, lifecycle state, backups and data domains. No shared unlocked session or cross-vault transaction.
2. **Synchronization: cloud.** Operational applications publish minimized, authenticated commercial events to a cloud integration inbox. Financial-D3v Business retrieves these events and imports them locally. The cloud transports operational facts; it never stores, receives or decrypts either Financial-D3v vault.
3. **Accounting basis: cash.** Business income is recorded when money is actually received; expenses are recorded when money is actually paid. An order, invoice, payment intention or unpaid obligation is not cash income. An unpaid bill is not a cash expense. Operational commitments may be displayed separately as pending items, not included in cash totals.

## 3. Non-negotiable security invariants

- Personal and Business vaults are separate `.fdv` files. Never merge their payloads, keys, passwords, memory state, backups or exports.
- Reuse of the FDV1 cryptographic implementation is allowed; reuse of a key, password reference, salt, IV, vault ID or unlocked state is not.
- Financial plaintext, personal or business, must not be uploaded to Firebase/Firestore, Vercel, Cloudflare, GitHub, logs, analytics, crash reports, remote Go APIs or the integration inbox.
- No `.fdv` file, vault password, derived key, decrypted ledger, bank statement, personal account identifier or personal transaction may leave the user's device.
- Cloud payloads are limited to the approved business event contract. No customer name, phone, email, delivery address, precise location, free-text notes, bank account number or personal financial detail.
- The cloud integration cannot query, unlock, backup, export or mutate a vault.
- Browser code must not contain service-account credentials, HMAC signing secrets, private keys or long-lived integration secrets.
- Use server-to-server authentication/signatures at producers and authenticated user-scoped retrieval at the inbox. Rotate/revoke credentials and reject replayed or altered events.
- Encrypt transport with HTTPS/TLS. Cloud event storage is not a vault and must be treated as a limited-retention operational queue.
- Cloud logs contain event IDs, source, result code and timestamps only; do not log full payloads or credentials.
- A Business import is not durable until the encrypted Business vault save succeeds. Acknowledge/advance the cloud cursor only after durable local save.
- Never silently mark an event as imported if the vault is locked, save fails, or the user rejects a conflict.

## 4. Ownership boundaries

| Data / action | Authoritative owner | Financial-D3v responsibility |
|---|---|---|
| Product identity, recipe and price | Sandwichies catalog | Read commercial reference and calculate reports |
| Order and order status | Sandwichies | Never infer a cash receipt from order creation/delivery |
| Payment confirmation/refund | Sandwichies trusted backend/payment operator | Record actual receipt/refund event |
| Stock quantity and movement | Cupboard | Consume approved purchase/consumption facts for analysis |
| Cash expense/payment | Business owner / source of payment evidence | Record when paid |
| Business cash ledger | Financial-D3v Business | Authoritative cash ledger and reconciliation |
| Personal ledger | Financial-D3v Personal | Remains private and independent |
| Tasks/reminders | DayFlow | May remind; does not create financial ledger entries |
| Event delivery/retry | PALMI cloud integration service | Transport only; not a ledger |

## 5. Cash-basis recognition rules

### Income
- `order.created`, `order.confirmed`, `order.preparing`, `order.delivered` and unpaid orders do not create cash income.
- A trusted `payment.received` event creates an income/cash-in record once the money has actually been received/settled according to the payment method's evidence.
- Cash collected on delivery is recognized only when collection is confirmed, not when the order is dispatched.
- A transfer is recognized only after the business confirms receipt; a customer-provided screenshot alone is not authoritative.
- Partial payments create separate receipts for the amounts actually received.
- A refund creates a cash-out/refund record when money is actually returned.
- A failed, pending, reversed-before-settlement or cancelled payment does not create income.

### Expenses and inventory
- An expense is recognized when paid, with payment date, amount, currency, category and payment method.
- An unpaid supplier invoice or purchase order is a pending commitment, not a cash expense.
- A paid inventory purchase creates one cash expense in the cash ledger and an inventory purchase fact in the operational view.
- Cupboard consumption/stock depletion is not another cash expense. It may inform product cost and operational margin analytics, but must not double-count the already-paid purchase.
- A stock adjustment is not automatically a cash movement.
- Owner contributions, withdrawals, transfers between business cash accounts and financing movements must use distinct transaction types; internal transfers must not inflate income or expenses.

### Daily close
- Daily close compares opening cash + confirmed receipts − confirmed cash disbursements = expected closing cash, by cash account/payment channel.
- Transfers are separated from cash-on-hand.
- Difference/variance is explicit and requires review; never silently auto-adjust.
- A close is a snapshot/reconciliation record, not a second income/expense posting.

### Tax/accounting caveat
This is a cash-management model for the product, not a statement that cash-basis treatment satisfies every Colombian tax, invoicing or statutory accounting requirement. Tax invoices, VAT/IVA, withholding, inventory valuation and statutory books require a separately reviewed compliance scope with a qualified Colombian accountant.

## 6. Integration architecture

```text
Sandwichies trusted backend ─┐
                             ├─> Cloud Business Event Inbox
Cupboard trusted backend ────┘       │
                                     │ authenticated pull
                                     ▼
                          Financial-D3v Business client
                                     │
                              validate / dedupe
                                     │
                               in-memory ledger
                                     │
                         user saves encrypted Business .fdv
                                     │
                           durable-save confirmation
                                     │
                            acknowledge event cursor

Financial-D3v Personal .fdv ── local only; no connection to inbox
DayFlow ── reminders/workflows only; no ledger authority
PALMI Connected Workspace ── local launcher/status; not the cloud relay
```

### Cloud service responsibilities
- Accept events only from authorized server-side producers.
- Validate schema, source identity, signature, timestamp and idempotency key.
- Store only minimized business event payloads in an isolated business tenant/namespace.
- Provide authenticated pull with cursor/acknowledgement.
- Support retry, dead-letter/quarantine, retention and credential revocation.
- Never expose a generic database query endpoint to browser clients.
- Never accept a vault upload or arbitrary financial document.

### Delivery guarantee
Use **at-least-once delivery + idempotent import**, not an unsubstantiated exactly-once claim. A stable event ID and source idempotency key prevent duplicate ledger effects. Retain events until acknowledged after local encrypted save. If the user does not open Financial-D3v, events remain queued within the configured retention period.

## 7. Version 1 event contract

Canonical JSON Schema: `docs/contracts/palmi-business-financial-event.schema.json`.

Allowed event types for the first vertical slice:
- `business.payment_received.v1`
- `business.refund_paid.v1`
- `business.expense_paid.v1`
- `business.inventory_purchase_paid.v1`

Each event includes:
- immutable `event_id`;
- `schema_version`;
- `event_type`;
- `source` and `business_id`;
- `occurred_at` in ISO-8601 UTC;
- `published_at` in ISO-8601 UTC;
- `currency` (ISO 4217);
- positive integer `amount_minor`;
- `payment_method`;
- opaque `external_reference` (order/payment/purchase ID; no customer PII);
- `idempotency_key`;
- optional allowlisted, non-identifying metadata.

Money is integer minor units; no floating-point monetary values. Amount sign is represented by event type, not by negative amounts. All events must refer to the same configured business tenant. Reject unknown fields and unknown event types by default.

### Producer mapping
- Sandwichies emits `payment_received` only after trusted payment confirmation. Emit `refund_paid` only after refund completion. It does not emit revenue on order creation.
- Cupboard/Sandwichies purchase workflow emits `inventory_purchase_paid` only after purchase payment is confirmed. Cupboard's stock movement remains authoritative for quantity; the event does not authorize a second expense.
- General business payments emit `expense_paid` from an approved source/owner action, with evidence/reference and category code. Do not infer payment from an unpaid purchase or inventory adjustment.

## 8. Authentication and tenant isolation

- Producers authenticate to the cloud inbox using server-held credentials or a managed workload identity; sign each event with a rotatable key or equivalent asymmetric signature.
- Financial-D3v users authenticate to the inbox using a dedicated business integration identity and explicit business membership/authorization. Firebase Auth may identify a user but is never a vault encryption key.
- Bind user identity to an authorized `business_id`; do not trust a client-supplied tenant ID alone.
- Separate production, test and development tenants/credentials.
- Do not reuse Sandwichies or Cupboard service-account credentials in browser code.
- Verify signatures over canonical serialized payload bytes; reject timestamp skew outside policy and replayed IDs.
- Define key rotation, revocation, rate limits and audit records before production enablement.

## 9. Import, persistence and recovery protocol

1. Unlock Business vault locally.
2. Fetch the next event batch using an authenticated cursor.
3. Validate schema, tenant, signature metadata, source and timestamp.
4. Stage events in memory; classify duplicates/conflicts.
5. Map each event to the Business ledger using stable source + event ID.
6. Show a review summary for new, duplicate, rejected and conflicting events.
7. User confirms import; apply to in-memory Business state.
8. Save/re-seal the Business `.fdv` file.
9. Verify save completion and file integrity.
10. Acknowledge the event IDs/cursor to cloud only after successful durable save.

If the app closes before step 10, the cloud may redeliver. The local idempotency registry ensures no duplicate financial effect. If vault save fails, do not acknowledge. If the user rejects an event, quarantine/reject with a reason; do not silently discard it.

## 10. Consequences

### Positive
- Personal finances remain isolated and private.
- Business operations can synchronize from cloud sources.
- Financial-D3v becomes the authoritative business cash ledger without taking over orders or inventory.
- Event IDs, evidence references, timestamps and reconciliation improve traceability.
- Cloud provider can change without changing the vault format.

### Costs / limitations
- Business finance requires its own vault lifecycle, backup/recovery UX and access controls.
- Cloud event inbox needs secure backend implementation, monitoring, retention and operational ownership.
- A local Business vault is not automatically available on every device; encrypted backup/export or a separately reviewed encrypted sync design is needed.
- If Financial-D3v is closed or offline, business events remain pending and dashboards are not real-time.
- Cash-basis reports do not equal statutory accounting or tax filings.
- Cloud inbox data is still sensitive business data even after PII minimization.

## 11. Rejected alternatives

- **One combined personal/business vault:** rejected due to larger blast radius, accidental cross-domain reporting and shared recovery risk.
- **Upload encrypted .fdv to Vercel/Firebase/Cloudflare:** rejected; cloud is not the vault backup or sync provider in this ADR.
- **Remote plaintext financial database:** rejected; violates the current Financial-D3v privacy invariant.
- **Direct browser-to-Firebase writes:** rejected; no trusted producer validation or controlled event semantics.
- **Treat orders as income:** rejected; order lifecycle does not prove receipt of money.
- **Treat stock consumption as cash expense:** rejected; it duplicates paid inventory purchases.
- **DayFlow as ledger:** rejected; it owns workflow/reminders, not financial truth.

## 12. Implementation plan and exit gates

### Phase 34.1 — Domain and vault isolation
- Define Business vault identity, schema namespace, independent key lifecycle and backup UX.
- Reuse FDV1 crypto primitives only after confirming format compatibility and migration safety.
- Add explicit Personal/Business mode selection and visible active-vault indicator.
- Ensure lock/unlock, timeout, import/export and recovery operate independently.
- Tests: cross-vault isolation, wrong-key rejection, no cross-domain aggregation, lock clears each active state.

### Phase 34.2 — Cash ledger
- Add business cash accounts, income receipts, refunds, paid expenses, owner contributions/withdrawals and internal transfers.
- Add integer minor-unit money and currency invariants.
- Add source reference, evidence reference, event ID and reconciliation status.
- Implement daily closing and channel-level reconciliation.
- Tests: partial payments, unpaid orders excluded, refunds, duplicate events, transfer neutrality, inventory purchase not double-counted.

### Phase 34.3 — Event inbox contract and cloud service
- Implement JSON Schema validation, tenant isolation, signature verification, idempotency, cursor, acknowledgement, retry and quarantine.
- Use separate development/staging/production credentials.
- Define retention and deletion policies; default 30-day operational retention is a proposal requiring approval before deployment.
- Tests: invalid signature, replay, tenant mismatch, unknown fields, stale timestamp, duplicate ID, cursor recovery, rate limiting.

### Phase 34.4 — Sandwichies producer
- Publish payment-received and refund-paid events from trusted server-side transitions only.
- Do not publish customer identity, address, phone, email, cart details or notes.
- Verify payment state and refund completion semantics.
- Tests with synthetic orders/payments; no real customer orders or production enablement.

### Phase 34.5 — Cupboard/purchase producer
- Define purchase paid event ownership and ensure purchase is not posted twice.
- Keep stock quantity/movements in Cupboard.
- Send only purchase totals, currency, paid date, category/reference and approved non-PII metadata.
- Tests with synthetic purchase/movement data.

### Phase 34.6 — Financial-D3v Business importer
- Authenticated pull, local validation, preview, duplicate/conflict review and explicit import.
- Save encrypted Business vault before acknowledgement.
- Recovery from app crash, failed save and redelivery.
- Tests: at-least-once delivery, no duplicate ledger effect, no acknowledgement before save.

### Phase 34.7 — Reconciliation and release
- Daily close, cash/transfer reconciliation, exception queue and audit trail.
- Verify PWA/offline behavior, two-vault isolation, backup/restore and security audit.
- Complete manual save → lock → reopen with synthetic Business vault.
- Complete end-to-end staging tests and independent security review.
- Production release requires explicit owner approval.

## 13. Release blockers / prohibited actions

Until separately authorized:
- Do not enable Sandwichies customer orders.
- Do not deploy or change Cloudflare Worker, Firebase rules, Vercel environment variables or production integrations.
- Do not create/enable paid cloud resources or billing.
- Do not import real bank statements or personal finance data into Business.
- Do not run live financial events or mutate inventory.
- Do not claim production-ready, real-time or fully reconciled status before end-to-end evidence.

## 14. Acceptance criteria

The architecture is accepted for implementation when:
- Personal and Business vaults can be unlocked, saved, locked and recovered independently.
- No personal vault data or key is transmitted to cloud.
- Cloud inbox accepts only signed, schema-valid, tenant-authorized business events.
- No event is acknowledged before successful encrypted Business vault save.
- Duplicate/replayed events have no duplicate ledger effect.
- Cash income/expenses reflect actual receipt/payment, not order or obligation status.
- Inventory purchases and consumption do not double-count cash expenses.
- Daily close reconciles by account/channel and exposes variances.
- Security audit confirms no plaintext financial persistence or transport.
- All release gates have reproducible test evidence and explicit owner approval.

---

**Decision summary:** Financial-D3v Personal stays local and private. Financial-D3v Business is a separate encrypted ledger that consumes minimized cloud-delivered commercial events. The cloud is an event transport, never a financial vault.
