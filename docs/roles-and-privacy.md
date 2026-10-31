# Roles, permissions and data privacy

## Roles

| Role | Side | Description |
|---|---|---|
| **Project Lead** | Client (German Company) | Responsible for project delivery. Configures purchase orders, assigns consultants, reviews detailed bookings, approves proofs of work (*Leistungsnachweise*), and monitors real-time burn forecasts. |
| **Purchasing / Finance** | Client (German Company) | Responsible for commercial governance. Monitors macro-level budget consumption across orders and receives automated 4-week reorder alerts. |
| **External Consultant** | Supplier (Vendor Agency) | Responsible for delivering project work. Views only assigned orders and logs deliverable hours/days with work descriptions. |

## Role matrix

`✔` = allowed, `–` = not allowed, `Σ` = only aggregated values (no individual details)

| Action or data | Project Lead (Client) | Purchasing (Client) | External Consultant (Supplier) |
|---|:---:|:---:|:---:|
| **Create & configure Purchase Order** | `✔` | `✔` | `–` |
| **Assign consultants to order** | `✔` | `–` | `–` |
| **Book working time on assigned order** | `–` | `–` | `✔` |
| **View individual bookings & descriptions** | `✔` | `–` | `✔` *(own bookings only)* |
| **View aggregated budget burn & forecast** | `✔` | `Σ` | `–` |
| **Receive 4-week reorder radar warning** | `✔` | `✔` | `–` |
| **Approve / reject proof of work** | `✔` | `–` | `–` |

## Personal data

| Data | Why we store it | Who needs it | How long we keep it |
|---|---|---|---|
| **Consultant Name & Email** | Authentication and order assignment. | Project Lead, Consultant | Contract duration + 30 days. |
| **Daily Hours & Work Description** | Verification of delivered work packages against purchase order budget. | Project Lead, Consultant *(Purchasing never sees this)* | Statutory tax retention period (10 years under German § 147 AO / HGB). |
| **Planned Absences (Vacation)** | Forecasting project pace and Christmas shutdown. | Stored as **anonymous capacity** (e.g. "KW 51: 0 PD capacity"), not individual personal vacation logs. | Duration of active purchase order. |

## Conflicts and how we resolve them

1. **Transparency for Project Lead vs. Privacy of the Consultant:**
   * *Conflict:* Project Leads need transparency to verify deliverables, but enterprise Purchasing should not track individual consultant work habits.
   * *Resolution:* Purchasing gets **aggregated values only (`Σ`)**. They can see total Person-Days consumed and the burn rate of the order, but individual names, dates, and work notes are filtered out.
2. **Client Control vs. *Scheinselbstständigkeit* (Co-Employment Risk):**
   * *Conflict:* If the German client monitors exact minute-by-minute clock-in/out times or presence, it triggers severe legal liabilities under German labor law (illegal employee integration).
   * *Resolution:* Orvix tracks **deliverables and person-days per purchase order**, leaving employee attendance management strictly to the supplier agency.

## How it is enforced

* **Server-Side Enforcement:** Permissions are enforced on the server using Next.js Server Actions and Route Handlers. 
* **Non-Bypassable:** Hiding buttons in the React UI is purely for user experience. Any direct API or form manipulation attempting unauthorized access is rejected on the server with `HTTP 403 Forbidden`.
