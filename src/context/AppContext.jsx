import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { checkPanelStatus } from '../services/api';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [appStatus, setAppStatus] = useState('ok'); // 'loading' | 'ok' | 'error'
  const [companyInfo, setCompanyInfo] = useState({
    company_name: 'UtsavGifts CRM',
    tagline: 'Making Every Moment Special'
  });
  const [appVersion, setAppVersion] = useState('2.4.0');

  useEffect(() => {
    (async () => {
      try {
        const data = await checkPanelStatus();
        if (data?.company_detils) {
          setCompanyInfo(data.company_detils);
        }
        if (data?.version?.version_panel) {
          setAppVersion(data.version.version_panel);
        }
        setAppStatus('ok');
      } catch (err) {
        console.warn('[AppContext] Status check warning, continuing in offline mode:', err.message);
        setAppStatus('ok');
      }
    })();
  }, []);

  const value = useMemo(
    () => ({
      appStatus,
      companyInfo,
      appVersion
    }),
    [appStatus, companyInfo, appVersion]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used inside AppProvider');
  return ctx;
};

export default AppContext;
