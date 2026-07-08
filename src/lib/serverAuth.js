import { cookies } from 'next/headers';
import { verifyToken } from './auth';

export function getSessionUser() {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) return null;

  return verifyToken(token);
}

export function checkAdminSession() {
  const user = getSessionUser();
  if (!user || user.role !== 'ADMIN') {
    return null;
  }
  return user;
}

export function checkTeacherSession() {
  const user = getSessionUser();
  if (!user || user.role !== 'TEACHER') {
    return null;
  }
  return user;
}

export function checkSession() {
  const user = getSessionUser();
  if (!user) {
    return null;
  }
  return user;
}
