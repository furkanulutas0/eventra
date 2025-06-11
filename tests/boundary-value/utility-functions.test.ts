import { describe, it, expect, vi } from 'vitest'
import { 
  generateRandomString, 
  validatePasswordStrength, 
  validateName,
  validate1on1Event,
  EventFormData 
} from '../utils/validation.utils'

describe('Yardımcı Fonksiyonlar - Sınır Değer Testleri', () => {
  describe('Rastgele Dize Oluşturma', () => {
    it('belirtilen uzunlukta dize oluşturmalı', () => {
      const length = 10
      const result = generateRandomString(length)
      expect(result.length).toBe(length)
    })

    it('sıfır uzunlukta boş dize oluşturmalı', () => {
      const result = generateRandomString(0)
      expect(result).toBe('')
    })

    it('negatif uzunluk için boş dize oluşturmalı', () => {
      const result = generateRandomString(-5)
      expect(result).toBe('')
    })

    it('büyük uzunlukta dize oluşturmalı', () => {
      const length = 1000
      const result = generateRandomString(length)
      expect(result.length).toBe(length)
    })

    it('alfanümerik karakterler içermeli', () => {
      const result = generateRandomString(100)
      expect(result).toMatch(/^[a-zA-Z0-9]+$/)
    })

    it('her seferinde farklı dize oluşturmalı', () => {
      const length = 10
      const results = new Set()
      for (let i = 0; i < 100; i++) {
        results.add(generateRandomString(length))
      }
      expect(results.size).toBe(100) // Tüm dizeler benzersiz olmalı
    })
  })

  describe('Şifre Doğrulama', () => {
    it('geçerli şifreyi kabul etmeli', () => {
      expect(validatePasswordStrength('Test123!')).toBe(true)
    })

    it('minimum uzunluktan kısa şifreyi reddetmeli', () => {
      expect(validatePasswordStrength('Ts1!')).toBe(false)
    })

    it('maksimum uzunluktan uzun şifreyi reddetmeli', () => {
      expect(validatePasswordStrength('Test123!'.repeat(10))).toBe(false)
    })

    it('büyük harf olmayan şifreyi reddetmeli', () => {
      expect(validatePasswordStrength('test123!')).toBe(false)
    })

    it('küçük harf olmayan şifreyi reddetmeli', () => {
      expect(validatePasswordStrength('TEST123!')).toBe(false)
    })

    it('rakam olmayan şifreyi reddetmeli', () => {
      expect(validatePasswordStrength('TestTest!')).toBe(false)
    })

    it('özel karakter olmayan şifreyi reddetmeli', () => {
      expect(validatePasswordStrength('Test1234')).toBe(false)
    })

    it('boşluk içeren şifreyi reddetmeli', () => {
      expect(validatePasswordStrength('Test 123!')).toBe(false)
    })

    it('tam olarak minimum uzunlukta şifreyi kabul etmeli', () => {
      expect(validatePasswordStrength('Test12!')).toBe(true)
    })

    it('tam olarak maksimum uzunlukta şifreyi kabul etmeli', () => {
      expect(validatePasswordStrength('Test123!'.repeat(8))).toBe(true)
    })

    it('tüm özel karakterleri kabul etmeli', () => {
      const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?'
      for (const char of specialChars) {
        expect(validatePasswordStrength(`Test123${char}`)).toBe(true)
      }
    })
  })

  describe('İsim Doğrulama', () => {
    it('geçerli ismi kabul etmeli', () => {
      expect(validateName('John Doe')).toBe(true)
    })

    it('minimum uzunluktan kısa ismi reddetmeli', () => {
      expect(validateName('J')).toBe(false)
    })

    it('maksimum uzunluktan uzun ismi reddetmeli', () => {
      expect(validateName('J'.repeat(51))).toBe(false)
    })

    it('rakam içeren ismi reddetmeli', () => {
      expect(validateName('John2 Doe')).toBe(false)
    })

    it('özel karakter içeren ismi reddetmeli', () => {
      expect(validateName('John! Doe')).toBe(false)
    })

    it('birden fazla boşluk içeren ismi reddetmeli', () => {
      expect(validateName('John  Doe')).toBe(false)
    })

    it('başında boşluk olan ismi reddetmeli', () => {
      expect(validateName(' John Doe')).toBe(false)
    })

    it('sonunda boşluk olan ismi reddetmeli', () => {
      expect(validateName('John Doe ')).toBe(false)
    })

    it('tam olarak minimum uzunlukta ismi kabul etmeli', () => {
      expect(validateName('Jo')).toBe(true)
    })

    it('tam olarak maksimum uzunlukta ismi kabul etmeli', () => {
      expect(validateName('J'.repeat(50))).toBe(true)
    })

    it('tire içeren ismi kabul etmeli', () => {
      expect(validateName('Jean-Pierre')).toBe(true)
    })

    it('tek kelimelik ismi kabul etmeli', () => {
      expect(validateName('John')).toBe(true)
    })
  })

  describe('Birebir Etkinlik Doğrulama', () => {
    it('geçerli birebir etkinliği kabul etmeli', () => {
      expect(validate1on1Event({
        title: 'Meeting',
        description: 'Discussion',
        capacity: 2,
        isOneToOne: true
      })).toBe(true)
    })

    it('kapasitesi 2den farklı olan birebir etkinliği reddetmeli', () => {
      expect(validate1on1Event({
        title: 'Meeting',
        description: 'Discussion',
        capacity: 3,
        isOneToOne: true
      })).toBe(false)
    })

    it('isOneToOne değeri false olan birebir etkinliği reddetmeli', () => {
      expect(validate1on1Event({
        title: 'Meeting',
        description: 'Discussion',
        capacity: 2,
        isOneToOne: false
      })).toBe(false)
    })

    it('eksik başlığı olan birebir etkinliği reddetmeli', () => {
      expect(validate1on1Event({
        title: '',
        description: 'Discussion',
        capacity: 2,
        isOneToOne: true
      })).toBe(false)
    })

    it('eksik açıklaması olan birebir etkinliği reddetmeli', () => {
      expect(validate1on1Event({
        title: 'Meeting',
        description: '',
        capacity: 2,
        isOneToOne: true
      })).toBe(false)
    })

    it('çok uzun başlığı olan birebir etkinliği reddetmeli', () => {
      expect(validate1on1Event({
        title: 'M'.repeat(101),
        description: 'Discussion',
        capacity: 2,
        isOneToOne: true
      })).toBe(false)
    })

    it('çok uzun açıklaması olan birebir etkinliği reddetmeli', () => {
      expect(validate1on1Event({
        title: 'Meeting',
        description: 'D'.repeat(501),
        capacity: 2,
        isOneToOne: true
      })).toBe(false)
    })

    it('negatif kapasiteli birebir etkinliği reddetmeli', () => {
      expect(validate1on1Event({
        title: 'Meeting',
        description: 'Discussion',
        capacity: -1,
        isOneToOne: true
      })).toBe(false)
    })

    it('sıfır kapasiteli birebir etkinliği reddetmeli', () => {
      expect(validate1on1Event({
        title: 'Meeting',
        description: 'Discussion',
        capacity: 0,
        isOneToOne: true
      })).toBe(false)
    })

    it('tam olarak minimum uzunlukta başlığı olan birebir etkinliği kabul etmeli', () => {
      expect(validate1on1Event({
  describe('Password Strength Validation', () => {
    describe('Length Boundaries', () => {
      it('should reject password with 0 characters', () => {
        const result = validatePasswordStrength('')
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain("Password must be at least 8 characters long")
      })

      it('should reject password with 7 characters', () => {
        const result = validatePasswordStrength('Abc123!')
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain("Password must be at least 8 characters long")
      })

      it('should accept password with exactly 8 characters', () => {
        const result = validatePasswordStrength('Abc1234!')
        expect(result.isValid).toBe(true)
        expect(result.errors).toHaveLength(0)
      })

      it('should accept password with 9 characters', () => {
        const result = validatePasswordStrength('Abc12345!')
        expect(result.isValid).toBe(true)
        expect(result.errors).toHaveLength(0)
      })

      it('should accept password with exactly 128 characters', () => {
        const longPassword = 'A' + 'b'.repeat(125) + '1!'
        expect(longPassword.length).toBe(128)
        const result = validatePasswordStrength(longPassword)
        expect(result.isValid).toBe(true)
        expect(result.errors).toHaveLength(0)
      })

      it('should reject password with 129 characters', () => {
        const tooLongPassword = 'A' + 'b'.repeat(126) + '1!'
        expect(tooLongPassword.length).toBe(129)
        const result = validatePasswordStrength(tooLongPassword)
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain("Password must be less than 128 characters long")
      })

      it('should reject very long password', () => {
        const veryLongPassword = 'A'.repeat(1000) + 'b1!'
        const result = validatePasswordStrength(veryLongPassword)
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain("Password must be less than 128 characters long")
      })
    })

    describe('Character Requirements', () => {
      it('should reject password without uppercase letter', () => {
        const result = validatePasswordStrength('abc12345!')
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain("Password must contain at least one uppercase letter")
      })

      it('should reject password without lowercase letter', () => {
        const result = validatePasswordStrength('ABC12345!')
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain("Password must contain at least one lowercase letter")
      })

      it('should reject password without number', () => {
        const result = validatePasswordStrength('Abcdefgh!')
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain("Password must contain at least one number")
      })

      it('should accept password with exactly one of each required character type', () => {
        const result = validatePasswordStrength('Abcdefg1')
        expect(result.isValid).toBe(true)
        expect(result.errors).toHaveLength(0)
      })

      it('should accept password with multiple of each character type', () => {
        const result = validatePasswordStrength('ABCDabcd1234')
        expect(result.isValid).toBe(true)
        expect(result.errors).toHaveLength(0)
      })

      it('should handle password with special characters', () => {
        const result = validatePasswordStrength('Abc123!@#$%^&*()')
        expect(result.isValid).toBe(true)
        expect(result.errors).toHaveLength(0)
      })

      it('should handle password with unicode characters', () => {
        const result = validatePasswordStrength('Abc123üñíçødé')
        expect(result.isValid).toBe(true)
        expect(result.errors).toHaveLength(0)
      })
    })

    describe('Multiple Validation Errors', () => {
      it('should return all applicable errors for invalid password', () => {
        const result = validatePasswordStrength('abc')
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain("Password must be at least 8 characters long")
        expect(result.errors).toContain("Password must contain at least one uppercase letter")
        expect(result.errors).toContain("Password must contain at least one number")
        expect(result.errors).toHaveLength(3)
      })

      it('should return no errors for completely valid password', () => {
        const result = validatePasswordStrength('ValidPass123')
        expect(result.isValid).toBe(true)
        expect(result.errors).toHaveLength(0)
      })
    })
  })

  describe('Name Validation', () => {
    describe('Length Boundaries', () => {
      it('should reject empty name', () => {
        const result = validateName('')
        expect(result.isValid).toBe(false)
        expect(result.error).toBe("Name cannot be empty")
      })

      it('should reject name with only whitespace', () => {
        const result = validateName('   ')
        expect(result.isValid).toBe(false)
        expect(result.error).toBe("Name cannot be empty")
      })

      it('should accept name with exactly 1 character', () => {
        const result = validateName('A')
        expect(result.isValid).toBe(true)
        expect(result.error).toBeUndefined()
      })

      it('should accept name with exactly 50 characters', () => {
        const name = 'A'.repeat(50)
        const result = validateName(name)
        expect(result.isValid).toBe(true)
        expect(result.error).toBeUndefined()
      })

      it('should reject name with 51 characters', () => {
        const name = 'A'.repeat(51)
        const result = validateName(name)
        expect(result.isValid).toBe(false)
        expect(result.error).toBe("Name must be less than 50 characters")
      })

      it('should reject very long name', () => {
        const name = 'A'.repeat(1000)
        const result = validateName(name)
        expect(result.isValid).toBe(false)
        expect(result.error).toBe("Name must be less than 50 characters")
      })
    })

    describe('Character Validation', () => {
      it('should accept name with letters only', () => {
        const result = validateName('John')
        expect(result.isValid).toBe(true)
      })

      it('should accept name with spaces', () => {
        const result = validateName('John Doe')
        expect(result.isValid).toBe(true)
      })

      it('should accept name with hyphens', () => {
        const result = validateName('Mary-Jane')
        expect(result.isValid).toBe(true)
      })

      it('should accept name with apostrophes', () => {
        const result = validateName("O'Connor")
        expect(result.isValid).toBe(true)
      })

      it('should accept name with mixed valid characters', () => {
        const result = validateName("Mary-Jane O'Connor Smith")
        expect(result.isValid).toBe(true)
      })

      it('should reject name with numbers', () => {
        const result = validateName('John123')
        expect(result.isValid).toBe(false)
        expect(result.error).toBe("Name can only contain letters, spaces, hyphens, and apostrophes")
      })

      it('should reject name with special characters', () => {
        const result = validateName('John@Doe')
        expect(result.isValid).toBe(false)
        expect(result.error).toBe("Name can only contain letters, spaces, hyphens, and apostrophes")
      })

      it('should reject name with unicode characters', () => {
        const result = validateName('Jöhn')
        expect(result.isValid).toBe(false)
        expect(result.error).toBe("Name can only contain letters, spaces, hyphens, and apostrophes")
      })

      it('should handle name with leading/trailing spaces', () => {
        const result = validateName('  John Doe  ')
        expect(result.isValid).toBe(true) // Should be trimmed internally
      })
    })

    describe('Edge Cases', () => {
      it('should handle single letter names', () => {
        expect(validateName('A').isValid).toBe(true)
        expect(validateName('Z').isValid).toBe(true)
        expect(validateName('a').isValid).toBe(true)
        expect(validateName('z').isValid).toBe(true)
      })

      it('should handle names with multiple spaces', () => {
        const result = validateName('John    Doe')
        expect(result.isValid).toBe(true)
      })

      it('should handle names with multiple hyphens', () => {
        const result = validateName('Mary-Jane-Smith')
        expect(result.isValid).toBe(true)
      })

      it('should handle names with multiple apostrophes', () => {
        const result = validateName("O'Connor's")
        expect(result.isValid).toBe(true)
      })
    })
  })

  describe('1:1 Event Validation', () => {
    it('should accept 1:1 event with exactly 10 time slots', () => {
      const formData: EventFormData = {
        type: "1:1",
        dateTimeSlots: [
          {
            date: new Date('2024-01-01'),
            timeSlots: Array(10).fill(null).map(() => ({ startTime: '09:00', endTime: '10:00' }))
          }
        ]
      }
      expect(validate1on1Event(formData)).toBe(true)
    })

    it('should reject 1:1 event with 11 time slots', () => {
      const formData: EventFormData = {
        type: "1:1",
        dateTimeSlots: [
          {
            date: new Date('2024-01-01'),
            timeSlots: Array(11).fill(null).map(() => ({ startTime: '09:00', endTime: '10:00' }))
          }
        ]
      }
      expect(validate1on1Event(formData)).toBe(false)
    })

    it('should accept 1:1 event with 1 time slot', () => {
      const formData: EventFormData = {
        type: "1:1",
        dateTimeSlots: [
          {
            date: new Date('2024-01-01'),
            timeSlots: [{ startTime: '09:00', endTime: '10:00' }]
          }
        ]
      }
      expect(validate1on1Event(formData)).toBe(true)
    })

    it('should accept 1:1 event with 0 time slots', () => {
      const formData: EventFormData = {
        type: "1:1",
        dateTimeSlots: [
          {
            date: new Date('2024-01-01'),
            timeSlots: []
          }
        ]
      }
      expect(validate1on1Event(formData)).toBe(true)
    })

    it('should accept 1:1 event with slots across multiple dates totaling 10', () => {
      const formData: EventFormData = {
        type: "1:1",
        dateTimeSlots: [
          {
            date: new Date('2024-01-01'),
            timeSlots: Array(5).fill(null).map(() => ({ startTime: '09:00', endTime: '10:00' }))
          },
          {
            date: new Date('2024-01-02'),
            timeSlots: Array(5).fill(null).map(() => ({ startTime: '09:00', endTime: '10:00' }))
          }
        ]
      }
      expect(validate1on1Event(formData)).toBe(true)
    })

    it('should reject 1:1 event with slots across multiple dates totaling 11', () => {
      const formData: EventFormData = {
        type: "1:1",
        dateTimeSlots: [
          {
            date: new Date('2024-01-01'),
            timeSlots: Array(6).fill(null).map(() => ({ startTime: '09:00', endTime: '10:00' }))
          },
          {
            date: new Date('2024-01-02'),
            timeSlots: Array(5).fill(null).map(() => ({ startTime: '09:00', endTime: '10:00' }))
          }
        ]
      }
      expect(validate1on1Event(formData)).toBe(false)
    })

    it('should accept group event with any number of time slots', () => {
      const formData: EventFormData = {
        type: "group",
        dateTimeSlots: [
          {
            date: new Date('2024-01-01'),
            timeSlots: Array(50).fill(null).map(() => ({ startTime: '09:00', endTime: '10:00' }))
          }
        ]
      }
      expect(validate1on1Event(formData)).toBe(true)
    })

    it('should handle empty dateTimeSlots array for 1:1 event', () => {
      const formData: EventFormData = {
        type: "1:1",
        dateTimeSlots: []
      }
      expect(validate1on1Event(formData)).toBe(true)
    })

    it('should handle boundary case with exactly 100 slots for group event', () => {
      const formData: EventFormData = {
        type: "group",
        dateTimeSlots: [
          {
            date: new Date('2024-01-01'),
            timeSlots: Array(100).fill(null).map(() => ({ startTime: '09:00', endTime: '10:00' }))
          }
        ]
      }
      expect(validate1on1Event(formData)).toBe(true)
    })
  })
}) 
}) 