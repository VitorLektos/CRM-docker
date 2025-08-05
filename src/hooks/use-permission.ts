import { useAuth } from "@/contexts/AuthContext";

export const usePermission = () => {
  const { profile } = useAuth();

  const hasPermission = (permissionKey: string): boolean => {
    if (!profile) return false;
    if (profile.role === 'admin') return true;
    return !!profile.permissions?.[permissionKey];
  };

  const isManagerOrAdmin = (): boolean => {
    if (!profile) return false;
    return profile.role === 'admin' || profile.role === 'gestor';
  };

  return { hasPermission, isManagerOrAdmin, profile };
};