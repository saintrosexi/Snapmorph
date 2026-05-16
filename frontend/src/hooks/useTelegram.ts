import { useEffect, useState } from 'react';
import { initUtils, useLaunchParams, useSignal } from '@telegram-apps/sdk-react';

export function useTelegram() {
  const [isReady, setIsReady] = useState(false);
  const lp = useLaunchParams();

  useEffect(() => {
    // Initialization logic if needed
    setIsReady(true);
  }, []);

  return {
    isReady,
    user: lp.initData?.user,
    initData: lp.initDataRaw,
    startParam: lp.initData?.startParam,
    close: () => {
      // close logic
    }
  };
}
