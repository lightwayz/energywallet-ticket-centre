export const ADMIN_EMAILS = new Set<string>([
    "info@energywalletng.com",
    "creativepeopleltd@gmail.com",
    "soniaezeribe@energywalletng.com",
    "lightways90@gmail.com",
]);

export const isWhitelistedAdmin = (email: string | null | undefined): boolean => {
    return !!email && ADMIN_EMAILS.has(email.toLowerCase());
};
