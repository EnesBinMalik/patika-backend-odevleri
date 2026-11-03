/**
 * @license
 * Copyright 2026 Enes Öztürk — tüm hakları saklıdır
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState, useEffect, useCallback, useRef } from 'react';

// Battery Status API TypeScript DOM lib'inde tanımlı değil; gerekli alanları kendimiz bildiriyoruz.
interface BatteryManagerLike {
  level: number;
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  addEventListener(type: string, listener: () => void): void;
  removeEventListener(type: string, listener: () => void): void;
}

interface NavigatorWithBattery extends Navigator {
  getBattery?: () => Promise<BatteryManagerLike>;
}

export interface BatteryState {
  level: number; // 0 - 100
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  isRealApi: boolean;
  voltage: number; // Simulated or estimated, e.g. 3.92V
  temperature: number; // Simulated e.g. 29.4C
}

export type TiltSource = 'idle' | 'sensor' | 'pointer';

export interface GyroState {
  alpha: number; // compass rotation 0-360
  beta: number; // front-back tilt -180 to 180
  gamma: number; // left-right tilt -90 to 90
  tiltX: number; // normalized -1 to 1
  tiltY: number; // normalized -1 to 1
  isSupported: boolean;
  isPermissionGranted: boolean;
  source: TiltSource; // 'sensor' = gerçek deviceorientation, 'pointer' = fare/dokunma taklidi
}

export function useDeviceSensors() {
  // Battery State
  const [battery, setBattery] = useState<BatteryState>({
    level: 84,
    charging: false,
    chargingTime: 0,
    dischargingTime: Infinity,
    isRealApi: false,
    voltage: 3.98,
    temperature: 31.2,
  });

  // Gyroscope State
  const [gyro, setGyro] = useState<GyroState>({
    alpha: 0,
    beta: 0,
    gamma: 0,
    tiltX: 0,
    tiltY: 0,
    isSupported: false,
    isPermissionGranted: false,
    source: 'idle',
  });

  // Oturum saati ve süre sayacı
  const [currentTime, setCurrentTime] = useState<string>('');
  const [utcTime, setUtcTime] = useState<string>('');
  const [sessionUptime, setSessionUptime] = useState<string>('00:00:00.00');
  // DEKORATİF: rastgele üretilen süslü sayı. Gerçek bir ağ/sensör ölçümü değildir.
  const [decorativeJitter, setDecorativeJitter] = useState<string>('894');
  
  const sessionStartRef = useRef<number>(Date.now());

  // 1. Live System Clocks
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setUtcTime(now.toISOString().substring(11, 19) + ' UTC');

      // Session uptime counter
      const elapsed = Date.now() - sessionStartRef.current;
      const hours = Math.floor(elapsed / 3600000).toString().padStart(2, '0');
      const minutes = Math.floor((elapsed % 3600000) / 60000).toString().padStart(2, '0');
      const seconds = Math.floor((elapsed % 60000) / 1000).toString().padStart(2, '0');
      const centis = Math.floor((elapsed % 1000) / 10).toString().padStart(2, '0');
      setSessionUptime(`${hours}:${minutes}:${seconds}.${centis}`);

      setDecorativeJitter(Math.floor(100 + Math.random() * 899).toString());
    };

    updateTime();
    const interval = setInterval(updateTime, 40);
    return () => clearInterval(interval);
  }, []);

  // 2. Battery API integration
  useEffect(() => {
    let batteryInstance: BatteryManagerLike | null = null;
    let batteryUpdate: (() => void) | null = null;
    let isMounted = true;

    const nav = navigator as NavigatorWithBattery;

    if (typeof nav !== 'undefined' && typeof nav.getBattery === 'function') {
      nav.getBattery()
        .then((b) => {
          if (!isMounted) return;
          batteryInstance = b;
          batteryUpdate = () => {
            if (!isMounted) return;
            const lvl = Math.round(b.level * 100);
            setBattery({
              level: lvl,
              charging: b.charging,
              chargingTime: b.chargingTime,
              dischargingTime: b.dischargingTime,
              isRealApi: true,
              voltage: +(3.6 + (lvl / 100) * 0.65).toFixed(2),
              temperature: +(28.5 + (b.charging ? 4.2 : 0)).toFixed(1),
            });
          };

          batteryUpdate();
          b.addEventListener('levelchange', batteryUpdate);
          b.addEventListener('chargingchange', batteryUpdate);
        })
        .catch(() => {
          if (isMounted) useDemoBattery();
        });
    } else {
      useDemoBattery();
    }

    // Tarayıcıda Battery Status API yoksa (Chrome masaüstü hariç çoğu tarayıcı)
    // gösterilen değerler dekoratiftir; isRealApi = false bunu arayüzde etiketlenir.
    function useDemoBattery() {
      setBattery(prev => ({
        ...prev,
        level: 86,
        charging: false,
        isRealApi: false,
        voltage: 4.02,
        temperature: 30.8,
      }));
    }

    return () => {
      isMounted = false;
      if (batteryInstance && batteryUpdate) {
        batteryInstance.removeEventListener('levelchange', batteryUpdate);
        batteryInstance.removeEventListener('chargingchange', batteryUpdate);
      }
    };
  }, []);

  // Manual Battery Simulation Controls (for user testing)
  const toggleCharging = useCallback(() => {
    setBattery(prev => {
      const nextCharging = !prev.charging;
      return {
        ...prev,
        charging: nextCharging,
        temperature: nextCharging ? +(prev.temperature + 3.1).toFixed(1) : +(prev.temperature - 3.1).toFixed(1)
      };
    });
  }, []);

  const adjustBatteryLevel = useCallback((delta: number) => {
    setBattery(prev => {
      const nextLevel = Math.max(5, Math.min(100, prev.level + delta));
      return {
        ...prev,
        level: nextLevel,
        voltage: +(3.6 + (nextLevel / 100) * 0.65).toFixed(2)
      };
    });
  }, []);

  // 3. Gyroscope & Device Motion
  useEffect(() => {
    let hasGyro = false;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.beta !== null && e.gamma !== null) {
        hasGyro = true;
        // Clamp gamma (-45 to 45) and beta (-45 to 45) for natural mobile card tilt
        const gamma = e.gamma ?? 0;
        const beta = e.beta ?? 0;
        const alpha = e.alpha ?? 0;

        const tiltX = Math.max(-1, Math.min(1, gamma / 40));
        const tiltY = Math.max(-1, Math.min(1, (beta - 35) / 40)); // Calibrated for typical ~35-degree hand-held angle

        setGyro({
          alpha: Math.round(alpha),
          beta: Math.round(beta),
          gamma: Math.round(gamma),
          tiltX,
          tiltY,
          isSupported: true,
          isPermissionGranted: true,
          source: 'sensor',
        });
      }
    };

    // Yedek: masaüstünde veya sensör izni öncesinde fare/dokunma hareketiyle 3D eğim taklidi
    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (hasGyro) return; // Donanım sensörü aktifse ona öncelik ver

      let clientX = 0;
      let clientY = 0;

      if ('touches' in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ('clientX' in e) {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      const normX = (clientX / window.innerWidth) * 2 - 1;
      const normY = (clientY / window.innerHeight) * 2 - 1;

      setGyro(prev => ({
        ...prev,
        tiltX: +normX.toFixed(3),
        tiltY: +normY.toFixed(3),
        // İmleç koordinatlarından türetilen dereceler — gerçek sensör okuması değil
        gamma: Math.round(normX * 30),
        beta: Math.round(normY * 30),
        source: 'pointer',
      }));
    };

    if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
      window.addEventListener('deviceorientation', handleOrientation, true);
    }

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    window.addEventListener('touchmove', handlePointerMove, { passive: true });

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('deviceorientation', handleOrientation);
        window.removeEventListener('mousemove', handlePointerMove);
        window.removeEventListener('touchmove', handlePointerMove);
      }
    };
  }, []);

  // iOS 13+ cihaz hareketi izni iste; diğer tarayıclarda izin API'si yok,
  // destek iddiasını yalnızca gerçek bir deviceorientation olayı geldiğinde kesinleştiriyoruz.
  const requestGyroPermission = useCallback(async () => {
    if (typeof window === 'undefined') return false;

    if (!('DeviceOrientationEvent' in window)) {
      return false;
    }

    const orientationEvent = DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<PermissionState | string>;
    };

    if (typeof orientationEvent.requestPermission === 'function') {
      try {
        const response = await orientationEvent.requestPermission();
        const granted = response === 'granted';
        setGyro(prev => ({ ...prev, isPermissionGranted: granted }));
        return granted;
      } catch (err) {
        console.warn('Gyro permission request error:', err);
        return false;
      }
    }

    // İzin dialog'u olmayan tarayıcılar: API var, sensör olup olmadığı ilk olayda anlaşılır
    setGyro(prev => ({ ...prev, isPermissionGranted: true }));
    return true;
  }, []);

  return {
    battery,
    toggleCharging,
    adjustBatteryLevel,
    gyro,
    requestGyroPermission,
    currentTime,
    utcTime,
    sessionUptime,
    decorativeJitter,
  };
}
