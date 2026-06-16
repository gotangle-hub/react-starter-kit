# Tangle — Build Manual (for Claude Code)

Tangle is a mobile app for designers — a place to be matched, collaborate, get discovered, and get hired. This file is the **single source of truth**. Build to it exactly; do not invent screens, copy, or behaviour that isn't here. If something is ambiguous, ask before guessing.

## How to use this document
- **Read "Global Systems" first.** G1–G15 are app-wide rules. Each screen lists which ones it depends on. They are non-negotiable.
- **Every screen ships in BOTH light and dark mode** (see Colour tokens / G15).
- Screens are grouped by **account-type journey** in sequence. Screens repeat across journeys where the experience is shared — that is intentional.
- The `code` after each screen title is its stable component name — reuse the same component across journeys.

## Tech & conventions
- Mobile-first. Phone-sized frames (390×844 reference).
- Suggested stack: React + Tailwind (or the project's existing stack). Keep components small and reused.
- Persist session, onboarding-seen flag, and theme locally (see G1, G12).
- Never display placeholder/dummy data in the shipped product (G14).
- The technology powering search/recommendations is **never named in UI copy** (G4).

---

# Global Systems (G1–G15) — read first

### G1 · Stay signed in
Users sign in once and stay logged in. Persist the session token securely on the device; on every app open, restore the last session and land the user on their home tab — never show the sign in screen again unless they explicitly log out or the token is revoked. Do not require re-login between sessions.

### G2 · Personalised feed & people algorithm
Every user has a personalised ranking model. The Home feed, Explore feed and Match/swipe deck are ordered per user from their behaviour — disciplines they view, pieces they pin or save, people they connect with, time spent, and stated fields. It surfaces work the user is likely to care about and recommends people (to connect with, hire, or collaborate) accordingly, and keeps adapting as they use the app. Cold start: seed from the disciplines and fields chosen at signup.

### G3 · Virality / reach engine
Posts can go viral. Track an engagement-velocity signal per post (saves, pins, comments, shares, dwell, connection requests it drives, all relative to time since posting and the author audience size). When a post accelerates past normal, progressively widen its distribution beyond the author’s followers into Explore and relevant users’ feeds — so genuinely strong work can break out regardless of follower count. Decay reach as velocity falls.

### G4 · Smart search (never call it by name)
All search, for every account type, is intelligently powered — but the powering technology must NEVER be named anywhere in the UI copy. Search understands intent and meaning, not just keywords. Searching “chair” returns every relevant chair — chair projects, chair photos, chairs inside larger projects, makers known for chairs — even when the literal word “chair” isn’t in the caption. The same intelligence powers people search, visual search (search by image), and competition search.

### G5 · Competition search — live world scan
The competitions page is presented as continuously scanning the whole world for live design competitions and open calls. It visibly refreshes/repopulates as new results come in. Active filters are available to ALL users: field/discipline, location, deadline, prize, eligibility. Each competition card has: Pin, Interested, See who’s interested (a Pro-only feature), and Create collaboration. Students get the SAME competition experience (live world scan + the same pin / find-partner / interested / create-collaboration options) on their Student competitions page.

### G6 · Advertising & boosted content
Anything advertised/boosted is always shown first to all users — but woven in cleverly, never dumped all at once. Interleave one boosted item among several organic items (roughly 1-in-5, spacing them out), label them subtly as promoted, and keep them relevant to the viewer via G2. If a user pays to advertise (the Promote/boost flow): they pick what to boost, audience, duration and budget, confirm payment, and the item immediately enters the boosted pool with live reach stats. The ad/boost flow must fully work end to end — selection → payment → live placement → stats.

### G7 · Pull to refresh
Every feed and list refreshes when the user pulls the page down, exactly like Instagram — a pull-down gesture at the top triggers a refresh spinner and reloads newest content. Applies to Home, Explore, Community, competitions, messages, notifications, talent pool, search results, saved, classes, profiles.

### G8 · Chat keyboard must persist
Known past bug to avoid: in any chat, after sending the FIRST message the keyboard must NOT dismiss. Keep the text input focused and the keyboard open after send so the user can keep typing without tapping the field again. The keyboard only dismisses when the user deliberately taps outside it. This applies to every chat between every account type — direct messages, group collaboration chats, class group chats, comments.

### G9 · Uploads & automatic compression
Users upload photos and video (and PDFs). Enforce a reasonable maximum file size per type. If an upload exceeds the limit, an embedded compressor automatically reduces it to within the limit BEFORE saving — and the oversized original is never stored, only the compressed version is kept. The “link your work” / PDF path lets a user upload a PDF; the app extracts the individual projects from it and places them as images. Show clear progress and the final compressed size.

### G10 · Collaboration planning tools
Every collaboration chat has built-in planning features embedded — shared brief, tasks/checklist, milestones & timeline, roles for each member, file sharing and shared references/pins. Collaborations support GROUPS (more than two people). These planning tools are assistive and live inside the group chat.

### G11 · Automatic verification (yellow tick)
The yellow verification tick is granted by an automatic identity-verification process — the user submits the required proof and the system verifies them and awards the tick without manual review. Surface clear states: not started → submitted/checking → verified. Do not flip an unverified user to verified manually.

### G12 · Welcome dialog & tour — once only
The welcome community dialog and the coachmark tour are shown EXACTLY ONCE, right after a user first signs up. Persist a per-user “onboarding seen” flag the moment they finish or skip; never show either again on subsequent logins or app opens.

### G13 · Institution login — auto-detect system & role
On the institution path the user types their institution into a predictive search that autocompletes the name. Once selected, the app determines which login system that institution uses (e.g. if the college runs on Google Workspace, log in with Google; if Microsoft, use Microsoft, etc.) and routes the user through that provider. After authenticating with the institution email, the app auto-detects whether the person is FACULTY or a STUDENT and sends them to the matching profile setup. A prominent “Register your institution” option lets unlisted schools submit an interest form that is emailed to the Tangle team for follow-up.

### G14 · No placeholder content
Remove all placeholder/dummy text — invented sample names, fake handles, lorem ipsum, stand-in stats — from every account type. Ship real empty states and the user’s real data; never leave seeded demo names in the live product.

### G15 · Light & dark mode — both required
Every screen must be built in BOTH light and dark mode. Tokens swap, they are not separate designs. The app follows the user’s phone (system) appearance setting automatically: it opens in dark mode when the device is set to dark and light mode when the device is set to light, detects this on first launch, and switches live if the user changes their phone setting while the app is open. A manual light/dark override may also live in settings, but the default behaviour is to follow the system. Dark-mode rules: black text → beige; brand blue ↔ brand yellow swap (blue elements become yellow, yellow elements become blue) EXCEPT the verified tick stays as-is; the Tangle logo becomes beige with the dot and the “t” in yellow; if a user has no banner it takes the page background colour for the current mode. Light-mode splash: beige background, the “.t” is blue, the loading ring is yellow; dark-mode splash: the “.t” is yellow and the loading ring is blue.

---

# Colour tokens (light & dark · G15)

**Light** — bg `#FAF7F0`, card `#FFFFFF`, ink `#161514`, brown `#6E665B`, blue `#0107FF`, yellow `#F4D738`, line `#ECE4D4`.

**Dark** — bg `#3A342D`, card `#463E36`, ink `#F3ECE0`, brown `#9C9387`, blue→`#F4D738`, yellow→`#0107FF`, line `rgba(243,236,224,.14)`.

Dark-mode rules: blue and yellow **swap**; black ink becomes beige; the **verified tick never swaps**; the Tangle logo becomes beige with the dot and the "t" in yellow; a user with no banner takes the page background for the current mode. Splash: light = beige bg, blue ".t", yellow loading ring; dark = yellow ".t", blue loading ring.


---

## Journey — Designer
*Individual maker — the full product · 99 screens, in journey order*

**01 · Brand splash on launch.**  `Splash`  — _depends on: G1_
Centred Tangle logo with the dot before the “t”; only the “t” is coloured (blue in light, yellow in dark). A loading ring spins below (yellow ring in light mode on a beige bg; blue ring in dark mode). Auto-advance to onboarding once loaded; if a session exists, skip straight to Home (G1).

**02 · First welcome slide.**  `Carousel1`
Full-screen intro communicating Tangle’s mission — a home where designers are matched, collaborate and get discovered. Large serif headline, supporting line, progress dots, Next. No placeholder names.

**03 · Second welcome slide.**  `Carousel2`
Full-screen slide about showing your process and your journey, and giving and getting valuable feedback — the value of the community. Progress dots, Next/Back.

**04 · Choose your account type.**  `AccountType`
Options: Designer, Client, Institution, Collector. Selecting Designer animates the other options sliding down and reveals two sub-choices dropping in — Individual and Studio — then routes to plan selection. Include the Collector option (a browse-only account; live now, not “coming soon”). No type is preselected.

**05 · Sign in.**  `SignIn`  — _depends on: G1_
Email + password and social sign-in. On success, persist session and go to Home (G1). “Forgot password” path. This screen is only reachable when logged out.

**06 · Designer plans.**  `Plans`
Designer Free vs Pro comparison with real pricing (VAT-inclusive note). Free shows two active collaborations and excludes the smart-search perks reserved for Pro; Pro adds unlimited swipes, who-liked-you, advanced filters, full salary database. Monthly/annual toggle. Highlighted Pro card matches in both modes (G15).

**07 · Create your designer profile.**  `Signup`
Fields: name, location, and disciplines covering ALL design fields as selectable options plus an “Other” option with a free-text box. No “spatial”-only limitation, no portfolio/work upload on this page (that comes later). Continue to the legal consent step.

**08 · Add your work.**  `ProfileBuild`  — _depends on: G9_
Upload step where the new designer adds their first work (photos/video, or link a PDF) per G9, and ticks the legal checkboxes. This is the only profile-build step (no repeated second page).

**09 · Legal consent — designer.**  `DesignerConsent`
Final step before the account is created. Exactly 3 combined checkboxes: (1) conduct — own work, no plagiarism, credit parties, honesty & keeping promises; (2) platform protection (bold) — won’t copy/clone/imitate Tangle’s idea/concept/design/brand/platform or build a competitor, and Tangle isn’t responsible for payments/agreements between members; (3) agree to Terms & Conditions, Privacy Policy and Copyright Policy (all linked). All must be ticked to enable “Agree & create account”.

**10 · Welcome — community message (shown once).**  `WelcomeToTangle`  — _depends on: G12_
Celebratory full-screen welcome shown immediately after the account is created, with a rectangular message about building a community on ideas, making work with shared passion, crediting each other, and keeping it fair. Shown once only (G12). “Start exploring” continues into the tour.

**11 · Coachmark tour step (shown once).**  `TourDesigner1`  — _depends on: G12_
Bubble call-out coachmark, part of the once-only first-run tour (G12). The screen behind is dimmed with a spotlight on the element being explained and a white bubble with a step number, “Step N of T”, progress dots, a Skip link and a Next button (last step says “Got it”; the first is a centred Welcome card with a Start button). This step: welcome.

**12 · Coachmark tour step (shown once).**  `TourDesigner2`  — _depends on: G12_
Bubble call-out coachmark, part of the once-only first-run tour (G12). The screen behind is dimmed with a spotlight on the element being explained and a white bubble with a step number, “Step N of T”, progress dots, a Skip link and a Next button (last step says “Got it”; the first is a centred Welcome card with a Start button). This step: find people.

**13 · Coachmark tour step (shown once).**  `TourDesigner3`  — _depends on: G12_
Bubble call-out coachmark, part of the once-only first-run tour (G12). The screen behind is dimmed with a spotlight on the element being explained and a white bubble with a step number, “Step N of T”, progress dots, a Skip link and a Next button (last step says “Got it”; the first is a centred Welcome card with a Start button). This step: explore.

**14 · Coachmark tour step (shown once).**  `TourDesigner4`  — _depends on: G12_
Bubble call-out coachmark, part of the once-only first-run tour (G12). The screen behind is dimmed with a spotlight on the element being explained and a white bubble with a step number, “Step N of T”, progress dots, a Skip link and a Next button (last step says “Got it”; the first is a centred Welcome card with a Start button). This step: add work.

**15 · Coachmark tour step (shown once).**  `TourDesigner5`  — _depends on: G12_
Bubble call-out coachmark, part of the once-only first-run tour (G12). The screen behind is dimmed with a spotlight on the element being explained and a white bubble with a step number, “Step N of T”, progress dots, a Skip link and a Next button (last step says “Got it”; the first is a centred Welcome card with a Start button). This step: messages.

**16 · Home.**  `Dashboard`  — _depends on: G2, G7, G6_
The designer’s personalised home feed (G2). Pull to refresh (G7), boosted items woven in (G6). Top segmented control to switch home views.

**17 · Swipe to connect.**  `Match`
A swipeable deck of designers/studios shown over their work, ordered by the algorithm (G2). Like → if mutual, you CONNECT (not collaborate) and a chat opens. Free users hit a daily cap; Pro is unlimited.

**18 · It’s a match — you connected.**  `MutualMatch`
Celebration when two people match: they are now CONNECTED. The accent blue here is the SAME blue in both light and dark mode. CTAs: open chat, view profile.

**19 · Match filters.**  `MatchFilters`
Filter who appears in the deck — discipline, location, availability, etc.

**20 · Daily swipe cap.**  `SwipeCap`
Shown when a free user hits the daily like limit — explains the cap and offers upgrade to Pro for unlimited.

**21 · Who liked you (Pro).**  `WhoLiked`  — _depends on: G7_
Grid of people who liked you — a Pro feature; locked/blurred for free users with an upgrade prompt.

**22 · Explore — full bleed.**  `ExploreMinimal`  — _depends on: G2, G7, G6, G3_
Edge-to-edge personalised feed of work (G2) with NO chrome/buttons/text over it. Pull to refresh (G7); boosted work woven in (G6); strong work can break out via G3. Tapping reveals controls (next screen).

**23 · Explore — controls revealed.**  `ExploreRevealed`  — _depends on: G2, G7, G6, G3_
Same feed after a tap: overlay controls appear — save/pin, follow maker, comment, open project, and the bottom menu. Tapping again hides them.

**24 · Project detail.**  `ProjectDetail`  — _depends on: G3_
A full project — images/video, title, maker, credits, caption, save/pin, comment, share. Engagement here feeds virality (G3).

**25 · Comments.**  `CommentsSheet`  — _depends on: G8_
Comment thread on a project. Composing a comment keeps the keyboard open after sending (G8).

**26 · Pin to a pin up.**  `PinToBoard`
Sheet to pin the current work into one of the user’s “pin ups” (boards), or create a new pin up.

**27 · Pin ups.**  `PinBoards`  — _depends on: G7_
The user’s collected boards (“pin ups”), each a grid of pinned references. Pull to refresh (G7).

**28 · Search.**  `SearchText`  — _depends on: G7, G4_
Smart search across projects, people, studios and competitions (G4) — intent-aware, never names the technology. Recent and suggested. Toggle between searching people vs projects. Pull to refresh on results (G7).

**29 · Search by image.**  `SearchVisual`  — _depends on: G4_
Entry for visual search — search using an image instead of words (G4).

**30 · Search results — “chair”.**  `VisualSearch`  — _depends on: G7, G4_
Example: searching “chair” returns a grid of every relevant chair across the platform (G4), even where the caption never says “chair”. Make clear results are by meaning, not keyword.

**31 · A result, enlarged.**  `VisualSearchDetail`  — _depends on: G4_
Tapping a search result enlarges it and shows the creator, with a path to their profile/work.

**32 · People search.**  `SearchPeople`  — _depends on: G7, G4_
Results when searching for people/makers/studios (G4) — filter by discipline, city, availability. Clear that you can search people OR projects.

**33 · Call outs.**  `ProjectsCallouts`  — _depends on: G7_
Board of call outs / open collaboration calls. Group collaborations supported (G10). Pull to refresh (G7), ads woven in (G6).

**34 · Competitions — live world scan.**  `ProjectsAI`  — _depends on: G7, G4, G5_
Per G5: presented as continuously scanning the world for live competitions, visibly refreshing; filters for ALL users (field, location, deadline, prize). Each card: Pin · Interested · See who’s interested (Pro) · Create collaboration.

**35 · Tangle competitions.**  `ProjectsTangle`  — _depends on: G7, G4, G5_
Competitions run by Tangle itself — same card actions (pin, interested, create collaboration), official styling.

**36 · Find a partner.**  `PartnerMatch`
Find collaborators for a competition/call out — browse suggested partners (G2) and invite them; supports building a group (G10).

**37 · Post a call out / brief.**  `PostCallout`
Compose a call out (designer) or brief (client): title, discipline, description, scope, budget/terms. Clients use this to post briefs.

**38 · Apply.**  `ApplyFlow`
Apply to a call out or competition — pitch + attach relevant work; leads to “Application sent”.

**39 · Community.**  `Community`  — _depends on: G2, G7, G6, G3, G8_
A thoughts feed (like a designers’ Twitter) — only Designer and Institutional accounts can post/see it. Compose box keeps keyboard open after posting (G8); feed is ranked (G2), pull to refresh (G7), virality applies (G3).

**40 · Collaborations.**  `CollabTracker`  — _depends on: G10_
Tracker of active group collaborations (G10) — each shows members, progress, and opens into its group chat with planning tools.

**41 · Collaboration brief.**  `BriefPanel`  — _depends on: G10_
The shared brief inside a collaboration — scope, tasks, milestones, roles (part of G10).

**42 · Request to connect / collaborate.**  `RequestFlow`
Send a connection or collaboration request to someone; leads to “Connection requested” / “Collab invite sent”.

**43 · Messages.**  `Inbox`  — _depends on: G7_
Unified, colour-coded inbox: connections, group collaborations, class chats, competition threads. Pull to refresh (G7).

**44 · Collaboration group chat.**  `ProjectChat`  — _depends on: G8, G10_
Group chat for a collaboration with the embedded planning tools (G10) — brief, tasks, milestones, roles, shared files/pins. Supports more than two people. Keyboard persists after the first message (G8).

**45 · Direct message.**  `DMThread`  — _depends on: G8_
1:1 chat. Keyboard persists after the first message (G8).

**46 · Notifications.**  `Notifications`  — _depends on: G7_
Likes, connection requests, comments, collaboration and class updates. Pull to refresh (G7).

**47 · Your profile.**  `DesignerProfile`  — _depends on: G7_
Banner + avatar (the avatar must never drop below the banner edge), name, disciplines, verified tick if earned, and a grid of your work. If no banner is set it takes the page background for the current mode (G15). Pull to refresh (G7).

**48 · Add to your work.**  `WorkUpload`  — _depends on: G9_
Upload photos/video with size limits and automatic compression, or link a PDF that the app extracts into project images (G9). On adding, prompt to also add to Explore (next screen).

**49 · Also add to Explore?**  `AddToExplorePrompt`
Popup after adding a piece to your work asking whether to also publish it to the Explore feed. Yes/Not now.

**50 · Invite.**  `InviteSheet`
Invite someone to connect or to a collaboration/competition.

**51 · Create.**  `CreateSheet`
Bottom-sheet create menu — add work, post a call out, start a collaboration, post to community.

**52 · Get verified (yellow tick).**  `Verification`  — _depends on: G11_
Automatic verification flow (G11): submit the required proof; states not-started → checking → verified; the tick is awarded automatically.

**53 · Your network.**  `YourNet`  — _depends on: G7_
The people you’re connected with. Pull to refresh (G7).

**54 · Salary database.**  `SalaryDB`  — _depends on: G7_
Empty at launch — the database starts with NO entries and grows only from community submissions; ship no sample/placeholder salaries (G14). Top filters for Location, Title and Field. Primary action is an “Anonymous submission” button (“Add a salary anonymously”) framed as helping spread fairness across the community. It opens a form capturing Field, Title, Pay per month and Location, never linked to the user’s account; on submit, show a thank-you confirmation. Accessible to designers, studios, institutions and students.

**55 · Anonymous submission.**  `SalarySubmit`  — _depends on: G14_
Anonymous form to contribute a salary to the community database — fields: Field, Title, Pay per month, and Location. Framed as helping spread fairness across the community; nothing is linked to the user’s account. Submit leads to a thank-you confirmation. No placeholder data (G14).

**56 · Submission received.**  `SalarySubmitted`
Thank-you confirmation after an anonymous salary submission — reinforces that every entry makes the picture clearer and pay fairer. Actions: Back to salaries, Add another. Built in both light and dark (G15).

**57 · Promote / boost.**  `Promote`  — _depends on: G6_
The advertising flow (G6): pick what to boost, set audience, duration and budget, see a price, confirm. In dark mode the profile-boost card is black to match light. Leads to checkout then “Boost live” with stats.

**58 · Billing.**  `Billing`  — _depends on: G6_
Plan, payment method, receipts/history.

**59 · Checkout.**  `Checkout`  — _depends on: G6_
Payment screen — plan/boost summary, total (VAT inclusive), pay. Leads to “Payment complete”.

**60 · Settings**  `Settings`
Build the “Settings” screen for the Designer experience, consistent with the rest of the app, in both light and dark (G15).

**61 · Edit profile.**  `EditProfileSettings`
Edit name, bio, disciplines, banner and avatar.

**62 · Username & email.**  `AccountEmail`
Change username and email.

**63 · Password & security.**  `PasswordSecurity`
Change password, two factor, sessions.

**64 · Notifications.**  `NotificationSettings`
Toggle notification categories.

**65 · Blocked accounts.**  `BlockedAccounts`
List of blocked users with unblock. Use real data, no placeholder names (G14).

**66 · Log out — are you sure?**  `LogOutConfirm`
Confirm dialog for logging out (this is the only way back to Sign in, per G1).

**67 · Delete account — are you sure?**  `DeleteAccountConfirm`
Destructive confirm with consequences spelled out.

**68 · Someone’s profile.**  `PublicProfile`  — _depends on: G7_
Another user’s public profile — their work grid, verified tick, connect/message, and the ⋯ menu (report/block).

**69 · Help & legal.**  `LegalHelp`
Hub linking Terms, Privacy, Copyright, and support.

**70 · Terms & Conditions.**  `TermsConditions`
Full terms — including acceptable use, Tangle’s IP, the “no copying our concept / no building a competitor” clause, and the payments/agreements disclaimer.

**71 · Privacy Policy.**  `PrivacyPolicy`
Full privacy policy — data collected, use, sharing, rights, retention.

**72 · Copyright Policy.**  `CopyrightPolicy`
Full copyright policy — creators keep their rights; credit-first culture; takedown/counter-notice; Tangle’s own marks & concept protected.

**73 · Safety / moderation.**  `ReportPostSheet`
Report a post — choose a reason: plagiarism, user didn’t credit teammates, plus other relevant reasons and an “Other” free-text. Goes to Tangle review. Built in both light and dark (G15).

**74 · Safety / moderation.**  `ReportPostSent`
Confirmation that the post report was sent to Tangle’s review team. Built in both light and dark (G15).

**75 · Safety / moderation.**  `ReportUserSheet`
Report a person — relevant reasons plus “Other” free-text. Goes to Tangle review. Built in both light and dark (G15).

**76 · Safety / moderation.**  `ReportUserSent`
Confirmation that the user report was sent to review. Built in both light and dark (G15).

**77 · Safety / moderation.**  `BlockSheet`
Block a person — choose from reasons, then confirm. Built in both light and dark (G15).

**78 · Safety / moderation.**  `BlockConfirm`
Are-you-sure confirm before blocking. Built in both light and dark (G15).

**79 · Safety / moderation.**  `UnconnectSheet`
Unconnect from someone — a short “tell us why”. Built in both light and dark (G15).

**80 · Safety / moderation.**  `UnconnectConfirm`
Are-you-sure confirm before unconnecting (connections, not collaborations). Built in both light and dark (G15).

**81 · Safety / moderation.**  `UncollaborateSheet`
Leave a collaboration — a “tell us why”; works for group collaborations (G10). Built in both light and dark (G15).

**82 · Safety / moderation.**  `UncollaborateConfirm`
Are-you-sure confirm before leaving a collaboration. Built in both light and dark (G15).

**83 · Safety / moderation.**  `PostActionMenu`
The ⋯ menu on any post (anywhere it appears — feed, explore, search, profile): includes Report and, where relevant, Pin/Save and Share. Built in both light and dark (G15).

**84 · Safety / moderation.**  `UserActionMenu`
The ⋯ menu on any person: includes Report, Block, and Unconnect (if connected). Built in both light and dark (G15).

**85 · Confirmation state.**  `ApplicationSent`
Confirmation after applying to a call out/competition — “application sent”, what happens next, back to opportunities. Built in both light and dark (G15).

**86 · Confirmation state.**  `RequestSent`
Confirmation after sending a connection request — pending, with undo. Built in both light and dark (G15).

**87 · Confirmation state.**  `CollabRequestSent`
Confirmation after inviting someone to a collaboration — if accepted a shared group chat opens (G10). Built in both light and dark (G15).

**88 · Confirmation state.**  `InviteAccepted`
Confirmation that a connection was accepted — you are now connected, open chat / view profile. Built in both light and dark (G15).

**89 · Confirmation state.**  `InterestedConfirm`
Confirmation after marking interest in a competition — you’re on the interested list, with “Create collaboration” and “See who’s interested (Pro)”. Built in both light and dark (G15).

**90 · Confirmation state.**  `WorkPublished`
Confirmation that a piece is live on the profile, with the option to also add it to Explore. Built in both light and dark (G15).

**91 · Confirmation state.**  `PlanUpgraded`
Confirmation of upgrade to Pro — unlocked features listed, receipt in Billing. Built in both light and dark (G15).

**92 · Confirmation state.**  `PaymentSuccess`
Payment received — plan/boost active, receipt emailed and saved to Billing. Built in both light and dark (G15).

**93 · Confirmation state.**  `BoostConfirm`
Boost is live — featured for the set duration, with a path to live reach stats (G6). Built in both light and dark (G15).

**94 · Empty state.**  `EmptyMatches`
The “no more people to swipe today” state for this surface — keeps the tab bar and header, explains what will appear here, and offers the relevant next action. Real empty state, never placeholder data (G14).

**95 · Empty state.**  `EmptyMessages`
The “no messages yet” state for this surface — keeps the tab bar and header, explains what will appear here, and offers the relevant next action. Real empty state, never placeholder data (G14).

**96 · Empty state.**  `EmptyNotifications`
The “all caught up” state for this surface — keeps the tab bar and header, explains what will appear here, and offers the relevant next action. Real empty state, never placeholder data (G14).

**97 · Empty state.**  `EmptyCollaborations`
The “no collaborations yet” state for this surface — keeps the tab bar and header, explains what will appear here, and offers the relevant next action. Real empty state, never placeholder data (G14).

**98 · Empty state.**  `EmptySearch`
The “no results for that search” state for this surface — keeps the tab bar and header, explains what will appear here, and offers the relevant next action. Real empty state, never placeholder data (G14).

**99 · Empty state.**  `EmptyWork`
The “no work added yet” state for this surface — keeps the tab bar and header, explains what will appear here, and offers the relevant next action. Real empty state, never placeholder data (G14).


---

## Journey — Studio
*A team account — hire, showcase, manage · 62 screens, in journey order*

**01 · Brand splash on launch.**  `Splash`  — _depends on: G1_
Centred Tangle logo with the dot before the “t”; only the “t” is coloured (blue in light, yellow in dark). A loading ring spins below (yellow ring in light mode on a beige bg; blue ring in dark mode). Auto-advance to onboarding once loaded; if a session exists, skip straight to Home (G1).

**02 · Choose your account type.**  `AccountType`
Options: Designer, Client, Institution, Collector. Selecting Designer animates the other options sliding down and reveals two sub-choices dropping in — Individual and Studio — then routes to plan selection. Include the Collector option (a browse-only account; live now, not “coming soon”). No type is preselected.

**03 · Sign in.**  `SignIn`  — _depends on: G1_
Email + password and social sign-in. On success, persist session and go to Home (G1). “Forgot password” path. This screen is only reachable when logged out.

**04 · Combined plan picker (studio / client).**  `PlansCombined`
Horizontal plan bar dividing the tiers equally. Studio tiers (including a free 1–5 person tier) where every tier has identical features and differs only by team size; Client tiers Free/Pro/Business. Real pricing, VAT-inclusive note. No studio account beyond the free small tier is free.

**05 · Create your designer profile.**  `Signup`
Fields: name, location, and disciplines covering ALL design fields as selectable options plus an “Other” option with a free-text box. No “spatial”-only limitation, no portfolio/work upload on this page (that comes later). Continue to the legal consent step.

**06 · Legal consent — studio.**  `StudioConsent`
Same 3-checkbox structure as designer, worded for a studio acting on behalf of the team.

**07 · Welcome — community message (shown once).**  `WelcomeToTangle`  — _depends on: G12_
Celebratory full-screen welcome shown immediately after the account is created, with a rectangular message about building a community on ideas, making work with shared passion, crediting each other, and keeping it fair. Shown once only (G12). “Start exploring” continues into the tour.

**08 · Coachmark tour step (shown once).**  `TourStudio1`  — _depends on: G12_
Bubble call-out coachmark, part of the once-only first-run tour (G12). The screen behind is dimmed with a spotlight on the element being explained and a white bubble with a step number, “Step N of T”, progress dots, a Skip link and a Next button (last step says “Got it”; the first is a centred Welcome card with a Start button). This step: welcome.

**09 · Coachmark tour step (shown once).**  `TourStudio2`  — _depends on: G12_
Bubble call-out coachmark, part of the once-only first-run tour (G12). The screen behind is dimmed with a spotlight on the element being explained and a white bubble with a step number, “Step N of T”, progress dots, a Skip link and a Next button (last step says “Got it”; the first is a centred Welcome card with a Start button). This step: studio page.

**10 · Coachmark tour step (shown once).**  `TourStudio3`  — _depends on: G12_
Bubble call-out coachmark, part of the once-only first-run tour (G12). The screen behind is dimmed with a spotlight on the element being explained and a white bubble with a step number, “Step N of T”, progress dots, a Skip link and a Next button (last step says “Got it”; the first is a centred Welcome card with a Start button). This step: find talent.

**11 · Coachmark tour step (shown once).**  `TourStudio4`  — _depends on: G12_
Bubble call-out coachmark, part of the once-only first-run tour (G12). The screen behind is dimmed with a spotlight on the element being explained and a white bubble with a step number, “Step N of T”, progress dots, a Skip link and a Next button (last step says “Got it”; the first is a centred Welcome card with a Start button). This step: post.

**12 · Coachmark tour step (shown once).**  `TourStudio5`  — _depends on: G12_
Bubble call-out coachmark, part of the once-only first-run tour (G12). The screen behind is dimmed with a spotlight on the element being explained and a white bubble with a step number, “Step N of T”, progress dots, a Skip link and a Next button (last step says “Got it”; the first is a centred Welcome card with a Start button). This step: messages.

**13 · Studio page.**  `StudioPage`  — _depends on: G7_
The studio’s public home — banner, about, team, projects grid. Pull to refresh (G7).

**14 · Add a studio project.**  `StudioProjectUpload`  — _depends on: G9_
Upload a project on behalf of the studio (G9 upload + compression), with credits to team members.

**15 · Manage team.**  `StudioTeam`
Invite and manage team members; seats scale with the plan tier. Use real invited members, no placeholders (G14).

**16 · Talent pool.**  `TalentPool`  — _depends on: G7, G4_
Searchable pool of designers to hire (G4 search). Shortlist candidates. Pull to refresh (G7).

**17 · People search.**  `SearchPeople`  — _depends on: G7, G4_
Results when searching for people/makers/studios (G4) — filter by discipline, city, availability. Clear that you can search people OR projects.

**18 · Search results — “chair”.**  `VisualSearch`  — _depends on: G7, G4_
Example: searching “chair” returns a grid of every relevant chair across the platform (G4), even where the caption never says “chair”. Make clear results are by meaning, not keyword.

**19 · Salary database.**  `SalaryDB`  — _depends on: G7_
Empty at launch — the database starts with NO entries and grows only from community submissions; ship no sample/placeholder salaries (G14). Top filters for Location, Title and Field. Primary action is an “Anonymous submission” button (“Add a salary anonymously”) framed as helping spread fairness across the community. It opens a form capturing Field, Title, Pay per month and Location, never linked to the user’s account; on submit, show a thank-you confirmation. Accessible to designers, studios, institutions and students.

**20 · Anonymous submission.**  `SalarySubmit`  — _depends on: G14_
Anonymous form to contribute a salary to the community database — fields: Field, Title, Pay per month, and Location. Framed as helping spread fairness across the community; nothing is linked to the user’s account. Submit leads to a thank-you confirmation. No placeholder data (G14).

**21 · Submission received.**  `SalarySubmitted`
Thank-you confirmation after an anonymous salary submission — reinforces that every entry makes the picture clearer and pay fairer. Actions: Back to salaries, Add another. Built in both light and dark (G15).

**22 · Home.**  `Dashboard`  — _depends on: G2, G7, G6_
The designer’s personalised home feed (G2). Pull to refresh (G7), boosted items woven in (G6). Top segmented control to switch home views.

**23 · Explore — full bleed.**  `ExploreMinimal`  — _depends on: G2, G7, G6, G3_
Edge-to-edge personalised feed of work (G2) with NO chrome/buttons/text over it. Pull to refresh (G7); boosted work woven in (G6); strong work can break out via G3. Tapping reveals controls (next screen).

**24 · Explore — controls revealed.**  `ExploreRevealed`  — _depends on: G2, G7, G6, G3_
Same feed after a tap: overlay controls appear — save/pin, follow maker, comment, open project, and the bottom menu. Tapping again hides them.

**25 · Project detail.**  `ProjectDetail`  — _depends on: G3_
A full project — images/video, title, maker, credits, caption, save/pin, comment, share. Engagement here feeds virality (G3).

**26 · Post a call out / brief.**  `PostCallout`
Compose a call out (designer) or brief (client): title, discipline, description, scope, budget/terms. Clients use this to post briefs.

**27 · Call outs.**  `ProjectsCallouts`  — _depends on: G7_
Board of call outs / open collaboration calls. Group collaborations supported (G10). Pull to refresh (G7), ads woven in (G6).

**28 · Messages.**  `Inbox`  — _depends on: G7_
Unified, colour-coded inbox: connections, group collaborations, class chats, competition threads. Pull to refresh (G7).

**29 · Collaboration group chat.**  `ProjectChat`  — _depends on: G8, G10_
Group chat for a collaboration with the embedded planning tools (G10) — brief, tasks, milestones, roles, shared files/pins. Supports more than two people. Keyboard persists after the first message (G8).

**30 · Promote / boost.**  `Promote`  — _depends on: G6_
The advertising flow (G6): pick what to boost, set audience, duration and budget, see a price, confirm. In dark mode the profile-boost card is black to match light. Leads to checkout then “Boost live” with stats.

**31 · Billing.**  `Billing`  — _depends on: G6_
Plan, payment method, receipts/history.

**32 · Checkout.**  `Checkout`  — _depends on: G6_
Payment screen — plan/boost summary, total (VAT inclusive), pay. Leads to “Payment complete”.

**33 · Studio settings**  `SettingsStudio`
Build the “Studio settings” screen for the Studio experience, consistent with the rest of the app, in both light and dark (G15).

**34 · Edit profile.**  `EditProfileSettings`
Edit name, bio, disciplines, banner and avatar.

**35 · Username & email.**  `AccountEmail`
Change username and email.

**36 · Password & security.**  `PasswordSecurity`
Change password, two factor, sessions.

**37 · Notifications.**  `NotificationSettings`
Toggle notification categories.

**38 · Blocked accounts.**  `BlockedAccounts`
List of blocked users with unblock. Use real data, no placeholder names (G14).

**39 · Log out — are you sure?**  `LogOutConfirm`
Confirm dialog for logging out (this is the only way back to Sign in, per G1).

**40 · Delete account — are you sure?**  `DeleteAccountConfirm`
Destructive confirm with consequences spelled out.

**41 · Safety / moderation.**  `PostActionMenu`
The ⋯ menu on any post (anywhere it appears — feed, explore, search, profile): includes Report and, where relevant, Pin/Save and Share. Built in both light and dark (G15).

**42 · Safety / moderation.**  `UserActionMenu`
The ⋯ menu on any person: includes Report, Block, and Unconnect (if connected). Built in both light and dark (G15).

**43 · Safety / moderation.**  `ReportPostSheet`
Report a post — choose a reason: plagiarism, user didn’t credit teammates, plus other relevant reasons and an “Other” free-text. Goes to Tangle review. Built in both light and dark (G15).

**44 · Safety / moderation.**  `ReportPostSent`
Confirmation that the post report was sent to Tangle’s review team. Built in both light and dark (G15).

**45 · Safety / moderation.**  `ReportUserSheet`
Report a person — relevant reasons plus “Other” free-text. Goes to Tangle review. Built in both light and dark (G15).

**46 · Safety / moderation.**  `ReportUserSent`
Confirmation that the user report was sent to review. Built in both light and dark (G15).

**47 · Safety / moderation.**  `BlockSheet`
Block a person — choose from reasons, then confirm. Built in both light and dark (G15).

**48 · Safety / moderation.**  `BlockConfirm`
Are-you-sure confirm before blocking. Built in both light and dark (G15).

**49 · Safety / moderation.**  `UnconnectSheet`
Unconnect from someone — a short “tell us why”. Built in both light and dark (G15).

**50 · Safety / moderation.**  `UnconnectConfirm`
Are-you-sure confirm before unconnecting (connections, not collaborations). Built in both light and dark (G15).

**51 · Safety / moderation.**  `UncollaborateSheet`
Leave a collaboration — a “tell us why”; works for group collaborations (G10). Built in both light and dark (G15).

**52 · Safety / moderation.**  `UncollaborateConfirm`
Are-you-sure confirm before leaving a collaboration. Built in both light and dark (G15).

**53 · Confirmation state.**  `ApplicationSent`
Confirmation after applying to a call out/competition — “application sent”, what happens next, back to opportunities. Built in both light and dark (G15).

**54 · Confirmation state.**  `CollabRequestSent`
Confirmation after inviting someone to a collaboration — if accepted a shared group chat opens (G10). Built in both light and dark (G15).

**55 · Confirmation state.**  `InviteAccepted`
Confirmation that a connection was accepted — you are now connected, open chat / view profile. Built in both light and dark (G15).

**56 · Confirmation state.**  `WorkPublished`
Confirmation that a piece is live on the profile, with the option to also add it to Explore. Built in both light and dark (G15).

**57 · Confirmation state.**  `PlanUpgraded`
Confirmation of upgrade to Pro — unlocked features listed, receipt in Billing. Built in both light and dark (G15).

**58 · Confirmation state.**  `PaymentSuccess`
Payment received — plan/boost active, receipt emailed and saved to Billing. Built in both light and dark (G15).

**59 · Confirmation state.**  `BoostConfirm`
Boost is live — featured for the set duration, with a path to live reach stats (G6). Built in both light and dark (G15).

**60 · Empty state.**  `EmptyMessages`
The “no messages yet” state for this surface — keeps the tab bar and header, explains what will appear here, and offers the relevant next action. Real empty state, never placeholder data (G14).

**61 · Empty state.**  `EmptyCollaborations`
The “no collaborations yet” state for this surface — keeps the tab bar and header, explains what will appear here, and offers the relevant next action. Real empty state, never placeholder data (G14).

**62 · Empty state.**  `EmptySearch`
The “no results for that search” state for this surface — keeps the tab bar and header, explains what will appear here, and offers the relevant next action. Real empty state, never placeholder data (G14).


---

## Journey — Client
*Hire creatives — post, search, shortlist · 49 screens, in journey order*

**01 · Brand splash on launch.**  `Splash`  — _depends on: G1_
Centred Tangle logo with the dot before the “t”; only the “t” is coloured (blue in light, yellow in dark). A loading ring spins below (yellow ring in light mode on a beige bg; blue ring in dark mode). Auto-advance to onboarding once loaded; if a session exists, skip straight to Home (G1).

**02 · Choose your account type.**  `AccountType`
Options: Designer, Client, Institution, Collector. Selecting Designer animates the other options sliding down and reveals two sub-choices dropping in — Individual and Studio — then routes to plan selection. Include the Collector option (a browse-only account; live now, not “coming soon”). No type is preselected.

**03 · Create a client account.**  `ClientSignup`
Name, email, password, and client type (developer / private client / event / brand / agency). Continue to client consent.

**04 · Legal consent — client.**  `ClientConsent`
3 checkboxes: (1, bold) deliver what you promise, honour agreements with designers, honest briefs, fair terms, pay hired people directly and on time, respect their IP and credit; (2, bold) platform protection + Tangle not responsible for payments; (3) agree to the policies.

**05 · Welcome — community message (shown once).**  `WelcomeToTangle`  — _depends on: G12_
Celebratory full-screen welcome shown immediately after the account is created, with a rectangular message about building a community on ideas, making work with shared passion, crediting each other, and keeping it fair. Shown once only (G12). “Start exploring” continues into the tour.

**06 · Coachmark tour step (shown once).**  `TourClient1`  — _depends on: G12_
Bubble call-out coachmark, part of the once-only first-run tour (G12). The screen behind is dimmed with a spotlight on the element being explained and a white bubble with a step number, “Step N of T”, progress dots, a Skip link and a Next button (last step says “Got it”; the first is a centred Welcome card with a Start button). This step: welcome.

**07 · Coachmark tour step (shown once).**  `TourClient2`  — _depends on: G12_
Bubble call-out coachmark, part of the once-only first-run tour (G12). The screen behind is dimmed with a spotlight on the element being explained and a white bubble with a step number, “Step N of T”, progress dots, a Skip link and a Next button (last step says “Got it”; the first is a centred Welcome card with a Start button). This step: post brief.

**08 · Coachmark tour step (shown once).**  `TourClient3`  — _depends on: G12_
Bubble call-out coachmark, part of the once-only first-run tour (G12). The screen behind is dimmed with a spotlight on the element being explained and a white bubble with a step number, “Step N of T”, progress dots, a Skip link and a Next button (last step says “Got it”; the first is a centred Welcome card with a Start button). This step: browse.

**09 · Coachmark tour step (shown once).**  `TourClient4`  — _depends on: G12_
Bubble call-out coachmark, part of the once-only first-run tour (G12). The screen behind is dimmed with a spotlight on the element being explained and a white bubble with a step number, “Step N of T”, progress dots, a Skip link and a Next button (last step says “Got it”; the first is a centred Welcome card with a Start button). This step: shortlist.

**10 · Coachmark tour step (shown once).**  `TourClient5`  — _depends on: G12_
Bubble call-out coachmark, part of the once-only first-run tour (G12). The screen behind is dimmed with a spotlight on the element being explained and a white bubble with a step number, “Step N of T”, progress dots, a Skip link and a Next button (last step says “Got it”; the first is a centred Welcome card with a Start button). This step: message.

**11 · Client home.**  `ClientHome`  — _depends on: G2, G7, G6_
Landing for clients — post a brief CTA, shortlist, recent conversations. Personalised (G2), pull to refresh (G7), ads woven in (G6).

**12 · Combined plan picker (studio / client).**  `PlansCombined`
Horizontal plan bar dividing the tiers equally. Studio tiers (including a free 1–5 person tier) where every tier has identical features and differs only by team size; Client tiers Free/Pro/Business. Real pricing, VAT-inclusive note. No studio account beyond the free small tier is free.

**13 · Post a call out / brief.**  `PostCallout`
Compose a call out (designer) or brief (client): title, discipline, description, scope, budget/terms. Clients use this to post briefs.

**14 · Explore — full bleed.**  `ExploreMinimal`  — _depends on: G2, G7, G6, G3_
Edge-to-edge personalised feed of work (G2) with NO chrome/buttons/text over it. Pull to refresh (G7); boosted work woven in (G6); strong work can break out via G3. Tapping reveals controls (next screen).

**15 · Explore — controls revealed.**  `ExploreRevealed`  — _depends on: G2, G7, G6, G3_
Same feed after a tap: overlay controls appear — save/pin, follow maker, comment, open project, and the bottom menu. Tapping again hides them.

**16 · People search.**  `SearchPeople`  — _depends on: G7, G4_
Results when searching for people/makers/studios (G4) — filter by discipline, city, availability. Clear that you can search people OR projects.

**17 · Talent pool.**  `TalentPool`  — _depends on: G7, G4_
Searchable pool of designers to hire (G4 search). Shortlist candidates. Pull to refresh (G7).

**18 · Project detail.**  `ProjectDetail`  — _depends on: G3_
A full project — images/video, title, maker, credits, caption, save/pin, comment, share. Engagement here feeds virality (G3).

**19 · Someone’s profile.**  `PublicProfile`  — _depends on: G7_
Another user’s public profile — their work grid, verified tick, connect/message, and the ⋯ menu (report/block).

**20 · Messages.**  `Inbox`  — _depends on: G7_
Unified, colour-coded inbox: connections, group collaborations, class chats, competition threads. Pull to refresh (G7).

**21 · Direct message.**  `DMThread`  — _depends on: G8_
1:1 chat. Keyboard persists after the first message (G8).

**22 · Checkout.**  `Checkout`  — _depends on: G6_
Payment screen — plan/boost summary, total (VAT inclusive), pay. Leads to “Payment complete”.

**23 · Billing.**  `Billing`  — _depends on: G6_
Plan, payment method, receipts/history.

**24 · Client settings**  `SettingsClient`
Build the “Client settings” screen for the Client experience, consistent with the rest of the app, in both light and dark (G15).

**25 · Edit profile.**  `EditProfileSettings`
Edit name, bio, disciplines, banner and avatar.

**26 · Username & email.**  `AccountEmail`
Change username and email.

**27 · Password & security.**  `PasswordSecurity`
Change password, two factor, sessions.

**28 · Notifications.**  `NotificationSettings`
Toggle notification categories.

**29 · Blocked accounts.**  `BlockedAccounts`
List of blocked users with unblock. Use real data, no placeholder names (G14).

**30 · Log out — are you sure?**  `LogOutConfirm`
Confirm dialog for logging out (this is the only way back to Sign in, per G1).

**31 · Delete account — are you sure?**  `DeleteAccountConfirm`
Destructive confirm with consequences spelled out.

**32 · Safety / moderation.**  `PostActionMenu`
The ⋯ menu on any post (anywhere it appears — feed, explore, search, profile): includes Report and, where relevant, Pin/Save and Share. Built in both light and dark (G15).

**33 · Safety / moderation.**  `UserActionMenu`
The ⋯ menu on any person: includes Report, Block, and Unconnect (if connected). Built in both light and dark (G15).

**34 · Safety / moderation.**  `ReportPostSheet`
Report a post — choose a reason: plagiarism, user didn’t credit teammates, plus other relevant reasons and an “Other” free-text. Goes to Tangle review. Built in both light and dark (G15).

**35 · Safety / moderation.**  `ReportPostSent`
Confirmation that the post report was sent to Tangle’s review team. Built in both light and dark (G15).

**36 · Safety / moderation.**  `ReportUserSheet`
Report a person — relevant reasons plus “Other” free-text. Goes to Tangle review. Built in both light and dark (G15).

**37 · Safety / moderation.**  `ReportUserSent`
Confirmation that the user report was sent to review. Built in both light and dark (G15).

**38 · Safety / moderation.**  `BlockSheet`
Block a person — choose from reasons, then confirm. Built in both light and dark (G15).

**39 · Safety / moderation.**  `BlockConfirm`
Are-you-sure confirm before blocking. Built in both light and dark (G15).

**40 · Safety / moderation.**  `UnconnectSheet`
Unconnect from someone — a short “tell us why”. Built in both light and dark (G15).

**41 · Safety / moderation.**  `UnconnectConfirm`
Are-you-sure confirm before unconnecting (connections, not collaborations). Built in both light and dark (G15).

**42 · Safety / moderation.**  `UncollaborateSheet`
Leave a collaboration — a “tell us why”; works for group collaborations (G10). Built in both light and dark (G15).

**43 · Safety / moderation.**  `UncollaborateConfirm`
Are-you-sure confirm before leaving a collaboration. Built in both light and dark (G15).

**44 · Confirmation state.**  `RequestSent`
Confirmation after sending a connection request — pending, with undo. Built in both light and dark (G15).

**45 · Confirmation state.**  `InviteAccepted`
Confirmation that a connection was accepted — you are now connected, open chat / view profile. Built in both light and dark (G15).

**46 · Confirmation state.**  `PlanUpgraded`
Confirmation of upgrade to Pro — unlocked features listed, receipt in Billing. Built in both light and dark (G15).

**47 · Confirmation state.**  `PaymentSuccess`
Payment received — plan/boost active, receipt emailed and saved to Billing. Built in both light and dark (G15).

**48 · Empty state.**  `EmptyMessages`
The “no messages yet” state for this surface — keeps the tab bar and header, explains what will appear here, and offers the relevant next action. Real empty state, never placeholder data (G14).

**49 · Empty state.**  `EmptySearch`
The “no results for that search” state for this surface — keeps the tab bar and header, explains what will appear here, and offers the relevant next action. Real empty state, never placeholder data (G14).


---

## Journey — Institution & student
*Campus subscription — students free · 75 screens, in journey order*

**01 · Brand splash on launch.**  `Splash`  — _depends on: G1_
Centred Tangle logo with the dot before the “t”; only the “t” is coloured (blue in light, yellow in dark). A loading ring spins below (yellow ring in light mode on a beige bg; blue ring in dark mode). Auto-advance to onboarding once loaded; if a session exists, skip straight to Home (G1).

**02 · Choose your account type.**  `AccountType`
Options: Designer, Client, Institution, Collector. Selecting Designer animates the other options sliding down and reveals two sub-choices dropping in — Individual and Studio — then routes to plan selection. Include the Collector option (a browse-only account; live now, not “coming soon”). No type is preselected.

**03 · Find your school.**  `InstitutionFind`  — _depends on: G13_
Predictive search that autocompletes the institution name as you type (G13). Prominent “Register your institution” for unlisted schools.

**04 · Register your institution.**  `InstitutionRegister`  — _depends on: G13_
Interest form for unlisted schools — contact + institution details; on submit it’s emailed to the Tangle team who follow up (G13).

**05 · School email login.**  `InstitutionLogin`  — _depends on: G13_
After selecting the institution, the app detects which login system that school uses and routes the user through that provider (Google/Microsoft/etc.) to authenticate with their school email (G13).

**06 · Role detected.**  `InstitutionRoleDetect`  — _depends on: G13_
After institution login the app auto-detects whether the person is faculty or a student and routes them to the matching profile setup (G13).

**07 · Student profile setup.**  `InstitutionProfile`
Student builds their profile (name, course/year, disciplines). Students get the platform free under the campus subscription.

**08 · Faculty profile setup.**  `FacultyProfile`
Faculty builds their profile (name, department, role).

**09 · Legal consent — student.**  `InstitutionConsent`
Student-worded 3-checkbox consent (own work, credit, honesty / platform protection / policies).

**10 · Welcome — community message (shown once).**  `WelcomeToTangle`  — _depends on: G12_
Celebratory full-screen welcome shown immediately after the account is created, with a rectangular message about building a community on ideas, making work with shared passion, crediting each other, and keeping it fair. Shown once only (G12). “Start exploring” continues into the tour.

**11 · Coachmark tour step (shown once).**  `TourStudent1`  — _depends on: G12_
Bubble call-out coachmark, part of the once-only first-run tour (G12). The screen behind is dimmed with a spotlight on the element being explained and a white bubble with a step number, “Step N of T”, progress dots, a Skip link and a Next button (last step says “Got it”; the first is a centred Welcome card with a Start button). This step: welcome.

**12 · Coachmark tour step (shown once).**  `TourStudent2`  — _depends on: G12_
Bubble call-out coachmark, part of the once-only first-run tour (G12). The screen behind is dimmed with a spotlight on the element being explained and a white bubble with a step number, “Step N of T”, progress dots, a Skip link and a Next button (last step says “Got it”; the first is a centred Welcome card with a Start button). This step: classes.

**13 · Coachmark tour step (shown once).**  `TourStudent3`  — _depends on: G12_
Bubble call-out coachmark, part of the once-only first-run tour (G12). The screen behind is dimmed with a spotlight on the element being explained and a white bubble with a step number, “Step N of T”, progress dots, a Skip link and a Next button (last step says “Got it”; the first is a centred Welcome card with a Start button). This step: community.

**14 · Coachmark tour step (shown once).**  `TourStudent4`  — _depends on: G12_
Bubble call-out coachmark, part of the once-only first-run tour (G12). The screen behind is dimmed with a spotlight on the element being explained and a white bubble with a step number, “Step N of T”, progress dots, a Skip link and a Next button (last step says “Got it”; the first is a centred Welcome card with a Start button). This step: your work.

**15 · Coachmark tour step (shown once).**  `TourStudent5`  — _depends on: G12_
Bubble call-out coachmark, part of the once-only first-run tour (G12). The screen behind is dimmed with a spotlight on the element being explained and a white bubble with a step number, “Step N of T”, progress dots, a Skip link and a Next button (last step says “Got it”; the first is a centred Welcome card with a Start button). This step: connect.

**16 · Coachmark tour step (shown once).**  `TourFaculty1`  — _depends on: G12_
Bubble call-out coachmark, part of the once-only first-run tour (G12). The screen behind is dimmed with a spotlight on the element being explained and a white bubble with a step number, “Step N of T”, progress dots, a Skip link and a Next button (last step says “Got it”; the first is a centred Welcome card with a Start button). This step: welcome.

**17 · Coachmark tour step (shown once).**  `TourFaculty2`  — _depends on: G12_
Bubble call-out coachmark, part of the once-only first-run tour (G12). The screen behind is dimmed with a spotlight on the element being explained and a white bubble with a step number, “Step N of T”, progress dots, a Skip link and a Next button (last step says “Got it”; the first is a centred Welcome card with a Start button). This step: classes.

**18 · Coachmark tour step (shown once).**  `TourFaculty3`  — _depends on: G12_
Bubble call-out coachmark, part of the once-only first-run tour (G12). The screen behind is dimmed with a spotlight on the element being explained and a white bubble with a step number, “Step N of T”, progress dots, a Skip link and a Next button (last step says “Got it”; the first is a centred Welcome card with a Start button). This step: add.

**19 · Coachmark tour step (shown once).**  `TourFaculty4`  — _depends on: G12_
Bubble call-out coachmark, part of the once-only first-run tour (G12). The screen behind is dimmed with a spotlight on the element being explained and a white bubble with a step number, “Step N of T”, progress dots, a Skip link and a Next button (last step says “Got it”; the first is a centred Welcome card with a Start button). This step: explore.

**20 · Coachmark tour step (shown once).**  `TourFaculty5`  — _depends on: G12_
Bubble call-out coachmark, part of the once-only first-run tour (G12). The screen behind is dimmed with a spotlight on the element being explained and a white bubble with a step number, “Step N of T”, progress dots, a Skip link and a Next button (last step says “Got it”; the first is a centred Welcome card with a Start button). This step: chat.

**21 · Student competitions.**  `StudentCompetitions`  — _depends on: G7, G4, G5_
Free, prominent tab. Live world scan of student competitions (G5) with the same Pin / Find a partner / Interested / Create collaboration options and filters.

**22 · My classes (student).**  `StudentClasses`  — _depends on: G7_
The student’s enrolled classes (private). Pull to refresh (G7). Students can add pins to pin ups; each professor decides whether students may create pin-up boards.

**23 · Inside a course (student).**  `StudentClassPage`
A student’s view of a class — documents, brief, shared pins, group chat. Students cannot upload projects (only professors can); the + is not available to students except pins if the professor allows.

**24 · Classes (professor).**  `ClassList`  — _depends on: G7_
The professor’s classes list with a + to create. Pull to refresh (G7).

**25 · Create a class.**  `ProfessorCreateClass`
Professor creates a class. Always private (no privacy toggle). Asks studio vs theoretical (with a sentence describing the difference) and routes to the matching class type. Asks if they have a TA; if yes, lets them invite the TA by email.

**26 · TA invited — pending.**  `TAInvited`
Professor’s confirmation after inviting a TA — “invite sent”, pending badge, resend/cancel.

**27 · TA invite — the email.**  `TAInviteEmail`
The email the TA receives from Tangle with an “Open in Tangle to accept” link.

**28 · TA joins.**  `TAInviteAccept`
The screen the invite link opens — class card, what a TA can/can’t do, verified via school email, Accept & join as TA / Decline.

**29 · Studio class page.**  `StudioClassPage`
A studio-type class — project brief, images, references, shared pins, documents, group chat. + (professor only) adds projects/documents.

**30 · Theoretical class page.**  `TheoreticalClassPage`
A theory/lecture class — readings, lecture documents, discussion, group chat. + (professor only) adds documents.

**31 · Professor uploads.**  `ProfessorUploadDoc`  — _depends on: G9_
Professor’s + menu — add a project or a document (G9). Only professors can post to a class.

**32 · A class — private.**  `ClassPage`
Generic private class page combining documents, shared pins from Explore, and group chat.

**33 · Home.**  `Dashboard`  — _depends on: G2, G7, G6_
The designer’s personalised home feed (G2). Pull to refresh (G7), boosted items woven in (G6). Top segmented control to switch home views.

**34 · Explore — full bleed.**  `ExploreMinimal`  — _depends on: G2, G7, G6, G3_
Edge-to-edge personalised feed of work (G2) with NO chrome/buttons/text over it. Pull to refresh (G7); boosted work woven in (G6); strong work can break out via G3. Tapping reveals controls (next screen).

**35 · Explore — controls revealed.**  `ExploreRevealed`  — _depends on: G2, G7, G6, G3_
Same feed after a tap: overlay controls appear — save/pin, follow maker, comment, open project, and the bottom menu. Tapping again hides them.

**36 · Community.**  `Community`  — _depends on: G2, G7, G6, G3, G8_
A thoughts feed (like a designers’ Twitter) — only Designer and Institutional accounts can post/see it. Compose box keeps keyboard open after posting (G8); feed is ranked (G2), pull to refresh (G7), virality applies (G3).

**37 · Search results — “chair”.**  `VisualSearch`  — _depends on: G7, G4_
Example: searching “chair” returns a grid of every relevant chair across the platform (G4), even where the caption never says “chair”. Make clear results are by meaning, not keyword.

**38 · Salary database.**  `SalaryDB`  — _depends on: G7_
Empty at launch — the database starts with NO entries and grows only from community submissions; ship no sample/placeholder salaries (G14). Top filters for Location, Title and Field. Primary action is an “Anonymous submission” button (“Add a salary anonymously”) framed as helping spread fairness across the community. It opens a form capturing Field, Title, Pay per month and Location, never linked to the user’s account; on submit, show a thank-you confirmation. Accessible to designers, studios, institutions and students.

**39 · Anonymous submission.**  `SalarySubmit`  — _depends on: G14_
Anonymous form to contribute a salary to the community database — fields: Field, Title, Pay per month, and Location. Framed as helping spread fairness across the community; nothing is linked to the user’s account. Submit leads to a thank-you confirmation. No placeholder data (G14).

**40 · Submission received.**  `SalarySubmitted`
Thank-you confirmation after an anonymous salary submission — reinforces that every entry makes the picture clearer and pay fairer. Actions: Back to salaries, Add another. Built in both light and dark (G15).

**41 · Swipe to connect.**  `Match`
A swipeable deck of designers/studios shown over their work, ordered by the algorithm (G2). Like → if mutual, you CONNECT (not collaborate) and a chat opens. Free users hit a daily cap; Pro is unlimited.

**42 · Your profile.**  `DesignerProfile`  — _depends on: G7_
Banner + avatar (the avatar must never drop below the banner edge), name, disciplines, verified tick if earned, and a grid of your work. If no banner is set it takes the page background for the current mode (G15). Pull to refresh (G7).

**43 · Student settings**  `SettingsStudent`
Build the “Student settings” screen for the Institution & student experience, consistent with the rest of the app, in both light and dark (G15).

**44 · Graduation status.**  `StudentGraduation`
Shows the student’s institutional link; on graduation the account keeps all its work but drops the institutional link and becomes a free designer account.

**45 · Faculty settings**  `SettingsFaculty`
Build the “Faculty settings” screen for the Institution & student experience, consistent with the rest of the app, in both light and dark (G15).

**46 · Institution settings**  `SettingsInstitution`
Build the “Institution settings” screen for the Institution & student experience, consistent with the rest of the app, in both light and dark (G15).

**47 · Edit profile.**  `EditProfileSettings`
Edit name, bio, disciplines, banner and avatar.

**48 · Username & email.**  `AccountEmail`
Change username and email.

**49 · Password & security.**  `PasswordSecurity`
Change password, two factor, sessions.

**50 · Notifications.**  `NotificationSettings`
Toggle notification categories.

**51 · Blocked accounts.**  `BlockedAccounts`
List of blocked users with unblock. Use real data, no placeholder names (G14).

**52 · Log out — are you sure?**  `LogOutConfirm`
Confirm dialog for logging out (this is the only way back to Sign in, per G1).

**53 · Delete account — are you sure?**  `DeleteAccountConfirm`
Destructive confirm with consequences spelled out.

**54 · Safety / moderation.**  `PostActionMenu`
The ⋯ menu on any post (anywhere it appears — feed, explore, search, profile): includes Report and, where relevant, Pin/Save and Share. Built in both light and dark (G15).

**55 · Safety / moderation.**  `UserActionMenu`
The ⋯ menu on any person: includes Report, Block, and Unconnect (if connected). Built in both light and dark (G15).

**56 · Safety / moderation.**  `ReportPostSheet`
Report a post — choose a reason: plagiarism, user didn’t credit teammates, plus other relevant reasons and an “Other” free-text. Goes to Tangle review. Built in both light and dark (G15).

**57 · Safety / moderation.**  `ReportPostSent`
Confirmation that the post report was sent to Tangle’s review team. Built in both light and dark (G15).

**58 · Safety / moderation.**  `ReportUserSheet`
Report a person — relevant reasons plus “Other” free-text. Goes to Tangle review. Built in both light and dark (G15).

**59 · Safety / moderation.**  `ReportUserSent`
Confirmation that the user report was sent to review. Built in both light and dark (G15).

**60 · Safety / moderation.**  `BlockSheet`
Block a person — choose from reasons, then confirm. Built in both light and dark (G15).

**61 · Safety / moderation.**  `BlockConfirm`
Are-you-sure confirm before blocking. Built in both light and dark (G15).

**62 · Safety / moderation.**  `UnconnectSheet`
Unconnect from someone — a short “tell us why”. Built in both light and dark (G15).

**63 · Safety / moderation.**  `UnconnectConfirm`
Are-you-sure confirm before unconnecting (connections, not collaborations). Built in both light and dark (G15).

**64 · Safety / moderation.**  `UncollaborateSheet`
Leave a collaboration — a “tell us why”; works for group collaborations (G10). Built in both light and dark (G15).

**65 · Safety / moderation.**  `UncollaborateConfirm`
Are-you-sure confirm before leaving a collaboration. Built in both light and dark (G15).

**66 · Confirmation state.**  `ApplicationSent`
Confirmation after applying to a call out/competition — “application sent”, what happens next, back to opportunities. Built in both light and dark (G15).

**67 · Confirmation state.**  `RequestSent`
Confirmation after sending a connection request — pending, with undo. Built in both light and dark (G15).

**68 · Confirmation state.**  `CollabRequestSent`
Confirmation after inviting someone to a collaboration — if accepted a shared group chat opens (G10). Built in both light and dark (G15).

**69 · Confirmation state.**  `InviteAccepted`
Confirmation that a connection was accepted — you are now connected, open chat / view profile. Built in both light and dark (G15).

**70 · Confirmation state.**  `InterestedConfirm`
Confirmation after marking interest in a competition — you’re on the interested list, with “Create collaboration” and “See who’s interested (Pro)”. Built in both light and dark (G15).

**71 · Confirmation state.**  `WorkPublished`
Confirmation that a piece is live on the profile, with the option to also add it to Explore. Built in both light and dark (G15).

**72 · Empty state.**  `EmptyClasses`
The “no classes yet” state for this surface — keeps the tab bar and header, explains what will appear here, and offers the relevant next action. Real empty state, never placeholder data (G14).

**73 · Empty state.**  `EmptyMessages`
The “no messages yet” state for this surface — keeps the tab bar and header, explains what will appear here, and offers the relevant next action. Real empty state, never placeholder data (G14).

**74 · Empty state.**  `EmptyMatches`
The “no more people to swipe today” state for this surface — keeps the tab bar and header, explains what will appear here, and offers the relevant next action. Real empty state, never placeholder data (G14).

**75 · Empty state.**  `EmptyCollaborations`
The “no collaborations yet” state for this surface — keeps the tab bar and header, explains what will appear here, and offers the relevant next action. Real empty state, never placeholder data (G14).


---

## Journey — Collector
*Browse, follow and collect — free · 37 screens, in journey order*

**01 · Brand splash on launch.**  `Splash`  — _depends on: G1_
Centred Tangle logo with the dot before the “t”; only the “t” is coloured (blue in light, yellow in dark). A loading ring spins below (yellow ring in light mode on a beige bg; blue ring in dark mode). Auto-advance to onboarding once loaded; if a session exists, skip straight to Home (G1).

**02 · Choose your account type.**  `AccountType`
Options: Designer, Client, Institution, Collector. Selecting Designer animates the other options sliding down and reveals two sub-choices dropping in — Individual and Studio — then routes to plan selection. Include the Collector option (a browse-only account; live now, not “coming soon”). No type is preselected.

**03 · Sign in.**  `SignIn`  — _depends on: G1_
Email + password and social sign-in. On success, persist session and go to Home (G1). “Forgot password” path. This screen is only reachable when logged out.

**04 · Create a collector account.**  `CollectorSignup`
Name, email, password. Lightweight — collectors browse, follow and save. Continue to collector consent.

**05 · Legal consent — collector.**  `CollectorConsent`
3 checkboxes: (1) respect creators’ copyright, never repost as your own; (2) platform protection + payments disclaimer; (3) agree to the policies.

**06 · Welcome — community message (shown once).**  `WelcomeToTangle`  — _depends on: G12_
Celebratory full-screen welcome shown immediately after the account is created, with a rectangular message about building a community on ideas, making work with shared passion, crediting each other, and keeping it fair. Shown once only (G12). “Start exploring” continues into the tour.

**07 · Coachmark tour step (shown once).**  `TourCollector1`  — _depends on: G12_
Bubble call-out coachmark, part of the once-only first-run tour (G12). The screen behind is dimmed with a spotlight on the element being explained and a white bubble with a step number, “Step N of T”, progress dots, a Skip link and a Next button (last step says “Got it”; the first is a centred Welcome card with a Start button). This step: welcome.

**08 · Coachmark tour step (shown once).**  `TourCollector2`  — _depends on: G12_
Bubble call-out coachmark, part of the once-only first-run tour (G12). The screen behind is dimmed with a spotlight on the element being explained and a white bubble with a step number, “Step N of T”, progress dots, a Skip link and a Next button (last step says “Got it”; the first is a centred Welcome card with a Start button). This step: discover.

**09 · Coachmark tour step (shown once).**  `TourCollector3`  — _depends on: G12_
Bubble call-out coachmark, part of the once-only first-run tour (G12). The screen behind is dimmed with a spotlight on the element being explained and a white bubble with a step number, “Step N of T”, progress dots, a Skip link and a Next button (last step says “Got it”; the first is a centred Welcome card with a Start button). This step: explore.

**10 · Coachmark tour step (shown once).**  `TourCollector4`  — _depends on: G12_
Bubble call-out coachmark, part of the once-only first-run tour (G12). The screen behind is dimmed with a spotlight on the element being explained and a white bubble with a step number, “Step N of T”, progress dots, a Skip link and a Next button (last step says “Got it”; the first is a centred Welcome card with a Start button). This step: save.

**11 · Discover (collector).**  `CollectorHome`  — _depends on: G2, G7, G6, G3_
Collector’s personalised discovery feed (G2), pull to refresh (G7), ads woven in (G6).

**12 · Explore (collector) — full bleed.**  `CollectorExplore`  — _depends on: G2, G7, G6, G3_
Edge-to-edge feed with NO buttons or text, exactly like the designer Explore. Pull to refresh (G7).

**13 · Explore (collector) — tapped.**  `CollectorExploreRevealed`  — _depends on: G2, G7, G6_
After a tap, overlay controls appear — save, follow the maker, open the piece, and the menu.

**14 · Search results — “chair”.**  `VisualSearch`  — _depends on: G7, G4_
Example: searching “chair” returns a grid of every relevant chair across the platform (G4), even where the caption never says “chair”. Make clear results are by meaning, not keyword.

**15 · A result, enlarged.**  `VisualSearchDetail`  — _depends on: G4_
Tapping a search result enlarges it and shows the creator, with a path to their profile/work.

**16 · Saved.**  `CollectorSaved`  — _depends on: G7_
The collector’s saved work, organised into boards. Pull to refresh (G7).

**17 · Collector profile.**  `CollectorProfile`
The collector’s own profile and collection.

**18 · Collector settings**  `SettingsCollector`
Build the “Collector settings” screen for the Collector experience, consistent with the rest of the app, in both light and dark (G15).

**19 · Edit profile.**  `EditProfileSettings`
Edit name, bio, disciplines, banner and avatar.

**20 · Username & email.**  `AccountEmail`
Change username and email.

**21 · Password & security.**  `PasswordSecurity`
Change password, two factor, sessions.

**22 · Notifications.**  `NotificationSettings`
Toggle notification categories.

**23 · Blocked accounts.**  `BlockedAccounts`
List of blocked users with unblock. Use real data, no placeholder names (G14).

**24 · Log out — are you sure?**  `LogOutConfirm`
Confirm dialog for logging out (this is the only way back to Sign in, per G1).

**25 · Delete account — are you sure?**  `DeleteAccountConfirm`
Destructive confirm with consequences spelled out.

**26 · Safety / moderation.**  `PostActionMenu`
The ⋯ menu on any post (anywhere it appears — feed, explore, search, profile): includes Report and, where relevant, Pin/Save and Share. Built in both light and dark (G15).

**27 · Safety / moderation.**  `UserActionMenu`
The ⋯ menu on any person: includes Report, Block, and Unconnect (if connected). Built in both light and dark (G15).

**28 · Safety / moderation.**  `ReportPostSheet`
Report a post — choose a reason: plagiarism, user didn’t credit teammates, plus other relevant reasons and an “Other” free-text. Goes to Tangle review. Built in both light and dark (G15).

**29 · Safety / moderation.**  `ReportPostSent`
Confirmation that the post report was sent to Tangle’s review team. Built in both light and dark (G15).

**30 · Safety / moderation.**  `ReportUserSheet`
Report a person — relevant reasons plus “Other” free-text. Goes to Tangle review. Built in both light and dark (G15).

**31 · Safety / moderation.**  `ReportUserSent`
Confirmation that the user report was sent to review. Built in both light and dark (G15).

**32 · Safety / moderation.**  `BlockSheet`
Block a person — choose from reasons, then confirm. Built in both light and dark (G15).

**33 · Safety / moderation.**  `BlockConfirm`
Are-you-sure confirm before blocking. Built in both light and dark (G15).

**34 · Confirmation state.**  `FollowConfirm`
Now following a maker — their new work appears in your Following feed. Built in both light and dark (G15).

**35 · Empty state.**  `EmptySaved`
The “nothing saved yet” state for this surface — keeps the tab bar and header, explains what will appear here, and offers the relevant next action. Real empty state, never placeholder data (G14).

**36 · Empty state.**  `EmptySearch`
The “no results for that search” state for this surface — keeps the tab bar and header, explains what will appear here, and offers the relevant next action. Real empty state, never placeholder data (G14).

**37 · Empty state.**  `EmptyMessages`
The “no messages yet” state for this surface — keeps the tab bar and header, explains what will appear here, and offers the relevant next action. Real empty state, never placeholder data (G14).


---

_Total: 322 screen specs across 5 journeys. Build one journey at a time; verify before moving on._
