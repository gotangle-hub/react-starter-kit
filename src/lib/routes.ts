/** Central route table so navigation stays consistent across screens. */
export const routes = {
  foundation: "/foundation",

  // Onboarding / auth (Designer journey 01–15)
  splash: "/",
  welcome1: "/welcome/1",
  welcome2: "/welcome/2",
  accountType: "/account-type",
  signIn: "/sign-in",
  forgotPassword: "/forgot-password",
  resetCode: "/forgot-password/code",
  resetNewPassword: "/forgot-password/new",
  resetDone: "/forgot-password/done",
  resetOAuth: "/forgot-password/oauth",
  plans: "/plans",
  signup: "/signup",
  addWork: "/signup/work",
  consent: "/signup/consent",
  verifyEmail: "/signup/verify",
  welcome: "/welcome",
  tour: "/tour",

  // Core app — tab roots
  home: "/home",
  explore: "/explore",
  search: "/search",
  messages: "/messages",
  profile: "/profile",

  // Match (17–21)
  match: "/match",
  mutualMatch: "/match/connected",
  matchFilters: "/match/filters",
  swipeCap: "/match/cap",
  whoLiked: "/who-liked",

  // Discover detail (24–31)
  projectDetail: "/project/:id",
  comments: "/project/:id/comments",
  pinToBoard: "/pin",
  pinBoards: "/pins",
  searchVisual: "/search/visual",
  visualSearch: "/search/results",
  visualSearchDetail: "/search/results/:id",
  searchPeople: "/search/people",

  // Opportunities (33–38)
  callouts: "/callouts",
  competitions: "/competitions",
  tangleComps: "/competitions/tangle",
  partnerMatch: "/partner",
  postCallout: "/post-callout",
  applyFlow: "/apply",

  // Community + Collaboration (39–42)
  community: "/community",
  collabs: "/collaborations",
  brief: "/collaborations/brief",
  request: "/request",

  // Messages detail (44–46)
  projectChat: "/chat/:id",
  dmThread: "/dm/:id",
  notifications: "/notifications",

  // Profile & identity (47–53)
  workUpload: "/work/add",
  addToExplore: "/work/explore-prompt",
  inviteSheet: "/invite",
  createSheet: "/create",
  verification: "/verify",
  yourNet: "/network",
  publicProfile: "/u/:id",

  // Salary (54–56)
  salary: "/salary",
  salarySubmit: "/salary/submit",
  salarySubmitted: "/salary/submitted",

  // Money (57–59)
  promote: "/promote",
  billing: "/billing",
  checkout: "/checkout",

  // Settings (60–67)
  settings: "/settings",
  editProfile: "/settings/profile",
  accountEmail: "/settings/account",
  passwordSecurity: "/settings/security",
  notificationSettings: "/settings/notifications",
  blockedAccounts: "/settings/blocked",
  logoutConfirm: "/settings/logout",
  deleteAccount: "/settings/delete",

  // Help & legal (69–72)
  legalHelp: "/legal",
  terms: "/legal/terms",
  privacy: "/legal/privacy",
  copyright: "/legal/copyright",

  // Safety / moderation (73–84)
  reportPost: "/report/post",
  reportPostSent: "/report/post/sent",
  reportUser: "/report/user",
  reportUserSent: "/report/user/sent",
  blockSheet: "/block",
  blockConfirm: "/block/confirm",
  unconnectSheet: "/unconnect",
  unconnectConfirm: "/unconnect/confirm",
  uncollaborateSheet: "/uncollaborate",
  uncollaborateConfirm: "/uncollaborate/confirm",

  // Confirmation states (85–93)
  applicationSent: "/confirm/application",
  requestSent: "/confirm/request",
  collabRequestSent: "/confirm/collab",
  inviteAccepted: "/confirm/connected",
  interestedConfirm: "/confirm/interested",
  workPublished: "/confirm/published",
  planUpgraded: "/confirm/upgraded",
  paymentSuccess: "/confirm/payment",
  boostConfirm: "/confirm/boost",

  // Empty states (94–99)
  emptyMatches: "/empty/matches",
  emptyMessages: "/empty/messages",
  emptyNotifications: "/empty/notifications",
  emptyCollaborations: "/empty/collaborations",
  emptySearch: "/empty/search",
  emptyWork: "/empty/work",

  // Studio journey
  plansCombined: "/plans/combined",
  studioConsent: "/signup/consent/studio",
  tourStudio: "/tour/studio",
  studioPage: "/studio",
  studioProjectUpload: "/studio/project/add",
  studioTeam: "/studio/team",
  talentPool: "/talent",
  settingsStudio: "/settings/studio",

  // Client journey
  clientSignup: "/signup/client",
  clientConsent: "/signup/consent/client",
  tourClient: "/tour/client",
  clientHome: "/client/home",
  settingsClient: "/settings/client",

  // Institution & student journey
  institutionFind: "/institution",
  institutionRegister: "/institution/register",
  institutionLogin: "/institution/login",
  institutionRoleDetect: "/institution/role",
  institutionProfile: "/institution/profile/student",
  facultyProfile: "/institution/profile/faculty",
  institutionConsent: "/signup/consent/student",
  tourStudent: "/tour/student",
  tourFaculty: "/tour/faculty",
  studentCompetitions: "/student/competitions",
  studentClasses: "/student/classes",
  studentClassPage: "/student/class/:id",
  classList: "/classes",
  classPage: "/class/:id",
  studioClassPage: "/class/:id/studio",
  theoreticalClassPage: "/class/:id/theory",
  professorCreateClass: "/classes/create",
  professorUploadDoc: "/class/:id/upload",
  taInvited: "/class/:id/ta/invited",
  taInviteEmail: "/class/:id/ta/email",
  taInviteAccept: "/classes/ta/accept/:token",
  classChat: "/class/:id/chat",
  settingsStudent: "/settings/student",
  studentGraduation: "/settings/graduation",
  settingsFaculty: "/settings/faculty",
  settingsInstitution: "/settings/institution",
  emptyClasses: "/empty/classes",

  // Collector journey
  collectorSignup: "/signup/collector",
  collectorConsent: "/signup/consent/collector",
  tourCollector: "/tour/collector",
  collectorHome: "/collector/discover",
  collectorExplore: "/collector/explore",
  collectorSaved: "/collector/saved",
  collectorProfile: "/collector/profile",
  settingsCollector: "/settings/collector",
  followConfirm: "/confirm/following",
  emptySaved: "/empty/saved",

  // Sheets / menus
  postMenu: "/post-menu",
  userMenu: "/user-menu",
} as const;

export type RouteKey = keyof typeof routes;

/** Build a concrete path from a parameterised route (e.g. project/:id). */
export const path = (route: string, params: Record<string, string> = {}) =>
  Object.entries(params).reduce((p, [k, v]) => p.replace(`:${k}`, v), route);
