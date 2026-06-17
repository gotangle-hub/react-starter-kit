import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "@/hooks/use-theme";
import { SessionProvider } from "@/hooks/use-session";
import { AccountTypeProvider } from "@/hooks/use-account-type";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { routes } from "@/lib/routes";

import Foundation from "@/pages/Foundation";

// Onboarding 01–15
import Splash from "@/pages/onboarding/Splash";
import Welcome1 from "@/pages/onboarding/Welcome1";
import Welcome2 from "@/pages/onboarding/Welcome2";
import AccountType from "@/pages/onboarding/AccountType";
import SignIn from "@/pages/onboarding/SignIn";
import ForgotPassword from "@/pages/onboarding/ForgotPassword";
import ResetCode from "@/pages/onboarding/ResetCode";
import ResetNewPassword from "@/pages/onboarding/ResetNewPassword";
import ResetDone from "@/pages/onboarding/ResetDone";
import ResetOAuth from "@/pages/onboarding/ResetOAuth";
import Plans from "@/pages/onboarding/Plans";
import Signup from "@/pages/onboarding/Signup";
import VerifyEmail from "@/pages/onboarding/VerifyEmail";
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
            <Route path={routes.forgotPassword} element={<ForgotPassword />} />
            <Route path={routes.resetCode} element={<ResetCode />} />
            <Route path={routes.resetNewPassword} element={<ResetNewPassword />} />
            <Route path={routes.resetDone} element={<ResetDone />} />
            <Route path={routes.resetOAuth} element={<ResetOAuth />} />
            <Route path={routes.plans} element={<Plans />} />
            <Route path={routes.signup} element={<Signup />} />
            <Route path={routes.addWork} element={<AddWork />} />
            <Route path={routes.verifyEmail} element={<VerifyEmail />} />
            <Route path={routes.consent} element={<DesignerConsent />} />
            <Route path={routes.welcome} element={<WelcomeToTangle />} />
            <Route path={routes.tour} element={<Tour />} />

            {/* Tab roots */}
            <Route path={routes.home} element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path={routes.explore} element={<ProtectedRoute><Explore /></ProtectedRoute>} />
            <Route path={routes.search} element={<ProtectedRoute><SearchText /></ProtectedRoute>} />
            <Route path={routes.messages} element={<ProtectedRoute><Inbox /></ProtectedRoute>} />
            <Route path={routes.profile} element={<ProtectedRoute><DesignerProfile /></ProtectedRoute>} />

            {/* Match */}
            <Route path={routes.match} element={<ProtectedRoute><Match /></ProtectedRoute>} />
            <Route path={routes.mutualMatch} element={<ProtectedRoute><MutualMatch /></ProtectedRoute>} />
            <Route path={routes.matchFilters} element={<ProtectedRoute><MatchFilters /></ProtectedRoute>} />
            <Route path={routes.swipeCap} element={<ProtectedRoute><SwipeCap /></ProtectedRoute>} />
            <Route path={routes.whoLiked} element={<ProtectedRoute><WhoLiked /></ProtectedRoute>} />

            {/* Discover detail */}
            <Route path={routes.projectDetail} element={<ProtectedRoute><ProjectDetail /></ProtectedRoute>} />
            <Route path={routes.comments} element={<ProtectedRoute><CommentsSheet /></ProtectedRoute>} />
            <Route path={routes.pinToBoard} element={<ProtectedRoute><PinToBoard /></ProtectedRoute>} />
            <Route path={routes.pinBoards} element={<ProtectedRoute><PinBoards /></ProtectedRoute>} />
            <Route path={routes.searchVisual} element={<ProtectedRoute><SearchVisual /></ProtectedRoute>} />
            <Route path={routes.visualSearch} element={<ProtectedRoute><VisualSearch /></ProtectedRoute>} />
            <Route path={routes.visualSearchDetail} element={<ProtectedRoute><VisualSearchDetail /></ProtectedRoute>} />
            <Route path={routes.searchPeople} element={<ProtectedRoute><SearchPeople /></ProtectedRoute>} />

            {/* Opportunities */}
            <Route path={routes.callouts} element={<ProtectedRoute><ProjectsCallouts /></ProtectedRoute>} />
            <Route path={routes.competitions} element={<ProtectedRoute><ProjectsAI /></ProtectedRoute>} />
            <Route path={routes.tangleComps} element={<ProtectedRoute><ProjectsTangle /></ProtectedRoute>} />
            <Route path={routes.partnerMatch} element={<ProtectedRoute><PartnerMatch /></ProtectedRoute>} />
            <Route path={routes.postCallout} element={<ProtectedRoute><PostCallout /></ProtectedRoute>} />
            <Route path={routes.applyFlow} element={<ProtectedRoute><ApplyFlow /></ProtectedRoute>} />

            {/* Community + collaboration */}
            <Route path={routes.community} element={<ProtectedRoute><Community /></ProtectedRoute>} />
            <Route path={routes.collabs} element={<ProtectedRoute><CollabTracker /></ProtectedRoute>} />
            <Route path={routes.brief} element={<ProtectedRoute><BriefPanel /></ProtectedRoute>} />
            <Route path={routes.request} element={<ProtectedRoute><RequestFlow /></ProtectedRoute>} />

            {/* Messages detail */}
            <Route path={routes.projectChat} element={<ProtectedRoute><ProjectChat /></ProtectedRoute>} />
            <Route path={routes.dmThread} element={<ProtectedRoute><DMThread /></ProtectedRoute>} />
            <Route path={routes.notifications} element={<ProtectedRoute><Notifications /></ProtectedRoute>} />

            {/* Profile & identity */}
            <Route path={routes.workUpload} element={<ProtectedRoute><WorkUpload /></ProtectedRoute>} />
            <Route path={routes.addToExplore} element={<ProtectedRoute><AddToExplorePrompt /></ProtectedRoute>} />
            <Route path={routes.inviteSheet} element={<ProtectedRoute><InviteSheet /></ProtectedRoute>} />
            <Route path={routes.createSheet} element={<ProtectedRoute><CreateSheet /></ProtectedRoute>} />
            <Route path={routes.verification} element={<ProtectedRoute><Verification /></ProtectedRoute>} />
            <Route path={routes.yourNet} element={<ProtectedRoute><YourNet /></ProtectedRoute>} />
            <Route path={routes.publicProfile} element={<ProtectedRoute><PublicProfile /></ProtectedRoute>} />

            {/* Salary */}
            <Route path={routes.salary} element={<ProtectedRoute><SalaryDB /></ProtectedRoute>} />
            <Route path={routes.salarySubmit} element={<ProtectedRoute><SalarySubmit /></ProtectedRoute>} />
            <Route path={routes.salarySubmitted} element={<ProtectedRoute><SalarySubmitted /></ProtectedRoute>} />

            {/* Money */}
            <Route path={routes.promote} element={<ProtectedRoute><Promote /></ProtectedRoute>} />
            <Route path={routes.billing} element={<ProtectedRoute><Billing /></ProtectedRoute>} />
            <Route path={routes.checkout} element={<ProtectedRoute><Checkout /></ProtectedRoute>} />

            {/* Settings */}
            <Route path={routes.settings} element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path={routes.editProfile} element={<ProtectedRoute><EditProfileSettings /></ProtectedRoute>} />
            <Route path={routes.accountEmail} element={<ProtectedRoute><AccountEmail /></ProtectedRoute>} />
            <Route path={routes.passwordSecurity} element={<ProtectedRoute><PasswordSecurity /></ProtectedRoute>} />
            <Route path={routes.notificationSettings} element={<ProtectedRoute><NotificationSettings /></ProtectedRoute>} />
            <Route path={routes.blockedAccounts} element={<ProtectedRoute><BlockedAccounts /></ProtectedRoute>} />
            <Route path={routes.logoutConfirm} element={<ProtectedRoute><LogOutConfirm /></ProtectedRoute>} />
            <Route path={routes.deleteAccount} element={<ProtectedRoute><DeleteAccountConfirm /></ProtectedRoute>} />

            {/* Help & legal */}
            <Route path={routes.legalHelp} element={<ProtectedRoute><LegalHelp /></ProtectedRoute>} />
            <Route path={routes.terms} element={<ProtectedRoute><TermsConditions /></ProtectedRoute>} />
            <Route path={routes.privacy} element={<ProtectedRoute><PrivacyPolicy /></ProtectedRoute>} />
            <Route path={routes.copyright} element={<ProtectedRoute><CopyrightPolicy /></ProtectedRoute>} />

            {/* Safety / moderation */}
            <Route path={routes.reportPost} element={<ProtectedRoute><ReportPostSheet /></ProtectedRoute>} />
            <Route path={routes.reportPostSent} element={<ProtectedRoute><ReportPostSent /></ProtectedRoute>} />
            <Route path={routes.reportUser} element={<ProtectedRoute><ReportUserSheet /></ProtectedRoute>} />
            <Route path={routes.reportUserSent} element={<ProtectedRoute><ReportUserSent /></ProtectedRoute>} />
            <Route path={routes.blockSheet} element={<ProtectedRoute><BlockSheet /></ProtectedRoute>} />
            <Route path={routes.blockConfirm} element={<ProtectedRoute><BlockConfirm /></ProtectedRoute>} />
            <Route path={routes.unconnectSheet} element={<ProtectedRoute><UnconnectSheet /></ProtectedRoute>} />
            <Route path={routes.unconnectConfirm} element={<ProtectedRoute><UnconnectConfirm /></ProtectedRoute>} />
            <Route path={routes.uncollaborateSheet} element={<ProtectedRoute><UncollaborateSheet /></ProtectedRoute>} />
            <Route path={routes.uncollaborateConfirm} element={<ProtectedRoute><UncollaborateConfirm /></ProtectedRoute>} />
            <Route path={routes.postMenu} element={<ProtectedRoute><PostActionMenu /></ProtectedRoute>} />
            <Route path={routes.userMenu} element={<ProtectedRoute><UserActionMenu /></ProtectedRoute>} />

            {/* Confirmation states */}
            <Route path={routes.applicationSent} element={<ProtectedRoute><ApplicationSent /></ProtectedRoute>} />
            <Route path={routes.requestSent} element={<ProtectedRoute><RequestSent /></ProtectedRoute>} />
            <Route path={routes.collabRequestSent} element={<ProtectedRoute><CollabRequestSent /></ProtectedRoute>} />
            <Route path={routes.inviteAccepted} element={<ProtectedRoute><InviteAccepted /></ProtectedRoute>} />
            <Route path={routes.interestedConfirm} element={<ProtectedRoute><InterestedConfirm /></ProtectedRoute>} />
            <Route path={routes.workPublished} element={<ProtectedRoute><WorkPublished /></ProtectedRoute>} />
            <Route path={routes.planUpgraded} element={<ProtectedRoute><PlanUpgraded /></ProtectedRoute>} />
            <Route path={routes.paymentSuccess} element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
            <Route path={routes.boostConfirm} element={<ProtectedRoute><BoostConfirm /></ProtectedRoute>} />

            {/* Collector journey */}
            <Route path={routes.collectorSignup} element={<CollectorSignup />} />
            <Route path={routes.collectorConsent} element={<CollectorConsent />} />
            <Route path={routes.tourCollector} element={<TourCollector />} />
            <Route path={routes.collectorHome} element={<ProtectedRoute><CollectorHome /></ProtectedRoute>} />
            <Route path={routes.collectorExplore} element={<ProtectedRoute><CollectorExplore /></ProtectedRoute>} />
            <Route path={routes.collectorSaved} element={<ProtectedRoute><CollectorSaved /></ProtectedRoute>} />
            <Route path={routes.collectorProfile} element={<ProtectedRoute><CollectorProfile /></ProtectedRoute>} />
            <Route path={routes.settingsCollector} element={<ProtectedRoute><SettingsCollector /></ProtectedRoute>} />
            <Route path={routes.followConfirm} element={<ProtectedRoute><FollowConfirm /></ProtectedRoute>} />
            <Route path={routes.emptySaved} element={<ProtectedRoute><EmptySaved /></ProtectedRoute>} />

            {/* Institution & student journey */}
            <Route path={routes.institutionFind} element={<InstitutionFind />} />
            <Route path={routes.institutionRegister} element={<InstitutionRegister />} />
            <Route path={routes.institutionLogin} element={<InstitutionLogin />} />
            <Route path={routes.institutionRoleDetect} element={<InstitutionRoleDetect />} />
            <Route path={routes.institutionProfile} element={<ProtectedRoute><InstitutionProfile /></ProtectedRoute>} />
            <Route path={routes.facultyProfile} element={<ProtectedRoute><FacultyProfile /></ProtectedRoute>} />
            <Route path={routes.institutionConsent} element={<InstitutionConsent />} />
            <Route path={routes.tourStudent} element={<TourStudent />} />
            <Route path={routes.tourFaculty} element={<TourFaculty />} />
            <Route path={routes.studentCompetitions} element={<ProtectedRoute><StudentCompetitions /></ProtectedRoute>} />
            <Route path={routes.studentClasses} element={<ProtectedRoute><StudentClasses /></ProtectedRoute>} />
            <Route path={routes.studentClassPage} element={<ProtectedRoute><StudentClassPage /></ProtectedRoute>} />
            <Route path={routes.classList} element={<ProtectedRoute><ClassList /></ProtectedRoute>} />
            <Route path={routes.classPage} element={<ProtectedRoute><ClassPage /></ProtectedRoute>} />
            <Route path={routes.studioClassPage} element={<ProtectedRoute><StudioClassPage /></ProtectedRoute>} />
            <Route path={routes.theoreticalClassPage} element={<ProtectedRoute><TheoreticalClassPage /></ProtectedRoute>} />
            <Route path={routes.professorCreateClass} element={<ProtectedRoute><ProfessorCreateClass /></ProtectedRoute>} />
            <Route path={routes.professorUploadDoc} element={<ProtectedRoute><ProfessorUploadDoc /></ProtectedRoute>} />
            <Route path={routes.taInvited} element={<ProtectedRoute><TAInvited /></ProtectedRoute>} />
            <Route path={routes.taInviteEmail} element={<TAInviteEmail />} />
            <Route path={routes.taInviteAccept} element={<TAInviteAccept />} />
            <Route path={routes.settingsStudent} element={<ProtectedRoute><SettingsStudent /></ProtectedRoute>} />
            <Route path={routes.studentGraduation} element={<ProtectedRoute><StudentGraduation /></ProtectedRoute>} />
            <Route path={routes.settingsFaculty} element={<ProtectedRoute><SettingsFaculty /></ProtectedRoute>} />
            <Route path={routes.settingsInstitution} element={<ProtectedRoute><SettingsInstitution /></ProtectedRoute>} />
            <Route path={routes.emptyClasses} element={<ProtectedRoute><EmptyClasses /></ProtectedRoute>} />

            {/* Client journey */}
            <Route path={routes.clientSignup} element={<ClientSignup />} />
            <Route path={routes.clientConsent} element={<ClientConsent />} />
            <Route path={routes.tourClient} element={<TourClient />} />
            <Route path={routes.clientHome} element={<ProtectedRoute><ClientHome /></ProtectedRoute>} />
            <Route path={routes.settingsClient} element={<ProtectedRoute><SettingsClient /></ProtectedRoute>} />

            {/* Studio journey */}
            <Route path={routes.plansCombined} element={<PlansCombined />} />
            <Route path={routes.studioConsent} element={<StudioConsent />} />
            <Route path={routes.tourStudio} element={<TourStudio />} />
            <Route path={routes.studioPage} element={<ProtectedRoute><StudioPage /></ProtectedRoute>} />
            <Route path={routes.studioProjectUpload} element={<ProtectedRoute><StudioProjectUpload /></ProtectedRoute>} />
            <Route path={routes.studioTeam} element={<ProtectedRoute><StudioTeam /></ProtectedRoute>} />
            <Route path={routes.talentPool} element={<ProtectedRoute><TalentPool /></ProtectedRoute>} />
            <Route path={routes.settingsStudio} element={<ProtectedRoute><SettingsStudio /></ProtectedRoute>} />

            {/* Empty states */}
            <Route path={routes.emptyMatches} element={<ProtectedRoute><EmptyMatches /></ProtectedRoute>} />
            <Route path={routes.emptyMessages} element={<ProtectedRoute><EmptyMessages /></ProtectedRoute>} />
            <Route path={routes.emptyNotifications} element={<ProtectedRoute><EmptyNotifications /></ProtectedRoute>} />
            <Route path={routes.emptyCollaborations} element={<ProtectedRoute><EmptyCollaborations /></ProtectedRoute>} />
            <Route path={routes.emptySearch} element={<ProtectedRoute><EmptySearch /></ProtectedRoute>} />
            <Route path={routes.emptyWork} element={<ProtectedRoute><EmptyWork /></ProtectedRoute>} />
            <Route path="/unsubscribe" element={<Unsubscribe />} />
          </Routes>
        </BrowserRouter>
        </AccountTypeProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
