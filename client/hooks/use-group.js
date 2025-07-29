'use client';

import useSWR from 'swr';
// import { fetcher } from '@/services/fetcher';
import { fetcherGroup } from '@/services/rest-client/use-fetcher';
// import { useAuth } from '@/hooks/use-auth';

export const useGroups = (memberId, token) => {
  // const { user } = useAuth();
  console.log(memberId);
  return useSWR(
    memberId
      ? [`https://daiski-ispan.onrender.com/api/group/user/${memberId}`, token]
      : null,
    ([url, tk]) => fetcherGroup(url, tk)
  );
};
