import { useCallback, useEffect, useState } from 'react';
import { AppRoute, DEFAULT_ROUTE, parseRouteFromSearch } from '../types/routes';

function readRoute(): AppRoute {
  return parseRouteFromSearch(window.location.search);
}

/** Synchronise la vue active avec l'URL (boutons du ruban Excel). */
export function useAppRoute(): [AppRoute, () => void] {
  const [route, setRoute] = useState<AppRoute>(readRoute);

  const refreshRoute = useCallback(() => {
    setRoute(readRoute());
  }, []);

  useEffect(() => {
    refreshRoute();

    const onPopState = () => refreshRoute();
    window.addEventListener('popstate', onPopState);

    const interval = window.setInterval(refreshRoute, 500);

    return () => {
      window.removeEventListener('popstate', onPopState);
      window.clearInterval(interval);
    };
  }, [refreshRoute]);

  return [route.action ? route : DEFAULT_ROUTE, refreshRoute];
}
