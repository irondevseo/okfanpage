/**
 * Đăng nhập bằng cookie Facebook: renderer chỉ gọi IPC.
 * Hàm `extractAccessToken` và gọi Graph API chạy ở main process — xem
 * `src/main-process/facebook-auth.ts`.
 */

export { authLogin, authRestore, authValidate, authLogout } from './authClient';
