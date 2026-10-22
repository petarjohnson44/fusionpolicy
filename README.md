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

## Important security and governance limitations
- There is NO real authentication, database, secure server, member registry or certified vote.
- The "Admin preview" is open to anyone who can reach the site.
- Preview submissions and ballot selections are saved only in the current tab's browser sessionStorage; they are not sent to a server.
- NEVER enter real member information, personal details, sensitive political data or confidential submissions.
- Browser-enforced ballot windows are not secure and must NOT be used for genuine voting.
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
