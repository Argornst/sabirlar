export function getReadableErrorMessage(error, fallbackMessage) {
  const rawMessage = error?.message || fallbackMessage || "Bir hata oluştu.";

  const lowered = String(rawMessage).toLowerCase();

  if (lowered.includes("invalid login credentials")) {
    return "Kullanıcı adı/e-posta veya şifre hatalı.";
  }

  if (lowered.includes("jwt")) {
    return "Oturum doğrulaması sırasında hata oluştu.";
  }

  if (lowered.includes("permission")) {
    return "Bu işlem için yetkin bulunmuyor.";
  }

  if (lowered.includes("row-level security")) {
    return "Veri erişim kuralı nedeniyle işlem tamamlanamadı.";
  }

  if (lowered.includes("network")) {
    return "Ağ bağlantısı nedeniyle işlem tamamlanamadı.";
  }

  return rawMessage;
}