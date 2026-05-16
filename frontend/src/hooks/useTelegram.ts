import { useEffect, useState } from 'react';
import { useLaunchParams } from '@telegram-apps/sdk-react';

export function useTelegram() {
  const [isReady, setIsReady] = useState(false);
  const lp = useLaunchParams();

  useEffect(() => {
    setIsReady(true);
  }, []);

  return {
    isReady,
    user: (lp as any).initData?.user,
    initData: lp.initDataRaw,
    startParam: (lp as any).initData?.startParam,
    close: () => {
      // close logic
    }
  };
}
