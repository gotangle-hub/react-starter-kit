import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "@/hooks/use-theme";
import { SessionProvider } from "@/hooks/use-session";
import { AccountTypeProvider } from "@/hooks/use-account-type";
import { routes } from "@/lib/routes";

import Foundation from "@/pages/Foundation";

// Onboarding 01–15
import Splash from "@/pages/onboarding/Splash";
import Welcome1 from "@/pages/onboarding/Welcome1";
import Welcome2 from "@/pages/onboarding/Welcome2";
import AccountType from "@/pages/onboarding/AccountType";
import SignIn from "@/pages/onboarding/SignIn";
import Plans from "@/pages/onboarding/Plans";
import Signup from "@/pages/onboarding/Signup";
import AddWork from "@/pages/onboarding/AddWork";
import DesignerConsent from "@/pages/onboarding/DesignerConsent";
import WelcomeToTangle from "@/pages/onboarding/WelcomeToTangle";
import Tour from "@/pages/onboarding/Tour";

// Core app — tab roots
import Home from "@/pages/app/Home";
import Explore from "@/pages/app/Explore";
import SearchText from "@/pages/app/SearchText";
import Inbox from "@/pages/app/Inbox";
import DesignerProfile from "@/pages/app/DesignerProfile";

// Discover detail
import ProjectDetail from "@/pages/app/ProjectDetail";
import CommentsSheet from "@/pages/app/CommentsSheet";
import PinToBoard from "@/pages/app/PinToBoard";
import PinBoards from "@/pages/app/PinBoards";
import SearchVisual from "@/pages/app/SearchVisual";
import VisualSearch from "@/pages/app/VisualSearch";
import VisualSearchDetail from "@/pages/app/VisualSearchDetail";
import SearchPeople from "@/pages/app/SearchPeople";

// Match
import Match from "@/pages/app/Match";
import MutualMatch from "@/pages/app/MutualMatch";
import MatchFilters from "@/pages/app/MatchFilters";
import SwipeCap from "@/pages/app/SwipeCap";
import WhoLiked from "@/pages/app/WhoLiked";

// Opportunities
import ProjectsCallouts from "@/pages/app/ProjectsCallouts";
import ProjectsAI from "@/pages/app/ProjectsAI";
import ProjectsTangle from "@/pages/app/ProjectsTangle";
import PartnerMatch from "@/pages/app/PartnerMatch";
import PostCallout from "@/pages/app/PostCallout";
import ApplyFlow from "@/pages/app/ApplyFlow";

// Community + collaboration
import Community from "@/pages/app/Community";
import CollabTracker from "@/pages/app/CollabTracker";
import BriefPanel from "@/pages/app/BriefPanel";
import RequestFlow from "@/pages/app/RequestFlow";

// Messages
import ProjectChat from "@/pages/app/ProjectChat";
import DMThread from "@/pages/app/DMThread";
import Notifications from "@/pages/app/Notifications";

// Profile & identity
import WorkUpload from "@/pages/app/WorkUpload";
import AddToExplorePrompt from "@/pages/app/AddToExplorePrompt";
import InviteSheet from "@/pages/app/InviteSheet";
import CreateSheet from "@/pages/app/CreateSheet";
import Verification from "@/pages/app/Verification";
import YourNet from "@/pages/app/YourNet";
import PublicProfile from "@/pages/app/PublicProfile";

// Salary
import SalaryDB from "@/pages/app/SalaryDB";
import SalarySubmit from "@/pages/app/SalarySubmit";
import SalarySubmitted from "@/pages/app/SalarySubmitted";

// Money (57–59)
import Promote from "@/pages/app/Promote";
import Billing from "@/pages/app/Billing";
import Checkout from "@/pages/app/Checkout";

// Settings (60–67)
import Settings from "@/pages/app/Settings";
import EditProfileSettings from "@/pages/app/EditProfileSettings";
import AccountEmail from "@/pages/app/AccountEmail";
import PasswordSecurity from "@/pages/app/PasswordSecurity";
import NotificationSettings from "@/pages/app/NotificationSettings";
import BlockedAccounts from "@/pages/app/BlockedAccounts";
import LogOutConfirm from "@/pages/app/LogOutConfirm";
import DeleteAccountConfirm from "@/pages/app/DeleteAccountConfirm";

// Help & legal (69–72)
import LegalHelp from "@/pages/app/LegalHelp";
import TermsConditions from "@/pages/app/TermsConditions";
import PrivacyPolicy from "@/pages/app/PrivacyPolicy";
import CopyrightPolicy from "@/pages/app/CopyrightPolicy";

// Moderation (73–84)
import ReportPostSheet from "@/pages/app/ReportPostSheet";
import ReportPostSent from "@/pages/app/ReportPostSent";
import ReportUserSheet from "@/pages/app/ReportUserSheet";
import ReportUserSent from "@/pages/app/ReportUserSent";
import BlockSheet from "@/pages/app/BlockSheet";
import BlockConfirm from "@/pages/app/BlockConfirm";
import UnconnectSheet from "@/pages/app/UnconnectSheet";
import UnconnectConfirm from "@/pages/app/UnconnectConfirm";
import UncollaborateSheet from "@/pages/app/UncollaborateSheet";
import UncollaborateConfirm from "@/pages/app/UncollaborateConfirm";
import PostActionMenu from "@/pages/app/PostActionMenu";
import UserActionMenu from "@/pages/app/UserActionMenu";

// Confirmation states (85–93)
import ApplicationSent from "@/pages/app/ApplicationSent";
import RequestSent from "@/pages/app/RequestSent";
import CollabRequestSent from "@/pages/app/CollabRequestSent";
import InviteAccepted from "@/pages/app/InviteAccepted";
import InterestedConfirm from "@/pages/app/InterestedConfirm";
import WorkPublished from "@/pages/app/WorkPublished";
import PlanUpgraded from "@/pages/app/PlanUpgraded";
import PaymentSuccess from "@/pages/app/PaymentSuccess";
import BoostConfirm from "@/pages/app/BoostConfirm";

// Collector journey
import CollectorSignup from "@/pages/collector/CollectorSignup";
import CollectorConsent from "@/pages/collector/CollectorConsent";
import TourCollector from "@/pages/collector/TourCollector";
import CollectorHome from "@/pages/collector/CollectorHome";
import CollectorExplore from "@/pages/collector/CollectorExplore";
import CollectorSaved from "@/pages/collector/CollectorSaved";
import CollectorProfile from "@/pages/collector/CollectorProfile";
import SettingsCollector from "@/pages/collector/SettingsCollector";
import FollowConfirm from "@/pages/collector/FollowConfirm";
import EmptySaved from "@/pages/collector/EmptySaved";

// Institution & student journey
import InstitutionFind from "@/pages/institution/InstitutionFind";
import InstitutionRegister from "@/pages/institution/InstitutionRegister";
import InstitutionLogin from "@/pages/institution/InstitutionLogin";
import InstitutionRoleDetect from "@/pages/institution/InstitutionRoleDetect";
import InstitutionProfile from "@/pages/institution/InstitutionProfile";
import FacultyProfile from "@/pages/institution/FacultyProfile";
import InstitutionConsent from "@/pages/institution/InstitutionConsent";
import TourStudent from "@/pages/institution/TourStudent";
import TourFaculty from "@/pages/institution/TourFaculty";
import StudentCompetitions from "@/pages/institution/StudentCompetitions";
import StudentClasses from "@/pages/institution/StudentClasses";
import StudentClassPage from "@/pages/institution/StudentClassPage";
import ClassList from "@/pages/institution/ClassList";
import ClassPage from "@/pages/institution/ClassPage";
import StudioClassPage from "@/pages/institution/StudioClassPage";
import TheoreticalClassPage from "@/pages/institution/TheoreticalClassPage";
import ProfessorCreateClass from "@/pages/institution/ProfessorCreateClass";
import ProfessorUploadDoc from "@/pages/institution/ProfessorUploadDoc";
import TAInvited from "@/pages/institution/TAInvited";
import TAInviteEmail from "@/pages/institution/TAInviteEmail";
import TAInviteAccept from "@/pages/institution/TAInviteAccept";
import SettingsStudent from "@/pages/institution/SettingsStudent";
import StudentGraduation from "@/pages/institution/StudentGraduation";
import SettingsFaculty from "@/pages/institution/SettingsFaculty";
import SettingsInstitution from "@/pages/institution/SettingsInstitution";
import EmptyClasses from "@/pages/institution/EmptyClasses";

// Client journey
import ClientSignup from "@/pages/client/ClientSignup";
import ClientConsent from "@/pages/client/ClientConsent";
import TourClient from "@/pages/client/TourClient";
import ClientHome from "@/pages/client/ClientHome";
import SettingsClient from "@/pages/client/SettingsClient";

// Studio journey
import PlansCombined from "@/pages/studio/PlansCombined";
import StudioConsent from "@/pages/studio/StudioConsent";
import TourStudio from "@/pages/studio/TourStudio";
import StudioPage from "@/pages/studio/StudioPage";
import StudioProjectUpload from "@/pages/studio/StudioProjectUpload";
import StudioTeam from "@/pages/studio/StudioTeam";
import TalentPool from "@/pages/studio/TalentPool";
import SettingsStudio from "@/pages/studio/SettingsStudio";

// Empty states (94–99)
import EmptyMatches from "@/pages/app/EmptyMatches";
import EmptyMessages from "@/pages/app/EmptyMessages";
import EmptyNotifications from "@/pages/app/EmptyNotifications";
import EmptyCollaborations from "@/pages/app/EmptyCollaborations";
import EmptySearch from "@/pages/app/EmptySearch";
import EmptyWork from "@/pages/app/EmptyWork";

/**
 * App shell. Providers wrap the router so theme (G15) and session (G1) are
 * available everywhere. Designer journey: onboarding 01–15 and core app 16–56
 * are live. Settings + moderation menus land on stubs until the next batch.
 */
export default function App() {
  return (
    <ThemeProvider>
      <SessionProvider>
        <AccountTypeProvider>
        <BrowserRouter>
          <Routes>
            <Route path={routes.foundation} element={<Foundation />} />

            {/* Onboarding 01–15 */}
            <Route path={routes.splash} element={<Splash />} />
            <Route path={routes.welcome1} element={<Welcome1 />} />
            <Route path={routes.welcome2} element={<Welcome2 />} />
            <Route path={routes.accountType} element={<AccountType />} />
            <Route path={routes.signIn} element={<SignIn />} />
            <Route path={routes.plans} element={<Plans />} />
            <Route path={routes.signup} element={<Signup />} />
            <Route path={routes.addWork} element={<AddWork />} />
            <Route path={routes.consent} element={<DesignerConsent />} />
            <Route path={routes.welcome} element={<WelcomeToTangle />} />
            <Route path={routes.tour} element={<Tour />} />

            {/* Tab roots */}
            <Route path={routes.home} element={<Home />} />
            <Route path={routes.explore} element={<Explore />} />
            <Route path={routes.search} element={<SearchText />} />
            <Route path={routes.messages} element={<Inbox />} />
            <Route path={routes.profile} element={<DesignerProfile />} />

            {/* Match */}
            <Route path={routes.match} element={<Match />} />
            <Route path={routes.mutualMatch} element={<MutualMatch />} />
            <Route path={routes.matchFilters} element={<MatchFilters />} />
            <Route path={routes.swipeCap} element={<SwipeCap />} />
            <Route path={routes.whoLiked} element={<WhoLiked />} />

            {/* Discover detail */}
            <Route path={routes.projectDetail} element={<ProjectDetail />} />
            <Route path={routes.comments} element={<CommentsSheet />} />
            <Route path={routes.pinToBoard} element={<PinToBoard />} />
            <Route path={routes.pinBoards} element={<PinBoards />} />
            <Route path={routes.searchVisual} element={<SearchVisual />} />
            <Route path={routes.visualSearch} element={<VisualSearch />} />
            <Route path={routes.visualSearchDetail} element={<VisualSearchDetail />} />
            <Route path={routes.searchPeople} element={<SearchPeople />} />

            {/* Opportunities */}
            <Route path={routes.callouts} element={<ProjectsCallouts />} />
            <Route path={routes.competitions} element={<ProjectsAI />} />
            <Route path={routes.tangleComps} element={<ProjectsTangle />} />
            <Route path={routes.partnerMatch} element={<PartnerMatch />} />
            <Route path={routes.postCallout} element={<PostCallout />} />
            <Route path={routes.applyFlow} element={<ApplyFlow />} />

            {/* Community + collaboration */}
            <Route path={routes.community} element={<Community />} />
            <Route path={routes.collabs} element={<CollabTracker />} />
            <Route path={routes.brief} element={<BriefPanel />} />
            <Route path={routes.request} element={<RequestFlow />} />

            {/* Messages detail */}
            <Route path={routes.projectChat} element={<ProjectChat />} />
            <Route path={routes.dmThread} element={<DMThread />} />
            <Route path={routes.notifications} element={<Notifications />} />

            {/* Profile & identity */}
            <Route path={routes.workUpload} element={<WorkUpload />} />
            <Route path={routes.addToExplore} element={<AddToExplorePrompt />} />
            <Route path={routes.inviteSheet} element={<InviteSheet />} />
            <Route path={routes.createSheet} element={<CreateSheet />} />
            <Route path={routes.verification} element={<Verification />} />
            <Route path={routes.yourNet} element={<YourNet />} />
            <Route path={routes.publicProfile} element={<PublicProfile />} />

            {/* Salary */}
            <Route path={routes.salary} element={<SalaryDB />} />
            <Route path={routes.salarySubmit} element={<SalarySubmit />} />
            <Route path={routes.salarySubmitted} element={<SalarySubmitted />} />

            {/* Money */}
            <Route path={routes.promote} element={<Promote />} />
            <Route path={routes.billing} element={<Billing />} />
            <Route path={routes.checkout} element={<Checkout />} />

            {/* Settings */}
            <Route path={routes.settings} element={<Settings />} />
            <Route path={routes.editProfile} element={<EditProfileSettings />} />
            <Route path={routes.accountEmail} element={<AccountEmail />} />
            <Route path={routes.passwordSecurity} element={<PasswordSecurity />} />
            <Route path={routes.notificationSettings} element={<NotificationSettings />} />
            <Route path={routes.blockedAccounts} element={<BlockedAccounts />} />
            <Route path={routes.logoutConfirm} element={<LogOutConfirm />} />
            <Route path={routes.deleteAccount} element={<DeleteAccountConfirm />} />

            {/* Help & legal */}
            <Route path={routes.legalHelp} element={<LegalHelp />} />
            <Route path={routes.terms} element={<TermsConditions />} />
            <Route path={routes.privacy} element={<PrivacyPolicy />} />
            <Route path={routes.copyright} element={<CopyrightPolicy />} />

            {/* Safety / moderation */}
            <Route path={routes.reportPost} element={<ReportPostSheet />} />
            <Route path={routes.reportPostSent} element={<ReportPostSent />} />
            <Route path={routes.reportUser} element={<ReportUserSheet />} />
            <Route path={routes.reportUserSent} element={<ReportUserSent />} />
            <Route path={routes.blockSheet} element={<BlockSheet />} />
            <Route path={routes.blockConfirm} element={<BlockConfirm />} />
            <Route path={routes.unconnectSheet} element={<UnconnectSheet />} />
            <Route path={routes.unconnectConfirm} element={<UnconnectConfirm />} />
            <Route path={routes.uncollaborateSheet} element={<UncollaborateSheet />} />
            <Route path={routes.uncollaborateConfirm} element={<UncollaborateConfirm />} />
            <Route path={routes.postMenu} element={<PostActionMenu />} />
            <Route path={routes.userMenu} element={<UserActionMenu />} />

            {/* Confirmation states */}
            <Route path={routes.applicationSent} element={<ApplicationSent />} />
            <Route path={routes.requestSent} element={<RequestSent />} />
            <Route path={routes.collabRequestSent} element={<CollabRequestSent />} />
            <Route path={routes.inviteAccepted} element={<InviteAccepted />} />
            <Route path={routes.interestedConfirm} element={<InterestedConfirm />} />
            <Route path={routes.workPublished} element={<WorkPublished />} />
            <Route path={routes.planUpgraded} element={<PlanUpgraded />} />
            <Route path={routes.paymentSuccess} element={<PaymentSuccess />} />
            <Route path={routes.boostConfirm} element={<BoostConfirm />} />

            {/* Collector journey */}
            <Route path={routes.collectorSignup} element={<CollectorSignup />} />
            <Route path={routes.collectorConsent} element={<CollectorConsent />} />
            <Route path={routes.tourCollector} element={<TourCollector />} />
            <Route path={routes.collectorHome} element={<CollectorHome />} />
            <Route path={routes.collectorExplore} element={<CollectorExplore />} />
            <Route path={routes.collectorSaved} element={<CollectorSaved />} />
            <Route path={routes.collectorProfile} element={<CollectorProfile />} />
            <Route path={routes.settingsCollector} element={<SettingsCollector />} />
            <Route path={routes.followConfirm} element={<FollowConfirm />} />
            <Route path={routes.emptySaved} element={<EmptySaved />} />

            {/* Institution & student journey */}
            <Route path={routes.institutionFind} element={<InstitutionFind />} />
            <Route path={routes.institutionRegister} element={<InstitutionRegister />} />
            <Route path={routes.institutionLogin} element={<InstitutionLogin />} />
            <Route path={routes.institutionRoleDetect} element={<InstitutionRoleDetect />} />
            <Route path={routes.institutionProfile} element={<InstitutionProfile />} />
            <Route path={routes.facultyProfile} element={<FacultyProfile />} />
            <Route path={routes.institutionConsent} element={<InstitutionConsent />} />
            <Route path={routes.tourStudent} element={<TourStudent />} />
            <Route path={routes.tourFaculty} element={<TourFaculty />} />
            <Route path={routes.studentCompetitions} element={<StudentCompetitions />} />
            <Route path={routes.studentClasses} element={<StudentClasses />} />
            <Route path={routes.studentClassPage} element={<StudentClassPage />} />
            <Route path={routes.classList} element={<ClassList />} />
            <Route path={routes.classPage} element={<ClassPage />} />
            <Route path={routes.studioClassPage} element={<StudioClassPage />} />
            <Route path={routes.theoreticalClassPage} element={<TheoreticalClassPage />} />
            <Route path={routes.professorCreateClass} element={<ProfessorCreateClass />} />
            <Route path={routes.professorUploadDoc} element={<ProfessorUploadDoc />} />
            <Route path={routes.taInvited} element={<TAInvited />} />
            <Route path={routes.taInviteEmail} element={<TAInviteEmail />} />
            <Route path={routes.taInviteAccept} element={<TAInviteAccept />} />
            <Route path={routes.settingsStudent} element={<SettingsStudent />} />
            <Route path={routes.studentGraduation} element={<StudentGraduation />} />
            <Route path={routes.settingsFaculty} element={<SettingsFaculty />} />
            <Route path={routes.settingsInstitution} element={<SettingsInstitution />} />
            <Route path={routes.emptyClasses} element={<EmptyClasses />} />

            {/* Client journey */}
            <Route path={routes.clientSignup} element={<ClientSignup />} />
            <Route path={routes.clientConsent} element={<ClientConsent />} />
            <Route path={routes.tourClient} element={<TourClient />} />
            <Route path={routes.clientHome} element={<ClientHome />} />
            <Route path={routes.settingsClient} element={<SettingsClient />} />

            {/* Studio journey */}
            <Route path={routes.plansCombined} element={<PlansCombined />} />
            <Route path={routes.studioConsent} element={<StudioConsent />} />
            <Route path={routes.tourStudio} element={<TourStudio />} />
            <Route path={routes.studioPage} element={<StudioPage />} />
            <Route path={routes.studioProjectUpload} element={<StudioProjectUpload />} />
            <Route path={routes.studioTeam} element={<StudioTeam />} />
            <Route path={routes.talentPool} element={<TalentPool />} />
            <Route path={routes.settingsStudio} element={<SettingsStudio />} />

            {/* Empty states */}
            <Route path={routes.emptyMatches} element={<EmptyMatches />} />
            <Route path={routes.emptyMessages} element={<EmptyMessages />} />
            <Route path={routes.emptyNotifications} element={<EmptyNotifications />} />
            <Route path={routes.emptyCollaborations} element={<EmptyCollaborations />} />
            <Route path={routes.emptySearch} element={<EmptySearch />} />
            <Route path={routes.emptyWork} element={<EmptyWork />} />
          </Routes>
        </BrowserRouter>
        </AccountTypeProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
