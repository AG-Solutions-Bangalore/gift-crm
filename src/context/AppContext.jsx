import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { checkPanelStatus, fetchPanelDotenv, getApiConfig, resolveImageUrl } from '../services/api';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [appStatus, setAppStatus] = useState('loading'); // 'loading' | 'ok' | 'error'
  const [panelStatusData, setPanelStatusData] = useState(null);
  const [dotenvData, setDotenvData] = useState(null);
  const [companyInfo, setCompanyInfo] = useState({
    company_name: 'Gift CRM',
    tagline: 'Making Every Moment Special'
  });
  const [appVersion, setAppVersion] = useState('2.4.0');
  const apiConfig = useMemo(() => getApiConfig(), []);

  const imageUrls = useMemo(() => {
    return panelStatusData?.image_url || [];
  }, [panelStatusData]);

  const getImageUrl = (imageFor, fileName) => {
    return resolveImageUrl(imageFor, fileName, imageUrls);
  };

  const loadPanelStatus = async () => {
    setAppStatus('loading');
    try {
      const data = await checkPanelStatus();
      setPanelStatusData(data);
      if (data?.company_detils) {
        setCompanyInfo(data.company_detils);
      }
      if (data?.version?.version_panel) {
        setAppVersion(data.version.version_panel);
      }
      setAppStatus('ok');
    } catch (err) {
      console.warn('[AppContext] Status check warning:', err.message);
      setAppStatus('ok');
    }
  };

  const loadPanelDotenv = async () => {
    try {
      const res = await fetchPanelDotenv();
      setDotenvData(res);
      return res;
    } catch (err) {
      console.warn('[AppContext] Dotenv load warning:', err.message);
      return null;
    }
  };

  useEffect(() => {
    loadPanelStatus();
    loadPanelDotenv();
  }, []);

  const value = useMemo(
    () => ({
      appStatus,
      panelStatusData,
      dotenvData,
      companyInfo,
      appVersion,
      imageUrls,
      getImageUrl,
      apiConfig,
      apiBaseUrl: apiConfig.baseUrl,
      viteKey: apiConfig.viteKey,
      viteSecretKey: apiConfig.viteSecretKey,
      refreshPanelStatus: loadPanelStatus,
      refreshPanelDotenv: loadPanelDotenv
    }),
    [appStatus, panelStatusData, dotenvData, companyInfo, appVersion, imageUrls, apiConfig]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used inside AppProvider');
  return ctx;
};

export const useApiContext = () => {
  return useAppContext();
};

export default AppContext;
