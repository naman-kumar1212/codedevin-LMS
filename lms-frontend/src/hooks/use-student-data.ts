'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

export function useMyCourses() {
  return useQuery({
    queryKey: ['my-courses'],
    queryFn: () => api.getMyCourses().then((r) => r.data),
  });
}

export function useCoursePlayer(courseId: string) {
  return useQuery({
    queryKey: ['course-player', courseId],
    queryFn: () => api.getCourse(courseId).then((r) => r.data),
    enabled: !!courseId,
  });
}

export function useCourseProgress(courseId: string, userId?: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['progress', courseId],
    queryFn: () => api.getCourseProgress(courseId).then((r) => r.data),
    enabled: !!courseId && !!userId,
  });

  const markComplete = useMutation({
    mutationFn: (lessonId: string) => api.markResourceComplete(lessonId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress', courseId] });
    },
  });

  const trackVideo = useMutation({
    mutationFn: ({ lessonId, pct }: { lessonId: string; pct: number }) => 
      api.trackVideo(lessonId, pct),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress', courseId] });
    },
  });

  return {
    ...query,
    markComplete,
    trackVideo,
  };
}

export function useCertificates() {
  return useQuery({
    queryKey: ['certificates'],
    queryFn: () => api.getMyCertificates().then((r) => r.data),
  });
}

export function useNotifications() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.getMyNotifications().then((r) => r.data),
  });

  const markRead = useMutation({
    mutationFn: (id: string) => api.markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  return {
    ...query,
    markRead,
  };
}
