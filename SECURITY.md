# Security Policy

## Scope

This repository is a **static tools-shelf hub** (HTML/CSS/JS) for [moribundmurdoch.github.io](https://moribundmurdoch.github.io/). It does not run a backend. Individual webapps (e.g. MorTweetSRS, MorAlgorithms) live in **their own repos**. Report vulnerabilities against the project that actually owns the code.

## What we care about

- XSS, open redirects, or other issues that could harm people who open pages from this site or its linked apps
- Supply-chain problems in dependencies (if any appear later)
- Anything that would let a third party sabotage the repo, Pages deploy, or contributors

We do **not** treat the following as security issues:

- Style opinions, feature requests, or “this could be prettier”
- Theoretical risks with no realistic exploit path on a static Pages site
- Social drama dressed up as a vulnerability report (see [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md))

## Rules of engagement for reports

Same spirit as the Code of Conduct:

1. **Evidence over vibes.** Show steps to reproduce, affected URL/path, and impact.
2. **Directness is fine.** Blunt technical writeups are welcome; performative panic is not.
3. **No time-wasting theater.** Do not publicly dump 0-days for clout. Do not demand ransom. Do not spam issues.
4. **Maintainable fixes preferred.** A patch or clear remediation beats a vague alarm.

## How to report

**Preferred:** private disclosure when the issue is real and exploitable.

- Email: **[No Email Ready Yet]**
- Until that exists: use [GitHub private vulnerability reporting](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing-information-about-vulnerabilities/privately-reporting-a-security-vulnerability) on this repository if enabled, or open a minimal public issue that does **not** include a full exploit chain if the risk is low (static site).

Include:

- What is broken
- How to reproduce
- What an attacker could do
- Affected commit / URL if known
- Optional: a patch or suggested fix

## Response expectations

The maintainer's time is limited. Reports that are clear and technical will be prioritized. Reports that are mostly social friction or noise may be closed without ceremony.

There is no formal SLA and no bug bounty on this hub unless one is announced later.

## Supported versions

Only the current `main` branch (what GitHub Pages deploys) is considered supported. Old commits are history, not a support matrix.
