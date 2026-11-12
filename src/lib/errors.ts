const knownErrors: Record<string, string> = {
  'Invalid login credentials': 'Email atau kata sandi tidak sesuai.',
  'Email not confirmed': 'Konfirmasi email terlebih dahulu sebelum masuk.',
  'User already registered': 'Email ini sudah terdaftar. Silakan masuk.',
  'Password should be at least 6 characters': 'Kata sandi harus terdiri dari minimal 8 karakter.',
  'For security purposes, you can only request this after': 'Tunggu sebentar sebelum meminta tautan baru.',
};

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    const knownError = Object.entries(knownErrors).find(([message]) =>
      error.message.includes(message)
    );
    if (knownError) return knownError[1];
    return error.message;
  }
  return 'Terjadi kesalahan. Silakan coba kembali.';
};
