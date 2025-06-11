// src/hooks/use-courses.js
'use client';
import useSWR from 'swr';

const fetcher = (url) => fetch(url).then((r) => r.json());

export const useCourses = (userId) =>
  useSWR(
    userId
      ? `http://localhost:3005/api/profile/courses/${userId}/courses`
      : null,
    fetcher
  );
