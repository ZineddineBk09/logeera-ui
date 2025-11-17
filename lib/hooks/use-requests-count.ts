import useSWR from 'swr';
import { RequestsService } from '@/lib/services';
import { swrKeys } from '@/lib/swr-config';
import { useAuth } from './use-auth';

/**
 * Hook to get the total count of requests (incoming + outgoing)
 * Used for displaying badge counts in navigation
 */
export function useRequestsCount() {
  const { user } = useAuth();

  // Fetch incoming requests
  const { data: incomingRequests = [] } = useSWR(
    user ? swrKeys.requests.incoming() : null,
    () => RequestsService.incoming().then((r) => r.json()),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      refreshInterval: 30000, // Refresh every 30 seconds
    },
  );

  // Fetch outgoing requests
  const { data: outgoingRequests = [] } = useSWR(
    user ? swrKeys.requests.outgoing() : null,
    () => RequestsService.outgoing().then((r) => r.json()),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      refreshInterval: 30000, // Refresh every 30 seconds
    },
  );

  const totalRequests =
    (Array.isArray(incomingRequests) ? incomingRequests.length : 0) +
    (Array.isArray(outgoingRequests) ? outgoingRequests.length : 0);

  return {
    totalRequests,
    incomingCount: Array.isArray(incomingRequests)
      ? incomingRequests.length
      : 0,
    outgoingCount: Array.isArray(outgoingRequests)
      ? outgoingRequests.length
      : 0,
    isLoading: !user,
  };
}

