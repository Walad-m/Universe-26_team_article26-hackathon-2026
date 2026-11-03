"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "de";

export interface Translations {
  // Common & Navigation
  brandSubtitle: string;
  signIn: string;
  signOut: string;
  dashboard: string;
  liveDemo: string;
  connecting: string;
  backToOverview: string;
  closePreview: string;

  // Landing Page
  heroBadge: string;
  heroHeadline1: string;
  heroHeadline2: string;
  heroSub: string;
  launchDashboard: string;
  zeroInstall: string;
  builtForNeedTitle: string;
  builtForNeedSub: string;
  feature1Title: string;
  feature1Desc: string;
  feature2Title: string;
  feature2Desc: string;
  feature3Title: string;
  feature3Desc: string;
  feature4Title: string;
  feature4Desc: string;

  // Dashboard Tabs & Navigation
  tabsOverview: string;
  tabsApprovals: string;
  tabsLinks: string;
  reviewsCount: string;

  // Dashboard Header & Simulator
  dashboardSubOverview: string;
  dashboardSubApprovals: string;
  dashboardSubLinks: string;
  holidayToggle: string;
  holidayActive: string;
  holidayOff: string;

  // KPI Metrics
  kpiTotalBudget: string;
  kpiWorkCompleted: string;
  kpiBudgetRemaining: string;
  kpiWhenBudgetRunsOut: string;
  days: string;
  hours: string;
  logged: string;
  available: string;
  hoursSpent: string;
  hoursLeft: string;
  runwayHealthy: string;
  orderMoreBy: string;
  week: string;
  midDecember: string;
  fullyFunded: string;

  // Project Cards & Cockpit
  allProjectsOverview: string;
  allProjectsSub: string;
  schedule: string;
  rate: string;
  used: string;
  openCockpit: string;
  commercialPrivacy: string;

  // Forms
  onboardHeader: string;
  onboardSub: string;
  externalCompany: string;
  projectName: string;
  orderNumber: string;
  autoGenerate: string;
  budgetDays: string;
  hourlyRate: string;
  startDate: string;
  finishDate: string;
  computedValue: string;
  createLinkButton: string;
  activeLinksHeader: string;
  activeLinksSub: string;
  copy: string;
  copied: string;

  // Reviews & Approvals
  reviewLogsHeader: string;
  reviewLogsSub: string;
  totalSubmissions: string;
  dateCol: string;
  contractCol: string;
  companyCol: string;
  specialistCol: string;
  deliverableValCol: string;
  whatWasBuiltCol: string;
  statusCol: string;
  actionCol: string;
  proofAttached: string;
  proofModalTitle: string;
  proofModalSub: string;
  approve: string;
  reject: string;
  approved: string;
  rejected: string;
  needsReview: string;
  extensionRequested: string;
  completed: string;
  leadApprovalRequired: string;

  // Contractor Portal
  portalTitle: string;
  portalSubtitle: string;
  projectScope: string;
  totalContractBudget: string;
  burnedAcrossProject: string;
  remainingFreeBudget: string;
  requestBudgetExtension: string;
  closeForm: string;
  additionalHours: string;
  extensionReason: string;
  sendExtensionRequest: string;
  submitNewWorkPackage: string;
  submitWorkPackageSub: string;
  dateOfWork: string;
  hoursWorked: string;
  workDescription: string;
  attachProof: string;
  removeAttachment: string;
  uploadHint: string;
  submitWorkLog: string;
  submitting: string;
  workHistoryHeader: string;
  workHistorySub: string;

  // Login Screen
  loginTitle: string;
  loginSub: string;
  emailLabel: string;
  passwordLabel: string;
  loginButton: string;
  signingIn: string;
}

const translations: Record<Language, Translations> = {
  en: {
    // Common & Navigation
    brandSubtitle: "Enterprise Order Governance",
    signIn: "Sign In",
    signOut: "Log Out",
    dashboard: "Go to Dashboard",
    liveDemo: "Live Demo",
    connecting: "Connecting...",
    backToOverview: "Back to All Projects Overview",
    closePreview: "Close Preview",

    // Landing Page
    heroBadge: "Article26 Hackathon 2026 · Team Orvix",
    heroHeadline1: "Every hour you buy, ",
    heroHeadline2: "in plain view.",
    heroSub:
      "The smart time booking and budget runway radar for German enterprises buying project work from outside service providers. No more guessing how long budget will last.",
    launchDashboard: "Launch Project Lead Dashboard",
    zeroInstall: "Zero installation required · Preloaded with challenge scenario data",
    builtForNeedTitle: "Built for what German enterprises actually need",
    builtForNeedSub:
      "Every feature directly targets the pain points outlined in the hackathon challenge brief.",
    feature1Title: "4-Week Early Warning Radar",
    feature1Desc:
      "Purchasing takes 4 weeks to approve follow-up purchase orders. Orvix calculates exact exhaustion weeks considering holiday breaks and triggers reorders well before work stops.",
    feature2Title: "Multi-Metric Clarity (Money, Days & Hours)",
    feature2Desc:
      "Executives track Euros (€); contracts specify person-days; specialists deliver flexible hours. Orvix presents all three simultaneously with Money leading on top.",
    feature3Title: "German Working Time Compliance (ArbZG § 3)",
    feature3Desc:
      "Enforces statutory 10.0h daily working limits server-side while supporting realistic flexible hours (e.g., 3.5h, 4h, 7.5h). Rejects non-compliant bookings automatically.",
    feature4Title: "Bidirectional Budget Extensions",
    feature4Desc:
      "When deliverables grow, external contractors can submit a budget extension request with reason directly from their portal. The Project Lead reviews and approves it in 1 click.",

    // Dashboard Tabs
    tabsOverview: "Budget & Forecast Radar",
    tabsApprovals: "Review Work Logs",
    tabsLinks: "Contractor Access Links",
    reviewsCount: "Reviews",

    // Dashboard Header & Simulator
    dashboardSubOverview: "Tracking burn pace and holiday-adjusted forecast across external contracts",
    dashboardSubApprovals: "Verify contractor daily deliverable hours and approve budget extensions",
    dashboardSubLinks: "Create secure workspace access links with configurable hourly rates (€/h)",
    holidayToggle: "Simulate Christmas / Year-End Shutdown",
    holidayActive: "Holiday Freeze Active",
    holidayOff: "Excluding Holidays",

    // KPI Metrics
    kpiTotalBudget: "Total Budget",
    kpiWorkCompleted: "Work Completed",
    kpiBudgetRemaining: "Budget Remaining",
    kpiWhenBudgetRunsOut: "When Budget Runs Out",
    days: "Days",
    hours: "Hours",
    logged: "Logged",
    available: "Available",
    hoursSpent: "Hours spent",
    hoursLeft: "Hours left",
    runwayHealthy: "Runway Healthy",
    orderMoreBy: "Order More by Wk",
    week: "Week",
    midDecember: "Mid-December 2026",
    fullyFunded: "Fully Funded until completion",

    // Project Cards & Cockpit
    allProjectsOverview: "Active External Service Contracts",
    allProjectsSub: "Live status, budget consumption, and runway radar per contract",
    schedule: "Schedule",
    rate: "Agreed Rate",
    used: "used",
    openCockpit: "Open Project Cockpit & Radar",
    commercialPrivacy:
      "Commercial Privacy Active: Under German § 147 AO / DSGVO rules, contractor individual names and granular activity notes are redacted for Purchasing. Only aggregated totals (Σ) are accessible, and formal sign-off is reserved for the Client Project Lead.",

    // Forms
    onboardHeader: "Onboard External Service Provider",
    onboardSub: "Create a secure tokenized workspace link with agreed budget and hourly rate",
    externalCompany: "External Company Name",
    projectName: "Project Name / Scope",
    orderNumber: "Contract / Order Number",
    autoGenerate: "Auto-Generate",
    budgetDays: "Agreed Budget (Days)",
    hourlyRate: "Agreed Hourly Rate (€/h)",
    startDate: "Project Start Date",
    finishDate: "Target Finish Date",
    computedValue: "Computed Total Contract Value",
    createLinkButton: "Create Access Link",
    activeLinksHeader: "Active Contractor Links & Contracts",
    activeLinksSub: "Single-tenant contractor portal URLs for external service providers",
    copy: "Copy",
    copied: "Copied",

    // Reviews & Approvals
    reviewLogsHeader: "Review & Approve Work Logs",
    reviewLogsSub: "Check work submitted by external contractors before invoices are paid",
    totalSubmissions: "Total Submissions",
    dateCol: "Date",
    contractCol: "Contract Number",
    companyCol: "Company",
    specialistCol: "Specialist Name",
    deliverableValCol: "Deliverable Value & Time",
    whatWasBuiltCol: "What Was Built",
    statusCol: "Status",
    actionCol: "Action",
    proofAttached: "Proof Attached",
    proofModalTitle: "Proof of Work / Deliverable Attachment",
    proofModalSub: "Attached by contractor as proof of delivery (Leistungsnachweis)",
    approve: "Approve",
    reject: "Reject",
    approved: "Approved",
    rejected: "Rejected",
    needsReview: "Needs Review",
    extensionRequested: "Extension Requested",
    completed: "Completed",
    leadApprovalRequired: "Lead Approval Required",

    // Contractor Portal
    portalTitle: "Time Booking & Deliverables Portal",
    portalSubtitle: "Contractor Workspace · Deutsche Enterprise AG",
    projectScope: "Project Scope",
    totalContractBudget: "Total Contract Budget",
    burnedAcrossProject: "Burned Across Project",
    remainingFreeBudget: "Remaining Free Budget",
    requestBudgetExtension: "Request Budget Extension",
    closeForm: "Close Form",
    additionalHours: "Additional Hours Needed",
    extensionReason: "Reason for Extension",
    sendExtensionRequest: "Send Extension Request to Lead",
    submitNewWorkPackage: "Submit New Work Package",
    submitWorkPackageSub: "Submit your delivered work against contract",
    dateOfWork: "Date of Work",
    hoursWorked: "Hours Worked (ArbZG Max 10.0h)",
    workDescription: "Work Deliverable Package Description",
    attachProof: "Attach Screenshot / Proof of Work (Optional)",
    removeAttachment: "Remove file",
    uploadHint: "Supports PNG, JPG, WEBP screenshots up to 2MB",
    submitWorkLog: "Submit Work Log for Client Approval",
    submitting: "Submitting...",
    workHistoryHeader: "Your Work History & Deliverables",
    workHistorySub: "Contractor peer isolation active: Deliverables logged by your specialist account",

    // Login Screen
    loginTitle: "Log in to Orvix",
    loginSub: "Deutsche Enterprise AG · Order Governance Platform",
    emailLabel: "Corporate email address",
    passwordLabel: "Password",
    loginButton: "Log in",
    signingIn: "Signing in...",
  },
  de: {
    // Common & Navigation
    brandSubtitle: "Externe Auftragssteuerung",
    signIn: "Anmelden",
    signOut: "Abmelden",
    dashboard: "Zum Dashboard",
    liveDemo: "Live-Demo",
    connecting: "Verbinde...",
    backToOverview: "Zurück zur Gesamtübersicht",
    closePreview: "Vorschau schließen",

    // Landing Page
    heroBadge: "Article26 Hackathon 2026 · Team Orvix",
    heroHeadline1: "Jede eingekaufte Stunde, ",
    heroHeadline2: "glasklar im Blick.",
    heroSub:
      "Das intelligente Zeiterfassungs- und Budget-Runway-Cockpit für deutsche Großunternehmen beim Einkauf externer Projektdienstleister. Kein Rätselraten mehr, wie lange das Budget reicht.",
    launchDashboard: "Projektleiter-Dashboard öffnen",
    zeroInstall: "Keine Installation nötig · Mit Challenge-Szenariodaten vorkonfiguriert",
    builtForNeedTitle: "Entwickelt für die echten Herausforderungen deutscher Konzerne",
    builtForNeedSub:
      "Jedes Feature löst exakt die Kernprobleme der offiziellen Hackathon-Aufgabenstellung.",
    feature1Title: "4-Wochen-Frühwarn-Radar",
    feature1Desc:
      "Der Konzerneinkauf benötigt 4 Wochen für Folgebestellungen. Orvix berechnet die Kalenderwoche der Budgeterschöpfung unter Berücksichtigung von Feiertagen und warnt rechtzeitig vor Baustopps.",
    feature2Title: "Multi-Metrik-Klarheit (Geld, Tage & Stunden)",
    feature2Desc:
      "Das Management steuert in Euro (€); Verträge basieren auf Personentagen; Spezialisten buchen flexible Stunden. Orvix visualisiert alle drei Metriken konsistent mit Geld an oberster Stelle.",
    feature3Title: "Arbeitszeitgesetz-Konformität (ArbZG § 3)",
    feature3Desc:
      "Erzwingt gesetzliche 10,0h-Tageshöchstgrenzen serverseitig und unterstützt flexible Teilzeitkontingente (z. B. 3,5h, 4h, 7,5h). Verstöße werden automatisch abgewiesen.",
    feature4Title: "Bidirektionale Budgeterweiterungen",
    feature4Desc:
      "Wenn Anforderungen wachsen, können externe Auftragnehmer direkt im Portal eine Budgeterhöhung mit Begründung anfragen. Der Projektleiter gibt sie mit einem Klick frei.",

    // Dashboard Tabs
    tabsOverview: "Budget- & Prognose-Radar",
    tabsApprovals: "Leistungsnachweise prüfen",
    tabsLinks: "Auftragnehmer-Zugänge",
    reviewsCount: "Prüfungen",

    // Dashboard Header & Simulator
    dashboardSubOverview: "Verbrauchsgeschwindigkeit und feiertagsbereinigte Prognose aller externen Verträge",
    dashboardSubApprovals: "Tägliche Leistungsnachweise externer Berater prüfen und Budgetanfragen freigeben",
    dashboardSubLinks: "Sichere Zugangslinks mit flexiblen Stundensätzen (€/h) für Auftragnehmer generieren",
    holidayToggle: "Weihnachts- & Neujahrs-Betriebsruhe simulieren",
    holidayActive: "Betriebsruhe aktiv",
    holidayOff: "Ohne Betriebsruhe",

    // KPI Metrics
    kpiTotalBudget: "Gesamtbudget",
    kpiWorkCompleted: "Geleistete Arbeit",
    kpiBudgetRemaining: "Restbudget",
    kpiWhenBudgetRunsOut: "Budgetreichweite & Radar",
    days: "Tage",
    hours: "Stunden",
    logged: "Erbracht",
    available: "Verfügbar",
    hoursSpent: "Stunden geleistet",
    hoursLeft: "Stunden verbleibend",
    runwayHealthy: "Budget gesichert",
    orderMoreBy: "Nachbestellen bis KW",
    week: "KW",
    midDecember: "Mitte Dezember 2026",
    fullyFunded: "Voll finanziert bis Projektabschluss",

    // Project Cards & Cockpit
    allProjectsOverview: "Aktive externe Dienstleistungsverträge",
    allProjectsSub: "Echtzeitstatus, Budgetverbrauch und Runway-Radar je Auftrag",
    schedule: "Projektzeitraum",
    rate: "Vereinbarter Satz",
    used: "verbraucht",
    openCockpit: "Projekt-Cockpit & Radar öffnen",
    commercialPrivacy:
      "Datenschutz nach § 147 AO aktiv: Einzelne Beraternamen und Detailtätigkeiten sind für den Einkauf anonymisiert. Nur Gesamtsummen (Σ) sind einsehbar; fachliche Abnahmen obliegen der Projektleitung.",

    // Forms
    onboardHeader: "Externen Dienstleister anbinden",
    onboardSub: "Erstellt einen sicheren Token-Arbeitsbereich mit vereinbartem Budget und Stundensatz",
    externalCompany: "Name des externen Dienstleisters",
    projectName: "Projektname / Leistungsgegenstand",
    orderNumber: "Bestellnummer (PO)",
    autoGenerate: "Automatisch generieren",
    budgetDays: "Vereinbartes Budget (Tage)",
    hourlyRate: "Vereinbarter Stundensatz (€/h)",
    startDate: "Projekt-Startdatum",
    finishDate: "Ziel-Fertigstellung",
    computedValue: "Berechneter Gesamtauftragswert",
    createLinkButton: "Zugangslink erstellen",
    activeLinksHeader: "Aktive Auftragnehmer-Links & Verträge",
    activeLinksSub: "Dedizierte Portal-Links für externe Dienstleister",
    copy: "Kopieren",
    copied: "Kopiert",

    // Reviews & Approvals
    reviewLogsHeader: "Leistungsnachweise prüfen & freigeben",
    reviewLogsSub: "Erbrachte Leistungen externer Spezialisten vor Rechnungsfreigabe prüfen",
    totalSubmissions: "Eingereichte Nachweise",
    dateCol: "Datum",
    contractCol: "Bestellnummer",
    companyCol: "Dienstleister",
    specialistCol: "Beratername",
    deliverableValCol: "Leistungswert & Zeit",
    whatWasBuiltCol: "Erbrachte Leistung",
    statusCol: "Status",
    actionCol: "Aktion",
    proofAttached: "Nachweis angehängt",
    proofModalTitle: "Leistungsnachweis / Lieferbeleg",
    proofModalSub: "Vom Dienstleister als Leistungsnachweis eingereicht",
    approve: "Freigeben",
    reject: "Ablehnen",
    approved: "Freigegeben",
    rejected: "Abgelehnt",
    needsReview: "Prüfung ausstehend",
    extensionRequested: "Aufstockung beantragt",
    completed: "Abgeschlossen",
    leadApprovalRequired: "Freigabe durch Projektleiter erforderlich",

    // Contractor Portal
    portalTitle: "Zeiterfassungs- & Leistungsportal",
    portalSubtitle: "Auftragnehmer-Arbeitsbereich · Deutsche Enterprise AG",
    projectScope: "Projektgegenstand",
    totalContractBudget: "Gesamt-Auftragsbudget",
    burnedAcrossProject: "Im Gesamtprojekt verbraucht",
    remainingFreeBudget: "Verfügbares Restbudget",
    requestBudgetExtension: "Budgeterweiterung anfordern",
    closeForm: "Formular schließen",
    additionalHours: "Zusätzliche Stunden benötigt",
    extensionReason: "Begründung der Budgeterhöhung",
    sendExtensionRequest: "Erweiterungsanfrage an Projektleiter senden",
    submitNewWorkPackage: "Neues Arbeitspaket einreichen",
    submitWorkPackageSub: "Erfassen Sie Ihre erbrachten Leistungen zu Auftrag",
    dateOfWork: "Leistungsdatum",
    hoursWorked: "Arbeitsstunden (ArbZG max. 10,0h)",
    workDescription: "Beschreibung des gelieferten Arbeitspakets",
    attachProof: "Screenshot / Leistungsnachweis anhängen (Optional)",
    removeAttachment: "Anhang entfernen",
    uploadHint: "Unterstützt PNG, JPG, WEBP Screenshots bis 2 MB",
    submitWorkLog: "Leistungsnachweis zur Freigabe übermitteln",
    submitting: "Wird übermittelt...",
    workHistoryHeader: "Ihre erbrachten Leistungsnachweise",
    workHistorySub: "Auftragnehmer-Isolation aktiv: Nur von Ihrem Spezialistenkonto gebuchte Leistungen",

    // Login Screen
    loginTitle: "Bei Orvix anmelden",
    loginSub: "Deutsche Enterprise AG · Auftragssteuerungs-Plattform",
    emailLabel: "Geschäftliche E-Mail-Adresse",
    passwordLabel: "Passwort",
    loginButton: "Anmelden",
    signingIn: "Wird angemeldet...",
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "de",
  setLanguage: () => {},
  t: translations.de,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("de");

  useEffect(() => {
    const saved = localStorage.getItem("orvix_lang") as Language;
    if (saved === "en" || saved === "de") {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("orvix_lang", lang);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t: translations[language],
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
