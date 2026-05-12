// ═══════════════════════════════════════════════════════════════════════════════
// contacts/index.js
// Clean exports for the contacts module
// ═══════════════════════════════════════════════════════════════════════════════

// Main Components
export { default as ContactManagement } from "./ContactManagement";
export { default as Contacts } from "./Contacts";
export { default as Groups } from "./Groups";
export { default as SmartContactManagement } from "./SmartContactManagement";

// Hooks
export { useContacts } from "./hooks/useContacts";
export { useGroups, useGroupSelection, useSegments } from "./hooks/useGroups";
export { useContactFilters } from "./hooks/useContactFilters";
export { useContactSelection } from "./hooks/useContactSelection";

// UI Components - Contacts
export { default as ContactList } from "./components/ContactList";
export { default as ContactForm } from "./components/ContactForm";
export {
  SearchBar,
  FilterPanel,
  ActiveFiltersBadge,
  BulkActionsBar,
  TabNavigation,
} from "./components/ContactFilters";
export {
  WelcomeScreen,
  EmptyContactsState,
  ContactListSkeleton,
} from "./components/EmptyStates";

// UI Components - Groups
export { default as GroupList, GroupListSkeleton } from "./components/GroupList";
export { default as GroupForm, GroupWelcomeScreen } from "./components/GroupForm";

// API
export { contactsApi, groupsApi, segmentsApi } from "./api/contactsApi";


// Smart Contact Management
export { default as SmartContactManagement } from "./SmartContactManagement";
export {
  StatusBadge,
  StatsCards,
  StatusFilterTabs,
  SmartBulkActionsBar,
  SmartEmptyState,
} from "./components/SmartComponents";
export { ExportModal, ExportHistoryPanel } from "./components/ExportModal";
export {
  useContactStats,
  useSmartContacts,
  useExportHistory,
  useContactExport,
  useBulkActions,
} from "./hooks/useSmartContacts";