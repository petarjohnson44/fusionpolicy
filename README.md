# Reclaim Policy Consultation — standalone preview

**Status: static demonstration only. Not a member system, formal vote, or certified party policy register.**

This independent repository implements Policy Consultation and Formal Approval Portal v2.0.

## Preview and deployment
- Repository: https://github.com/petarjohnson44/fusionpolicy
- Planned Pages URL: https://petarjohnson44.github.io/fusionpolicy/
- GitHub Actions workflow: .github/workflows/pages.yml
- If Pages isn't enabled: Settings → Pages → Build and deployment → Source: GitHub Actions
- Local development: run 'python3 -m http.server 8000' from the root and open http://localhost:8000/.

## Prototype features
- Browse and search 76 proposals in 10 domains across 2 divisions, imported from the uploaded source.
- Read primary commitments, intended outcomes, further details and policy provenance.
- Submit demo comments, amendments, and alternative policy directions.
- View the 23 policies listed as new and requiring voting.
- Review formal Approve / Do Not Approve demo ballots. Non-approval requires a written reason.
- Re-submit a selection before a demo ballot closes; the last selection counts.
- Demo scheduling of open and close times, quorum, and threshold; submission-review controls.
- Demo receipts and administration overview.
- **Priority highlighting:** administrator demo can flag any policy as a **priority policy** (featured homepage + first in library) and/or a **priority ballot** (featured homepage + first in formal approval queue). Flags are independent and do not alter voting entitlement, deadline, tally or approval thresholds.
- **Direct admin link:** https://petarjohnson44.github.io/fusionpolicy/#admin — opens the admin demonstration (Priority highlighting tab is selected by default).
- **Fusion identity:** explicitly described as the *Members-only policy review portal of the Fusion Party of Australia*. Public access restrictions are **not** active in the static preview.
- **Visual parity:** adapted from the public Reclaim site's current `src/styles/global.css` and `src/styles/editorial.css` — Barlow, Barlow Condensed, Space Mono, white-on-purple surfaces (#1a0029 and #2e004d), magenta (#d428d4), mint (#00ddb8), muted borders and soft shadows.


## First priority policy round — October/November 2026

The member-facing first-round consultation is configured in `consultation-config.json` as four **policy areas**. Within each area the application presents one separate ballot for each policy proposal:

| Policy area | Number of individual policy proposals |
| --- | ---: |
| Solve the Housing Crisis | 10 |
| Renew Our Democracy | 8 |
| Build up Small Businesses | 8 |
| Rebuild Our Communities | 10 |
| **Total** | **36** |

* Opens **Monday 26 October 2026 at 00:00 AEDT**, stored as UTC 2026-10-25T13:00:00Z.
* Closes **Thursday 26 November 2026 at 23:59 AEDT** (the code uses the exclusive upper bound 2026-11-26T13:00:00Z = Friday 27 November at midnight AEDT).
* The ballot index and each individual ballot show the start and end dates explicitly. Other new policies remain unscheduled.
* The November review meeting is **Wednesday 2 December 2026, 6:00–8:00 pm AEDT**, to review the ballot and make final recommendations to the Executive. Google Meet URL remains a placeholder.

### Email-entry design versus real authentication

The GitHub Pages preview shows a member email entry page using **only the fictitious sample identity `demo.member@fusionpolicy.invalid`**. This is a browser-only demonstration, not access control: the sample email is intentionally public in the interface and no membership database is consulted. Simulated ballot records include this synthetic email in the session's demo data.

**Do not import actual member addresses into `policies.json`, client-side JavaScript, or any GitHub Pages asset.** When the private database is connected, its backend will check whether the submitted email is authorised and send a one-time code or link to that mailbox to verify the person controls the address. Checking whether an entered email exists in the list, without mailbox verification, permits another person to impersonate that member and would not be adequate for formal voting.

### Development boundaries

The configured ballot dates are *fixed* for these four areas in the static demonstration. The admin scheduling inputs are disabled for these records to prevent a browser-local setting from overriding the public date announcement. Adjust the version-controlled `consultation-config.json` before activation, then use formal backend change controls once live.

## Important security and governance limitations
- There is NO real authentication, database, secure server, member registry or certified vote.
- The "Admin preview" is open to anyone who can reach the site.
- Preview submissions, ballot selections **and priority flags** are saved only in the current tab's browser sessionStorage; they are not sent to a server. Priority flags set in the admin preview are **not shared across members or devices**. Two sample policies are initially highlighted for demonstration, not as authorised party priorities.
- NEVER enter real member information, personal details, sensitive political data or confidential submissions.
- Browser-enforced ballot windows are not secure and must NOT be used for genuine voting. The four area schedules are demonstrations of the requested dates and do not open an actual ballot.
- Illustrative schedules are generated relative to page open time; they do not reflect real voting dates.
- Example approval thresholds and quorum do NOT purport to be the party's actual rules.
- No result from this demo constitutes formal policy approval.
- The style is informed by the existing Reclaim website, but this is an entirely separate codebase and deployment.

## Production backend requirements (future stage)
- Separate server-side member authentication, voter eligibility snapshots, role-based administration and returning-officer authority.
- Ballot-specific immutable policy version/hash and audit trail.
- Server-enforced opening/closing deadlines and UTC timestamps.
- Database uniqueness for one current counted ballot per voter per policy ballot; controlled resubmissions only if rules permit.
- Mandatory confidentially handled reasons for non-approval and privacy-preserving reporting.
- Review whether the party requires actual ballot secrecy and design for that requirement.
- Constitution-approved eligibility, threshold, quorum, counting, cancellation, certification and dispute procedures.
- Accessibility, privacy and security testing before live voting.

**GitHub Pages is public static hosting, not a secure backend.**

## Files
- index.html — frontend shell
- styles.css — responsive Reclaim-inspired design
- app.js — browser-based demo workflow
- policies.json — 76 structured proposals, including the 23 new-policy flags
- .github/workflows/pages.yml — validation and deployment

Next steps: desktop/mobile design review, policy-data fidelity review, official ballot-governance specification, separate backend integration.
