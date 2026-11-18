export function getFriendlyApiError(
  message: string | undefined,
  status: number | undefined,
  fallbackMessage: string,
): string {
  const normalizedMessage = message?.toLowerCase() ?? "";

  if (
    normalizedMessage.includes("duplicate entry") &&
    normalizedMessage.includes("devices.device_key")
  ) {
    return "Device key sudah digunakan. Silakan gunakan device key lain.";
  }

  if (
    normalizedMessage.includes("username sudah terdaftar") ||
    normalizedMessage.includes("username sudah digunakan") ||
    (normalizedMessage.includes("duplicate entry") &&
      normalizedMessage.includes("username"))
  ) {
    return "Username sudah digunakan. Silakan pilih username lain.";
  }

  if (
    normalizedMessage.includes("devicerequest.devicekey") &&
    normalizedMessage.includes("validation for")
  ) {
    return "Device key wajib diisi.";
  }

  if (
    normalizedMessage.includes("devicerequest.name") &&
    normalizedMessage.includes("validation for")
  ) {
    return "Nama perangkat wajib diisi.";
  }

  if (
    normalizedMessage.includes("perangkat tidak ditemukan") ||
    normalizedMessage.includes("user tidak ditemukan")
  ) {
    return message ?? fallbackMessage;
  }

  if (
    normalizedMessage.includes("akses ditolak") ||
    normalizedMessage.includes("tidak memiliki hak")
  ) {
    return "Anda tidak memiliki akses untuk melakukan tindakan ini.";
  }

  if (
    status === 401 ||
    normalizedMessage.includes("token tidak valid") ||
    normalizedMessage.includes("token expired")
  ) {
    return "Sesi Anda telah berakhir. Silakan login kembali.";
  }

  if (
    normalizedMessage.includes("error 1062") ||
    normalizedMessage.includes("sql") ||
    normalizedMessage.includes("database")
  ) {
    return fallbackMessage;
  }

  return message || fallbackMessage;
}
