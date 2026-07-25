export const config = {
  matcher: [
    '/admin',
    '/admin/:path*',
    '/wp-admin/:path*',
    '/.env',
    '/.git/:path*',
    '/phpmyadmin/:path*',
  ],
};

export default function middleware() {
  return new Response('Not found', { status: 404 });
}
