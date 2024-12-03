import { NextFunction, Request, Response } from "express";

const apiAuthentication = (req: Request, res: Response, next: NextFunction): void => {
  // API Anahtarını header'dan al
  const apiKey = req.headers["x-api-key"];

  // Beklenen API Anahtarını tanımla (Bu örnekte sabit bir değer kullanılmıştır)
  const expectedApiKey: string | undefined = process.env.API_KEY;

  // Anahtarı kontrol et
  if (apiKey === expectedApiKey) {
    next(); // Doğrulama başarılı, bir sonraki middleware'e geç
  } else {
    // Doğrulama başarısız, hata mesajı ile yanıt ver
    res.status(401).json({ message: "Unauthorized: Invalid API key" });
  }
};
export default apiAuthentication;