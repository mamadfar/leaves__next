'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/authService';
import { IUser } from '@/types/Auth.type';

export const useLogin = () => {
  return useMutation({
    mutationFn: authService.login,
    onError: (error) => {
      console.error('Login error:', error);
    },
  });
};
