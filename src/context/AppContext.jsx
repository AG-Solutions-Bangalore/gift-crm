import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { checkPanelStatus, getApiConfig, resolveImageUrl } from '../services/api';

const DEFAULT_COMPANY_DETAILS = {
  id: 1,
  company_name: 'Memory Creators',
  company_email: 'info@memorycreators.in',
  company_short: 'MC',
  company_gst: null,
  company_pan_no: null,
  company_mobile_no: '8867171060',
  company_landline_no: null,
  company_address: 'Jayanagar 9th Block, Bangalore – 560 043 Karnataka.',
  company_place: 'Bangalore',
  company_logo: 'logo.webp',
  company_having_email: 1,
  company_status: 'Active',
};

const DEFAULT_IMAGE_URLS = [
  {
    image_for: 'Company',
    image_url: 'https://memorycreators.in/crmapi/public/assets/images/company_images/',
  },
  {
    image_for: 'No Image',
    image_url: 'https://memorycreators.in/crmapi/public/assets/images/no_image.jpg',
  },
];

const CACHE_KEY = 'gift_crm_status_cache_v1';

export const AppContext = createContext(null);

export function AppProvider({ children }) {
  // Read initial data synchronously from session cache for instant 0ms rendering
  const cachedData = useMemo(() => {
    try {
      const raw = sessionStorage.getItem(CACHE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const [companyInfo, setCompanyInfo] = useState(
    cachedData?.company_detils || DEFAULT_COMPANY_DETAILS
  );
  const [appVersion, setAppVersion] = useState(
    cachedData?.version?.version_panel || '1.0.0'
  );
  const [imageUrls, setImageUrls] = useState(
    Array.isArray(cachedData?.image_url) && cachedData.image_url.length > 0
      ? cachedData.image_url
      : DEFAULT_IMAGE_URLS
  );

  const apiConfig = useMemo(() => getApiConfig(), []);

  const getImageUrl = useCallback(
    (imageFor, fileName) => {
      return resolveImageUrl(imageFor, fileName, imageUrls);
    },
    [imageUrls]
  );

  const updateMetadata = useCallback((data) => {
    if (!data) return;
    if (data.company_detils) {
      setCompanyInfo((prev) => ({ ...prev, ...data.company_detils }));
    }
    if (data.version?.version_panel) {
      setAppVersion(data.version.version_panel);
    }
    if (Array.isArray(data.image_url) && data.image_url.length > 0) {
      setImageUrls(data.image_url);
    }
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch {
      // ignore storage errors
    }
  }, []);

  // Background non-blocking metadata refresh
  useEffect(() => {
    let isMounted = true;
    const fetchStatusAsync = async () => {
      try {
        const data = await checkPanelStatus();
        if (isMounted && data) {
          updateMetadata(data);
        }
      } catch (err) {
        // Silently preserve cached metadata
      }
    };

    fetchStatusAsync();
    return () => {
      isMounted = false;
    };
  }, [updateMetadata]);

  const noImageUrl = useMemo(() => {
    return getImageUrl('No Image', null);
  }, [getImageUrl]);

  const companyLogoUrl = useMemo(() => {
    return getImageUrl('Company', companyInfo?.company_logo);
  }, [getImageUrl, companyInfo?.company_logo]);

  const value = useMemo(
    () => ({
      appStatus: 'ok',
      panelStatusData: cachedData,
      dotenvData: null,
      companyInfo,
      appVersion,
      imageUrls,
      companyLogoUrl,
      noImageUrl,
      getImageUrl,
      apiConfig,
      reloadStatus: () => checkPanelStatus().then(updateMetadata),
    }),
    [
      cachedData,
      companyInfo,
      appVersion,
      imageUrls,
      companyLogoUrl,
      noImageUrl,
      getImageUrl,
      apiConfig,
      updateMetadata,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

export default AppContext;
