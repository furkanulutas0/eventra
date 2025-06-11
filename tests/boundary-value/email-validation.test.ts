import { describe, it, expect } from 'vitest'
import { isValidEmail } from '../utils/validation.utils'

describe('E-posta Doğrulama - Sınır Değer Testleri', () => {
  describe('Geçerli E-posta Adresleri', () => {
    it('minimum geçerli e-postayı kabul etmeli', () => {
      expect(isValidEmail('a@b.c')).toBe(true)
    })

    it('standart e-posta formatını kabul etmeli', () => {
      expect(isValidEmail('user@example.com')).toBe(true)
    })

    it('sayı içeren e-postayı kabul etmeli', () => {
      expect(isValidEmail('user123@example123.com')).toBe(true)
    })

    it('tire ve nokta içeren e-postayı kabul etmeli', () => {
      expect(isValidEmail('user.name-test@sub.example.com')).toBe(true)
    })

    it('artı işareti içeren e-postayı kabul etmeli', () => {
      expect(isValidEmail('user+tag@example.com')).toBe(true)
    })

    it('uzun ama geçerli e-postayı kabul etmeli', () => {
      const longEmail = 'a'.repeat(60) + '@' + 'b'.repeat(60) + '.com'
      expect(isValidEmail(longEmail)).toBe(true)
    })
  })

  describe('Geçersiz E-posta Adresleri - Sınır Durumları', () => {
    it('boş dizeyi reddetmeli', () => {
      expect(isValidEmail('')).toBe(false)
    })

    it('tek karakteri reddetmeli', () => {
      expect(isValidEmail('a')).toBe(false)
    })

    it('@ işareti olmayan e-postayı reddetmeli', () => {
      expect(isValidEmail('userexample.com')).toBe(false)
    })

    it('alan adı olmayan e-postayı reddetmeli', () => {
      expect(isValidEmail('user@')).toBe(false)
    })

    it('yerel kısmı olmayan e-postayı reddetmeli', () => {
      expect(isValidEmail('@example.com')).toBe(false)
    })

    it('üst seviye alan adı olmayan e-postayı reddetmeli', () => {
      expect(isValidEmail('user@example')).toBe(false)
    })

    it('boşluk içeren e-postayı reddetmeli', () => {
      expect(isValidEmail('user @example.com')).toBe(false)
      expect(isValidEmail('user@ example.com')).toBe(false)
      expect(isValidEmail('user@example .com')).toBe(false)
    })

    it('birden fazla @ işareti içeren e-postayı reddetmeli', () => {
      expect(isValidEmail('user@@example.com')).toBe(false)
      expect(isValidEmail('user@example@.com')).toBe(false)
    })

    it('@ işareti ile başlayan e-postayı reddetmeli', () => {
      expect(isValidEmail('@user@example.com')).toBe(false)
    })

    it('@ işareti ile biten e-postayı reddetmeli', () => {
      expect(isValidEmail('user@example.com@')).toBe(false)
    })

    it('ardışık nokta içeren e-postayı reddetmeli', () => {
      expect(isValidEmail('user..name@example.com')).toBe(false)
      expect(isValidEmail('user@example..com')).toBe(false)
    })

    it('nokta ile başlayan e-postayı reddetmeli', () => {
      expect(isValidEmail('.user@example.com')).toBe(false)
    })

    it('@ işaretinden önce nokta ile biten e-postayı reddetmeli', () => {
      expect(isValidEmail('user.@example.com')).toBe(false)
    })

    it('çok kısa alan adını reddetmeli', () => {
      expect(isValidEmail('user@a')).toBe(false)
    })

    it('nokta içermeyen alan adını reddetmeli', () => {
      expect(isValidEmail('user@example')).toBe(false)
    })
  })

  describe('Özel Durumlar ve Özel Karakterler', () => {
    it('yerel kısımda özel karakter içeren e-postayı reddetmeli', () => {
      expect(isValidEmail('user#@example.com')).toBe(false)
      expect(isValidEmail('user$@example.com')).toBe(false)
      expect(isValidEmail('user%@example.com')).toBe(false)
      expect(isValidEmail('user&@example.com')).toBe(false)
    })

    it('unicode karakterleri içeren e-postayı reddetmeli', () => {
      expect(isValidEmail('üser@example.com')).toBe(false)
      expect(isValidEmail('user@exämple.com')).toBe(false)
    })

    it('null ve undefined değerlerini düzgün işlemeli', () => {
      expect(isValidEmail(null as any)).toBe(false)
      expect(isValidEmail(undefined as any)).toBe(false)
    })

    it('string olmayan girdileri işlemeli', () => {
      expect(isValidEmail(123 as any)).toBe(false)
      expect(isValidEmail({} as any)).toBe(false)
      expect(isValidEmail([] as any)).toBe(false)
    })
  })

  describe('Uzunluk Sınır Testleri', () => {
    it('çok uzun e-posta adreslerini işlemeli', () => {
      const veryLongEmail = 'a'.repeat(100) + '@' + 'b'.repeat(100) + '.com'
      expect(isValidEmail(veryLongEmail)).toBe(true)
    })

    it('aşırı uzun e-posta adreslerini işlemeli', () => {
      const extremelyLongEmail = 'a'.repeat(1000) + '@' + 'b'.repeat(1000) + '.com'
      expect(isValidEmail(extremelyLongEmail)).toBe(true)
    })

    it('tek karakterli bileşenleri işlemeli', () => {
      expect(isValidEmail('a@b.c')).toBe(true)
    })

    it('boş bileşenleri reddetmeli', () => {
      expect(isValidEmail('@b.c')).toBe(false)
      expect(isValidEmail('a@.c')).toBe(false)
      expect(isValidEmail('a@b.')).toBe(false)
    })
  })
}) 